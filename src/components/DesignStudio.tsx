import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Grid,
  Undo2,
  Redo2,
  Compass,
  Sparkles,
  Sliders,
  FileSpreadsheet,
  Download,
  Save,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Columns,
  RefreshCw,
  Mail,
  Loader2,
} from 'lucide-react';
import {
  Plant,
  Pot,
  PlacedPlant,
  PlacementRecommendation,
  SavedDesign,
  SampleRoom,
  PlantScheduleItem,
} from '../types';
import { SAMPLE_ROOMS } from '../data/assets';
import { CanvasWorkspace } from './studio/CanvasWorkspace';
import { CatalogueDrawer } from './studio/CatalogueDrawer';
import { InspectorPanel } from './studio/InspectorPanel';
import { ComparisonModal } from './modals/ComparisonModal';
import { PlantScheduleModal } from './modals/PlantScheduleModal';
import { EnquiryModal } from './modals/EnquiryModal';
import { AiDesignModal } from './modals/AiDesignModal';
import { CustomPlantModal } from './modals/CustomPlantModal';
import { CustomPotModal } from './modals/CustomPotModal';
import { AiSettingsModal } from './modals/AiSettingsModal';
import { UploadMotionModal } from './modals/UploadMotionModal';
import { AiNanoHdDownloadModal } from './modals/AiNanoHdDownloadModal';
import {
  renderCompositeCanvas,
  createTransparentPlantCutout,
  unitToCm,
} from '../utils/imageUtils';

interface DesignStudioProps {
  initialRoom?: SampleRoom | null;
  initialCustomPhoto?: File | null;
  plants: Plant[];
  pots: Pot[];
  onSaveCustomPlant: (plant: Plant, addToDesign: boolean) => void;
  onSaveCustomPot: (pot: Pot) => void;
  onSaveDesignToLibrary: (design: SavedDesign) => void;
  aiConfigured: boolean;
  onOpenAiSettings: () => void;
  onNavigateToContact: (schedule: PlantScheduleItem[]) => void;
  onUpdatePlantCatalogue?: (plant: Plant) => void;
  onDeletePlantFromCatalogue?: (plantId: string) => void;
  onDeletePlantPhoto?: (plantId: string) => void;
  onOpenHouseTour?: () => void;
  initialPlacedPlants?: PlacedPlant[];
}

export const DesignStudio: React.FC<DesignStudioProps> = ({
  initialRoom,
  initialCustomPhoto,
  plants,
  pots,
  onSaveCustomPlant,
  onSaveCustomPot,
  onSaveDesignToLibrary,
  aiConfigured,
  onOpenAiSettings,
  onNavigateToContact,
  onUpdatePlantCatalogue,
  onDeletePlantFromCatalogue,
  onDeletePlantPhoto,
  onOpenHouseTour,
  initialPlacedPlants,
}) => {

  // Room Photograph state
  const [currentRoomTitle, setCurrentRoomTitle] = useState(
    initialRoom ? initialRoom.title : 'The Grand Hotel Lobby & Reception'
  );
  const [roomImageUrl, setRoomImageUrl] = useState<string>(
    initialRoom ? initialRoom.imageUrl : SAMPLE_ROOMS[0].imageUrl
  );
  const [roomRotation, setRoomRotation] = useState(0);

  // Placed plants state & Undo/Redo history
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>(() => initialPlacedPlants || []);
  const [history, setHistory] = useState<PlacedPlant[][]>(() => [initialPlacedPlants || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (initialPlacedPlants && initialPlacedPlants.length > 0) {
      setPlacedPlants(initialPlacedPlants);
      setHistory([initialPlacedPlants]);
      setHistoryIndex(0);
    }
  }, [initialPlacedPlants]);


  // Selection
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Canvas viewport controls
  const [zoom, setZoom] = useState(1.0);
  const [showGrid, setShowGrid] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<PlacementRecommendation[]>(
    initialRoom?.recommendedPositions || SAMPLE_ROOMS[0].recommendedPositions || []
  );
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Generated Result image (if generated)
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);

  // Modals state
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isAiDesignOpen, setIsAiDesignOpen] = useState(false);
  const [isCustomPlantOpen, setIsCustomPlantOpen] = useState(false);
  const [isCustomPotOpen, setIsCustomPotOpen] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // AI Nano HD download modal state
  const [isNanoHdModalOpen, setIsNanoHdModalOpen] = useState(false);

  // 3D Motion upload scanner modal state
  const [isUploadMotionModalOpen, setIsUploadMotionModalOpen] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<{ url: string; title: string } | null>(null);

  // Composite snapshot cache for comparison and export
  const [compositeSnapshotUrl, setCompositeSnapshotUrl] = useState<string | null>(null);

  // Zoom & Insert: Insert plant at specific coordinate
  const handleInsertPlantAt = (plant: Plant, xPercent: number, yPercent: number) => {
    const defaultPot = pots[0];
    const newPlacedPlant: PlacedPlant = {
      id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      plantId: plant.id,
      name: plant.name,
      botanicalName: plant.botanicalName,
      imageUrl: plant.imageUrl,
      transparentCutoutUrl: plant.cutoutUrl,
      x: xPercent,
      y: yPercent,
      scale: 1.0,
      rotation: 0,
      zIndex: placedPlants.length + 1,
      quantity: 1,
      heightCm: plant.defaultHeight || 150,
      widthCm: plant.approxWidth || 80,
      pot: {
        potId: defaultPot.id,
        name: defaultPot.name,
        shape: defaultPot.shape,
        material: defaultPot.material,
        color: defaultPot.color,
        colorHex: defaultPot.colorHex,
        imageUrl: defaultPot.imageUrl,
        height: defaultPot.defaultDimensions.height,
        width: defaultPot.defaultDimensions.width,
        unit: 'cm',
        quantity: 1,
      },
      locationTag: `${currentRoomTitle} (${xPercent}%, ${yPercent}%)`,
      visible: true,
      locked: false,
    };

    const updated = [...placedPlants, newPlacedPlant];
    recordHistory(updated);
    setSelectedPlantId(newPlacedPlant.id);
  };


  // Handle initial custom photo if passed from Hero upload
  useEffect(() => {
    if (initialCustomPhoto) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setRoomImageUrl(result);
        setCurrentRoomTitle(initialCustomPhoto.name.replace(/\.[^/.]+$/, ''));
        setPlacedPlants([]);
        setHistory([[]]);
        setHistoryIndex(0);
        triggerAiRecommendationsForImage(result);
      };
      reader.readAsDataURL(initialCustomPhoto);
    }
  }, [initialCustomPhoto]);

  // Update composite snapshot on plant modifications
  useEffect(() => {
    let isCancelled = false;
    const timeout = setTimeout(async () => {
      if (placedPlants.length > 0 && roomImageUrl) {
        try {
          const canvas = await renderCompositeCanvas(
            roomImageUrl,
            placedPlants,
            1280,
            720,
            roomRotation
          );
          if (!isCancelled) {
            setCompositeSnapshotUrl(canvas.toDataURL('image/jpeg', 0.88));
          }
        } catch (e) {
          console.warn('Composite snapshot generation error:', e);
        }
      } else {
        setCompositeSnapshotUrl(roomImageUrl);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [placedPlants, roomImageUrl, roomRotation]);

  // Undo / Redo helpers
  const recordHistory = (newPlants: PlacedPlant[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPlants);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setPlacedPlants(newPlants);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPlacedPlants(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPlacedPlants(history[newIndex]);
    }
  };

  // Plant Placement Operations
  const handleAddPlantToDesign = async (plant: Plant, chosenPot?: Pot) => {
    const potModel = chosenPot || pots[0];

    // Compute transparent cutout if available
    let transparentUrl = plant.cutoutUrl;
    if (!transparentUrl && plant.imageUrl) {
      transparentUrl = await createTransparentPlantCutout(plant.imageUrl);
    }

    // Default placement: center-floor or first recommendation
    let targetX = 50;
    let targetY = 75;
    if (recommendations.length > 0) {
      // Pick next unused recommendation coordinate
      const rec = recommendations[placedPlants.length % recommendations.length];
      targetX = rec.xPercent;
      targetY = rec.yPercent;
    }

    const newPlacedPlant: PlacedPlant = {
      id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      plantId: plant.id,
      name: plant.name,
      botanicalName: plant.botanicalName,
      imageUrl: plant.imageUrl,
      transparentCutoutUrl: transparentUrl,
      x: targetX,
      y: targetY,
      scale: 1.0,
      rotation: 0,
      zIndex: placedPlants.length + 1,
      quantity: 1,
      heightCm: plant.defaultHeight || 150,
      widthCm: plant.approxWidth || 70,
      pot: {
        potId: potModel.id,
        name: potModel.name,
        shape: potModel.shape,
        material: potModel.material,
        color: potModel.color,
        colorHex: potModel.colorHex,
        imageUrl: potModel.imageUrl,
        height: potModel.defaultDimensions.height,
        width: potModel.defaultDimensions.width,
        length: potModel.defaultDimensions.length,
        depth: potModel.defaultDimensions.depth,
        unit: potModel.defaultDimensions.unit,
        quantity: 1,
      },
      locationTag: `Zone ${placedPlants.length + 1}`,
      visible: true,
      locked: false,
    };

    const updated = [...placedPlants, newPlacedPlant];
    recordHistory(updated);
    setSelectedPlantId(newPlacedPlant.id);
  };

  const handleUpdatePlant = (id: string, updates: Partial<PlacedPlant>) => {
    const updated = placedPlants.map((p) => (p.id === id ? { ...p, ...updates } : p));
    recordHistory(updated);
  };

  const handleDuplicatePlant = (id: string) => {
    const original = placedPlants.find((p) => p.id === id);
    if (!original) return;

    const duplicated: PlacedPlant = {
      ...original,
      id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: Math.min(94, original.x + 8),
      y: Math.min(94, original.y + 4),
      zIndex: placedPlants.length + 1,
      locationTag: `${original.locationTag} (Copy)`,
    };

    const updated = [...placedPlants, duplicated];
    recordHistory(updated);
    setSelectedPlantId(duplicated.id);
  };

  const handleDeletePlant = (id: string) => {
    const updated = placedPlants.filter((p) => p.id !== id);
    recordHistory(updated);
    if (selectedPlantId === id) {
      setSelectedPlantId(null);
    }
  };

  const handleBringForward = (id: string) => {
    const index = placedPlants.findIndex((p) => p.id === id);
    if (index === -1) return;
    const currentZ = placedPlants[index].zIndex;
    handleUpdatePlant(id, { zIndex: currentZ + 1 });
  };

  const handleSendBackward = (id: string) => {
    const index = placedPlants.findIndex((p) => p.id === id);
    if (index === -1) return;
    const currentZ = placedPlants[index].zIndex;
    handleUpdatePlant(id, { zIndex: Math.max(1, currentZ - 1) });
  };

  // Spreading multiple matching plants along corridor/wall
  const handleSpreadMultiple = (id: string, count: number = 3) => {
    const base = placedPlants.find((p) => p.id === id);
    if (!base) return;

    const additions: PlacedPlant[] = [];
    const spacingX = 14;

    for (let i = 1; i < count; i++) {
      additions.push({
        ...base,
        id: `placed-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        x: Math.min(94, base.x + i * spacingX),
        y: base.y,
        zIndex: base.zIndex + i,
        locationTag: `${base.locationTag} Row #${i + 1}`,
      });
    }

    const updated = [...placedPlants, ...additions];
    recordHistory(updated);
  };

  // AI Recommendation Trigger
  const triggerAiRecommendationsForImage = async (imgData: string) => {
    setIsAiLoading(true);
    try {
      const selected = placedPlants.find((p) => p.id === selectedPlantId) || placedPlants[0];
      const response = await fetch('/api/ai/recommend-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: imgData,
          plantName: selected?.name || 'Areca Palm',
          plantHeight: selected?.heightCm || 160,
          potType: selected?.pot?.name || 'Black Rectangular Planter',
        }),
      });

      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setShowRecommendations(true);
      }
    } catch (e) {
      console.warn('AI recommendation fetch error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyRecommendation = (rec: PlacementRecommendation) => {
    if (selectedPlantId) {
      handleUpdatePlant(selectedPlantId, {
        x: rec.xPercent,
        y: rec.yPercent,
        locationTag: rec.title,
      });
    } else if (plants.length > 0) {
      handleAddPlantToDesign(plants[0]);
    }
  };

  // Photo Upload Handler inside Studio (triggers 3D motion scanner)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const title = file.name.replace(/\.[^/.]+$/, '');
        setPendingUploadData({ url: result, title });
        setIsUploadMotionModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMotionComplete = () => {
    if (pendingUploadData) {
      setRoomImageUrl(pendingUploadData.url);
      setCurrentRoomTitle(pendingUploadData.title);
      triggerAiRecommendationsForImage(pendingUploadData.url);
      setPendingUploadData(null);
    }
    setIsUploadMotionModalOpen(false);
  };


  // Save Design to Library
  const handleSaveDesign = () => {
    const newDesign: SavedDesign = {
      id: `design-${Date.now()}`,
      title: `${currentRoomTitle} Plant Styling`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roomImage: roomImageUrl,
      roomName: currentRoomTitle,
      plants: placedPlants,
      aiGeneratedImage: aiGeneratedImageUrl || undefined,
      thumbnail: compositeSnapshotUrl || roomImageUrl,
    };

    onSaveDesignToLibrary(newDesign);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  // High-res composite download
  const handleDownloadComposite = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await renderCompositeCanvas(
        roomImageUrl,
        placedPlants,
        undefined,
        undefined,
        roomRotation
      );
      const link = document.createElement('a');
      link.download = `ETR_Plants_Design_${currentRoomTitle.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Switch sample room
  const handleSwitchRoom = (room: SampleRoom) => {
    setRoomImageUrl(room.imageUrl);
    setCurrentRoomTitle(room.title);
    if (room.recommendedPositions) {
      setRecommendations(room.recommendedPositions);
    }
  };

  const selectedPlant = placedPlants.find((p) => p.id === selectedPlantId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-stone-950 overflow-hidden select-none">
      {/* Top Studio Toolbar */}
      <div className="h-14 bg-stone-900 border-b border-stone-800 px-4 flex items-center justify-between gap-2 z-30 shrink-0 text-stone-200">
        {/* Left Toolbar: Room selector & Photo controls */}
        <div className="flex items-center gap-2">
          {/* Sample Rooms dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded text-xs text-stone-200 font-medium transition-colors">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentRoomTitle}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-1 w-64 bg-stone-900 border border-stone-800 rounded shadow-xl py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-stone-500 border-b border-stone-800">
                Sample Luxury Spaces
              </div>
              {SAMPLE_ROOMS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSwitchRoom(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-stone-800 flex items-center gap-2 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate">{r.title}</span>
                </button>
              ))}

              <div className="border-t border-stone-800 mt-1 pt-1 px-2 pb-1">
                <label className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-emerald-400 hover:bg-stone-800 rounded cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Your Photo (JPG/PNG)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Rotate room photo */}
          <button
            onClick={() => setRoomRotation((prev) => (prev + 90) % 360)}
            title="Rotate photograph 90°"
            className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Grid Snap Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? 'Hide alignment grid' : 'Show alignment grid'}
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-emerald-800 text-white' : 'text-stone-400 hover:bg-stone-800'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-stone-950 border border-stone-800 rounded text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-stone-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="px-2 py-1 hover:bg-stone-800 text-[10px] text-stone-400 hover:text-stone-200 border-l border-stone-800"
            >
              Fit
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-l border-stone-800 pl-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo change"
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded disabled:opacity-30 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo change"
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded disabled:opacity-30 transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center / Right Toolbar: Features & Exports */}
        <div className="flex items-center gap-2">
          {/* AI Placement Pins toggle */}
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border transition-colors ${
              showRecommendations
                ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300'
                : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Pins ({recommendations.length})</span>
          </button>

          {/* Generate AI Plant Design Button */}
          <button
            onClick={() => setIsAiDesignOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Generate AI Design</span>
            <span className="sm:hidden">AI Design</span>
          </button>

          {/* Before & After Comparison */}
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs rounded transition-colors cursor-pointer"
            title="Before & After Split Slider Comparison"
          >
            <Columns className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Before & After</span>
          </button>

          {/* Plant Schedule */}
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs rounded transition-colors cursor-pointer"
            title="Itemized Plant Schedule & Bill of Quantities"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Plant Schedule</span>
            {placedPlants.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-900 text-emerald-300 rounded-full font-mono text-[10px]">
                {placedPlants.length}
              </span>
            )}
          </button>

          {/* Save Design */}
          <button
            onClick={handleSaveDesign}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs rounded transition-colors cursor-pointer"
            title="Save design to browser library"
          >
            {isSavedFeedback ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5 text-stone-400" />
            )}
            <span className="hidden sm:inline">
              {isSavedFeedback ? 'Saved!' : 'Save'}
            </span>
          </button>

          {/* House 3D Tour Shortcut */}
          {onOpenHouseTour && (
            <button
              onClick={onOpenHouseTour}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs rounded transition-colors cursor-pointer"
              title="Overview & 3D Walkthrough Tour across House Rooms"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">House 3D Tour</span>
            </button>
          )}

          {/* AI Nano HD Clarity Export */}
          <button
            onClick={() => setIsNanoHdModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
            title="Download in AI Nano HD (4K Ultra-Clarity) with leaf edge sharpening"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Nano HD (4K)</span>
          </button>

          {/* Standard Download button */}
          <button
            onClick={() => setIsNanoHdModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded transition-colors cursor-pointer"
            title="Export Image Resolution Options"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: 3-column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Catalogue Drawer (Plants & Pots) */}
        <CatalogueDrawer
          plants={plants}
          pots={pots}
          onAddPlantToDesign={handleAddPlantToDesign}
          onOpenCustomPlantModal={() => setIsCustomPlantOpen(true)}
          onOpenCustomPotModal={() => setIsCustomPotOpen(true)}
          onUpdatePlantCatalogue={onUpdatePlantCatalogue}
          onDeletePlantFromCatalogue={onDeletePlantFromCatalogue}
          onDeletePlantPhoto={onDeletePlantPhoto}
        />

        {/* Center: Interactive Photo Canvas Workspace */}
        <CanvasWorkspace
          roomImageUrl={roomImageUrl}
          roomRotation={roomRotation}
          plants={placedPlants}
          selectedPlantId={selectedPlantId}
          onSelectPlant={setSelectedPlantId}
          onUpdatePlant={handleUpdatePlant}
          onDuplicatePlant={handleDuplicatePlant}
          onDeletePlant={handleDeletePlant}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          zoom={zoom}
          showGrid={showGrid}
          recommendations={recommendations}
          showRecommendations={showRecommendations}
          onSelectRecommendation={handleApplyRecommendation}
          availablePlants={plants}
          onInsertPlantAt={handleInsertPlantAt}
          onSetZoom={setZoom}
        />


        {/* Right: Inspector & Specifications Panel */}
        <InspectorPanel
          selectedPlant={selectedPlant}
          placedPlants={placedPlants}
          availablePots={pots}
          recommendations={recommendations}
          onUpdatePlant={handleUpdatePlant}
          onSelectPlant={setSelectedPlantId}
          onDuplicatePlant={handleDuplicatePlant}
          onDeletePlant={handleDeletePlant}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onSpreadMultiple={handleSpreadMultiple}
          onApplyRecommendation={handleApplyRecommendation}
          onTriggerAiRecommendations={() => triggerAiRecommendationsForImage(roomImageUrl)}
          isAiLoading={isAiLoading}
        />
      </div>

      {/* Modals */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        originalImageUrl={roomImageUrl}
        editedCanvasUrl={compositeSnapshotUrl}
        aiEditedImageUrl={aiGeneratedImageUrl}
      />

      <PlantScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        placedPlants={placedPlants}
        onOpenEnquiry={(schedule) => {
          setIsScheduleOpen(false);
          setIsEnquiryOpen(true);
        }}
      />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        plantSchedule={placedPlants.map((plant, i) => ({
          id: plant.id,
          plantName: plant.name,
          botanicalName: plant.botanicalName,
          plantQuantity: plant.quantity || 1,
          plantHeight: plant.heightCm,
          plantWidth: plant.widthCm,
          potName: plant.pot?.name || 'Standard Planter',
          potQuantity: plant.quantity || 1,
          potDimensions: `${plant.pot.height}x${plant.pot.width}cm`,
          placementLocation: plant.locationTag || `Zone ${i + 1}`,
          lightRequirement: 'Indoor Acclimated',
        }))}
        designSnapshot={compositeSnapshotUrl || undefined}
      />

      <AiDesignModal
        isOpen={isAiDesignOpen}
        onClose={() => setIsAiDesignOpen(false)}
        roomImageUrl={roomImageUrl}
        placedPlants={placedPlants}
        onApplyAiImage={(url) => setAiGeneratedImageUrl(url)}
        aiConfigured={aiConfigured}
        onOpenAiSettings={onOpenAiSettings}
      />

      <CustomPlantModal
        isOpen={isCustomPlantOpen}
        onClose={() => setIsCustomPlantOpen(false)}
        onSaveCustomPlant={(newPlant, addToDesign) => {
          onSaveCustomPlant(newPlant, addToDesign);
          if (addToDesign) {
            handleAddPlantToDesign(newPlant);
          }
        }}
      />

      <CustomPotModal
        isOpen={isCustomPotOpen}
        onClose={() => setIsCustomPotOpen(false)}
        onSaveCustomPot={onSaveCustomPot}
      />

      {/* 3D Motion Ingestion Scanner Modal */}
      <UploadMotionModal
        isOpen={isUploadMotionModalOpen}
        onComplete={handleUploadMotionComplete}
        imagePreviewUrl={pendingUploadData?.url || null}
        roomTitle={pendingUploadData?.title || currentRoomTitle}
      />

      {/* AI Nano HD 4K Ultra-Clarity Download Modal */}
      <AiNanoHdDownloadModal
        isOpen={isNanoHdModalOpen}
        onClose={() => setIsNanoHdModalOpen(false)}
        roomImageUrl={roomImageUrl}
        roomTitle={currentRoomTitle}
        roomRotation={roomRotation}
        plants={placedPlants}
      />
    </div>
  );
};
