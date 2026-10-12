import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { SavedDesign, Plant, Pot, EnquiryData } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider: any) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Cloud persistence service for ETR Plants projects
 */

// 1. Designs
export async function saveDesignToCloud(design: SavedDesign): Promise<void> {
  const path = `designs/${design.id}`;
  try {
    const designRef = doc(db, 'designs', design.id);
    await setDoc(designRef, {
      title: design.title,
      roomName: design.roomName || 'Custom Room',
      roomImage: design.roomImage,
      plants: JSON.stringify(design.plants),
      thumbnail: design.thumbnail,
      aiGeneratedImage: design.aiGeneratedImage || null,
      createdAt: design.createdAt,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchDesignsFromCloud(): Promise<SavedDesign[]> {
  const path = 'designs';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const designs: SavedDesign[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let parsedPlants = [];
      try {
        parsedPlants =
          typeof data.plants === 'string'
            ? JSON.parse(data.plants)
            : data.plants || [];
      } catch (e) {
        console.warn('Failed to parse plants for design', docSnap.id);
      }

      designs.push({
        id: docSnap.id,
        title: data.title || 'Untitled Design',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        roomImage: data.roomImage || '',
        roomName: data.roomName || 'Custom Room',
        plants: parsedPlants,
        thumbnail: data.thumbnail || data.roomImage || '',
        aiGeneratedImage: data.aiGeneratedImage || undefined,
      });
    });
    return designs;
  } catch (error) {
    console.warn('Note on fetching designs from cloud, fallback to local storage:', error);
    return [];
  }
}

export async function deleteDesignFromCloud(designId: string): Promise<void> {
  const path = `designs/${designId}`;
  try {
    await deleteDoc(doc(db, 'designs', designId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Custom Plants
export async function saveCustomPlantToCloud(plant: Plant): Promise<void> {
  const path = `customPlants/${plant.id}`;
  try {
    const plantRef = doc(db, 'customPlants', plant.id);
    await setDoc(plantRef, {
      name: plant.name,
      botanicalName: plant.botanicalName,
      category: plant.category,
      imageUrl: plant.imageUrl,
      cutoutUrl: plant.cutoutUrl || plant.imageUrl,
      heightMin: plant.heightMin,
      heightMax: plant.heightMax,
      defaultHeight: plant.defaultHeight,
      approxWidth: plant.approxWidth,
      lightRequirements: plant.lightRequirements,
      growthHabit: plant.growthHabit,
      indoorSuitability: plant.indoorSuitability,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomPlantFromCloud(plantId: string): Promise<void> {
  const path = `customPlants/${plantId}`;
  try {
    await deleteDoc(doc(db, 'customPlants', plantId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCustomPlantsFromCloud(): Promise<Plant[]> {
  const path = 'customPlants';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const plants: Plant[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      plants.push({
        id: docSnap.id,
        name: d.name,
        botanicalName: d.botanicalName || d.name,
        category: d.category || 'foliage',
        imageUrl: d.imageUrl,
        cutoutUrl: d.cutoutUrl,
        heightMin: d.heightMin || 100,
        heightMax: d.heightMax || 200,
        defaultHeight: d.defaultHeight || 150,
        approxWidth: d.approxWidth || 70,
        growthHabit: d.growthHabit || 'Custom botanical',
        indoorSuitability: d.indoorSuitability || 'Indoor acclimated',
        lightRequirements: d.lightRequirements || 'Bright Indirect',
        wateringNeeds: 'Standard interior watering',
        suggestedPlacement: ['Custom placement zone'],
        isCustom: true,
      });
    });
    return plants;
  } catch (error) {
    console.warn('Note on fetching custom plants from cloud:', error);
    return [];
  }
}

// 3. Custom Pots
export async function saveCustomPotToCloud(pot: Pot): Promise<void> {
  const path = `customPots/${pot.id}`;
  try {
    const potRef = doc(db, 'customPots', pot.id);
    await setDoc(potRef, {
      name: pot.name,
      shape: pot.shape,
      material: pot.material,
      color: pot.color,
      colorHex: pot.colorHex,
      defaultDimensions: pot.defaultDimensions,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchCustomPotsFromCloud(): Promise<Pot[]> {
  const path = 'customPots';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const pots: Pot[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      pots.push({
        id: docSnap.id,
        name: d.name,
        shape: d.shape,
        material: d.material,
        color: d.color,
        colorHex: d.colorHex,
        defaultDimensions:
          d.defaultDimensions || { height: 45, width: 30, unit: 'cm' },
        isCustom: true,
      });
    });
    return pots;
  } catch (error) {
    console.warn('Note on fetching custom pots from cloud:', error);
    return [];
  }
}

// 4. Commercial Enquiries
export async function submitEnquiryToCloud(enquiry: EnquiryData): Promise<string> {
  const path = 'enquiries';
  try {
    const enquiryRef = await addDoc(collection(db, path), {
      customerName: enquiry.customerName,
      contactNumber: enquiry.contactNumber,
      email: enquiry.email || null,
      projectLocation: enquiry.projectLocation,
      projectType: enquiry.projectType,
      plantRequirements: enquiry.plantRequirements || null,
      additionalNotes: enquiry.additionalNotes || null,
      plantSchedule: JSON.stringify(enquiry.plantSchedule),
      createdAt: new Date().toISOString(),
    });
    return enquiryRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
