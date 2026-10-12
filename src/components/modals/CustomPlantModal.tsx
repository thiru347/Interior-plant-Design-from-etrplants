import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Check,
  Eye,
  Sliders,
  Scissors,
} from 'lucide-react';
import { Plant, PlantCategory, LightLevel } from '../../types';
import { createTransparentPlantCutout } from '../../utils/imageUtils';

interface CustomPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomPlant: (plant: Plant, addToDesignImmediately: boolean) => void;
}

export const CustomPlantModal: React.FC<CustomPlantModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomPlant,
}) => {
  const [plantName, setPlantName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [category, setCategory] = useState<PlantCategory>('foliage');
  const [lightRequirements, setLightRequirements] = useState<LightLevel>('Bright Indirect');
  const [heightMin, setHeightMin] = useState(120);
  const [heightMax, setHeightMax] = useState(200);
  const [approxWidth, setApproxWidth] = useState(70);
  const [growthHabit, setGrowthHabit] = useState('');
  const [indoorSuitability, setIndoorSuitability] = useState('');

  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [cutoutImageUrl, setCutoutImageUrl] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [isProcessingCutout, setIsProcessingCutout] = useState(false);
  const [threshold, setThreshold] = useState(238);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setRawImageUrl(dataUrl);

      if (removeBackground) {
        setIsProcessingCutout(true);
        const cutout = await createTransparentPlantCutout(dataUrl, threshold);
        setCutoutImageUrl(cutout);
        setIsProcessingCutout(false);
      } else {
        setCutoutImageUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRecomputeCutout = async (newThreshold: number) => {
    setThreshold(newThreshold);
    if (rawImageUrl && removeBackground) {
      setIsProcessingCutout(true);
      const cutout = await createTransparentPlantCutout(rawImageUrl, newThreshold);
      setCutoutImageUrl(cutout);
      setIsProcessingCutout(false);
    }
  };

  const handleSave = (addImmediately: boolean) => {
    if (!plantName.trim() || !rawImageUrl) return;

    const newPlant: Plant = {
      id: `custom-plant-${Date.now()}`,
      name: plantName.trim(),
      botanicalName: botanicalName.trim() || plantName.trim(),
      category,
      imageUrl: rawImageUrl,
      cutoutUrl: cutoutImageUrl || rawImageUrl,
      heightMin,
      heightMax,
      defaultHeight: Math.round((heightMin + heightMax) / 2),
      approxWidth,
      growthHabit: growthHabit || 'Custom botanical specimen',
      indoorSuitability: indoorSuitability || 'Interior landscape grade',
      lightRequirements,
      wateringNeeds: 'Standard interior sub-irrigation maintenance',
      suggestedPlacement: ['Custom designated architectural location'],
      isCustom: true,
    };

    onSaveCustomPlant(newPlant, addImmediately);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-stone-200">
      <div className="bg-stone-900 border border-stone-800 rounded-lg w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-100">
                Upload Custom Plant Reference Photo
              </h3>
              <p className="text-xs text-stone-400">
                Import customer plant variety with automatic transparent background cutout
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Photo Upload Zone */}
          {!rawImageUrl ? (
            <label className="border-2 border-dashed border-stone-700 hover:border-emerald-600 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-stone-950 cursor-pointer group transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-stone-200">
                Click to Upload Plant Photograph
              </span>
              <span className="text-xs text-stone-500 mt-1">
                Best results: Photo on plain or white wall. Supports JPG, PNG, WebP.
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </label>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950 border border-stone-800 rounded p-4">
              {/* Image Preview & Cutout Toggle */}
              <div className="space-y-3">
                <div className="aspect-square bg-stone-900 rounded border border-stone-800 overflow-hidden flex items-center justify-center relative">
                  {/* Checkerboard background to demonstrate transparency */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#444_25%,transparent_25%),linear-gradient(-45deg,#444_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#444_75%),linear-gradient(-45deg,transparent_75%,#444_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0]" />
                  <img
                    src={cutoutImageUrl || rawImageUrl}
                    alt="Plant Preview"
                    className="max-h-full max-w-full object-contain relative z-10"
                  />
                  {isProcessingCutout && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-emerald-300 z-20">
                      Processing Cutout...
                    </div>
                  )}
                </div>

                <label className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer">
                  <span>Replace Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </label>
              </div>

              {/* Cutout Controls */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider mb-2">
                    Transparency Cutout
                  </h4>

                  <label className="flex items-center gap-2 text-xs text-stone-200 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeBackground}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setRemoveBackground(val);
                        if (val && rawImageUrl) {
                          handleRecomputeCutout(threshold);
                        } else {
                          setCutoutImageUrl(rawImageUrl);
                        }
                      }}
                      className="accent-emerald-500 rounded"
                    />
                    <span>Auto-Remove White / Light Background</span>
                  </label>

                  {removeBackground && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>Cutout Sensitivity</span>
                        <span className="font-mono text-stone-300">{threshold}</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="252"
                        value={threshold}
                        onChange={(e) => handleRecomputeCutout(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500"
                      />
                      <p className="text-[10px] text-stone-500">
                        Foliage edges are smoothly feathered to composite naturally over room photos.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800 text-[11px] text-stone-400">
                  Cutout is saved locally in browser storage for instant reuse.
                </div>
              </div>
            </div>
          )}

          {/* Plant Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-300 block mb-1">
                Plant Variety Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                placeholder="e.g. Ficus Panda Standard"
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">
                Botanical Name
              </label>
              <input
                type="text"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
                placeholder="e.g. Ficus retusa microcarpa"
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlantCategory)}
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              >
                <option value="palms">Palms</option>
                <option value="ficus">Ficus & Trees</option>
                <option value="foliage">Foliage</option>
                <option value="architectural">Architectural</option>
                <option value="low-light">Low Light</option>
                <option value="flowering">Flowering</option>
                <option value="artificial">Artificial / Preserved</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">
                Light Requirement
              </label>
              <select
                value={lightRequirements}
                onChange={(e) => setLightRequirements(e.target.value as LightLevel)}
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Low Light Tolerant">Low Light Tolerant</option>
                <option value="Medium Light">Medium Light</option>
                <option value="Bright Indirect">Bright Indirect</option>
                <option value="High / Filtered Sun">High / Filtered Sun</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">
                Height Range (cm)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={heightMin}
                  onChange={(e) => setHeightMin(parseInt(e.target.value, 10) || 100)}
                  placeholder="Min"
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded text-stone-100 font-mono"
                />
                <input
                  type="number"
                  value={heightMax}
                  onChange={(e) => setHeightMax(parseInt(e.target.value, 10) || 200)}
                  placeholder="Max"
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded text-stone-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">
                Approximate Width (cm)
              </label>
              <input
                type="number"
                value={approxWidth}
                onChange={(e) => setApproxWidth(parseInt(e.target.value, 10) || 70)}
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 font-mono"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!plantName || !rawImageUrl}
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 text-xs rounded transition-colors disabled:opacity-40"
            >
              Save to Catalogue Only
            </button>

            <button
              type="button"
              disabled={!plantName || !rawImageUrl}
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Directly to Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
