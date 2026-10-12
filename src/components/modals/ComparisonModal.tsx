import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sliders,
  Columns,
  Download,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImageUrl: string;
  editedCanvasUrl: string | null;
  aiEditedImageUrl?: string | null;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  originalImageUrl,
  editedCanvasUrl,
  aiEditedImageUrl,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [afterSource, setAfterSource] = useState<'manual' | 'ai'>('manual');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const activeAfterImage =
    afterSource === 'ai' && aiEditedImageUrl
      ? aiEditedImageUrl
      : editedCanvasUrl || originalImageUrl;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    updateSlider(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleDownloadComparison = () => {
    if (!activeAfterImage) return;
    const link = document.createElement('a');
    link.download = `ETR_Plants_Design_Comparison_${Date.now()}.png`;
    link.href = activeAfterImage;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none">
      <div
        className={`bg-stone-900 border border-stone-800 rounded-lg flex flex-col overflow-hidden shadow-2xl transition-all ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950 text-stone-200">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-100">
              Before & After Visual Comparison
            </h3>
            <p className="text-xs text-stone-400">
              Scrub the slider or compare side-by-side to review biophilic transformations
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Source switch (Manual vs AI if available) */}
            {aiEditedImageUrl && (
              <div className="flex bg-stone-900 border border-stone-800 rounded p-0.5 text-xs">
                <button
                  onClick={() => setAfterSource('manual')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    afterSource === 'manual'
                      ? 'bg-emerald-800 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Manual Design
                </button>
                <button
                  onClick={() => setAfterSource('ai')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    afterSource === 'ai'
                      ? 'bg-emerald-800 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  AI Generated
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-stone-900 border border-stone-800 rounded p-0.5 text-xs">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'slider'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Split Slider Mode"
              >
                <Sliders className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Side by Side Mode"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleDownloadComparison}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Workspace */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-stone-950 flex items-center justify-center">
          {viewMode === 'slider' ? (
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative max-w-full max-h-[75vh] select-none rounded overflow-hidden shadow-2xl cursor-ew-resize border border-stone-800"
            >
              {/* After (Plant Design) - Full base layer */}
              <img
                src={activeAfterImage}
                alt="After Plant Design"
                className="block max-h-[72vh] w-auto max-w-full object-contain pointer-events-none"
              />

              {/* Before (Original Photo) - Clipped by slider percentage */}
              <div
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                className="absolute inset-0 pointer-events-none"
              >
                <img
                  src={originalImageUrl}
                  alt="Before (Original Interior)"
                  className="block h-full w-full object-contain pointer-events-none"
                />
              </div>

              {/* Draggable Divider Handle Line */}
              <div
                style={{ left: `${sliderPosition}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 pointer-events-none shadow-[0_0_10px_rgba(52,211,153,0.8)]"
              >
                {/* Center Knob */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-900 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-lg text-[10px] font-mono">
                  ↔
                </div>
              </div>

              {/* Floating Labels */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-stone-900/80 backdrop-blur border border-stone-700 text-stone-200 text-xs font-mono rounded pointer-events-none">
                BEFORE (ORIGINAL)
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-950/80 backdrop-blur border border-emerald-700 text-emerald-300 text-xs font-mono rounded pointer-events-none">
                AFTER (ETR PLANTS)
              </div>
            </div>
          ) : (
            /* Side by Side Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
              <div className="flex flex-col bg-stone-900 border border-stone-800 rounded overflow-hidden">
                <div className="px-3 py-2 bg-stone-950 border-b border-stone-800 text-xs font-mono text-stone-400">
                  BEFORE: ORIGINAL INTERIOR
                </div>
                <div className="p-3 flex items-center justify-center flex-1 bg-stone-950/50">
                  <img
                    src={originalImageUrl}
                    alt="Original Interior"
                    className="max-h-[55vh] object-contain rounded"
                  />
                </div>
              </div>

              <div className="flex flex-col bg-stone-900 border border-stone-800 rounded overflow-hidden">
                <div className="px-3 py-2 bg-emerald-950 border-b border-emerald-800 text-xs font-mono text-emerald-300">
                  AFTER: ETR PLANTS DESIGN
                </div>
                <div className="p-3 flex items-center justify-center flex-1 bg-stone-950/50">
                  <img
                    src={activeAfterImage}
                    alt="ETR Plants Design"
                    className="max-h-[55vh] object-contain rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <div>
            Drag handle left or right to inspect foliage placement against original walls,
            flooring, and lighting.
          </div>
          <button
            onClick={() => setSliderPosition(50)}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset 50/50</span>
          </button>
        </div>
      </div>
    </div>
  );
};
