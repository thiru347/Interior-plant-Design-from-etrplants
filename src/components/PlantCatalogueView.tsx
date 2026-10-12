import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Sun,
  Ruler,
  Upload,
  ArrowRight,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  TreePine,
  Image as ImageIcon,
} from 'lucide-react';
import { Plant, PlantCategory } from '../types';
import { EditPlantModal } from './modals/EditPlantModal';
import { BOTANICAL_PLACEHOLDER_URL } from '../utils/imageUtils';

interface PlantCatalogueViewProps {
  plants: Plant[];
  onSelectPlantForStudio: (plant: Plant) => void;
  onOpenCustomPlantModal: () => void;
  onUpdatePlant?: (updatedPlant: Plant) => void;
  onDeletePlant?: (plantId: string) => void;
  onDeletePlantPhoto?: (plantId: string) => void;
}

export const PlantCatalogueView: React.FC<PlantCatalogueViewProps> = ({
  plants,
  onSelectPlantForStudio,
  onOpenCustomPlantModal,
  onUpdatePlant,
  onDeletePlant,
  onDeletePlantPhoto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [renamingPlantId, setRenamingPlantId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [renamingBotanical, setRenamingBotanical] = useState('');

  // Individual file input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadPlantId, setActiveUploadPlantId] = useState<string | null>(null);

  const categories: { id: string; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All Varieties' },
    { id: 'bonsai', label: 'Bonsai Trees' },
    { id: 'palms', label: 'Palms' },
    { id: 'ficus', label: 'Ficus & Trees' },
    { id: 'architectural', label: 'Architectural' },
    { id: 'foliage', label: 'Foliage' },
    { id: 'low-light', label: 'Low Light' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'artificial', label: 'Preserved & Artificial' },
  ];

  const filteredPlants = plants.filter((plant) => {
    const matchesQuery =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || plant.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const handleStartRename = (plant: Plant) => {
    setRenamingPlantId(plant.id);
    setRenamingName(plant.name);
    setRenamingBotanical(plant.botanicalName);
  };

  const handleSaveRename = (plant: Plant) => {
    if (!renamingName.trim() || !onUpdatePlant) {
      setRenamingPlantId(null);
      return;
    }
    const updated: Plant = {
      ...plant,
      name: renamingName.trim(),
      botanicalName: renamingBotanical.trim() || plant.botanicalName,
    };
    onUpdatePlant(updated);
    setRenamingPlantId(null);
  };

  const handleDeletePhoto = (plant: Plant) => {
    if (onDeletePlantPhoto) {
      onDeletePlantPhoto(plant.id);
    } else if (onUpdatePlant) {
      const updated: Plant = {
        ...plant,
        imageUrl: BOTANICAL_PLACEHOLDER_URL,
        isPlaceholderImage: true,
        originalImageUrl: plant.originalImageUrl || plant.imageUrl,
      };
      onUpdatePlant(updated);
    }
  };

  const handleRestorePhoto = (plant: Plant) => {
    if (plant.originalImageUrl && onUpdatePlant) {
      const updated: Plant = {
        ...plant,
        imageUrl: plant.originalImageUrl,
        isPlaceholderImage: false,
      };
      onUpdatePlant(updated);
    }
  };

  const handleTriggerUpload = (plantId: string) => {
    setActiveUploadPlantId(plantId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadPlantId || !onUpdatePlant) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        const targetPlant = plants.find((p) => p.id === activeUploadPlantId);
        if (targetPlant) {
          const updated: Plant = {
            ...targetPlant,
            imageUrl: dataUrl,
            isPlaceholderImage: false,
            originalImageUrl: targetPlant.originalImageUrl || targetPlant.imageUrl,
          };
          onUpdatePlant(updated);
        }
      }
      setActiveUploadPlantId(null);
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const handleDeletePlant = (plantId: string, plantName: string) => {
    if (window.confirm(`Are you sure you want to remove "${plantName}" from the catalogue?`)) {
      if (onDeletePlant) {
        onDeletePlant(plantId);
      }
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-800 pb-20">
      {/* Hidden file input for photo replacement */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-emerald-400 text-xs font-mono tracking-wider uppercase mb-2 flex items-center gap-2">
              <TreePine className="w-3.5 h-3.5" />
              <span>Botanical Specifications & Acclimatization</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
              ETR Plants Botanical Catalogue
            </h1>
            <p className="text-stone-400 text-sm mt-2 max-w-2xl font-light">
              Explore acclimated indoor plant specimens selected for luxury hotel lobbies, corporate
              headquarters, and architectural atriums. You can rename varieties, update or delete photos, and customize your catalogue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick button to view only bonsai */}
            <button
              onClick={() => setSelectedCategory('bonsai')}
              className={`px-4 py-2.5 rounded text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer border ${
                selectedCategory === 'bonsai'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-stone-800 text-emerald-300 border-emerald-800/60 hover:bg-stone-750'
              }`}
            >
              <TreePine className="w-4 h-4 text-emerald-400" />
              <span>View Only Bonsai</span>
            </button>

            <button
              onClick={onOpenCustomPlantModal}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-2 shadow-lg transition-colors shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Add New Plant Variety</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by variety name or botanical species (e.g. Bonsai, Palm)..."
              className="w-full bg-white border border-stone-300 pl-9 pr-4 py-2.5 rounded text-xs text-stone-900 placeholder-stone-400 shadow-sm focus:border-emerald-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
            <span>
              Displaying {filteredPlants.length} of {plants.length} specimens
            </span>
            {selectedCategory === 'bonsai' && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans font-medium text-[11px]">
                Showing Only Bonsai
              </span>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat.id === 'bonsai' && <TreePine className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Plant Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {filteredPlants.map((plant) => {
            const isPlaceholder = Boolean(plant.isPlaceholderImage);
            const isRenaming = renamingPlantId === plant.id;

            return (
              <div
                key={plant.id}
                className="bg-white border border-stone-200/90 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-700/60 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Image Container with Delete Photo & Replace Controls */}
                  <div className="aspect-[4/3] bg-stone-100/70 p-4 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Placeholder or Custom badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {isPlaceholder && (
                        <span className="px-2 py-0.5 bg-amber-800/90 text-amber-100 text-[10px] font-mono rounded shadow-sm border border-amber-700">
                          Placeholder · No Photo
                        </span>
                      )}
                      {plant.category === 'bonsai' && (
                        <span className="px-2 py-0.5 bg-emerald-900/90 text-emerald-200 text-[10px] font-mono rounded shadow-sm border border-emerald-700 flex items-center gap-1">
                          <TreePine className="w-3 h-3 text-emerald-400" />
                          <span>Bonsai</span>
                        </span>
                      )}
                      {plant.isCustom && (
                        <span className="px-2 py-0.5 bg-stone-900/80 text-emerald-400 text-[10px] font-mono rounded">
                          Custom Variety
                        </span>
                      )}
                    </div>

                    {/* Quick photo controls overlay */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-stone-900/85 backdrop-blur-xs p-1 rounded-md border border-stone-700/70 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Upload / Replace Photo"
                        onClick={() => handleTriggerUpload(plant.id)}
                        className="p-1 text-stone-300 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>

                      {!isPlaceholder ? (
                        <button
                          title="Delete Plant Photo"
                          onClick={() => handleDeletePhoto(plant)}
                          className="p-1 text-stone-300 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        plant.originalImageUrl && (
                          <button
                            title="Restore Original Photo"
                            onClick={() => handleRestorePhoto(plant)}
                            className="p-1 text-stone-300 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}

                      <button
                        title="Edit Plant Details"
                        onClick={() => setEditingPlant(plant)}
                        className="p-1 text-stone-300 hover:text-amber-400 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* If photo is deleted, show a quick upload button inside the photo area */}
                    {isPlaceholder && (
                      <div className="absolute inset-0 bg-stone-100/80 flex flex-col items-center justify-center p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-stone-400 mb-1" />
                        <span className="text-xs font-medium text-stone-700 mb-2">Photo Deleted</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTriggerUpload(plant.id)}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Photo</span>
                          </button>
                          {plant.originalImageUrl && (
                            <button
                              onClick={() => handleRestorePhoto(plant)}
                              className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details & Inline Rename */}
                  <div className="p-4 space-y-2.5">
                    {isRenaming ? (
                      <div className="space-y-2 bg-stone-50 p-2.5 rounded border border-stone-200">
                        <div>
                          <label className="text-[10px] font-mono text-stone-500 uppercase">Plant Name</label>
                          <input
                            type="text"
                            value={renamingName}
                            onChange={(e) => setRenamingName(e.target.value)}
                            className="w-full bg-white border border-stone-300 px-2 py-1 text-xs rounded text-stone-900 focus:outline-none focus:border-emerald-600"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-stone-500 uppercase">Botanical Name</label>
                          <input
                            type="text"
                            value={renamingBotanical}
                            onChange={(e) => setRenamingBotanical(e.target.value)}
                            className="w-full bg-white border border-stone-300 px-2 py-1 text-xs rounded text-stone-900 italic focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => setRenamingPlantId(null)}
                            className="px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-200 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveRename(plant)}
                            className="px-2.5 py-1 text-[11px] bg-emerald-800 text-white rounded font-medium hover:bg-emerald-700 cursor-pointer"
                          >
                            Save Name
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-1 group/title">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-serif text-base font-medium text-stone-900 truncate">
                              {plant.name}
                            </h3>
                            <button
                              title="Rename plant name"
                              onClick={() => handleStartRename(plant)}
                              className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="italic text-xs text-stone-500 font-sans truncate">
                            {plant.botanicalName}
                          </p>
                        </div>

                        {/* Delete plant button */}
                        <button
                          title="Delete plant from catalogue"
                          onClick={() => handleDeletePlant(plant.id, plant.name)}
                          className="text-stone-300 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                      {plant.growthHabit}
                    </p>

                    <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-600 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{plant.lightRequirements}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>
                          {plant.heightMin} - {plant.heightMax} cm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => onSelectPlantForStudio(plant)}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Add to Active Design</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlants.length === 0 && (
          <div className="bg-white rounded-lg border border-stone-200 p-12 text-center text-stone-500 space-y-3 mt-6">
            <TreePine className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-serif text-stone-800 font-medium">No Plant Specimens Found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No plants match "{searchQuery}" in category "{selectedCategory}". You can clear the search filter or add a new variety.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-medium cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={onOpenCustomPlantModal}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-medium cursor-pointer"
              >
                Add Custom Plant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Plant Modal */}
      <EditPlantModal
        plant={editingPlant}
        isOpen={Boolean(editingPlant)}
        onClose={() => setEditingPlant(null)}
        onUpdatePlant={(upd) => {
          if (onUpdatePlant) onUpdatePlant(upd);
          setEditingPlant(null);
        }}
        onDeletePlant={(id) => {
          if (onDeletePlant) onDeletePlant(id);
          setEditingPlant(null);
        }}
        onDeletePlantPhoto={(id) => {
          if (onDeletePlantPhoto) onDeletePlantPhoto(id);
        }}
      />
    </div>
  );
};
