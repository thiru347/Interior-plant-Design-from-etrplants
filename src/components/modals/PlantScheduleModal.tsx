import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Printer,
  Edit2,
  Check,
  Send,
  Building,
  Ruler,
} from 'lucide-react';
import { PlacedPlant, PlantScheduleItem } from '../../types';
import { exportScheduleToCsv, formatDimension } from '../../utils/imageUtils';

interface PlantScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  placedPlants: PlacedPlant[];
  onOpenEnquiry: (schedule: PlantScheduleItem[]) => void;
}

export const PlantScheduleModal: React.FC<PlantScheduleModalProps> = ({
  isOpen,
  onClose,
  placedPlants,
  onOpenEnquiry,
}) => {
  // Convert placed plants to initial editable schedule items
  const [scheduleItems, setScheduleItems] = useState<PlantScheduleItem[]>(() => {
    return placedPlants.map((plant, index) => ({
      id: plant.id,
      plantName: plant.name,
      botanicalName: plant.botanicalName,
      plantQuantity: plant.quantity || 1,
      plantHeight: plant.heightCm,
      plantWidth: plant.widthCm,
      potName: plant.pot?.name || 'Standard Planter',
      potQuantity: plant.quantity || 1,
      potDimensions: formatDimension(
        plant.pot?.length,
        plant.pot?.width,
        plant.pot?.height,
        plant.pot?.unit || 'cm'
      ),
      placementLocation: plant.locationTag || `Location Zone ${index + 1}`,
      lightRequirement: 'Indoor Acclimated',
      notes: plant.pot?.color ? `Finish: ${plant.pot.color}` : '',
    }));
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const totalPlants = scheduleItems.reduce((acc, curr) => acc + (curr.plantQuantity || 1), 0);
  const totalPots = scheduleItems.reduce((acc, curr) => acc + (curr.potQuantity || 1), 0);

  const handleUpdateItem = (id: string, updates: Partial<PlantScheduleItem>) => {
    setScheduleItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleExportCsv = () => {
    exportScheduleToCsv(scheduleItems);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-100">
                Plant & Planter Inventory Schedule
              </h3>
              <p className="text-xs text-stone-400">
                Architectural specification bill of quantities for ETR Plants installation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={() => onOpenEnquiry(scheduleItems)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Quotation</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-stone-950/60 border-b border-stone-800/80 text-xs font-mono">
          <div>
            <span className="text-stone-400 block text-[10px]">TOTAL PLANTS</span>
            <span className="text-emerald-400 font-bold text-base">{totalPlants} units</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">TOTAL PLANTERS</span>
            <span className="text-stone-200 font-bold text-base">{totalPots} units</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">DISTINCT VARIETIES</span>
            <span className="text-stone-200 font-bold text-base">
              {new Set(scheduleItems.map((i) => i.plantName)).size} species
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px]">SPECIFICATION STATUS</span>
            <span className="text-emerald-300 font-medium">Ready for Procurement</span>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-auto p-6">
          {scheduleItems.length > 0 ? (
            <div className="overflow-x-auto rounded border border-stone-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-950 text-stone-400 uppercase font-mono text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Botanical Species</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Dimensions (H × W)</th>
                    <th className="py-2.5 px-3">Planter Specification</th>
                    <th className="py-2.5 px-3">Planter Dimensions</th>
                    <th className="py-2.5 px-3">Placement Zone</th>
                    <th className="py-2.5 px-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {scheduleItems.map((item, index) => {
                    const isEditing = editingId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-850/60 transition-colors group"
                      >
                        <td className="py-3 px-3 font-mono text-stone-500">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-stone-100">{item.plantName}</div>
                          <div className="italic text-[11px] text-stone-400 font-sans">
                            {item.botanicalName}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={item.plantQuantity}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  plantQuantity: parseInt(e.target.value, 10) || 1,
                                  potQuantity: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-14 bg-stone-950 border border-stone-700 px-1 py-0.5 rounded text-stone-100"
                            />
                          ) : (
                            <span className="text-emerald-400 font-medium">
                              {item.plantQuantity}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-300">
                          {item.plantHeight}cm × {item.plantWidth}cm
                        </td>
                        <td className="py-3 px-3 text-stone-300">
                          <div>{item.potName}</div>
                          {item.notes && (
                            <div className="text-[10px] text-stone-400">{item.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-300">
                          {item.potDimensions}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.placementLocation}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  placementLocation: e.target.value,
                                })
                              }
                              className="w-full bg-stone-950 border border-stone-700 px-2 py-0.5 rounded text-stone-100 text-xs"
                            />
                          ) : (
                            <span className="text-stone-300 font-sans">
                              {item.placementLocation}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 transition-colors"
                          >
                            {isEditing ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Edit2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-stone-500 text-xs">
              No plants currently placed on the canvas. Add plants from the catalogue to generate
              the schedule automatically.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <span>
            ETR Plants will review exact pot materials, interior drainage liners, and delivery access
            upon quotation.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
