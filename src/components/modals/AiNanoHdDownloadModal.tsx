import React, { useState } from 'react';
import {
  X,
  Download,
  Sparkles,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
  Eye,
  Maximize2,
  Loader2,
  FileImage,
} from 'lucide-react';
import { PlacedPlant } from '../../types';
import { renderNanoHdCompositeCanvas } from '../../utils/imageUtils';

interface AiNanoHdDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomImageUrl: string;
  roomTitle: string;
  roomRotation: number;
  plants: PlacedPlant[];
}

export const AiNanoHdDownloadModal: React.FC<AiNanoHdDownloadModalProps> = ({
  isOpen,
  onClose,
  roomImageUrl,
  roomTitle,
  roomRotation,
  plants,
}) => {
  const [resolution, setResolution] = useState<'4k-nano' | '2k' | '1080p'>('4k-nano');
  const [sharpnessLevel, setSharpnessLevel] = useState<number>(65);
  const [foliageVibrance, setFoliageVibrance] = useState<number>(30);
  const [unsharpMask, setUnsharpMask] = useState<boolean>(true);
  const [includeWatermarkBadge, setIncludeWatermarkBadge] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [previewZoomActive, setPreviewZoomActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const resolutionDetails = {
    '4k-nano': {
      label: 'AI Nano HD (4K Ultra-Clarity)',
      dims: '3840 × 2160 px',
      desc: 'Sub-pixel supersampling, unsharp mask edge enhancement, ultra-sharp leaf veins & pot finishes.',
      badge: 'Best Quality',
    },
    '2k': {
      label: '2K Studio Master',
      dims: '2560 × 1440 px',
      desc: 'High dynamic range clarity for client presentations and tablet portfolio viewing.',
      badge: 'Balanced',
    },
    '1080p': {
      label: 'Full HD Web Specification',
      dims: '1920 × 1080 px',
      desc: 'Fast, lightweight export ideal for email sharing and quick contractor distribution.',
      badge: 'Fast',
    },
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setStatusMessage('Synthesizing high-DPI room layers...');

    try {
      // Simulate status progression for user feedback
      setTimeout(() => {
        setStatusMessage('Applying unsharp mask edge clarity & botanical contrast...');
      }, 400);

      const canvas = await renderNanoHdCompositeCanvas(
        roomImageUrl,
        plants,
        roomRotation,
        {
          resolution,
          sharpnessLevel,
          foliageVibrance,
          unsharpMask,
          includeWatermarkBadge,
          roomTitle,
        }
      );

      setStatusMessage('Finalizing 32-bit PNG encoding...');

      const link = document.createElement('a');
      const filename = `ETR_Plants_${roomTitle.replace(/\s+/g, '_')}_NanoHD_${resolution}_${Date.now()}.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setTimeout(() => {
        setIsGenerating(false);
        setStatusMessage('');
        onClose();
      }, 500);
    } catch (err) {
      console.error('HD download failed:', err);
      setIsGenerating(false);
      setStatusMessage('Download encountered an error. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-stone-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-100 flex items-center gap-2">
                <span>AI Nano HD Clarity Export</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Ultra-Crisp
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Architectural supersampling with leaf-edge clarity and contact shadows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Resolution Presets */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-stone-400 block mb-2.5">
              Select Output Resolution:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['4k-nano', '2k', '1080p'] as const).map((key) => {
                const item = resolutionDetails[key];
                const isSelected = resolution === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setResolution(key)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-stone-100 shadow-md shadow-emerald-950/50'
                        : 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700 hover:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        {item.dims}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div className="font-serif text-sm font-medium text-stone-100">
                      {key === '4k-nano' ? '4K Nano HD' : key === '2k' ? '2K Studio' : 'Full HD 1080p'}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clarity Tuning Sliders */}
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-stone-200">
                  AI Nano Clarity & Botanical Tuning
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                Hardware Accelerated
              </span>
            </div>

            {/* Unsharp Mask Sharpness */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-stone-300">Unsharp Mask & Leaf Edge Sharpness</span>
                <span className="font-mono text-emerald-400 font-semibold">{sharpnessLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sharpnessLevel}
                onChange={(e) => setSharpnessLevel(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded cursor-pointer"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Amplifies fine leaf veins, frond serrations, and pot texture boundaries.
              </p>
            </div>

            {/* Micro-contrast & Foliage Vibrance */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-stone-300">Foliage Micro-Contrast & Green Vibrance</span>
                <span className="font-mono text-emerald-400 font-semibold">{foliageVibrance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={foliageVibrance}
                onChange={(e) => setFoliageVibrance(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded cursor-pointer"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Optimizes organic chlorophyl tones and prevents washed-out highlights.
              </p>
            </div>

            {/* Checkbox Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
              <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unsharpMask}
                  onChange={(e) => setUnsharpMask(e.target.checked)}
                  className="rounded border-stone-700 text-emerald-600 focus:ring-emerald-500 bg-stone-900"
                />
                <span>Enable Unsharp Masking</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWatermarkBadge}
                  onChange={(e) => setIncludeWatermarkBadge(e.target.checked)}
                  className="rounded border-stone-700 text-emerald-600 focus:ring-emerald-500 bg-stone-900"
                />
                <span>Include ETR Plants Spec Badge</span>
              </label>
            </div>
          </div>

          {/* Room Details & Plant Summary */}
          <div className="flex items-center justify-between px-3 py-2 bg-stone-800/40 rounded-lg text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <FileImage className="w-3.5 h-3.5 text-stone-400" />
              <span>Target Space: <strong className="text-stone-200">{roomTitle}</strong></span>
            </span>
            <span className="font-mono text-stone-300">
              {plants.length} Plant Specimen{plants.length === 1 ? '' : 's'} Included
            </span>
          </div>

          {/* Status Alert if generating */}
          {isGenerating && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div className="text-xs text-emerald-200">
                <p className="font-medium">{statusMessage || 'Processing high-resolution image...'}</p>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">
                  Rendering at {resolutionDetails[resolution].dims} with 32-bit color depth
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-lg shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting Nano HD...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {resolution === '4k-nano' ? '4K Nano HD' : resolution.toUpperCase()} Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
