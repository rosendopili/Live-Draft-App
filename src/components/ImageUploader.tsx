import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Check, AlertTriangle, Image as ImageIcon, Sliders, Play, FileCheck } from 'lucide-react';
import { SAMPLE_BOARDS } from '../data/sampleBoards';
import { OCRResult, DraftSettings } from '../types';

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

    try {
      // 1. Downscale image more aggressively to stay under Vercel's 4.5MB payload limit
      // 1500px at 0.7 quality is usually < 1MB, well within limits.
      const optimizedImage = await resizeImage(imageData, 1500);
      
      setStatusText('Analyzing spatial grid & reading draft stickers with Gemini 3.6 Flash...');

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: optimizedImage,
          totalTeams: teamsOverride,
          totalRounds: roundsOverride,
          customInstructions: customPrompt,
          teamNames: draftSettings?.team_names,
        }),
      });
// ... existing code ...
  const handleSelectSample = (sample: typeof SAMPLE_BOARDS[0]) => {
    setSelectedImage(sample.thumbnailUrl);
    // Directly pass sample pre-calculated result for instantaneous preview or offer re-scan
    onProcessComplete(sample.picksData, sample.thumbnailUrl);
  };

  /**
   * Helper to downscale large images in the browser
   */
  const resizeImage = (base64Str: string, maxDimension: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality to ensure small payload
      };
      img.onerror = () => resolve(base64Str); // Fallback to original if error
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Overview Banner */}
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
            Snap or upload a photo of your live fantasy football draft board. The vision system will scan row-by-row, map team columns, extract standard player names, normalize positions & NFL teams, and output structured JSON.
          </p>
        </div>
      </div>

      {/* Main Upload Dropzone */}
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
                  <div className="absolute top-2 right-2 bg-slate-900/90 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-700 backdrop-blur-sm">
                    Image Loaded
                  </div>
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
                  <p className="text-slate-400 text-xs mt-1">
                    Supports high-res JPG, PNG, WEBP from phone camera or desktop
                  </p>
                </div>
                <div className="inline-flex items-center space-x-2 text-slate-400 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Works with angled, tilted, or handwritten board photos</span>
                </div>
              </div>
            )}
          </div>

          {/* Grid Settings Override */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Grid Structure Guidelines (Optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Expected Teams (Columns)
                </label>
                <select
                  value={teamsOverride}
                  onChange={(e) => setTeamsOverride(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {[8, 10, 12, 14, 16].map((num) => (
                    <option key={num} value={num}>{num} Teams</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Expected Rounds (Rows)
                </label>
                <select
                  value={roundsOverride}
                  onChange={(e) => setRoundsOverride(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {[5, 10, 12, 15, 16, 18, 20].map((num) => (
                    <option key={num} value={num}>{num} Rounds</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Custom OCR Disambiguation Context (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. League uses PPR scoring, team 3 is 'The Champs', Round 1-3 only"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Sample Boards Sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Or Try Sample Draft Boards</span>
            </div>
            <p className="text-slate-400 text-xs">
              Test the vision transcription system instantly with sample physical draft board renders.
            </p>

            <div className="space-y-3 pt-2">
              {SAMPLE_BOARDS.map((board) => (
                <div
                  key={board.id}
                  onClick={() => handleSelectSample(board)}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-3 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="h-24 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative">
                    <img src={board.thumbnailUrl} alt={board.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute bottom-1 right-1 bg-slate-900/90 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                      {board.teams} Teams × {board.rounds} Rounds
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {board.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {board.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Transcribing Draft Board</h3>
              <p className="text-xs text-emerald-400 font-medium">{statusText}</p>
            </div>
            <p className="text-slate-400 text-xs">
              Gemini Vision AI is analyzing row-by-row sticker grid alignment, normalizing player names, and validating position abbreviations...
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-4 flex items-start space-x-3 text-red-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">OCR System Notice</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
};
