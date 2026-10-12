import React, { useEffect, useState } from 'react';
import { Sparkles, Scan, Compass, CheckCircle2, Layers } from 'lucide-react';

interface UploadMotionModalProps {
  isOpen: boolean;
  onComplete: () => void;
  imagePreviewUrl: string | null;
  roomTitle: string;
}

export const UploadMotionModal: React.FC<UploadMotionModalProps> = ({
  isOpen,
  onComplete,
  imagePreviewUrl,
  roomTitle,
}) => {
  const [phase, setPhase] = useState<'scanning' | 'depth' | 'ready'>('scanning');
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setPhase('scanning');
      setProgress(15);
      return;
    }

    const t1 = setTimeout(() => {
      setProgress(55);
      setPhase('depth');
    }, 650);

    const t2 = setTimeout(() => {
      setProgress(100);
      setPhase('ready');
    }, 1350);

    const t3 = setTimeout(() => {
      onComplete();
    }, 1950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-xl mx-4 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-center">
        {/* Animated 3D background ambient grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            transform: 'perspective(500px) rotateX(45deg)',
            transformOrigin: 'top center',
          }}
        />

        {/* 3D Holographic Card Container */}
        <div
          className="relative mx-auto w-64 h-40 sm:w-80 sm:h-48 rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl shadow-emerald-950/60 transition-transform duration-700 ease-out"
          style={{
            transform:
              phase === 'scanning'
                ? 'perspective(800px) rotateX(18deg) rotateY(-10deg) scale(0.92)'
                : phase === 'depth'
                ? 'perspective(800px) rotateX(8deg) rotateY(6deg) scale(0.98)'
                : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
          }}
        >
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="Uploaded room preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-500">
              <Scan className="w-10 h-10 animate-pulse text-emerald-400" />
            </div>
          )}

          {/* 3D Scanning Laser Beam */}
          <div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981]"
            style={{
              animation: 'scanLaser 1.4s ease-in-out infinite alternate',
            }}
          />

          {/* Holographic depth corners */}
          <div className="absolute top-2 left-2 border-t-2 border-l-2 border-emerald-400 w-4 h-4" />
          <div className="absolute top-2 right-2 border-t-2 border-r-2 border-emerald-400 w-4 h-4" />
          <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-emerald-400 w-4 h-4" />
          <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-emerald-400 w-4 h-4" />

          {/* Phase Badge */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stone-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {phase === 'scanning'
                ? '3D Spatial Mapping...'
                : phase === 'depth'
                ? 'Calculating Floor Perspective...'
                : '3D Room Synchronized'}
            </span>
          </div>
        </div>

        {/* Title & Status */}
        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-full text-xs font-medium text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Room Ingestion Engine</span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif text-stone-100 font-semibold truncate">
            {roomTitle || 'Architectural Space'}
          </h3>

          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {phase === 'scanning'
              ? 'Analyzing architectural surfaces, room lighting angles, and floor boundary lines.'
              : phase === 'depth'
              ? 'Generating 3D spatial depth plane for realistic perspective plant sizing.'
              : 'Complete! Room loaded with interactive 3D motion and nano HD clarity.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_8px_#10B981]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 mt-2">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-500" />
              <span>Depth Layers: 3</span>
            </span>
            <span className="text-emerald-400 font-semibold">{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.8; }
          100% { top: 96%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};
