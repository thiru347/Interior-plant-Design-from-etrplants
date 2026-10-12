import React, { useState } from 'react';
import {
  Sliders,
  Compass,
  Layers,
  Box,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Sparkles,
  Check,
  Ruler,
  Sun,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  PlacedPlant,
  Pot,
  PlacementRecommendation,
  MeasurementUnit,
} from '../../types';
import { unitToCm, cmToUnit } from '../../utils/imageUtils';

interface InspectorPanelProps {
  selectedPlant: PlacedPlant | null;
  placedPlants: PlacedPlant[];
  availablePots: Pot[];
  recommendations: PlacementRecommendation[];
  onUpdatePlant: (id: string, updates: Partial<PlacedPlant>) => void;
  onSelectPlant: (id: string | null) => void;
  onDuplicatePlant: (id: string) => void;
  onDeletePlant: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onSpreadMultiple: (id: string, count: number) => void;
  onApplyRecommendation: (rec: PlacementRecommendation) => void;
  onTriggerAiRecommendations: () => void;
  isAiLoading: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedPlant,
  placedPlants,
  availablePots,
  recommendations,
  onUpdatePlant,
  onSelectPlant,
  onDuplicatePlant,
  onDeletePlant,
  onBringForward,
  onSendBackward,
  onSpreadMultiple,
  onApplyRecommendation,
  onTriggerAiRecommendations,
  isAiLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'recommendations' | 'layers'>('specs');

  // Combined plant + pot height calculation
  const potHeightCm = selectedPlant?.pot?.height
    ? unitToCm(selectedPlant.pot.height, selectedPlant.pot.unit || 'cm')
    : 45;
  const combinedHeightCm = (selectedPlant?.heightCm || 150) + potHeightCm;

  return (
    <aside className="w-80 lg:w-96 bg-stone-900 border-l border-stone-800 flex flex-col h-full text-stone-200 shrink-0">
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-800 bg-stone-950/60 p-2 gap-1">
        <button
          onClick={() => setActiveTab('specs')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'specs'
              ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Specifications</span>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>AI Placement</span>
          {recommendations.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-800 text-emerald-200 text-[10px] font-mono flex items-center justify-center">
              {recommendations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded transition-colors ${
            activeTab === 'layers'
              ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers ({placedPlants.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'specs' && (
          <>
            {selectedPlant ? (
              <div className="space-y-5">
                {/* Plant Overview Header */}
                <div className="bg-stone-950 border border-stone-800 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-base font-medium text-stone-100">
                        {selectedPlant.name}
                      </h3>
                      <p className="italic text-xs text-stone-400">
                        {selectedPlant.botanicalName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicatePlant(selectedPlant.id)}
                        title="Duplicate"
                        className="p-1 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePlant(selectedPlant.id)}
                        title="Delete"
                        className="p-1 hover:bg-red-950 text-stone-400 hover:text-red-300 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Combined Height Calculation Banner */}
                  <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Combined Height:</span>
                    <span className="font-mono font-medium text-emerald-400">
                      {Math.round(combinedHeightCm)} cm (~{(combinedHeightCm / 100).toFixed(2)}m)
                    </span>
                  </div>
                </div>

                {/* Physical Plant Dimensions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Plant Dimensions
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">Real-world Scale</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">
                        Plant Height (cm)
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="350"
                        value={selectedPlant.heightCm}
                        onChange={(e) =>
                          onUpdatePlant(selectedPlant.id, {
                            heightCm: parseInt(e.target.value, 10) || 150,
                          })
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">
                        Approx Width (cm)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="250"
                        value={selectedPlant.widthCm}
                        onChange={(e) =>
                          onUpdatePlant(selectedPlant.id, {
                            widthCm: parseInt(e.target.value, 10) || 70,
                          })
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Scale & Rotation */}
                <div className="space-y-3 pt-3 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Visual Transform
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span>Visual Scale</span>
                      <span className="font-mono text-stone-300">
                        {Math.round(selectedPlant.scale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.35"
                      max="2.5"
                      step="0.05"
                      value={selectedPlant.scale}
                      onChange={(e) =>
                        onUpdatePlant(selectedPlant.id, {
                          scale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span>Rotation</span>
                      <span className="font-mono text-stone-300">{selectedPlant.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={selectedPlant.rotation}
                      onChange={(e) =>
                        onUpdatePlant(selectedPlant.id, {
                          rotation: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Room Position Coordinates */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">
                        X Position ({Math.round(selectedPlant.x)}%)
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="98"
                        value={selectedPlant.x}
                        onChange={(e) =>
                          onUpdatePlant(selectedPlant.id, {
                            x: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">
                        Y Position ({Math.round(selectedPlant.y)}%)
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="98"
                        value={selectedPlant.y}
                        onChange={(e) =>
                          onUpdatePlant(selectedPlant.id, {
                            y: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Pot Selection & Custom Dimensions */}
                <div className="space-y-3 pt-3 border-t border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-400">
                      Pot Selection & Dimensions
                    </label>
                    {/* Unit Switcher */}
                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded p-0.5 text-[10px]">
                      {(['cm', 'mm', 'in'] as MeasurementUnit[]).map((u) => (
                        <button
                          key={u}
                          onClick={() => {
                            const currentUnit = selectedPlant.pot.unit || 'cm';
                            if (currentUnit === u) return;
                            const heightInCm = unitToCm(selectedPlant.pot.height, currentUnit);
                            const widthInCm = unitToCm(selectedPlant.pot.width, currentUnit);
                            const lengthInCm = selectedPlant.pot.length
                              ? unitToCm(selectedPlant.pot.length, currentUnit)
                              : undefined;

                            onUpdatePlant(selectedPlant.id, {
                              pot: {
                                ...selectedPlant.pot,
                                unit: u,
                                height: cmToUnit(heightInCm, u),
                                width: cmToUnit(widthInCm, u),
                                length: lengthInCm ? cmToUnit(lengthInCm, u) : undefined,
                              },
                            });
                          }}
                          className={`px-2 py-0.5 rounded uppercase font-mono ${
                            selectedPlant.pot.unit === u
                              ? 'bg-emerald-800 text-white'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Switch Pot Model */}
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">
                      Planter Model (Harshdeep 2025 Catalogue)
                    </label>
                    <select
                      value={selectedPlant.pot.potId}
                      onChange={(e) => {
                        const newPot = availablePots.find((p) => p.id === e.target.value);
                        if (newPot) {
                          onUpdatePlant(selectedPlant.id, {
                            pot: {
                              ...selectedPlant.pot,
                              potId: newPot.id,
                              name: newPot.name,
                              shape: newPot.shape,
                              material: newPot.material,
                              color: newPot.color,
                              colorHex: newPot.colorHex,
                              imageUrl: newPot.imageUrl,
                              height: newPot.defaultDimensions.height,
                              width: newPot.defaultDimensions.width,
                              length: newPot.defaultDimensions.length,
                              depth: newPot.defaultDimensions.depth,
                            },
                          });
                        }
                      }}
                      className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 focus:border-emerald-600 focus:outline-none"
                    >
                      {availablePots.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.material} · {p.color})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Standard Sizes from Harshdeep Catalogue */}
                  {(() => {
                    const matchedPot = availablePots.find((p) => p.id === selectedPlant.pot.potId);
                    if (!matchedPot?.availableSizes || matchedPot.availableSizes.length === 0) return null;
                    return (
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1.5">
                          Catalogue Sizes (Harshdeep 2025)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedPot.availableSizes.map((sizeOpt) => {
                            const isCurrentSize =
                              selectedPlant.pot.width === sizeOpt.width &&
                              selectedPlant.pot.height === sizeOpt.height &&
                              (sizeOpt.length === undefined || selectedPlant.pot.length === sizeOpt.length);
                            return (
                              <button
                                key={sizeOpt.label}
                                type="button"
                                onClick={() => {
                                  onUpdatePlant(selectedPlant.id, {
                                    pot: {
                                      ...selectedPlant.pot,
                                      width: sizeOpt.width,
                                      height: sizeOpt.height,
                                      length: sizeOpt.length,
                                    },
                                  });
                                }}
                                className={`px-2 py-1 text-[11px] rounded font-mono transition-colors ${
                                  isCurrentSize
                                    ? 'bg-emerald-800 text-white border border-emerald-500'
                                    : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                                }`}
                              >
                                {sizeOpt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Available Colors from Harshdeep Catalogue */}
                  {(() => {
                    const matchedPot = availablePots.find((p) => p.id === selectedPlant.pot.potId);
                    if (!matchedPot?.availableColors || matchedPot.availableColors.length === 0) return null;
                    return (
                      <div>
                        <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1.5">
                          Catalogue Finishes & Colors
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedPot.availableColors.map((col) => {
                            const isCurrentColor = selectedPlant.pot.colorHex === col.hex;
                            return (
                              <button
                                key={col.name}
                                type="button"
                                onClick={() => {
                                  onUpdatePlant(selectedPlant.id, {
                                    pot: {
                                      ...selectedPlant.pot,
                                      color: col.name,
                                      colorHex: col.hex,
                                    },
                                  });
                                }}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-colors ${
                                  isCurrentColor
                                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-200'
                                    : 'bg-stone-950 border border-stone-800 text-stone-300 hover:border-stone-700'
                                }`}
                              >
                                <span
                                  style={{ backgroundColor: col.hex }}
                                  className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0"
                                />
                                <span>{col.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Exact Pot Dimension Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">
                        Pot Height ({selectedPlant.pot.unit || 'cm'})
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={selectedPlant.pot.height}
                        onChange={(e) =>
                          onUpdatePlant(selectedPlant.id, {
                            pot: {
                              ...selectedPlant.pot,
                              height: parseFloat(e.target.value) || 45,
                            },
                          })
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">
                        Width / Dia ({selectedPlant.pot.unit || 'cm'})
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={selectedPlant.pot.width}
                        onChange={(e) =>
                          onUpdatePlant(selectedPlant.id, {
                            pot: {
                              ...selectedPlant.pot,
                              width: parseFloat(e.target.value) || 30,
                            },
                          })
                        }
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    {/* Optional Length for Rectangular / Trough */}
                    {(selectedPlant.pot.shape === 'rectangular' ||
                      selectedPlant.pot.shape === 'trough') && (
                      <div className="col-span-2">
                        <label className="text-[11px] text-stone-400 block mb-1">
                          Planter Length ({selectedPlant.pot.unit || 'cm'})
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="250"
                          value={selectedPlant.pot.length || 60}
                          onChange={(e) =>
                            onUpdatePlant(selectedPlant.id, {
                              pot: {
                                ...selectedPlant.pot,
                                length: parseFloat(e.target.value) || 60,
                              },
                            })
                          }
                          className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Placement Tag & Quantity Tools */}
                <div className="space-y-3 pt-3 border-t border-stone-800">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">
                      Designated Location Tag (for Schedule & Invoice)
                    </label>
                    <input
                      type="text"
                      value={selectedPlant.locationTag}
                      onChange={(e) =>
                        onUpdatePlant(selectedPlant.id, {
                          locationTag: e.target.value,
                        })
                      }
                      placeholder="e.g. Left Reception Desk, Executive Corridor"
                      className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-100 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  {/* Quantity & Spreading Multiple Plants */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="text-xs text-stone-300 font-medium block">
                        Spread Multiple Plants
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Create evenly spaced row (e.g. corridor)
                      </span>
                    </div>

                    <button
                      onClick={() => onSpreadMultiple(selectedPlant.id, 3)}
                      className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded transition-colors"
                    >
                      + 3 In Row
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-500 text-xs">
                Select a plant on the canvas or click "Add to Canvas" in the catalogue to edit
                dimensions and specifications.
              </div>
            )}
          </>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-sm font-medium text-stone-100">
                  AI Placement Guidance
                </h4>
                <p className="text-[11px] text-stone-400">
                  Physical room space & lighting analysis
                </p>
              </div>

              <button
                onClick={onTriggerAiRecommendations}
                disabled={isAiLoading}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>{isAiLoading ? 'Analyzing...' : 'Re-analyze Room'}</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-400 bg-stone-950/80 border border-stone-800 p-3 rounded leading-relaxed">
              <span className="text-stone-300 font-medium">Important Landscaping Note:</span> Recommendations
              are based on visual architectural features (corners, pillars, counter flanks). Actual indoor
              botanical health requires verified lux meter readings before final planting.
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-stone-950 border border-stone-800 rounded p-3 hover:border-emerald-700/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {rec.id}
                      </span>
                      <h5 className="text-xs font-medium text-stone-100">{rec.title}</h5>
                    </div>

                    <button
                      onClick={() => onApplyRecommendation(rec)}
                      className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-700 text-emerald-300 hover:text-white text-[11px] font-medium rounded transition-colors"
                    >
                      Place Here
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-300 mt-2 leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-stone-800/80 space-y-1 text-[10px] text-stone-400">
                    <div className="flex items-start gap-1">
                      <Sun className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{rec.lightNote}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec.trafficClearance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer Manager Tab */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-sm font-medium text-stone-100">
                Layer Stack ({placedPlants.length} Plants)
              </h4>
              <span className="text-[10px] text-stone-400 font-mono">Top to Bottom</span>
            </div>

            <div className="space-y-1.5">
              {[...placedPlants]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((plant) => {
                  const isSelected = plant.id === selectedPlant?.id;
                  return (
                    <div
                      key={plant.id}
                      onClick={() => onSelectPlant(plant.id)}
                      className={`flex items-center justify-between p-2 rounded text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/80 border border-emerald-700 text-white'
                          : 'bg-stone-950 border border-stone-800/80 text-stone-300 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePlant(plant.id, { visible: !plant.visible });
                          }}
                          className="text-stone-400 hover:text-stone-200"
                          title={plant.visible ? 'Hide plant' : 'Show plant'}
                        >
                          {plant.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-stone-600" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdatePlant(plant.id, { locked: !plant.locked });
                          }}
                          className="text-stone-400 hover:text-stone-200"
                          title={plant.locked ? 'Unlock plant' : 'Lock plant'}
                        >
                          {plant.locked ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-stone-600" />
                          )}
                        </button>

                        <span className="truncate">{plant.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBringForward(plant.id);
                          }}
                          title="Move Up"
                          className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendBackward(plant.id);
                          }}
                          title="Move Down"
                          className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePlant(plant.id);
                          }}
                          title="Delete"
                          className="p-1 hover:bg-red-950 rounded text-stone-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {placedPlants.length === 0 && (
                <div className="text-center py-10 text-stone-500 text-xs">
                  No plants added to canvas yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
