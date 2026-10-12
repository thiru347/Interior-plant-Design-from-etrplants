import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Sun,
  Layers,
  Sparkles,
  Upload,
  Box,
  Leaf,
  Filter,
  Trash2,
  Edit2,
  RotateCcw,
  TreePine,
  Image as ImageIcon,
} from 'lucide-react';
import { Plant, Pot, PlantCategory } from '../../types';
import { BOTANICAL_PLACEHOLDER_URL } from '../../utils/imageUtils';

interface CatalogueDrawerProps {
  plants: Plant[];
  pots: Pot[];
  onAddPlantToDesign: (plant: Plant, pot?: Pot) => void;
  onOpenCustomPlantModal: () => void;
  onOpenCustomPotModal: () => void;
  onUpdatePlantCatalogue?: (plant: Plant) => void;
  onDeletePlantFromCatalogue?: (plantId: string) => void;
  onDeletePlantPhoto?: (plantId: string) => void;
}

export const CatalogueDrawer: React.FC<CatalogueDrawerProps> = ({
  plants,
  pots,
  onAddPlantToDesign,
  onOpenCustomPlantModal,
  onOpenCustomPotModal,
  onUpdatePlantCatalogue,
  onDeletePlantFromCatalogue,
  onDeletePlantPhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'plants' | 'pots'>('plants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPot, setSelectedPot] = useState<Pot>(pots[0]);
  const [selectedPotShape, setSelectedPotShape] = useState<string>('all');

  // Inline rename state in sidebar
  const [renamingPlantId, setRenamingPlantId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBotanical, setEditBotanical] = useState('');

  // File upload ref for sidebar photo replacement
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  // Filter plants
  const filteredPlants = plants.filter((plant) => {
    const matchesQuery =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || plant.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const potShapes: { id: string; label: string }[] = [
    { id: 'all', label: 'All Shapes' },
    { id: 'cylindrical', label: 'Cylinder' },
    { id: 'round', label: 'Round' },
    { id: 'square', label: 'Square / Cube' },
    { id: 'fluted', label: 'Fluted' },
    { id: 'bowl', label: 'Bowl Basin' },
    { id: 'urn', label: 'Urn' },
    { id: 'conical', label: 'Conical' },
    { id: 'rectangular', label: 'Rectangular' },
  ];

  // Filter pots
  const filteredPots = pots.filter((pot) => {
    const matchesQuery =
      pot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pot.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pot.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pot.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesShape =
      selectedPotShape === 'all' || pot.shape === selectedPotShape;

    return matchesQuery && matchesShape;
  });

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Plants' },
    { id: 'bonsai', label: 'Bonsai' },
    { id: 'palms', label: 'Palms' },
    { id: 'ficus', label: 'Ficus & Trees' },
    { id: 'architectural', label: 'Architectural' },
    { id: 'foliage', label: 'Foliage' },
    { id: 'low-light', label: 'Low Light' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'artificial', label: 'Preserved / Artificial' },
  ];

  const handleStartRename = (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingPlantId(plant.id);
    setEditName(plant.name);
    setEditBotanical(plant.botanicalName);
  };

  const handleSaveRename = (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim() || !onUpdatePlantCatalogue) {
      setRenamingPlantId(null);
      return;
    }
    const updated: Plant = {
      ...plant,
      name: editName.trim(),
      botanicalName: editBotanical.trim() || plant.botanicalName,
    };
    onUpdatePlantCatalogue(updated);
    setRenamingPlantId(null);
  };

  const handleDeletePhoto = (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeletePlantPhoto) {
      onDeletePlantPhoto(plant.id);
    } else if (onUpdatePlantCatalogue) {
      const updated: Plant = {
        ...plant,
        imageUrl: BOTANICAL_PLACEHOLDER_URL,
        isPlaceholderImage: true,
        originalImageUrl: plant.originalImageUrl || plant.imageUrl,
      };
      onUpdatePlantCatalogue(updated);
    }
  };

  const handleRestorePhoto = (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    if (plant.originalImageUrl && onUpdatePlantCatalogue) {
      const updated: Plant = {
        ...plant,
        imageUrl: plant.originalImageUrl,
        isPlaceholderImage: false,
      };
      onUpdatePlantCatalogue(updated);
    }
  };

  const handleTriggerUpload = (plantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveUploadId(plantId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadId || !onUpdatePlantCatalogue) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        const target = plants.find((p) => p.id === activeUploadId);
        if (target) {
          const updated: Plant = {
            ...target,
            imageUrl: dataUrl,
            isPlaceholderImage: false,
            originalImageUrl: target.originalImageUrl || target.imageUrl,
          };
          onUpdatePlantCatalogue(updated);
        }
      }
      setActiveUploadId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePlant = (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${plant.name}" from catalogue?`)) {
      if (onDeletePlantFromCatalogue) {
        onDeletePlantFromCatalogue(plant.id);
      }
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-stone-900 border-r border-stone-800 flex flex-col h-full text-stone-200 shrink-0">
      {/* Hidden file input for photo upload in sidebar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Tab Switcher (Plants / Pots) */}
      <div className="flex border-b border-stone-800 bg-stone-950/60 p-2 gap-2">
        <button
          onClick={() => setActiveTab('plants')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'plants'
              ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plant Varieties ({plants.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pots')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'pots'
              ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-emerald-400" />
          <span>Planters & Pots ({pots.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-stone-800/80">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'plants'
                ? 'Search plants (e.g. Bonsai, Palm)...'
                : 'Search pots & planters...'
            }
            className="w-full bg-stone-950 border border-stone-800 pl-9 pr-3 py-1.5 rounded text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Categories pills for plants */}
        {activeTab === 'plants' && (
          <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1 no-scrollbar text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 whitespace-nowrap rounded font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.id === 'bonsai' && <TreePine className="w-3 h-3 text-emerald-300" />}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Shape filter pills for pots */}
        {activeTab === 'pots' && (
          <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1 no-scrollbar text-[11px]">
            {potShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSelectedPotShape(shape.id)}
                className={`px-2.5 py-1 whitespace-nowrap rounded font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedPotShape === shape.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>{shape.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'plants' ? (
          <>
            {/* Custom Plant Upload CTA card */}
            <div
              onClick={onOpenCustomPlantModal}
              className="border border-dashed border-emerald-800/60 bg-emerald-950/20 hover:bg-emerald-950/40 rounded p-3 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-300">
                    Upload Custom Plant Variety
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Import your own reference photo & cutout
                  </div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Plants catalogue items */}
            {filteredPlants.map((plant) => {
              const isPlaceholder = Boolean(plant.isPlaceholderImage);
              const isRenaming = renamingPlantId === plant.id;

              return (
                <div
                  key={plant.id}
                  className="bg-stone-950 border border-stone-800/90 rounded p-3 hover:border-emerald-800 transition-all flex flex-col justify-between group"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail with photo actions */}
                    <div className="w-20 h-24 rounded bg-stone-900 border border-stone-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative group/img">
                      <img
                        src={plant.imageUrl}
                        alt={plant.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />

                      {/* Photo management overlay on hover */}
                      <div className="absolute inset-0 bg-stone-950/85 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                        <button
                          title="Upload new photo"
                          onClick={(e) => handleTriggerUpload(plant.id, e)}
                          className="p-1 bg-stone-800 hover:bg-emerald-800 text-stone-200 rounded transition-colors text-[10px] flex items-center gap-1 w-full justify-center cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Photo</span>
                        </button>
                        {!isPlaceholder ? (
                          <button
                            title="Delete photo"
                            onClick={(e) => handleDeletePhoto(plant, e)}
                            className="p-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded transition-colors text-[10px] flex items-center gap-1 w-full justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          plant.originalImageUrl && (
                            <button
                              title="Restore photo"
                              onClick={(e) => handleRestorePhoto(plant, e)}
                              className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded transition-colors text-[10px] flex items-center gap-1 w-full justify-center cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          )
                        )}
                      </div>

                      {isPlaceholder && (
                        <span className="absolute bottom-1 bg-amber-950 text-amber-300 text-[8px] font-mono px-1 rounded">
                          No Photo
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="space-y-1.5 bg-stone-900 p-2 rounded border border-stone-700">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Plant name"
                            className="w-full bg-stone-950 border border-stone-700 px-1.5 py-0.5 text-xs text-stone-100 rounded focus:border-emerald-500 focus:outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editBotanical}
                            onChange={(e) => setEditBotanical(e.target.value)}
                            placeholder="Botanical name"
                            className="w-full bg-stone-950 border border-stone-700 px-1.5 py-0.5 text-[11px] text-stone-300 italic rounded focus:border-emerald-500 focus:outline-none"
                          />
                          <div className="flex justify-end gap-1 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingPlantId(null);
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-stone-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => handleSaveRename(plant, e)}
                              className="px-2 py-0.5 text-[10px] bg-emerald-800 hover:bg-emerald-700 text-white rounded font-medium cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <h4 className="font-serif text-sm font-medium text-stone-100 truncate">
                                  {plant.name}
                                </h4>
                                <button
                                  title="Rename plant name in sidebar"
                                  onClick={(e) => handleStartRename(plant, e)}
                                  className="text-stone-500 hover:text-emerald-400 p-0.5 rounded cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="italic text-[11px] text-stone-400 truncate">
                                {plant.botanicalName}
                              </p>
                            </div>

                            {/* Delete plant button */}
                            <button
                              title="Delete plant from catalogue"
                              onClick={(e) => handleDeletePlant(plant, e)}
                              className="text-stone-600 hover:text-rose-400 p-0.5 rounded cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="mt-2 space-y-1 text-[11px] text-stone-400">
                            <div className="flex items-center gap-1.5">
                              <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{plant.lightRequirements}</span>
                            </div>
                            <div className="text-stone-400">
                              Height:{' '}
                              <span className="text-stone-300 font-mono">
                                {plant.heightMin} - {plant.heightMax} cm
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-500 font-mono">
                      W: ~{plant.approxWidth}cm
                    </span>

                    <button
                      onClick={() => onAddPlantToDesign(plant, selectedPot)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-stone-100 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Canvas</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPlants.length === 0 && (
              <div className="text-center py-10 text-stone-500 text-xs space-y-2">
                <p>No matching plants found for "{searchQuery}".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-2.5 py-1 bg-stone-800 text-stone-300 hover:text-white rounded text-[11px] cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Custom Pot Upload CTA card */}
            <div
              onClick={onOpenCustomPotModal}
              className="border border-dashed border-emerald-800/60 bg-emerald-950/20 hover:bg-emerald-950/40 rounded p-3 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-emerald-300">
                    Add Bespoke Planter Specification
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Custom fiberglass, trough, or round pot
                  </div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Pots items list with small pot photo & color */}
            {filteredPots.map((pot) => {
              const isSelected = selectedPot?.id === pot.id;
              return (
                <div
                  key={pot.id}
                  onClick={() => setSelectedPot(pot)}
                  className={`bg-stone-950 border rounded-lg p-2.5 cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-stone-900/95 ring-1 ring-emerald-500/50 shadow-sm'
                      : 'border-stone-800/90 hover:border-stone-700 bg-stone-950/90'
                  }`}
                >
                  {/* Small Pot Shape Photo */}
                  <div className="w-16 h-16 rounded-md bg-stone-900 border border-stone-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {pot.imageUrl ? (
                      <img
                        src={pot.imageUrl}
                        alt={pot.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: pot.colorHex || '#555' }}
                        className="w-10 h-10 rounded border border-white/20 flex items-center justify-center"
                      >
                        <Box className="w-5 h-5 text-white/70" />
                      </div>
                    )}
                    {/* Tiny shape badge */}
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-stone-950/85 text-[8px] font-mono text-stone-300 rounded capitalize">
                      {pot.shape}
                    </span>
                  </div>

                  {/* Pot Details with Small Color Swatch */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-xs sm:text-sm font-medium text-stone-100 truncate">
                        {pot.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-900/90 text-emerald-300 rounded border border-emerald-700/60 shrink-0">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-stone-400 capitalize">
                        {pot.material}
                      </span>
                      <span className="text-stone-600 text-[10px]">·</span>
                      <span className="px-1.5 py-0.2 bg-stone-900 text-emerald-400 text-[9px] font-mono rounded capitalize border border-stone-800">
                        {pot.shape}
                      </span>
                    </div>

                    {/* Small Color Swatch and Color Name */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-300">
                      <span
                        style={{ backgroundColor: pot.colorHex || '#6E4E3A' }}
                        className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0 shadow-xs inline-block"
                      />
                      <span className="truncate text-stone-300 text-[11px]">{pot.color}</span>
                    </div>

                    {/* Multi-color swatches in small size if available */}
                    {pot.availableColors && pot.availableColors.length > 1 && (
                      <div className="flex items-center gap-1 mt-1">
                        {pot.availableColors.slice(0, 5).map((col, idx) => (
                          <span
                            key={idx}
                            title={col.name}
                            style={{ backgroundColor: col.hex }}
                            className="w-2 h-2 rounded-full border border-stone-600 inline-block"
                          />
                        ))}
                        {pot.availableColors.length > 5 && (
                          <span className="text-[9px] text-stone-500 font-mono">
                            +{pot.availableColors.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-1 text-[10px] font-mono text-stone-400">
                      {pot.defaultDimensions.height}cm H × {pot.defaultDimensions.width}cm W
                      {pot.defaultDimensions.length ? ` × ${pot.defaultDimensions.length}cm L` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
};
