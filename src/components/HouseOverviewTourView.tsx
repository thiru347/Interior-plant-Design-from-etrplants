import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Upload,
  Plus,
  Home,
  Compass,
  ArrowRight,
  Layers,
  Check,
  Eye,
  SlidersHorizontal,
  Info,
  Maximize2,
  RotateCw,
  Box,
  Leaf,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  Plant,
  Pot,
  PlacedPlant,
  HouseRoomItem,
  RoomTypeTag,
  RoomPlacementItem,
} from '../types';
import { DEFAULT_HOUSE_ROOMS } from '../data/assets';
import { UploadMotionModal } from './modals/UploadMotionModal';

interface HouseOverviewTourViewProps {
  plants: Plant[];
  pots: Pot[];
  onOpenInStudio: (
    roomImageUrl: string,
    roomTitle: string,
    initialPlants: PlacedPlant[]
  ) => void;
  onOpenAiSettings: () => void;
  aiConfigured: boolean;
}

export const HouseOverviewTourView: React.FC<HouseOverviewTourViewProps> = ({
  plants,
  pots,
  onOpenInStudio,
  onOpenAiSettings,
  aiConfigured,
}) => {
  // House rooms list
  const [houseRooms, setHouseRooms] = useState<HouseRoomItem[]>(() => {
    try {
      const stored = localStorage.getItem('etr_house_rooms');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse house rooms:', e);
    }

    return DEFAULT_HOUSE_ROOMS.map((r) => ({
      id: r.id,
      name: r.name,
      roomType: r.roomType as RoomTypeTag,
      imageUrl: r.imageUrl,
      description: r.description,
      plants: [],
      theme:
        r.roomType === 'bedroom'
          ? 'Restful Clean-Air Sanctuary'
          : r.roomType === 'hall'
          ? 'Grand Architectural Living Statement'
          : r.roomType === 'corridor'
          ? 'Slim Architectural Circulation Gallery'
          : 'Biophilic Executive Lounge',
    }));
  });

  // Active room index in 3D carousel
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  // 3D Auto-Tour playing state
  const [isAutoTourPlaying, setIsAutoTourPlaying] = useState(false);

  // 3D Interactive Cursor Tilt state
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [is3dMotionActive, setIs3dMotionActive] = useState(true);

  // User's given plants selection for AI generation
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(() =>
    plants.slice(0, 8).map((p) => p.id)
  );

  // AI Generation loading & state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // New Room Upload Modal state
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomType, setNewRoomType] = useState<RoomTypeTag>('bedroom');
  const [newRoomImagePreview, setNewRoomImagePreview] = useState<string | null>(null);

  // 3D Ingestion animation on photo upload
  const [isMotionScanningOpen, setIsMotionScanningOpen] = useState(false);
  const [pendingScannedRoom, setPendingScannedRoom] = useState<HouseRoomItem | null>(null);

  // Save rooms to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('etr_house_rooms', JSON.stringify(houseRooms));
    } catch (e) {
      console.warn('Failed to save house rooms:', e);
    }
  }, [houseRooms]);

  // Auto-Tour interval timer
  useEffect(() => {
    if (!isAutoTourPlaying) return;
    const interval = setInterval(() => {
      setActiveRoomIndex((prev) => (prev + 1) % houseRooms.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoTourPlaying, houseRooms.length]);

  // Handle 3D mouse move tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3dMotionActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMouseTilt({ x: x * 14, y: -y * 14 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  const activeRoom = houseRooms[activeRoomIndex] || houseRooms[0];

  // Toggle plant selection in inventory
  const handleTogglePlant = (id: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Generate AI Interior Plant Designs for the House using ONLY given plants
  const handleGenerateAiInteriorDesigns = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMessage(null);

    const availableGivenPlants = plants.filter((p) =>
      selectedPlantIds.includes(p.id)
    );

    try {
      const response = await fetch('/api/ai/multi-room-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: houseRooms.map((r) => ({
            id: r.id,
            name: r.name,
            roomType: r.roomType,
          })),
          availablePlants: availableGivenPlants,
        }),
      });

      const data = await response.json();
      if (data && Array.isArray(data.designs)) {
        // Merge AI design proposals into house rooms
        setHouseRooms((prev) =>
          prev.map((room) => {
            const foundDesign = data.designs.find((d: any) => d.roomId === room.id);
            if (foundDesign) {
              return {
                ...room,
                theme: foundDesign.theme || room.theme,
                designSummary: foundDesign.designSummary,
                suggestedPlacements: foundDesign.placements || [],
              };
            }
            return room;
          })
        );
        setAiSuccessMessage(
          `AI interior designs generated successfully for all ${houseRooms.length} rooms using strictly your ${availableGivenPlants.length} selected plants!`
        );
      }
    } catch (err) {
      console.error('Multi-room AI design error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Apply suggested design directly to room and open in Studio
  const handleApplyAndOpenInStudio = (room: HouseRoomItem) => {
    const placements = room.suggestedPlacements || [];
    const newPlacedPlants: PlacedPlant[] = placements.map((item, idx) => {
      const matchedPlant = plants.find((p) => p.id === item.plantId) || plants[0];
      const matchedPot =
        pots.find((p) =>
          item.potShape ? p.shape === item.potShape : true
        ) || pots[0];

      return {
        id: `placed-${Date.now()}-${idx}`,
        plantId: matchedPlant.id,
        name: matchedPlant.name,
        botanicalName: matchedPlant.botanicalName,
        imageUrl: matchedPlant.imageUrl,
        transparentCutoutUrl: matchedPlant.cutoutUrl,
        x: item.x,
        y: item.y,
        scale: item.scale || 1.0,
        rotation: 0,
        zIndex: idx + 1,
        quantity: 1,
        heightCm: matchedPlant.defaultHeight || 150,
        widthCm: matchedPlant.approxWidth || 80,
        pot: {
          potId: matchedPot.id,
          name: item.potName || matchedPot.name,
          shape: item.potShape || matchedPot.shape,
          material: matchedPot.material,
          color: item.potColor || matchedPot.color,
          colorHex: matchedPot.colorHex,
          imageUrl: matchedPot.imageUrl,
          height: matchedPot.defaultDimensions.height,
          width: matchedPot.defaultDimensions.width,
          unit: 'cm',
          quantity: 1,
        },
        locationTag: item.designReasoning || `${room.name} Placement #${idx + 1}`,
        visible: true,
        locked: false,
      };
    });

    onOpenInStudio(room.imageUrl, room.name, newPlacedPlants);
  };

  // Upload handler for new room
  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setNewRoomImagePreview(result);
        if (!newRoomTitle) {
          setNewRoomTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAddRoom = () => {
    if (!newRoomImagePreview) return;

    const newRoom: HouseRoomItem = {
      id: `house-custom-${Date.now()}`,
      name: newRoomTitle || `${newRoomType.toUpperCase()} Space`,
      roomType: newRoomType,
      imageUrl: newRoomImagePreview,
      description: `Custom ${newRoomType} space uploaded by client.`,
      plants: [],
      theme: `${newRoomType.charAt(0).toUpperCase() + newRoomType.slice(1)} Biophilic Plan`,
    };

    setIsAddRoomModalOpen(false);
    setPendingScannedRoom(newRoom);
    setIsMotionScanningOpen(true);
  };

  const handleMotionScanComplete = () => {
    if (pendingScannedRoom) {
      setHouseRooms((prev) => [...prev, pendingScannedRoom]);
      setActiveRoomIndex(houseRooms.length); // jump to newly added room
      setPendingScannedRoom(null);
    }
    setIsMotionScanningOpen(false);
    setNewRoomTitle('');
    setNewRoomImagePreview(null);
  };

  const handleDeleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (houseRooms.length <= 1) return;
    setHouseRooms((prev) => prev.filter((r) => r.id !== roomId));
    setActiveRoomIndex(0);
  };

  const roomTypeBadges: Record<RoomTypeTag, { label: string; color: string }> = {
    bedroom: { label: 'Bedroom Suite', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
    hall: { label: 'Living Room / Hall', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    corridor: { label: 'Corridor & Walkway', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    balcony: { label: 'Balcony / Terrace', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    office: { label: 'Home Office / Study', color: 'bg-purple-950 text-purple-300 border-purple-800' },
    dining: { label: 'Dining Area', color: 'bg-orange-950 text-orange-300 border-orange-800' },
    entrance: { label: 'Entryway Foyer', color: 'bg-rose-950 text-rose-300 border-rose-800' },
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      {/* 3D Motion Scanner Ingestion Modal */}
      <UploadMotionModal
        isOpen={isMotionScanningOpen}
        onComplete={handleMotionScanComplete}
        imagePreviewUrl={pendingScannedRoom?.imageUrl || null}
        roomTitle={pendingScannedRoom?.name || 'New House Room'}
      />

      {/* Top Banner & Mode Header */}
      <div className="bg-stone-900 border-b border-stone-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>House Overview & 3D Spatial Walkthrough</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {houseRooms.length} Rooms Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Interactive 3D House Tour & Interior Plant Designer
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
              Upload photos of your actual house spaces (Bedroom, Hall, Corridor, Balcony) and explore
              them in 3D motion. Our AI suggests custom interior plant layouts using{' '}
              <strong className="text-emerald-400">only the plants you have provided</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoTourPlaying(!isAutoTourPlaying)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                isAutoTourPlaying
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-md shadow-emerald-950'
                  : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700'
              }`}
            >
              {isAutoTourPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause 3D Tour</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Start 3D Tour Playback</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAddRoomModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add House Photo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): 3D Motion Room Carousel & Stage */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main 3D Motion Viewport Stage */}
          <div
            className="relative w-full h-[400px] sm:h-[480px] bg-stone-900/90 rounded-2xl border border-stone-800 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{ perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Background 3D Perspective Plane */}
            <div
              className="relative w-full h-full transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale3d(1.02, 1.02, 1)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <img
                src={activeRoom.imageUrl}
                alt={activeRoom.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />

              {/* 3D Depth Lighting Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30 pointer-events-none"
                style={{ transform: 'translateZ(20px)' }}
              />

              {/* Placed / Suggested Plants Pin Indicators in 3D parallax */}
              {activeRoom.suggestedPlacements && activeRoom.suggestedPlacements.length > 0 ? (
                activeRoom.suggestedPlacements.map((pin, pIdx) => (
                  <div
                    key={pIdx}
                    className="absolute group z-20"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: 'translate(-50%, -100%) translateZ(45px)',
                    }}
                  >
                    {/* Pulsing Floor Target Reticle */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping" />
                      <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <Leaf className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Hover Card / Popover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-stone-950/95 border border-emerald-600/60 rounded-xl shadow-2xl text-left pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30">
                      <div className="text-[10px] font-mono uppercase text-emerald-400">
                        {pin.lightZone || 'Floor Placement'}
                      </div>
                      <div className="font-serif text-xs font-semibold text-stone-100">
                        {pin.plantName}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Pot: {pin.potName} ({pin.potColor})
                      </div>
                      <div className="text-[10px] text-stone-300 mt-1 italic border-t border-stone-800 pt-1">
                        "{pin.designReasoning}"
                      </div>
                    </div>
                  </div>
                ))
              ) : null}

              {/* Room Title Floating 3D Badge */}
              <div
                className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none"
                style={{ transform: 'translateZ(35px)' }}
              >
                <div className="bg-stone-950/85 backdrop-blur-md p-4 rounded-xl border border-stone-800/80 max-w-lg pointer-events-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        roomTypeBadges[activeRoom.roomType]?.color || 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {roomTypeBadges[activeRoom.roomType]?.label || activeRoom.roomType}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Room {activeRoomIndex + 1} of {houseRooms.length}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                    {activeRoom.name}
                  </h3>

                  <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                    {activeRoom.theme || activeRoom.description}
                  </p>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    onClick={() => handleApplyAndOpenInStudio(activeRoom)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 transition-all cursor-pointer group"
                  >
                    <span>Design Room in Studio</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            <button
              onClick={() =>
                setActiveRoomIndex(
                  (prev) => (prev - 1 + houseRooms.length) % houseRooms.length
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center transition-colors cursor-pointer z-30 shadow-lg"
              title="Previous Room"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() =>
                setActiveRoomIndex((prev) => (prev + 1) % houseRooms.length)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center transition-colors cursor-pointer z-30 shadow-lg"
              title="Next Room"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 3D Motion Status indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
              <button
                onClick={() => setIs3dMotionActive(!is3dMotionActive)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono border backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  is3dMotionActive
                    ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300'
                    : 'bg-stone-900/70 border-stone-700 text-stone-400'
                }`}
              >
                <Compass className={`w-3 h-3 ${is3dMotionActive ? 'animate-spin' : ''}`} />
                <span>3D Gyro Tilt: {is3dMotionActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Room Thumbnails 3D Carousel Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {houseRooms.map((room, idx) => {
              const isSelected = idx === activeRoomIndex;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoomIndex(idx)}
                  className={`relative min-w-[140px] sm:min-w-[170px] h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 group ${
                    isSelected
                      ? 'border-emerald-500 shadow-lg shadow-emerald-950/60 scale-102'
                      : 'border-stone-800 opacity-60 hover:opacity-100 hover:border-stone-700'
                  }`}
                >
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[9px] font-mono uppercase text-emerald-400">
                      {room.roomType}
                    </span>
                    <span className="font-serif text-xs font-semibold text-stone-100 truncate">
                      {room.name}
                    </span>
                  </div>

                  {houseRooms.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteRoom(room.id, e)}
                      title="Remove room from house tour"
                      className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-stone-400 hover:text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Room AI Interior Design Evaluation Breakdown */}
          {activeRoom.designSummary && (
            <div className="p-5 bg-stone-900 border border-emerald-900/40 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-serif text-sm font-semibold text-stone-100">
                    AI Interior Architecture Rationale: {activeRoom.name}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Strictly Given Plants
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {activeRoom.designSummary}
              </p>

              {activeRoom.suggestedPlacements && activeRoom.suggestedPlacements.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-800">
                  {activeRoom.suggestedPlacements.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-medium text-stone-100">
                          {p.plantName}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Pos: {p.x}% × {p.y}%
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Planter: {p.potName} · {p.potColor}
                      </div>
                      <div className="text-[10px] text-stone-400 italic">
                        {p.designReasoning}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): User's Given Plants Inventory & AI Action */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Generation Control Card */}
          <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-stone-100">
                    AI Multi-Room Interior Styling
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Uses strictly your selected plant inventory
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Tailors placements specifically for bedrooms (air-purifying, restorative), living halls
              (grand focal anchors), corridors (slim vertical flow), and balconies.
            </p>

            <button
              onClick={handleGenerateAiInteriorDesigns}
              disabled={isGeneratingAi || selectedPlantIds.length === 0}
              className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Multi-Room Designs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Interior Designs for House</span>
                </>
              )}
            </button>

            {aiSuccessMessage && (
              <div className="mt-3 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* User's Given Plants Inventory Checklist */}
          <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-serif text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>My Given Plant Inventory</span>
                </h4>
                <p className="text-[10px] text-stone-400">
                  Select which plants the AI is permitted to use:
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                {selectedPlantIds.length} Selected
              </span>
            </div>

            <div className="flex gap-2 my-2 text-[10px] font-mono">
              <button
                onClick={() => setSelectedPlantIds(plants.map((p) => p.id))}
                className="text-stone-400 hover:text-emerald-300 underline"
              >
                Select All ({plants.length})
              </button>
              <span className="text-stone-600">·</span>
              <button
                onClick={() => setSelectedPlantIds([])}
                className="text-stone-400 hover:text-stone-200 underline"
              >
                Clear
              </button>
            </div>

            <div className="overflow-y-auto max-h-[360px] space-y-2 pr-1 scrollbar-thin">
              {plants.map((plant) => {
                const isChecked = selectedPlantIds.includes(plant.id);
                return (
                  <div
                    key={plant.id}
                    onClick={() => handleTogglePlant(plant.id)}
                    className={`p-2 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-600/70 bg-emerald-950/20 text-stone-100'
                        : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>

                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="w-10 h-10 object-contain bg-stone-900 rounded-lg p-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-stone-200 truncate">
                        {plant.name}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">
                        {plant.category} · {plant.lightRequirements}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add House Photo Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-100">
            <h3 className="font-serif text-lg font-semibold text-stone-100 mb-1">
              Add House Room Photograph
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Mention the room type (e.g. bedroom, hall, corridor, balcony) so our AI can design
              interior plant placements suited to that exact architectural zone.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-300 block mb-1">
                  Room Label / Mention Room Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      'bedroom',
                      'hall',
                      'corridor',
                      'balcony',
                      'office',
                      'dining',
                      'entrance',
                    ] as RoomTypeTag[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewRoomType(type)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-center capitalize transition-colors ${
                        newRoomType === type
                          ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-300 block mb-1">
                  Custom Room Title (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom 1st Floor"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-300 block mb-1">
                  Select Room Photo:
                </label>
                {newRoomImagePreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-emerald-600/50">
                    <img
                      src={newRoomImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute bottom-2 right-2 px-3 py-1 bg-stone-950/80 text-emerald-400 text-xs rounded-lg cursor-pointer border border-emerald-700">
                      Change Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleRoomPhotoUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="w-full h-36 border-2 border-dashed border-stone-700 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-stone-950/50 hover:bg-emerald-950/20 transition-colors">
                    <Upload className="w-6 h-6 text-emerald-400 mb-2" />
                    <span className="text-xs text-stone-300 font-medium">
                      Upload Room Photo File
                    </span>
                    <span className="text-[10px] text-stone-500 mt-0.5">JPG, PNG, WebP</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleRoomPhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddRoomModalOpen(false)}
                className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddRoom}
                disabled={!newRoomImagePreview}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-md transition-colors cursor-pointer"
              >
                Save & Ingest with 3D Motion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
