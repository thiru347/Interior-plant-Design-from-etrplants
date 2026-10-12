import React from 'react';
import {
  Upload,
  Sparkles,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
  Building2,
  Layers,
  Sliders,
} from 'lucide-react';
import { SAMPLE_ROOMS } from '../data/assets';
import { SampleRoom } from '../types';
import { UploadMotionModal } from './modals/UploadMotionModal';

interface HomeViewProps {
  onStartDesigning: () => void;
  onSelectSampleRoom: (room: SampleRoom) => void;
  onCustomPhotoUpload: (file: File) => void;
  onOpenHouseTour?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartDesigning,
  onSelectSampleRoom,
  onCustomPhotoUpload,
  onOpenHouseTour,
}) => {
  const [isMotionScanningOpen, setIsMotionScanningOpen] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = React.useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingPreviewUrl(event.target?.result as string);
        setPendingFile(file);
        setIsMotionScanningOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingPreviewUrl(event.target?.result as string);
        setPendingFile(file);
        setIsMotionScanningOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMotionComplete = () => {
    if (pendingFile) {
      onCustomPhotoUpload(pendingFile);
      setPendingFile(null);
      setPendingPreviewUrl(null);
    }
    setIsMotionScanningOpen(false);
  };


  return (
    <div className="bg-[#FAF8F5] text-stone-800 min-h-screen">
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-16 lg:py-24 border-b border-stone-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#40916c_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded text-emerald-300 text-xs font-mono tracking-wider uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commercial & Hospitality Biophilic Engineering</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.15]">
              AI Interior Plant Designer for{' '}
              <span className="italic font-normal text-emerald-400">Architects & Hotels</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl font-light">
              Visualize exact plant varieties, custom planter dimensions, and biophilic placements in
              your actual interior spaces before purchasing. You retain complete manual control over
              every plant, pot dimension, and placement coordinate.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onStartDesigning}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded shadow-lg shadow-emerald-950/50 flex items-center gap-2.5 transition-all group cursor-pointer"
              >
                <span>Start Designing Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <label className="px-5 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-sm rounded flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Room Photograph</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {onOpenHouseTour && (
                <button
                  onClick={onOpenHouseTour}
                  className="px-5 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-medium text-sm rounded flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>House 3D Tour (Bedroom, Hall, Corridor)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instant Action: Upload or Choose Sample Room */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-stone-200/80">
          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="lg:col-span-5 border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-stone-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              Upload Your Actual Interior Photo
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Supports JPG, PNG, and WebP. Existing walls, furniture, floors, and lighting perspective
              are 100% preserved.
            </p>
            <label className="mt-4 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer transition-colors">
              <span>Select Photo File</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Preset Sample Rooms */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Or Test with Curated Interior Spaces
                </h3>
                <span className="text-xs text-stone-400 font-mono">1-Click Launch</span>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Explore immediate plant styling in photorealistic luxury hospitality and executive settings:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_ROOMS.map((room) => (
                <div
                  key={room.id}
                  onClick={() => onSelectSampleRoom(room)}
                  className="group relative rounded overflow-hidden border border-stone-200 cursor-pointer bg-stone-100 hover:border-emerald-600 hover:shadow-md transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5 bg-white">
                    <div className="text-[10px] uppercase font-mono text-emerald-700 tracking-wider">
                      {room.category}
                    </div>
                    <div className="text-xs font-medium text-stone-900 truncate mt-0.5">
                      {room.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles & Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-serif text-2xl sm:text-4xl text-stone-900 font-normal">
            Built for Exact Commercial Landscaping Specifications
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3 font-light">
            No guesswork. You maintain complete control over botanical selection, exact planter
            dimensions, quantities, and physical room coordinates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-lg border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
                Complete Manual Canvas Control
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Drag, scale, rotate, duplicate, and z-index order any plant cutout over your photo.
                Works instantly without slow API calls or internet latency.
              </p>
            </div>
            <ul className="mt-5 space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-4">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom plant & pot dimensions (cm, mm, inches)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Relative percentage anchor coordinates</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multi-level undo, redo, and layer management</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-lg border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
                AI Physical Placement Recommendations
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Receive physical placement pins analyzing room corners, reception desks, structural
                columns, traffic flow clearance, and light suitability.
              </p>
            </div>
            <ul className="mt-5 space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-4">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Numbered markers placed directly on photo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accept, reject, or fine-tune any recommendation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Realistic lux/daylight assessment notes</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-lg border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
                Plant Schedule & Quotation Pipeline
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Automatic generation of a professional plant schedule itemizing varieties, botanical
                names, pot dimensions, quantities, and room locations.
              </p>
            </div>
            <ul className="mt-5 space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-4">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export directly to CSV or print schedule</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Submit 1-click quotation enquiry to ETR Plants</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Draggable Before-and-After comparison slider</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-100 py-10 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm">ETR PLANTS</span>
            <span className="text-stone-400">·</span>
            <span>Commercial Indoor Plant Solutions</span>
          </div>
          <p className="text-stone-500">
            Dedicated interior landscaping visualization for hotels, commercial towers, and modern spaces.
          </p>
        </div>
      </footer>

      {/* 3D Motion Upload Scanning Ingestion Modal */}
      <UploadMotionModal
        isOpen={isMotionScanningOpen}
        onComplete={handleMotionComplete}
        imagePreviewUrl={pendingPreviewUrl}
        roomTitle={pendingFile?.name.replace(/\.[^/.]+$/, '') || 'Custom Interior Photograph'}
      />
    </div>
  );
};
