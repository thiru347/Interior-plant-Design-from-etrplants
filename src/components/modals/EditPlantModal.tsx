import React, { useState, useRef } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Upload,
  RotateCcw,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Plant, PlantCategory } from '../../types';
import { BOTANICAL_PLACEHOLDER_URL } from '../../utils/imageUtils';

interface EditPlantModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlant: (updatedPlant: Plant) => void;
  onDeletePlant: (plantId: string) => void;
  onDeletePlantPhoto: (plantId: string) => void;
}

export const EditPlantModal: React.FC<EditPlantModalProps> = ({
  plant,
  isOpen,
  onClose,
  onUpdatePlant,
  onDeletePlant,
  onDeletePlantPhoto,
}) => {
  if (!isOpen || !plant) return null;

  const [name, setName] = useState(plant.name);
  const [botanicalName, setBotanicalName] = useState(plant.botanicalName);
  const [category, setCategory] = useState<PlantCategory>(plant.category);
  const [currentImage, setCurrentImage] = useState(plant.imageUrl);
  const [isPlaceholder, setIsPlaceholder] = useState(Boolean(plant.isPlaceholderImage));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: { id: PlantCategory; label: string }[] = [
    { id: 'bonsai', label: 'Bonsai Trees' },
    { id: 'palms', label: 'Palms' },
    { id: 'ficus', label: 'Ficus & Trees' },
    { id: 'architectural', label: 'Architectural' },
    { id: 'foliage', label: 'Foliage' },
    { id: 'low-light', label: 'Low Light' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'artificial', label: 'Preserved & Artificial' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setCurrentImage(dataUrl);
        setIsPlaceholder(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = () => {
    setCurrentImage(BOTANICAL_PLACEHOLDER_URL);
    setIsPlaceholder(true);
  };

  const handleResetPhoto = () => {
    if (plant.originalImageUrl) {
      setCurrentImage(plant.originalImageUrl);
      setIsPlaceholder(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const updated: Plant = {
      ...plant,
      name: name.trim(),
      botanicalName: botanicalName.trim(),
      category,
      imageUrl: currentImage,
      isPlaceholderImage: isPlaceholder,
      originalImageUrl: plant.originalImageUrl || plant.imageUrl,
    };

    onUpdatePlant(updated);
    onClose();
  };

  const handleDeletePlantConfirm = () => {
    onDeletePlant(plant.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-lg text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-white">Edit Plant Details</h2>
              <p className="text-xs text-stone-400">Change name, replace photo, or delete from catalogue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Photo Management Section */}
          <div>
            <label className="block text-stone-300 font-medium mb-2 font-mono uppercase tracking-wider text-[11px]">
              Plant Photograph
            </label>
            <div className="flex gap-4 items-center bg-stone-950 p-3 rounded-lg border border-stone-800">
              <div className="w-24 h-24 rounded bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden shrink-0 relative group">
                <img
                  src={currentImage}
                  alt={name}
                  className="max-h-full max-w-full object-contain"
                />
                {isPlaceholder && (
                  <span className="absolute bottom-1 bg-amber-950/90 text-amber-300 text-[9px] px-1.5 py-0.5 rounded border border-amber-800/60 font-mono">
                    Placeholder
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>

                  {!isPlaceholder && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Photo</span>
                    </button>
                  )}

                  {plant.originalImageUrl && plant.originalImageUrl !== currentImage && (
                    <button
                      type="button"
                      onClick={handleResetPhoto}
                      className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Original</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-stone-400">
                  {isPlaceholder
                    ? 'Photo has been deleted. You can upload an authentic plant photo or keep the placeholder.'
                    : 'JPG, PNG, or WebP. Transparent cutouts blend seamlessly into interior designs.'}
                </p>
              </div>
            </div>
          </div>

          {/* Plant Name Input */}
          <div>
            <label className="block text-stone-300 font-medium mb-1 font-mono uppercase tracking-wider text-[11px]">
              Plant Variety Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ficus Ginseng Bonsai, Japanese Juniper"
              className="w-full bg-stone-950 border border-stone-700 px-3.5 py-2 rounded text-stone-100 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Botanical Name Input */}
          <div>
            <label className="block text-stone-300 font-medium mb-1 font-mono uppercase tracking-wider text-[11px]">
              Botanical / Scientific Species Name
            </label>
            <input
              type="text"
              value={botanicalName}
              onChange={(e) => setBotanicalName(e.target.value)}
              placeholder="e.g. Ficus microcarpa, Juniperus procumbens"
              className="w-full bg-stone-950 border border-stone-700 px-3.5 py-2 rounded text-stone-100 italic focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-stone-300 font-medium mb-1.5 font-mono uppercase tracking-wider text-[11px]">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-2 rounded text-xs text-center border transition-colors cursor-pointer ${
                    category === cat.id
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-medium'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone: Delete Entire Plant */}
          <div className="pt-4 border-t border-stone-800/80">
            {showDeleteConfirm ? (
              <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Are you sure you want to delete this plant?</span>
                </div>
                <p className="text-[11px] text-rose-300/80">
                  This will remove "{plant.name}" from the botanical catalogue.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDeletePlantConfirm}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-medium cursor-pointer"
                  >
                    Confirm Delete Plant
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete this plant variety from catalogue...</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-950/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
