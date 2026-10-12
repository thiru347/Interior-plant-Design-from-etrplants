// Sample room interiors for instant design testing
import hotelLobbyImg from '../assets/images/hotel_lobby_sample_1791733777622.jpg';
import officeLoungeImg from '../assets/images/office_lounge_sample_1791733794428.jpg';
import hotelCorridorImg from '../assets/images/hotel_corridor_sample_1791733822202.jpg';
import bedroomSampleImg from '../assets/images/bedroom_sample_1791817499843.jpg';
import livingHallSampleImg from '../assets/images/living_hall_sample_1791817518695.jpg';
import houseCorridorSampleImg from '../assets/images/corridor_sample_1791817542458.jpg';

export { bedroomSampleImg, livingHallSampleImg, houseCorridorSampleImg };


// Isolated studio plant images
import arecaPalmImg from '../assets/images/areca_palm_isolated_1791733850020.jpg';
import monsteraImg from '../assets/images/monstera_isolated_1791733876820.jpg';
import snakePlantImg from '../assets/images/snake_plant_isolated_1791733908987.jpg';
import fiddleLeafFigImg from '../assets/images/fiddle_leaf_fig_isolated_1791733943061.jpg';
import birdParadiseImg from '../assets/images/bird_paradise_isolated_1791733979206.jpg';
import zzPlantImg from '../assets/images/zz_plant_isolated_1791734126450.jpg';
import rubberPlantImg from '../assets/images/rubber_plant_isolated_1791734170414.jpg';
import bonsaiImg from '../assets/images/bonsai_isolated_1791743568114.jpg';
import moneyPlantImg from '../assets/images/pothos_money_plant_1791744437240.jpg';
import spiderPlantImg from '../assets/images/spider_plant_isolated_1791744500859.jpg';
import aloeVeraImg from '../assets/images/aloe_vera_isolated_1791744519247.jpg';
import jadePlantImg from '../assets/images/jade_plant_isolated_1791744543365.jpg';
import bostonFernImg from '../assets/images/boston_fern_isolated_1791744565070.jpg';
import anthuriumImg from '../assets/images/anthurium_isolated_1791744590195.jpg';
import calatheaImg from '../assets/images/calathea_isolated_1791744623296.jpg';
import aglaonemaImg from '../assets/images/aglaonema_isolated_1791744659561.jpg';
import alocasiaImg from '../assets/images/alocasia_isolated_1791744696442.jpg';
import aspidistraImg from '../assets/images/aspidistra_isolated_1791744734079.jpg';
import syngoniumImg from '../assets/images/syngonium_isolated_1791744781157.jpg';
import peaceLilyImg from '../assets/images/peace_lily_isolated_1791744837378.jpg';

// Isolated pot models
import blackRectPlanterImg from '../assets/images/black_rect_planter_1791734212841.jpg';
import tallCylinderPlanterImg from '../assets/images/tall_cylinder_planter_1791734263727.jpg';
import whiteFlutedPotImg from '../assets/images/white_fluted_pot_1791745747398.jpg';
import terracottaBowlPotImg from '../assets/images/terracotta_bowl_pot_1791745804766.jpg';
import brassGoldPotImg from '../assets/images/brass_gold_pot_1791745861484.jpg';
import sageGreenPotImg from '../assets/images/sage_green_pot_1791745922673.jpg';
import navyGlazedPotImg from '../assets/images/navy_glazed_pot_1791745986296.jpg';
import concreteCubePotImg from '../assets/images/concrete_cube_pot_1791746052289.jpg';
import sandstoneUrnPotImg from '../assets/images/sandstone_urn_pot_1791746119813.jpg';

import { SampleRoom } from '../types';

export const SAMPLE_ROOMS: SampleRoom[] = [
  {
    id: 'meridian-hotel-lobby',
    title: 'The Grand Hotel Lobby & Reception',
    category: 'Luxury Hotel',
    imageUrl: hotelLobbyImg,
    description: 'High-ceiling lobby with marble reception desk, ambient downlights, terrazzo floors, and architectural seating groupings.',
    recommendedPositions: [
      {
        id: 1,
        title: 'Left Reception Column Base',
        description: 'Tucked beside the dark marble counter end; creates a welcoming biophilic frame.',
        xPercent: 12,
        yPercent: 78,
        scale: 1.05,
        lightNote: 'Ambient warm downlight directly above; ideal for Areca Palm or Ficus.',
        trafficClearance: 'Maintains 2.5m open concourse pathway for check-in arrivals.',
      },
      {
        id: 2,
        title: 'Seating Lounge Accent',
        description: 'Placed behind the emerald velvet lounge chairs to ground the private conversation zone.',
        xPercent: 68,
        yPercent: 82,
        scale: 0.95,
        lightNote: 'Filtered indirect light from double-height floor-to-ceiling glazing.',
        trafficClearance: 'Zero obstruction, sits flush with lounge rug boundary.',
      },
      {
        id: 3,
        title: 'Rear Corridor Vista',
        description: 'Deep architectural corner at the elevator vestibule boundary.',
        xPercent: 44,
        yPercent: 66,
        scale: 0.8,
        lightNote: 'Requires low-light tolerant varieties like Snake Plant or ZZ Plant.',
        trafficClearance: 'Provides natural directional flow along the center gallery.',
      },
    ],
  },
  {
    id: 'contemporary-executive-office',
    title: 'Executive Boardroom Reception Lounge',
    category: 'Corporate Office',
    imageUrl: officeLoungeImg,
    description: 'Minimalist contemporary executive suite with timber vertical batten walls, polished concrete flooring, and skyline window wall.',
    recommendedPositions: [
      {
        id: 1,
        title: 'Timber Reception Flank',
        description: 'Anchor position to the left of the oak slatted reception counter.',
        xPercent: 74,
        yPercent: 78,
        scale: 1.0,
        lightNote: 'High natural daylight diffusion from south-facing panoramic glazing.',
        trafficClearance: 'Preserves clear entrance corridor into main executive suite.',
      },
      {
        id: 2,
        title: 'Lounge Sofa Boundary',
        description: 'Flanking the charcoal sofa on the left side to define the informal waiting area.',
        xPercent: 28,
        yPercent: 76,
        scale: 0.9,
        lightNote: 'Abundant natural light; exceptional for Fiddle Leaf Fig or Bird of Paradise.',
        trafficClearance: 'Frames the wool area rug without intruding into walkway.',
      },
      {
        id: 3,
        title: 'Corner Architectural Column',
        description: 'Deep perimeter corner against the structural concrete pillar.',
        xPercent: 12,
        yPercent: 72,
        scale: 1.05,
        lightNote: 'Soft filtered light; ideal for Monstera or Dracaena.',
        trafficClearance: 'Dead floor zone with ample 1.5m clearance.',
      },
    ],
  },
  {
    id: 'boutique-hotel-corridor',
    title: 'Boutique Hotel Art Gallery & Foyer',
    category: 'Hospitality',
    imageUrl: hotelCorridorImg,
    description: 'Warm limestone foyer with coffered cove ceiling lights, curated wall artwork, and classic brass accents.',
    recommendedPositions: [
      {
        id: 1,
        title: 'Concierge Desk Portal',
        description: 'Left side of the walnut desk near the glass street entrance.',
        xPercent: 15,
        yPercent: 80,
        scale: 1.05,
        lightNote: 'Direct natural illumination from glass entrance facade.',
        trafficClearance: 'Welcoming portal statement; keeps doorway fully unobstructed.',
      },
      {
        id: 2,
        title: 'Hallway Gallery Transition',
        description: 'Curved stone alcove leading into the guest room wing.',
        xPercent: 52,
        yPercent: 76,
        scale: 0.9,
        lightNote: 'Cove architectural downlights; pair with low/medium light foliage.',
        trafficClearance: 'Wide 3m hallway maintains full accessibility standards.',
      },
    ],
  },
  {
    id: 'luxury-master-bedroom',
    title: 'Master Bedroom Suite',
    category: 'Residential',
    imageUrl: bedroomSampleImg,
    description: 'Serene master suite with oak floors, natural linen textures, soft morning window light, and uncluttered bedside zones.',
    recommendedPositions: [
      {
        id: 1,
        title: 'Bedside Light Alcove',
        description: 'Tucked left of the armchair and bedside table; catches indirect window light.',
        xPercent: 18,
        yPercent: 78,
        scale: 0.95,
        lightNote: 'Soft filtered morning sunlight; optimal for Snake Plant or Peace Lily.',
        trafficClearance: 'Preserves open pathway between bedside and exterior door.',
      },
      {
        id: 2,
        title: 'Window Sill Accent',
        description: 'Positioned beside the floor-to-ceiling glass window frame.',
        xPercent: 8,
        yPercent: 82,
        scale: 1.0,
        lightNote: 'High indirect daylight for lush foliage vitality.',
        trafficClearance: 'Sits flush against perimeter mullion.',
      },
    ],
  },
  {
    id: 'grand-living-hall',
    title: 'Grand Double-Height Living Hall',
    category: 'Residential',
    imageUrl: livingHallSampleImg,
    description: 'Spacious architectural living hall with double-height glass doors opening to terrace, stone feature wall, and oak timber slats.',
    recommendedPositions: [
      {
        id: 1,
        title: 'Garden Slider Focal Anchor',
        description: 'Positioned left of the large sliding glass patio door to bridge indoor-outdoor biophilic flow.',
        xPercent: 20,
        yPercent: 78,
        scale: 1.15,
        lightNote: 'Abundant panoramic daylight; exceptional for large Ficus Lyrata or Areca Palm.',
        trafficClearance: 'Anchors the perimeter while preserving open patio access.',
      },
      {
        id: 2,
        title: 'Stone Wall Lounge Boundary',
        description: 'Framing the sofa lounge near the vertical timber slat media wall.',
        xPercent: 86,
        yPercent: 80,
        scale: 0.95,
        lightNote: 'Filtered ambient light and architectural ceiling LED strip.',
        trafficClearance: 'Grounds the conversation seating zone.',
      },
    ],
  },
  {
    id: 'modern-house-corridor',
    title: 'Architectural House Corridor & Gallery',
    category: 'Residential',
    imageUrl: houseCorridorSampleImg,
    description: 'Modern residential corridor with linear recessed LED lighting, polished concrete floors, and framed art gallery walls.',
    recommendedPositions: [
      {
        id: 1,
        title: 'Entrance Hallway Portal',
        description: 'Flanking the corridor entry point against the neutral gallery wall.',
        xPercent: 16,
        yPercent: 82,
        scale: 0.9,
        lightNote: 'Overhead linear architectural beam; ideal for low-light tolerant Snake Plant or ZZ Plant.',
        trafficClearance: 'Maintains wide 1.5m corridor accessibility.',
      },
      {
        id: 2,
        title: 'Mid-Corridor Niche',
        description: 'Placed against structural divider between bedroom doorways.',
        xPercent: 68,
        yPercent: 74,
        scale: 0.85,
        lightNote: 'Diffused ambient corridor cove light.',
        trafficClearance: 'Flush against wall baseboard.',
      },
    ],
  },
];

export const DEFAULT_HOUSE_ROOMS: Array<{
  id: string;
  name: string;
  roomType: 'bedroom' | 'hall' | 'corridor' | 'office';
  imageUrl: string;
  description: string;
}> = [
  {
    id: 'house-hall-1',
    name: 'Grand Living Hall',
    roomType: 'hall',
    imageUrl: livingHallSampleImg,
    description: 'Double-height living space with terrace doors, stone wall, and central sofa lounge.',
  },
  {
    id: 'house-bedroom-1',
    name: 'Master Bedroom',
    roomType: 'bedroom',
    imageUrl: bedroomSampleImg,
    description: 'Quiet bedroom suite with oak floors, linen textiles, and bedside window alcove.',
  },
  {
    id: 'house-corridor-1',
    name: 'Main House Corridor',
    roomType: 'corridor',
    imageUrl: houseCorridorSampleImg,
    description: 'Linear hallway with polished floors, modern artwork, and linear light tracks.',
  },
  {
    id: 'house-office-1',
    name: 'Executive Home Office',
    roomType: 'office',
    imageUrl: officeLoungeImg,
    description: 'Contemporary work and reading lounge with slatted timber feature wall and city view.',
  },
];


export const PLANT_IMAGES = {
  arecaPalm: arecaPalmImg,
  monstera: monsteraImg,
  snakePlant: snakePlantImg,
  fiddleLeafFig: fiddleLeafFigImg,
  birdParadise: birdParadiseImg,
  zzPlant: zzPlantImg,
  rubberPlant: rubberPlantImg,
  bonsai: bonsaiImg,
  moneyPlant: moneyPlantImg,
  spiderPlant: spiderPlantImg,
  aloeVera: aloeVeraImg,
  jadePlant: jadePlantImg,
  bostonFern: bostonFernImg,
  anthurium: anthuriumImg,
  calathea: calatheaImg,
  aglaonema: aglaonemaImg,
  alocasia: alocasiaImg,
  aspidistra: aspidistraImg,
  syngonium: syngoniumImg,
  peaceLily: peaceLilyImg,
};

export const POT_IMAGES = {
  blackRectPlanter: blackRectPlanterImg,
  tallCylinderPlanter: tallCylinderPlanterImg,
  whiteFlutedPot: whiteFlutedPotImg,
  terracottaBowlPot: terracottaBowlPotImg,
  brassGoldPot: brassGoldPotImg,
  sageGreenPot: sageGreenPotImg,
  navyGlazedPot: navyGlazedPotImg,
  concreteCubePot: concreteCubePotImg,
  sandstoneUrnPot: sandstoneUrnPotImg,
};
