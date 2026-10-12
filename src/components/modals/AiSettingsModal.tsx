import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Key,
  ShieldCheck,
  Server,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfigured: boolean;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  aiConfigured,
}) => {
  const [statusData, setStatusData] = useState<{
    configured: boolean;
    modelText: string;
    modelImage: string;
    note: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/ai/status')
        .then((res) => res.json())
        .then((data) => setStatusData(data))
        .catch((err) => console.error('Status fetch failed', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-stone-200">
      <div className="bg-stone-900 border border-stone-800 rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-100">
                AI Engine & Cost Control Architecture
              </h3>
              <p className="text-xs text-stone-400">
                Transparency on models, server-side security, and offline manual workflows
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
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-stone-300">
          {/* Status Badge */}
          <div
            className={`p-4 rounded border flex items-start gap-3 ${
              statusData?.configured || aiConfigured
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : 'bg-stone-950 border-stone-800 text-stone-300'
            }`}
          >
            {statusData?.configured || aiConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-serif font-medium text-sm text-stone-100">
                {statusData?.configured || aiConfigured
                  ? 'Gemini API Active (Server-Side)'
                  : 'Offline Architectural Heuristics Engine Active'}
              </h4>
              <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                {statusData?.note ||
                  'The application is fully operational. Manual canvas placement, custom pot dimensions, transparent cutouts, and schedule exports work with zero API calls.'}
              </p>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="space-y-3">
            <h5 className="font-mono uppercase text-stone-400 tracking-wider text-[10px]">
              Engineered Models & Services
            </h5>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="bg-stone-950 border border-stone-800 p-3 rounded flex items-start justify-between">
                <div>
                  <div className="text-emerald-400 font-bold">gemini-3.8-flash</div>
                  <div className="text-stone-400 font-sans text-xs mt-0.5">
                    Room vision analysis, corner identification, traffic clearance, light estimation
                  </div>
                </div>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                  Vision API
                </span>
              </div>

              <div className="bg-stone-950 border border-stone-800 p-3 rounded flex items-start justify-between">
                <div>
                  <div className="text-emerald-400 font-bold">gemini-3.1-flash-lite-image</div>
                  <div className="text-stone-400 font-sans text-xs mt-0.5">
                    Photorealistic interior plant blending, surface light reflections & shadows
                  </div>
                </div>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                  Image Synthesis
                </span>
              </div>
            </div>
          </div>

          {/* Cost Control & Security */}
          <div className="space-y-2 bg-stone-950 border border-stone-800 p-4 rounded text-[11px] leading-relaxed">
            <h5 className="font-mono uppercase text-emerald-400 text-[10px] tracking-wider">
              Cost Control & Architecture Guarantees
            </h5>
            <ul className="space-y-1.5 text-stone-400 list-disc list-inside">
              <li>
                <strong className="text-stone-200">Zero Involuntary API Calls:</strong> Moving,
                scaling, and rotating plants on canvas uses native browser GPU canvas rendering with 0
                API cost.
              </li>
              <li>
                <strong className="text-stone-200">Secure Server Proxy:</strong> Secret API keys
                remain on the server runtime and are never exposed in browser JavaScript.
              </li>
              <li>
                <strong className="text-stone-200">No Fake Renders:</strong> The system never displays
                fictitious results if API calls are disabled.
              </li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
