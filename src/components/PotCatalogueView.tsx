import React, { useState } from 'react';
import { Search, Plus, Box, Ruler, Upload, Check, X, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';
import { Pot, PotShape, PotMaterial } from '../types';

interface PotCatalogueViewProps {
  pots: Pot[];
  onOpenCustomPotModal: () => void;
}

export const PotCatalogueView: React.FC<PotCatalogueViewProps> = ({
  pots,
  onOpenCustomPotModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'height-desc' | 'width-desc'>('featured');

  // Primary Category / Shape Filter Buttons
  const categories: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'All Planters' },
    { id: 'cylindrical', label: 'Cylinders & Columns' },
    { id: 'round', label: 'Round & Spherical' },
    { id: 'square', label: 'Square & Cubes' },
    { id: 'rectangular', label: 'Troughs & Rectangles' },
    { id: 'bowl', label: 'Low Basins & Bowls' },
    { id: 'fluted', label: 'Fluted & Textured' },
    { id: 'conical', label: 'Conical Tapered' },
    { id: 'urn', label: 'Urns & Pedestals' },
  ];

  // Material Filter Options
  const materials: { id: string; label: string }[] = [
    { id: 'all', label: 'All Materials' },
    { id: 'Ceramic', label: 'Ceramic' },
    { id: 'Fiberglass', label: 'Fiberglass (FRP)' },
    { id: 'Stone Composite', label: 'Stone Composite' },
    { id: 'Architectural Concrete', label: 'Concrete' },
    { id: 'Powder-coated Aluminum', label: 'Metal / Aluminum' },
    { id: 'Terrazzo', label: 'Terrazzo' },
  ];

  // Color Filter Options
  const colorFilterOptions: { id: string; label: string; hex?: string }[] = [
    { id: 'all', label: 'All Colors' },
    { id: 'white', label: 'White & Ivory', hex: '#F5F5F5' },
    { id: 'black', label: 'Black & Charcoal', hex: '#232323' },
    { id: 'grey', label: 'Grey & Concrete', hex: '#878B91' },
    { id: 'terracotta', label: 'Terracotta & Clay', hex: '#D46B42' },
    { id: 'gold', label: 'Brass & Gold', hex: '#C5A059' },
    { id: 'green', label: 'Olive & Green', hex: '#3B5943' },
    { id: 'blue', label: 'Navy & Blue', hex: '#1B365D' },
    { id: 'marble', label: 'Marble Finishes', hex: '#ECEBE6' },
  ];

  const filteredPots = pots
    .filter((pot) => {
      // Search query matches name, material, color, shape, or dimensions
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        pot.name.toLowerCase().includes(query) ||
        pot.material.toLowerCase().includes(query) ||
        pot.color.toLowerCase().includes(query) ||
        pot.shape.toLowerCase().includes(query) ||
        (pot.availableColors && pot.availableColors.some(c => c.name.toLowerCase().includes(query))) ||
        `${pot.defaultDimensions.height}cm`.includes(query) ||
        `${pot.defaultDimensions.width}cm`.includes(query);

      // Category / Shape filter
      const matchesCategory =
        selectedCategory === 'all' || pot.shape === selectedCategory;

      // Material filter
      const matchesMaterial =
        selectedMaterial === 'all' ||
        pot.material.toLowerCase().includes(selectedMaterial.toLowerCase());

      // Color filter
      const matchesColor =
        selectedColor === 'all' ||
        pot.color.toLowerCase().includes(selectedColor) ||
        (pot.availableColors &&
          pot.availableColors.some((c) =>
            c.name.toLowerCase().includes(selectedColor)
          ));

      return matchesQuery && matchesCategory && matchesMaterial && matchesColor;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'height-desc') {
        return b.defaultDimensions.height - a.defaultDimensions.height;
      }
      if (sortBy === 'width-desc') {
        return b.defaultDimensions.width - a.defaultDimensions.width;
      }
      return 0; // featured default
    });

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedMaterial !== 'all' ||
    selectedColor !== 'all' ||
    sortBy !== 'featured';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setSelectedColor('all');
    setSortBy('featured');
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-800 pb-20">
      {/* Header Banner */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-emerald-400 text-xs font-mono tracking-wider uppercase mb-2">
              Architectural Vessels & Planters
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
              ETR Plants Planter Catalogue
            </h1>
            <p className="text-stone-400 text-sm mt-2 max-w-2xl font-light">
              Fiberglass, terrazzo, lightweight ceramic, and stone composite planters engineered for
              interior sub-irrigation liners and commercial load-bearing durability.
            </p>
          </div>

          <button
            onClick={onOpenCustomPotModal}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-2 shadow-lg transition-colors shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Add Custom Planter Model</span>
          </button>
        </div>
      </div>

      {/* Controls & Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar & Action Controls */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search planters by name, material, color, shape, or dimensions (e.g. 'cylinder', 'terracotta', 'fiberglass')..."
                className="w-full bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-300 pl-10 pr-9 py-2.5 rounded-lg text-xs text-stone-900 placeholder-stone-400 shadow-inner focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & Quick Counter */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-xs text-stone-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[11px] text-stone-500 font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-xs text-stone-800 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="featured">Featured Architectural</option>
                  <option value="name-asc">Alphabetical (A - Z)</option>
                  <option value="height-desc">Height (Tallest First)</option>
                  <option value="width-desc">Width (Widest First)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-xs font-medium text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                Filter by Vessel Category & Shape
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                Showing {filteredPots.length} of {pots.length} planters
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {categories.map((c) => {
                const count =
                  c.id === 'all'
                    ? pots.length
                    : pots.filter((p) => p.shape === c.id).length;
                const isActive = selectedCategory === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                        : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-emerald-950/40 text-emerald-100'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filter Row: Material & Color quick filters */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <span>Material:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMaterial(m.id)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                    selectedMaterial === m.id
                      ? 'bg-stone-800 text-white font-medium shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-stone-200 hidden sm:block mx-1" />

            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
              <span>Finish:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {colorFilterOptions.map((cf) => (
                <button
                  key={cf.id}
                  onClick={() => setSelectedColor(cf.id)}
                  title={cf.label}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedColor === cf.id
                      ? 'bg-stone-800 text-white font-medium shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {cf.hex && (
                    <span
                      style={{ backgroundColor: cf.hex }}
                      className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block shrink-0"
                    />
                  )}
                  <span>{cf.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State when no planters match */}
        {filteredPots.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-stone-900 mb-1">
              No matching planters found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
              We couldn't find any planters matching &quot;{searchQuery}&quot; with the currently selected category, material, or color filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {filteredPots.map((pot) => (
            <div
              key={pot.id}
              className="bg-white border border-stone-200/90 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Swatch / Vessel Render */}
                <div className="aspect-[4/3] bg-stone-100 p-6 flex flex-col items-center justify-center relative">
                  {pot.imageUrl ? (
                    <img
                      src={pot.imageUrl}
                      alt={pot.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: pot.colorHex }}
                      className="w-24 h-28 rounded shadow-lg border border-white/20 flex items-center justify-center"
                    >
                      <span className="text-white/60 font-mono text-xs uppercase font-bold">
                        {pot.shape}
                      </span>
                    </div>
                  )}

                  <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-stone-900/80 text-white rounded text-[10px] font-mono">
                    <span
                      style={{ backgroundColor: pot.colorHex }}
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                    />
                    <span>{pot.color}</span>
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <h3 className="font-serif text-sm font-medium text-stone-900 truncate">
                    {pot.name}
                  </h3>
                  <div className="text-xs text-stone-500 font-sans">
                    {pot.material} · {pot.shape}
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-xs text-stone-600 font-mono space-y-1">
                    <div>
                      Default: <span className="text-stone-900">{pot.defaultDimensions.height}cm H × {pot.defaultDimensions.width}cm W</span>
                      {pot.defaultDimensions.length ? ` × ${pot.defaultDimensions.length}cm L` : ''}
                    </div>
                  </div>

                  {/* Catalogue Available Sizes */}
                  {pot.availableSizes && pot.availableSizes.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">
                        Catalogue Sizes:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {pot.availableSizes.map((s) => (
                          <span
                            key={s.label}
                            className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-mono rounded"
                          >
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catalogue Finishes */}
                  {pot.availableColors && pot.availableColors.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">
                        Finishes:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {pot.availableColors.map((c) => (
                          <span
                            key={c.name}
                            title={c.name}
                            style={{ backgroundColor: c.hex }}
                            className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="text-[11px] text-emerald-800 font-medium">
                  Harshdeep 2025 Architectural Specification
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};
