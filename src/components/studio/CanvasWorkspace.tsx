import React, { useRef, useState, useEffect } from 'react';
import {
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Compass,
  Check,
  Crosshair,
  Sparkles,
  Search,
  X,
  Plus,
  ZoomIn,
} from 'lucide-react';
import { PlacedPlant, PlacementRecommendation, Plant } from '../../types';

interface CanvasWorkspaceProps {
  roomImageUrl: string;
  roomRotation: number;
  plants: PlacedPlant[];
  selectedPlantId: string | null;
  onSelectPlant: (id: string | null) => void;
  onUpdatePlant: (id: string, updates: Partial<PlacedPlant>) => void;
  onDuplicatePlant: (id: string) => void;
  onDeletePlant: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  zoom: number;
  showGrid: boolean;
  recommendations: PlacementRecommendation[];
  showRecommendations: boolean;
  onSelectRecommendation: (rec: PlacementRecommendation) => void;
  availablePlants?: Plant[];
  onInsertPlantAt?: (plant: Plant, x: number, y: number) => void;
  onSetZoom?: (zoom: number) => void;
}


export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  roomImageUrl,
  roomRotation,
  plants,
  selectedPlantId,
  onSelectPlant,
  onUpdatePlant,
  onDuplicatePlant,
  onDeletePlant,
  onBringForward,
  onSendBackward,
  zoom,
  showGrid,
  recommendations,
  showRecommendations,
  onSelectRecommendation,
  availablePlants = [],
  onInsertPlantAt,
  onSetZoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Interaction dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [initialPlantState, setInitialPlantState] = useState<{
    x: number;
    y: number;
    scale: number;
    rotation: number;
  } | null>(null);

  // 3D Motion Mode states
  const [is3dMotionActive, setIs3dMotionActive] = useState(false);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAutoSway, setIsAutoSway] = useState(false);

  // Zoom & Insert states
  const [isZoomInsertMode, setIsZoomInsertMode] = useState(false);
  const [insertTargetCoord, setInsertTargetCoord] = useState<{ x: number; y: number } | null>(null);
  const [insertSearchQuery, setInsertSearchQuery] = useState('');

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;

  // Auto 3D sway oscillation
  useEffect(() => {
    if (!isAutoSway || !is3dMotionActive) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.05;
      setMouseTilt({
        x: Math.sin(angle) * 8,
        y: Math.cos(angle * 0.8) * 5,
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoSway, is3dMotionActive]);


  // Handle pointer down on a placed plant
  const handlePlantPointerDown = (e: React.PointerEvent, plant: PlacedPlant) => {
    e.stopPropagation();
    if (plant.locked) {
      onSelectPlant(plant.id);
      return;
    }

    onSelectPlant(plant.id);
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialPlantState({
      x: plant.x,
      y: plant.y,
      scale: plant.scale,
      rotation: plant.rotation,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle pointer down on a scale handle
  const handleScaleHandleDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedPlant || selectedPlant.locked) return;
    setIsScaling(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialPlantState({
      x: selectedPlant.x,
      y: selectedPlant.y,
      scale: selectedPlant.scale,
      rotation: selectedPlant.rotation,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle pointer down on the rotation handle
  const handleRotateHandleDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedPlant || selectedPlant.locked) return;
    setIsRotating(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialPlantState({
      x: selectedPlant.x,
      y: selectedPlant.y,
      scale: selectedPlant.scale,
      rotation: selectedPlant.rotation,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Global pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    // 3D Motion cursor tracking when not dragging/scaling/rotating
    if (is3dMotionActive && !isDragging && !isScaling && !isRotating && !isAutoSway && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 16;
      setMouseTilt({ x, y });
    }

    if (!dragStartPos || !initialPlantState || !selectedPlant || !imageRef.current) return;

    const imgRect = imageRef.current.getBoundingClientRect();
    if (imgRect.width === 0 || imgRect.height === 0) return;

    if (isDragging) {
      const deltaXPx = e.clientX - dragStartPos.x;
      const deltaYPx = e.clientY - dragStartPos.y;

      const deltaXPercent = (deltaXPx / imgRect.width) * 100;
      const deltaYPercent = (deltaYPx / imgRect.height) * 100;

      let newX = Math.max(2, Math.min(98, initialPlantState.x + deltaXPercent));
      let newY = Math.max(5, Math.min(98, initialPlantState.y + deltaYPercent));

      // Optional snap to 2.5% grid
      if (showGrid) {
        newX = Math.round(newX / 2.5) * 2.5;
        newY = Math.round(newY / 2.5) * 2.5;
      }

      onUpdatePlant(selectedPlant.id, { x: newX, y: newY });
    } else if (isScaling) {
      const deltaYPx = dragStartPos.y - e.clientY; // upward drag increases size
      const scaleDelta = (deltaYPx / 150) * initialPlantState.scale;
      const newScale = Math.max(0.35, Math.min(2.5, initialPlantState.scale + scaleDelta));
      onUpdatePlant(selectedPlant.id, { scale: Math.round(newScale * 100) / 100 });
    } else if (isRotating) {
      // Calculate angle relative to center of plant
      const plantCenterXPx = imgRect.left + (initialPlantState.x / 100) * imgRect.width;
      const plantCenterYPx = imgRect.top + (initialPlantState.y / 100) * imgRect.height - 40;

      const angleRad = Math.atan2(e.clientY - plantCenterYPx, e.clientX - plantCenterXPx);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
      if (angleDeg > 180) angleDeg -= 360;
      if (angleDeg < -180) angleDeg += 360;

      onUpdatePlant(selectedPlant.id, { rotation: angleDeg });
    }
  };

  // Pointer up
  const handlePointerUp = () => {
    setIsDragging(false);
    setIsScaling(false);
    setIsRotating(false);
    setDragStartPos(null);
    setInitialPlantState(null);
  };

  // Canvas background click (handles Zoom & Insert or de-selecting)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isZoomInsertMode && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickY = ((e.clientY - rect.top) / rect.height) * 100;

      const boundedX = Math.max(4, Math.min(96, Math.round(clickX)));
      const boundedY = Math.max(10, Math.min(96, Math.round(clickY)));

      setInsertTargetCoord({ x: boundedX, y: boundedY });
      if (onSetZoom && zoom < 1.4) {
        onSetZoom(1.5);
      }
      return;
    }

    onSelectPlant(null);
  };

  // Quick insert plant execution
  const handleExecuteQuickInsert = (plant: Plant) => {
    if (insertTargetCoord && onInsertPlantAt) {
      onInsertPlantAt(plant, insertTargetCoord.x, insertTargetCoord.y);
      setInsertTargetCoord(null);
    }
  };

  // Filter available plants for quick insert
  const filteredQuickPlants = availablePlants.filter((p) =>
    insertSearchQuery
      ? p.name.toLowerCase().includes(insertSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(insertSearchQuery.toLowerCase())
      : true
  );

  // Sort plants by zIndex / depth
  const sortedPlants = [...plants].sort((a, b) => {
    if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
    return a.y - b.y;
  });

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative flex-1 h-full w-full bg-stone-950 flex items-center justify-center overflow-auto p-4 sm:p-8 select-none ${
        isZoomInsertMode ? 'cursor-crosshair' : ''
      }`}
    >
      {/* Top HUD Controls (3D Motion & Zoom-Insert) */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIs3dMotionActive(!is3dMotionActive);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
            is3dMotionActive
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-950'
              : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:bg-stone-800'
          }`}
          title="Toggle 3D spatial perspective tilt with parallax depth"
        >
          <Compass className={`w-3.5 h-3.5 ${is3dMotionActive ? 'text-emerald-400' : 'text-stone-400'}`} />
          <span>3D Motion: {is3dMotionActive ? 'ON' : 'OFF'}</span>
        </button>

        {is3dMotionActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoSway(!isAutoSway);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md flex items-center gap-1 transition-colors cursor-pointer ${
              isAutoSway
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Auto-oscillate room in gentle 3D sway"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Auto Sway</span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomInsertMode(!isZoomInsertMode);
            setInsertTargetCoord(null);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono border backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
            isZoomInsertMode
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-950'
              : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:bg-stone-800'
          }`}
          title="Click anywhere on the room to zoom in and insert a plant"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Zoom & Insert {isZoomInsertMode ? 'Active' : ''}</span>
        </button>
      </div>

      {/* Floating Zoom & Insert Plant Picker Popover */}
      {insertTargetCoord && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bg-stone-900/95 border border-emerald-600/80 rounded-2xl shadow-2xl p-4 w-72 text-stone-100 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-serif font-semibold text-stone-100">
                Insert Plant at {insertTargetCoord.x}%, {insertTargetCoord.y}%
              </span>
            </div>
            <button
              onClick={() => setInsertTargetCoord(null)}
              className="text-stone-400 hover:text-stone-100 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plants to insert..."
              value={insertSearchQuery}
              onChange={(e) => setInsertSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {filteredQuickPlants.map((plant) => (
              <button
                key={plant.id}
                onClick={() => handleExecuteQuickInsert(plant)}
                className="w-full p-2 bg-stone-950/60 hover:bg-emerald-950/50 border border-stone-800 hover:border-emerald-700/60 rounded-xl flex items-center gap-2.5 text-left transition-all group cursor-pointer"
              >
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-8 h-8 object-contain rounded bg-stone-900 p-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-stone-200 truncate group-hover:text-emerald-300">
                    {plant.name}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {plant.category} · {plant.defaultHeight}cm
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zoom transform container */}
      <div
        style={{
          transform: is3dMotionActive
            ? `perspective(1200px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(${zoom}) rotate(${roomRotation}deg)`
            : `scale(${zoom}) rotate(${roomRotation}deg)`,
          transformOrigin: 'center center',
          transformStyle: 'preserve-3d',
          transition:
            isDragging || isScaling || isRotating
              ? 'none'
              : 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative max-w-full max-h-full inline-block shadow-2xl rounded-sm overflow-hidden"
      >
        {/* Background Room Photograph */}
        <img
          ref={imageRef}
          src={roomImageUrl}
          alt="Interior Design Canvas"
          className="block max-h-[80vh] w-auto max-w-[90vw] object-contain pointer-events-none"
        />


        {/* Alignment Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:5%_5%]" />
        )}

        {/* AI Physical Placement Recommendation Markers */}
        {showRecommendations &&
          recommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRecommendation(rec);
              }}
              style={{
                left: `${rec.xPercent}%`,
                top: `${rec.yPercent}%`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute z-30 cursor-pointer group animate-fade-in"
              title={`${rec.title} - Click to place plant here`}
            >
              <div className="flex items-center gap-1.5 bg-emerald-900/90 text-emerald-100 hover:bg-emerald-700 border border-emerald-400 px-2 py-1 rounded-full shadow-lg shadow-black/50 transition-all transform group-hover:scale-110">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  {rec.id}
                </span>
                <span className="text-xs font-medium whitespace-nowrap hidden sm:inline pr-1">
                  {rec.title}
                </span>
              </div>
              {/* Pointer arrow pin */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-600 mx-auto" />
            </div>
          ))}

        {/* Placed Plants Layer */}
        {sortedPlants.map((plant) => {
          if (!plant.visible) return null;
          const isSelected = plant.id === selectedPlantId;

          // Proportions based on scale and height
          const widthPx = 180 * plant.scale * (plant.widthCm / plant.heightCm);
          const foliageHeightPx = 220 * plant.scale * (plant.heightCm / 150);
          const potHeightPx = 70 * plant.scale * ((plant.pot.height || 45) / 45);
          const potWidthPx = widthPx * 0.58 * ((plant.pot.width || 30) / 30);

          return (
            <div
              key={plant.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlant(plant.id);
              }}
              onPointerDown={(e) => handlePlantPointerDown(e, plant)}
              style={{
                left: `${plant.x}%`,
                top: `${plant.y}%`,
                transform: `translate(-50%, -100%) rotate(${plant.rotation}deg) translateZ(${
                  is3dMotionActive ? 18 + (plant.y / 100) * 45 : 0
                }px)`,
                transformStyle: 'preserve-3d',
                zIndex: isSelected ? 40 : plant.zIndex + 10,
              }}
              className={`absolute cursor-move select-none group transition-shadow ${
                isSelected ? 'ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-transparent' : ''
              }`}
            >
              {/* Plant Visual Arrangement */}
              <div
                style={{ width: `${Math.max(widthPx, potWidthPx)}px` }}
                className="flex flex-col items-center relative"
              >
                {/* 1. Plant Foliage Cutout */}
                <div
                  style={{
                    height: `${foliageHeightPx}px`,
                    width: `${widthPx}px`,
                    marginBottom: `-${potHeightPx * 0.18}px`, // foliage sinks into pot rim
                  }}
                  className="relative z-10 flex items-end justify-center pointer-events-none"
                >
                  <img
                    src={plant.transparentCutoutUrl || plant.imageUrl}
                    alt={plant.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                    draggable={false}
                  />
                </div>

                {/* 2. Pot Vessel */}
                {plant.pot.imageUrl ? (
                  <div
                    style={{
                      width: `${potWidthPx}px`,
                      height: `${potHeightPx}px`,
                    }}
                    className="relative z-20 flex items-end justify-center pointer-events-none select-none"
                  >
                    <img
                      src={plant.pot.imageUrl}
                      alt={plant.pot.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: `${potWidthPx}px`,
                      height: `${potHeightPx}px`,
                      backgroundColor: plant.pot.colorHex || '#1C1D1F',
                      borderRadius:
                        plant.pot.shape === 'cylindrical' || plant.pot.shape === 'fluted'
                          ? '4px 4px 14px 14px'
                          : '2px',
                    }}
                    className="relative z-20 shadow-md border-t border-white/20 flex flex-col justify-between overflow-hidden pointer-events-none"
                  >
                    {/* Pot inner rim/soil highlight */}
                    <div className="w-full h-1.5 bg-stone-900/60 border-b border-black/40" />

                    {/* Subtle vertical cylinder shading gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-white/10 to-black/35 pointer-events-none" />

                    {/* Pot base subtle shadow */}
                    <div className="w-full h-1 bg-black/30" />
                  </div>
                )}

                {/* 3. Floor Contact Drop Shadow */}
                <div
                  style={{
                    width: `${potWidthPx * 1.3}px`,
                    height: `${potHeightPx * 0.3}px`,
                  }}
                  className="absolute bottom-0 translate-y-1/2 bg-black/40 rounded-full blur-[3px] pointer-events-none -z-10"
                />

                {/* Plant Label Badge (shown on hover or selection) */}
                <div
                  className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono shadow transition-opacity pointer-events-none ${
                    isSelected
                      ? 'bg-emerald-950 text-emerald-200 border border-emerald-700/80 opacity-100'
                      : 'bg-stone-900/80 text-stone-300 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {plant.name} ({plant.heightCm}cm)
                </div>
              </div>

              {/* Selection Transform Controls Overlay */}
              {isSelected && !plant.locked && (
                <>
                  {/* Floating Action Bar above selected plant */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900/95 text-stone-200 border border-stone-700 p-1 rounded shadow-xl pointer-events-auto"
                  >
                    <button
                      onClick={() => onDuplicatePlant(plant.id)}
                      title="Duplicate plant"
                      className="p-1 hover:bg-stone-800 hover:text-white rounded text-stone-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBringForward(plant.id)}
                      title="Bring layer forward"
                      className="p-1 hover:bg-stone-800 hover:text-white rounded text-stone-300"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSendBackward(plant.id)}
                      title="Send layer backward"
                      className="p-1 hover:bg-stone-800 hover:text-white rounded text-stone-300"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdatePlant(plant.id, { locked: true })}
                      title="Lock position"
                      className="p-1 hover:bg-stone-800 hover:text-white rounded text-stone-300"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePlant(plant.id)}
                      title="Delete plant"
                      className="p-1 hover:bg-red-950 hover:text-red-300 rounded text-stone-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Top Rotation Knob */}
                  <div
                    onPointerDown={handleRotateHandleDown}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center text-stone-950 hover:scale-125 transition-transform"
                    title="Drag to rotate plant angle"
                  >
                    <RotateCw className="w-2.5 h-2.5" />
                  </div>
                  {/* Stem connecting rotation knob to box */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-emerald-500 pointer-events-none" />

                  {/* Corner Scale Handles */}
                  <div
                    onPointerDown={handleScaleHandleDown}
                    className="absolute -top-2 -left-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-sm cursor-nwse-resize shadow hover:scale-125 transition-transform"
                    title="Drag to resize plant"
                  />
                  <div
                    onPointerDown={handleScaleHandleDown}
                    className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-sm cursor-nesw-resize shadow hover:scale-125 transition-transform"
                    title="Drag to resize plant"
                  />
                  <div
                    onPointerDown={handleScaleHandleDown}
                    className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-sm cursor-nesw-resize shadow hover:scale-125 transition-transform"
                    title="Drag to resize plant"
                  />
                  <div
                    onPointerDown={handleScaleHandleDown}
                    className="absolute -bottom-2 -right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-sm cursor-nwse-resize shadow hover:scale-125 transition-transform"
                    title="Drag to resize plant"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
