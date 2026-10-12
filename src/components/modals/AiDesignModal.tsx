import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Eye,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import { PlacedPlant } from '../../types';

interface AiDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomImageUrl: string;
  placedPlants: PlacedPlant[];
  onApplyAiImage: (generatedImageUrl: string) => void;
  aiConfigured: boolean;
  onOpenAiSettings: () => void;
}

export const AiDesignModal: React.FC<AiDesignModalProps> = ({
  isOpen,
  onClose,
  roomImageUrl,
  placedPlants,
  onApplyAiImage,
  aiConfigured,
  onOpenAiSettings,
}) => {
  const [placementMode, setPlacementMode] = useState<
    'marked' | 'automatic' | 'combined'
  >('marked');
  const [promptInstructions, setPromptInstructions] = useState(
    'Seamlessly blend the indoor plants into the space. Preserve all original architectural features, reception desks, flooring, and windows. Cast soft realistic ground shadows consistent with the room lighting.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedResultUrl, setGeneratedResultUrl] = useState<string | null>(null);
  const [fallbackGuidance, setFallbackGuidance] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setFallbackGuidance(null);

    try {
      // Ensure image is converted to clean base64 data URL if it's a relative URL
      let safeImageData = roomImageUrl;
      if (!safeImageData.startsWith('data:')) {
        safeImageData = await new Promise<string>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = Math.min(1920, img.naturalWidth || 1280);
              canvas.height = Math.min(1080, img.naturalHeight || 720);
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
                return;
              }
            } catch (e) {
              console.warn('Canvas conversion error:', e);
            }
            resolve(roomImageUrl);
          };
          img.onerror = () => resolve(roomImageUrl);
          img.src = roomImageUrl;
        });
      }

      const response = await fetch('/api/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: safeImageData,
          plants: placedPlants,
          placementMode,
          promptInstructions,
        }),
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error(
          'Server returned unexpected response. The high-resolution manual arrangement remains active and exportable.'
        );
      }

      if (data.imageUrl) {
        setGeneratedResultUrl(data.imageUrl);
      } else if (data.fallbackText) {
        setFallbackGuidance(data.fallbackText);
        if (data.message) {
          setErrorMsg(data.message);
        }
      } else if (data.error || data.message) {
        setErrorMsg(data.message || data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedResultUrl) {
      onApplyAiImage(generatedResultUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-stone-200">
      <div className="bg-stone-900 border border-stone-800 rounded-lg w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-100">
                Generate AI Interior Plant Design
              </h3>
              <p className="text-xs text-stone-400">
                Photorealistic lighting blend and perspective synthesis using Gemini models
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Active Configuration Banner */}
          {!aiConfigured && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded text-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Gemini API Key Required for AI Generation
                </span>
                <button
                  onClick={onOpenAiSettings}
                  className="underline text-amber-300 hover:text-white"
                >
                  Configure Key
                </button>
              </div>
              <p className="text-amber-300/80 leading-relaxed text-[11px]">
                The manual canvas editor operates with full functionality (transparent cutouts,
                pot shaders, shadows, dimensions, and CSV schedule) completely offline. Automated
                AI photo synthesis requires a configured GEMINI_API_KEY.
              </p>
            </div>
          )}

          {generatedResultUrl ? (
            /* Result Review State */
            <div className="space-y-4">
              <div className="aspect-[16/10] bg-stone-950 rounded border border-stone-800 overflow-hidden flex items-center justify-center">
                <img
                  src={generatedResultUrl}
                  alt="Generated AI Plant Design"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGeneratedResultUrl(null)}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setGeneratedResultUrl(null);
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition-colors"
                  >
                    Reject
                  </button>

                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Save to Design</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Pre-generation Form State */
            <div className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded">
                  {errorMsg}
                </div>
              )}

              {fallbackGuidance && (
                <div className="p-4 bg-stone-950 border border-emerald-800/80 text-xs text-stone-200 rounded space-y-3 leading-relaxed shadow-lg">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <strong className="text-emerald-400 font-serif text-sm">
                      AI Interior Botanical Assessment
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                      Vision Evaluation Complete
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-stone-300 font-sans leading-relaxed text-[11px]">
                    {fallbackGuidance}
                  </div>
                </div>
              )}

              {/* Plant & Planter Summary Card */}
              <div className="bg-stone-950 border border-stone-800 rounded p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-stone-400 uppercase text-[10px]">
                    Current Plant Specification Summary
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {placedPlants.length} Plants Selected
                  </span>
                </div>

                <div className="divide-y divide-stone-800/80 max-h-36 overflow-y-auto pr-1 text-xs">
                  {placedPlants.map((plant, idx) => (
                    <div key={plant.id} className="py-1.5 flex items-center justify-between">
                      <span className="text-stone-200 truncate">
                        {idx + 1}. {plant.name} ({plant.heightCm}cm)
                      </span>
                      <span className="text-stone-400 text-[11px] font-mono shrink-0 ml-2">
                        Pot: {plant.pot.name}
                      </span>
                    </div>
                  ))}

                  {placedPlants.length === 0 && (
                    <div className="py-2 text-stone-500 text-xs">
                      No plants placed on canvas. The AI will place luxury biophilic groupings
                      suited to the room architecture.
                    </div>
                  )}
                </div>
              </div>

              {/* Placement Mode Radio Options */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-stone-400 tracking-wider block">
                  Placement Strategy
                </label>

                <div className="space-y-2 text-xs">
                  <label
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      placementMode === 'marked'
                        ? 'bg-emerald-950/40 border-emerald-700/80 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={placementMode === 'marked'}
                      onChange={() => setPlacementMode('marked')}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <div className="font-medium text-stone-200">
                        A. Strict Marked Positions (Recommended)
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Follows your exact manual coordinates, heights, and pot dimensions on the photo.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      placementMode === 'automatic'
                        ? 'bg-emerald-950/40 border-emerald-700/80 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={placementMode === 'automatic'}
                      onChange={() => setPlacementMode('automatic')}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <div className="font-medium text-stone-200">
                        B. Automatic Biophilic Spatial Layout
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Let AI detect empty architectural corners, pillars, and window perimeters automatically.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      placementMode === 'combined'
                        ? 'bg-emerald-950/40 border-emerald-700/80 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={placementMode === 'combined'}
                      onChange={() => setPlacementMode('combined')}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <div className="font-medium text-stone-200">
                        C. Combined AI Recommendations + Manual Positions
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Harmonizes your marked plants with supplemental architectural accents.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Prompt Instructions */}
              <div>
                <label className="text-xs font-mono uppercase text-stone-400 tracking-wider block mb-1">
                  Styling Instructions
                </label>
                <textarea
                  rows={3}
                  value={promptInstructions}
                  onChange={(e) => setPromptInstructions(e.target.value)}
                  placeholder="e.g. Preserve existing marble floor reflections; blend plants naturally into the background downlights..."
                  className="w-full bg-stone-950 border border-stone-800 p-2.5 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                <span className="text-[11px] text-stone-500">
                  Existing architecture & camera angle are preserved.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Synthesizing Design...' : 'Generate AI Plant Design'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
