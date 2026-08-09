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
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onProcessComplete,
  isLoading,
  setIsLoading,
  draftSettings,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [teamsOverride, setTeamsOverride] = useState<number>(draftSettings?.total_teams || 12);
  const [roundsOverride, setRoundsOverride] = useState<number>(draftSettings?.total_rounds || 16);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Ready');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setErrorMsg(null);
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMsg('Please drop a valid image file.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const executeOcr = async (imageData: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setStatusText('Preparing image & normalizing resolution...');

    const resizeImage = (base64Str: string, maxDimension: number): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDimension) { height *= maxDimension / width; width = maxDimension; }
          } else {
            if (height > maxDimension) { width *= maxDimension / height; height = maxDimension; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(base64Str);
      });
    };

    try {
      const optimizedImage = await resizeImage(imageData, 1500);
      setStatusText('Analyzing spatial grid with Gemini 1.5 Flash (Client-Side)...');

      // 1. Initialize Gemini Client directly in browser
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is missing. Please add it to Vercel Environment Variables.');
      }

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

      const mimeType = 'image/jpeg';
      const base64Data = optimizedImage.split(';base64,')[1];

      const systemPrompt = `You are an expert OCR vision system specialized in reading physical fantasy football draft boards. Transcribe player draft stickers into structured JSON data. Scan row-by-row.
Expected Teams: ${teamsOverride}, Expected Rounds: ${roundsOverride}.
${customInstructions ? `User Context: ${customInstructions}` : ''}`;

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: systemPrompt + '

Analyze this draft board and extract all stickers.' }
          ]
        }]
      });

      const response = await result.response;
      const data = JSON.parse(response.text());
      
      // Post-processing to match app structure
      const formattedPicks = (data.drafted_players || []).map((p: any) => {
        const round = Number(p.round) || 1;
        const pickInRound = Number(p.pick) || 1;
        return {
          round,
          pick_in_round: pickInRound,
          overall_pick: ((round - 1) * teamsOverride + pickInRound),
          team_column: pickInRound,
          team_name: draftSettings?.team_names[pickInRound] || `Team ${pickInRound}`,
          player_name: p.player_name || 'Unknown',
          position: p.position || 'WR',
          nfl_team: p.nfl_team || 'NFL',
          confidence: p.confidence_score || 0.9,
          status: 'confirmed'
        };
      });

      const finalResult: OCRResult = {
        draft_info: {
          total_teams: teamsOverride,
          total_rounds: roundsOverride,
          teams: Array.from({ length: teamsOverride }, (_, i) => ({
            column: i + 1,
            name: draftSettings?.team_names[i + 1] || `Team ${i + 1}`
          }))
        },
        picks: formattedPicks,
        summary: {
          total_detected: formattedPicks.length,
          avg_confidence: 0.9
        }
      };

      setStatusText('Extraction complete!');
      onProcessComplete(finalResult, imageData);
    } catch (err: any) {
      console.error('Client OCR error:', err);
      setErrorMsg(err.message || 'Error occurred during image OCR transcription.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_BOARDS[0]) => {
    setSelectedImage(sample.thumbnailUrl);
    onProcessComplete(sample.picksData, sample.thumbnailUrl);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Draft Sticker Transcription</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Upload Physical Draft Board Photo
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Snap or upload a photo of your live fantasy football draft board. The vision system will scan row-by-row and output structured JSON.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              selectedImage
                ? 'border-emerald-500/50 bg-slate-900/80 hover:bg-slate-900'
                : 'border-slate-700 bg-slate-900/40 hover:border-emerald-500/50 hover:bg-slate-900/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative max-h-64 rounded-lg overflow-hidden border border-slate-700 mx-auto inline-block shadow-lg">
                  <img src={selectedImage} alt="Draft Board Preview" className="max-h-64 object-contain" />
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedImage) executeOcr(selectedImage);
                    }}
                    disabled={isLoading}
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run AI Vision OCR Scan</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-base">
                    Click to upload or drag & drop draft board photo
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Grid Structure Guidelines (Optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Expected Teams</label>
                <select
                  value={teamsOverride}
                  onChange={(e) => setTeamsOverride(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {[8, 10, 12, 14, 16].map((num) => (<option key={num} value={num}>{num} Teams</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Expected Rounds</label>
                <select
                  value={roundsOverride}
                  onChange={(e) => setRoundsOverride(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {[5, 10, 12, 15, 16, 18, 20].map((num) => (<option key={num} value={num}>{num} Rounds</option>))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Or Try Sample Draft Boards</span>
            </div>
            <div className="space-y-3 pt-2">
              {SAMPLE_BOARDS.map((board) => (
                <div
                  key={board.id}
                  onClick={() => handleSelectSample(board)}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl p-3 cursor-pointer transition-all group"
                >
                  <div className="h-24 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative">
                    <img src={board.thumbnailUrl} alt={board.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-2">{board.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-white">Transcribing Draft Board</h3>
            <p className="text-xs text-emerald-400 font-medium">{statusText}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-4 flex items-start space-x-3 text-red-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div><span className="font-bold block">OCR System Notice</span>{errorMsg}</div>
        </div>
      )}
    </div>
  );
};
