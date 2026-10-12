export type PlantCategory =
  | 'palms'
  | 'ficus'
  | 'bonsai'
  | 'foliage'
  | 'architectural'
  | 'low-light'
  | 'tabletop'
  | 'flowering'
  | 'artificial';

export type LightLevel =
  | 'Low Light Tolerant'
  | 'Medium Light'
  | 'Bright Indirect'
  | 'High / Filtered Sun';

export type MeasurementUnit = 'cm' | 'mm' | 'in';

export interface Plant {
  id: string;
  name: string;
  botanicalName: string;
  category: PlantCategory;
  imageUrl: string;
  originalImageUrl?: string;
  isPlaceholderImage?: boolean;
  cutoutUrl?: string;
  heightMin: number; // in cm
  heightMax: number; // in cm
  defaultHeight: number; // in cm
  approxWidth: number; // in cm
  growthHabit: string;
  indoorSuitability: string;
  lightRequirements: LightLevel;
  wateringNeeds: string;
  suggestedPlacement: string[];
  isCustom?: boolean;
  notes?: string;
}

export type PotShape =
  | 'rectangular'
  | 'cylindrical'
  | 'square'
  | 'round'
  | 'trough'
  | 'fluted'
  | 'bowl'
  | 'urn'
  | 'conical';

export type PotMaterial =
  | 'Fiberglass'
  | 'Ceramic'
  | 'Terrazzo'
  | 'Powder-coated Aluminum'
  | 'Stone Composite'
  | 'Architectural Concrete';

export interface PotDimensions {
  height: number;
  width: number;
  length?: number;
  depth?: number;
  unit: MeasurementUnit;
}

export interface PotSizeOption {
  label: string;
  height: number;
  width: number;
  length?: number;
  depth?: number;
}

export interface PotColorOption {
  name: string;
  hex: string;
}

export interface Pot {
  id: string;
  name: string;
  shape: PotShape;
  material: PotMaterial;
  color: string;
  colorHex: string;
  imageUrl?: string;
  defaultDimensions: PotDimensions;
  availableSizes?: PotSizeOption[];
  availableColors?: PotColorOption[];
  isCustom?: boolean;
}

export interface PlacedPlantPot {
  potId: string;
  name: string;
  shape: PotShape;
  material: PotMaterial;
  color: string;
  colorHex: string;
  imageUrl?: string;
  transparentCutoutUrl?: string;
  height: number;
  width: number;
  length?: number;
  depth?: number;
  unit: MeasurementUnit;
  quantity: number;
}

export interface PlacedPlant {
  id: string;
  plantId: string;
  name: string;
  botanicalName: string;
  imageUrl: string;
  transparentCutoutUrl?: string;
  // Position as percentage (0-100%) of original photo width and height
  x: number;
  y: number;
  scale: number; // visual scale multiplier, default 1.0
  rotation: number; // degrees, -180 to 180
  zIndex: number;
  quantity: number; // count
  heightCm: number;
  widthCm: number;
  pot: PlacedPlantPot;
  locationTag: string;
  visible: boolean;
  locked: boolean;
  // AI Planting sink depth into pot rim (0% to 50%, default 24%)
  potInsertionDepthPercent?: number;
}


export interface PlacementRecommendation {
  id: number;
  title: string;
  description: string;
  xPercent: number;
  yPercent: number;
  scale: number;
  lightNote: string;
  trafficClearance: string;
}

export interface SampleRoom {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  recommendedPositions?: PlacementRecommendation[];
}

export interface SavedDesign {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  roomImage: string;
  roomName: string;
  plants: PlacedPlant[];
  aiGeneratedImage?: string;
  thumbnail: string;
  notes?: string;
}

export interface PlantScheduleItem {
  id: string;
  plantName: string;
  botanicalName: string;
  plantQuantity: number;
  plantHeight: number;
  plantWidth: number;
  potName: string;
  potQuantity: number;
  potDimensions: string;
  placementLocation: string;
  lightRequirement: string;
  notes?: string;
}

export interface EnquiryData {
  customerName: string;
  contactNumber: string;
  email?: string;
  projectLocation: string;
  projectType: string;
  plantRequirements?: string;
  additionalNotes?: string;
  plantSchedule: PlantScheduleItem[];
  designSnapshot?: string;
}

export type RoomTypeTag =
  | 'bedroom'
  | 'hall'
  | 'corridor'
  | 'balcony'
  | 'dining'
  | 'office'
  | 'entrance';

export interface RoomPlacementItem {
  plantId: string;
  plantName: string;
  botanicalName?: string;
  x: number;
  y: number;
  scale: number;
  potName: string;
  potColor: string;
  potShape?: PotShape;
  designReasoning: string;
  lightZone: string;
}

export interface HouseRoomItem {
  id: string;
  name: string;
  roomType: RoomTypeTag;
  imageUrl: string;
  description?: string;
  plants: PlacedPlant[];
  suggestedPlacements?: RoomPlacementItem[];
  theme?: string;
  designSummary?: string;
}

export interface NanoHdExportOptions {
  resolution: '1080p' | '2k' | '4k-nano';
  supersampling: number; // 1, 2, 4
  unsharpMask: boolean;
  sharpnessLevel: number; // 0 to 100
  foliageVibrance: number; // 0 to 100
  includeWatermarkBadge: boolean;
  contactShadowBoost: boolean;
}

