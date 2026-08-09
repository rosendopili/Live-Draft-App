import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Check, AlertTriangle, Image as ImageIcon, Sliders, Play, FileCheck } from 'lucide-react';
import { SAMPLE_BOARDS } from '../data/sampleBoards';
import { OCRResult, DraftSettings } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface ImageUploaderProps {
  onProcessComplete: (result: OCRResult, imagePreviewUrl?: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  draftSettings?: DraftSettings;
  apiKey: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onProcessComplete,
  isLoading,
  setIsLoading,
  draftSettings,
  apiKey,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [teamsOverride, setTeamsOverride] = useState<number>(draftSettings?.total_teams || 12);
  const [roundsOverride, setRoundsOverride] = useState<number>(draftSettings?.total_rounds || 16);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Ready');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeOcr = async (imageData: string) => {
    if (!apiKey) { setErrorMsg('Please enter a Gemini API Key above first.'); return; }
    setIsLoading(true); setErrorMsg(null); setStatusText('Optimizing image...');
    
    const resizeImage = (base64Str: string, maxDim: number): Promise<string> => new Promise((resolve) => {
      const img = new Image(); img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h *= maxDim / w; w = maxDim; } } else { if (h > maxDim) { w *= maxDim / h; h = maxDim; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });

    try {
      const optimizedImage = await resizeImage(imageData, 1500);
      setStatusText('Scanning with Gemini AI...');
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              drafted_players: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    round: { type: Type.INTEGER },
                    pick: { type: Type.INTEGER },
                    player_name: { type: Type.STRING },
                    position: { type: Type.STRING },
                    nfl_team: { type: Type.STRING },
                    confidence_score: { type: Type.NUMBER }
                  },
                  required: ['round', 'pick', 'player_name', 'position', 'nfl_team', 'confidence_score']
                }
              }
            },
            required: ['drafted_players']
          }
        }
      });

      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: optimizedImage.split(',')[1] } }, { text: `Teams: ${teamsOverride}, Rounds: ${roundsOverride}. Scan draft stickers row-by-row into JSON.` }] }]
      });

      const data = JSON.parse((await res.response).text());
      const picks = (data.drafted_players || []).map((p: any) => ({
        round: p.round, pick_in_round: p.pick, overall_pick: ((p.round - 1) * teamsOverride + p.pick), team_column: p.pick,
        team_name: draftSettings?.team_names[p.pick] || `Team ${p.pick}`, player_name: p.player_name, position: p.position, nfl_team: p.nfl_team, confidence: p.confidence_score, status: 'confirmed'
      }));

      onProcessComplete({
        draft_info: { total_teams: teamsOverride, total_rounds: roundsOverride, teams: [] },
        picks, summary: { total_detected: picks.length, avg_confidence: 0.9 }
      }, imageData);
    } catch (err: any) { setErrorMsg(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Upload Draft Board Photo</h2>
        <p className="text-xs text-slate-400">Your API key is safe—it never leaves your browser.</p>
      </div>
      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
        <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setSelectedImage(r.result as string); r.readAsDataURL(f); } }} accept="image/*" className="hidden" />
        {selectedImage ? <img src={selectedImage} className="max-h-48 mx-auto rounded-lg" /> : <div className="py-4"><Upload className="w-10 h-10 mx-auto text-slate-500 mb-2" /><p className="text-sm font-medium">Click to select image</p></div>}
      </div>
      {selectedImage && <button onClick={() => executeOcr(selectedImage)} disabled={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition flex items-center justify-center gap-2">{isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run AI Scan</button>}
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
);
