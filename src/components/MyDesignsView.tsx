import React from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Calendar,
  Layers,
  ArrowRight,
  Download,
  BarChart3,
} from 'lucide-react';
import { SavedDesign } from '../types';

interface MyDesignsViewProps {
  savedDesigns: SavedDesign[];
  onLoadDesign: (design: SavedDesign) => void;
  onDuplicateDesign: (design: SavedDesign) => void;
  onDeleteDesign: (id: string) => void;
  onCreateNewDesign: () => void;
  onOpenDashboard?: () => void;
}

export const MyDesignsView: React.FC<MyDesignsViewProps> = ({
  savedDesigns,
  onLoadDesign,
  onDuplicateDesign,
  onDeleteDesign,
  onCreateNewDesign,
  onOpenDashboard,
}) => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-800 pb-20">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-emerald-400 text-xs font-mono tracking-wider uppercase mb-2">
              Project Archive & Iterations
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
              My Saved Interior Plant Designs
            </h1>
            <p className="text-stone-400 text-sm mt-2 max-w-2xl font-light">
              Stored locally in your browser session. Reopen any design to reposition plants,
              generate fresh comparisons, or export plant schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-stone-700 text-xs font-medium rounded flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics Dashboard</span>
              </button>
            )}

            <button
              onClick={onCreateNewDesign}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Design</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {savedDesigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDesigns.map((design) => (
              <div
                key={design.id}
                className="bg-white border border-stone-200/90 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail */}
                  <div
                    onClick={() => onLoadDesign(design)}
                    className="aspect-[16/10] bg-stone-950 overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={design.thumbnail || design.roomImage}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-stone-950/80 text-emerald-300 text-[10px] font-mono rounded">
                      {design.plants.length} Plants Placed
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => onLoadDesign(design)}
                      className="font-serif text-base font-medium text-stone-900 group-hover:text-emerald-800 transition-colors cursor-pointer truncate"
                    >
                      {design.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{new Date(design.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-xs text-stone-600 line-clamp-1 font-sans">
                      Space: {design.roomName || 'Custom Upload'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateDesign(design)}
                      title="Duplicate project"
                      className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-stone-800 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDesign(design.id)}
                      title="Delete project"
                      className="p-1.5 hover:bg-red-50 text-stone-500 hover:text-red-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onLoadDesign(design)}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-stone-200/90 rounded-lg p-8 max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-normal text-stone-900">
              No Saved Projects Yet
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              When you design interior layouts in the studio and click "Save Design", your
              arrangements, dimensions, and plant schedules are saved here.
            </p>
            <button
              onClick={onCreateNewDesign}
              className="mt-6 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded transition-colors"
            >
              Start Your First Design
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
