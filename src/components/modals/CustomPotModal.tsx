import React, { useState } from 'react';
import { X, Box, Check } from 'lucide-react';
import { Pot, PotShape, PotMaterial, MeasurementUnit } from '../../types';

interface CustomPotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomPot: (pot: Pot) => void;
}

export const CustomPotModal: React.FC<CustomPotModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomPot,
}) => {
  const [name, setName] = useState('');
  const [shape, setShape] = useState<PotShape>('rectangular');
  const [material, setMaterial] = useState<PotMaterial>('Fiberglass');
  const [color, setColor] = useState('Matte Anthracite');
  const [colorHex, setColorHex] = useState('#202226');
  const [unit, setUnit] = useState<MeasurementUnit>('cm');
  const [height, setHeight] = useState(45);
  const [width, setWidth] = useState(30);
  const [length, setLength] = useState(60);

  const handleSave = () => {
    if (!name.trim()) return;

    const newPot: Pot = {
      id: `custom-pot-${Date.now()}`,
      name: name.trim(),
      shape,
      material,
      color,
      colorHex,
      defaultDimensions: {
        height,
        width,
        length: shape === 'rectangular' || shape === 'trough' ? length : undefined,
        unit,
      },
      isCustom: true,
    };

    onSaveCustomPot(newPot);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-stone-200">
      <div className="bg-stone-900 border border-stone-800 rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-100">
                Create Custom Planter Specification
              </h3>
              <p className="text-xs text-stone-400">
                Define exact shape, finish material, and dimensions for ETR Plants fabrication
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
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs text-stone-300 block mb-1">
              Planter Model Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bespoke Hotel Lobby Trough Planter"
              className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-300 block mb-1">Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as PotShape)}
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              >
                <option value="rectangular">Rectangular Planter</option>
                <option value="cylindrical">Tall Cylindrical</option>
                <option value="square">Square Planter</option>
                <option value="round">Round Bowl</option>
                <option value="trough">Trough Divider</option>
                <option value="fluted">Fluted Vessel</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as PotMaterial)}
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Fiberglass">Fiberglass (Lightweight Luxury)</option>
                <option value="Ceramic">Glazed Ceramic</option>
                <option value="Terrazzo">Terrazzo Composite</option>
                <option value="Powder-coated Aluminum">Powder-coated Aluminum</option>
                <option value="Stone Composite">Stone Composite</option>
                <option value="Architectural Concrete">Architectural Concrete</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-300 block mb-1">Finish / Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Matte Anthracite"
                className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Color Swatch</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-9 h-8 bg-transparent cursor-pointer rounded border border-stone-700"
                />
                <span className="font-mono text-xs text-stone-400">{colorHex}</span>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="pt-2 border-t border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-stone-400">
                Default Fabrication Dimensions
              </span>
              <div className="flex bg-stone-950 border border-stone-800 rounded p-0.5 text-xs">
                {(['cm', 'mm', 'in'] as MeasurementUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-2 py-0.5 rounded font-mono uppercase ${
                      unit === u ? 'bg-emerald-800 text-white' : 'text-stone-400'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">
                  Height ({unit})
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 45)}
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1">
                  Width / Dia ({unit})
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 30)}
                  className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded text-stone-100 font-mono"
                />
              </div>

              {(shape === 'rectangular' || shape === 'trough') && (
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">
                    Length ({unit})
                  </label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 60)}
                    className="w-full bg-stone-950 border border-stone-800 px-2 py-1.5 text-xs rounded text-stone-100 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Planter Model</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
