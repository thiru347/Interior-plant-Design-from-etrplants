import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { DesignStudio } from './components/DesignStudio';
import { PlantCatalogueView } from './components/PlantCatalogueView';
import { PotCatalogueView } from './components/PotCatalogueView';
import { MyDesignsView } from './components/MyDesignsView';
import { DashboardView } from './components/DashboardView';
import { ContactView } from './components/ContactView';
import { AiSettingsModal } from './components/modals/AiSettingsModal';
import { CustomPlantModal } from './components/modals/CustomPlantModal';
import { CustomPotModal } from './components/modals/CustomPotModal';
import { HouseOverviewTourView } from './components/HouseOverviewTourView';

import { INITIAL_PLANTS } from './data/plantsData';
import { INITIAL_POTS } from './data/potsData';
import { Plant, Pot, SavedDesign, SampleRoom, PlantScheduleItem, PlacedPlant } from './types';
import {
  saveDesignToCloud,
  fetchDesignsFromCloud,
  deleteDesignFromCloud,
  saveCustomPlantToCloud,
  fetchCustomPlantsFromCloud,
  deleteCustomPlantFromCloud,
  saveCustomPotToCloud,
  fetchCustomPotsFromCloud,
} from './lib/firestoreService';
import { BOTANICAL_PLACEHOLDER_URL } from './utils/imageUtils';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'studio' | 'house-tour' | 'plants' | 'pots' | 'my-designs' | 'dashboard' | 'contact'
  >('home');

  // Initial placed plants for studio when launched from House Tour
  const [initialPlantsForStudio, setInitialPlantsForStudio] = useState<PlacedPlant[]>([]);


  // Plant Catalogue state with localStorage persistence
  const [plants, setPlants] = useState<Plant[]>(() => {
    try {
      const stored = localStorage.getItem('etr_plants_catalog');
      if (stored) {
        const parsed: Plant[] = JSON.parse(stored);
        const merged = [...parsed];
        INITIAL_PLANTS.forEach((ip) => {
          if (!merged.some((m) => m.id === ip.id)) {
            merged.push(ip);
          }
        });
        return merged;
      }
      const customStored = localStorage.getItem('etr_custom_plants');
      if (customStored) {
        const parsed = JSON.parse(customStored);
        const merged = [...INITIAL_PLANTS];
        parsed.forEach((cp: Plant) => {
          if (!merged.some((m) => m.id === cp.id)) {
            merged.push(cp);
          }
        });
        return merged;
      }
    } catch (e) {
      console.warn('Failed to load plants from storage:', e);
    }
    return INITIAL_PLANTS;
  });

  // Pot Catalogue state with localStorage persistence
  const [pots, setPots] = useState<Pot[]>(() => {
    try {
      const stored = localStorage.getItem('etr_custom_pots');
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...INITIAL_POTS, ...parsed];
      }
    } catch (e) {
      console.warn('Failed to load custom pots from storage:', e);
    }
    return INITIAL_POTS;
  });

  // Saved Designs library with localStorage persistence
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(() => {
    try {
      const stored = localStorage.getItem('etr_saved_designs');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load saved designs from storage:', e);
    }
    return [];
  });

  // Studio launch props
  const [selectedRoomForStudio, setSelectedRoomForStudio] = useState<SampleRoom | null>(null);
  const [customPhotoForStudio, setCustomPhotoForStudio] = useState<File | null>(null);

  // Active schedule forwarded to Contact quotation form
  const [activeScheduleForContact, setActiveScheduleForContact] = useState<
    PlantScheduleItem[]
  >([]);

  // AI Configuration status
  const [aiConfigured, setAiConfigured] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isCustomPlantOpen, setIsCustomPlantOpen] = useState(false);
  const [isCustomPotOpen, setIsCustomPotOpen] = useState(false);

  // Check AI API status on mount & Fetch Cloud Firestore data
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.configured === 'boolean') {
          setAiConfigured(data.configured);
        }
      })
      .catch((err) => {
        console.warn('AI status check:', err);
      });

    // Cloud Database: load saved designs
    fetchDesignsFromCloud()
      .then((cloudDesigns) => {
        if (cloudDesigns.length > 0) {
          setSavedDesigns((prev) => {
            const merged = [...cloudDesigns];
            prev.forEach((localD) => {
              if (!merged.some((m) => m.id === localD.id)) {
                merged.push(localD);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Cloud designs sync note:', err));

    // Cloud Database: load custom plants
    fetchCustomPlantsFromCloud()
      .then((cloudPlants) => {
        if (cloudPlants.length > 0) {
          setPlants((prev) => {
            const merged = [...prev];
            cloudPlants.forEach((cp) => {
              if (!merged.some((p) => p.id === cp.id)) {
                merged.unshift(cp);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Cloud plants sync note:', err));

    // Cloud Database: load custom pots
    fetchCustomPotsFromCloud()
      .then((cloudPots) => {
        if (cloudPots.length > 0) {
          setPots((prev) => {
            const merged = [...prev];
            cloudPots.forEach((cp) => {
              if (!merged.some((p) => p.id === cp.id)) {
                merged.unshift(cp);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Cloud pots sync note:', err));
  }, []);

  // Save custom plants handler (local + cloud)
  const handleSaveCustomPlant = (newPlant: Plant, addToDesignImmediately: boolean) => {
    setPlants((prev) => {
      const updated = [newPlant, ...prev];
      const customOnly = updated.filter((p) => p.isCustom);
      try {
        localStorage.setItem('etr_custom_plants', JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to persist custom plant:', e);
      }
      return updated;
    });

    saveCustomPlantToCloud(newPlant).catch((e) =>
      console.warn('Cloud plant save note:', e)
    );

    if (addToDesignImmediately) {
      setCurrentTab('studio');
    }
  };

  // Update plant details (rename name, botanical name, replace photo, category)
  const handleUpdatePlant = (updatedPlant: Plant) => {
    setPlants((prev) => {
      const updated = prev.map((p) => (p.id === updatedPlant.id ? updatedPlant : p));
      try {
        localStorage.setItem('etr_plants_catalog', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save updated plant catalog:', e);
      }
      return updated;
    });

    if (updatedPlant.isCustom) {
      saveCustomPlantToCloud(updatedPlant).catch((e) =>
        console.warn('Cloud custom plant update note:', e)
      );
    }
  };

  // Delete plant photo (sets to botanical placeholder)
  const handleDeletePlantPhoto = (plantId: string) => {
    setPlants((prev) => {
      const updated = prev.map((p) => {
        if (p.id === plantId) {
          return {
            ...p,
            imageUrl: BOTANICAL_PLACEHOLDER_URL,
            isPlaceholderImage: true,
            originalImageUrl: p.originalImageUrl || p.imageUrl,
          };
        }
        return p;
      });
      try {
        localStorage.setItem('etr_plants_catalog', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist photo deletion:', e);
      }
      return updated;
    });
  };

  // Delete plant from catalogue
  const handleDeletePlant = (plantId: string) => {
    setPlants((prev) => {
      const updated = prev.filter((p) => p.id !== plantId);
      try {
        localStorage.setItem('etr_plants_catalog', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist plant deletion:', e);
      }
      return updated;
    });

    deleteCustomPlantFromCloud(plantId).catch((e) =>
      console.warn('Cloud plant delete note:', e)
    );
  };

  // Save custom pot handler (local + cloud)
  const handleSaveCustomPot = (newPot: Pot) => {
    setPots((prev) => {
      const updated = [newPot, ...prev];
      const customOnly = updated.filter((p) => p.isCustom);
      try {
        localStorage.setItem('etr_custom_pots', JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to persist custom pot:', e);
      }
      return updated;
    });

    saveCustomPotToCloud(newPot).catch((e) =>
      console.warn('Cloud pot save note:', e)
    );
  };

  // Save design to library (local + cloud)
  const handleSaveDesignToLibrary = (design: SavedDesign) => {
    setSavedDesigns((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === design.id);
      let updated: SavedDesign[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = design;
      } else {
        updated = [design, ...prev];
      }

      try {
        localStorage.setItem('etr_saved_designs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist saved designs:', e);
      }
      return updated;
    });

    saveDesignToCloud(design).catch((e) =>
      console.warn('Cloud design save note:', e)
    );
  };

  // Delete saved design (local + cloud)
  const handleDeleteDesign = (id: string) => {
    setSavedDesigns((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem('etr_saved_designs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update saved designs:', e);
      }
      return updated;
    });

    deleteDesignFromCloud(id).catch((e) =>
      console.warn('Cloud design delete note:', e)
    );
  };

  // Duplicate saved design
  const handleDuplicateDesign = (design: SavedDesign) => {
    const duplicated: SavedDesign = {
      ...design,
      id: `design-${Date.now()}`,
      title: `${design.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    handleSaveDesignToLibrary(duplicated);
  };

  // Import benchmark showcase designs into saved library
  const handleImportBenchmarkDesigns = (designs: SavedDesign[]) => {
    setSavedDesigns((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      const newItems = designs.filter((d) => !existingIds.has(d.id));
      const updated = [...prev, ...newItems];
      try {
        localStorage.setItem('etr_saved_designs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to store imported benchmark designs:', e);
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        aiConfigured={aiConfigured}
        placedPlantsCount={0}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'home' && (
          <HomeView
            onStartDesigning={() => setCurrentTab('studio')}
            onSelectSampleRoom={(room) => {
              setSelectedRoomForStudio(room);
              setCustomPhotoForStudio(null);
              setInitialPlantsForStudio([]);
              setCurrentTab('studio');
            }}
            onCustomPhotoUpload={(file) => {
              setCustomPhotoForStudio(file);
              setSelectedRoomForStudio(null);
              setInitialPlantsForStudio([]);
              setCurrentTab('studio');
            }}
            onOpenHouseTour={() => setCurrentTab('house-tour')}
          />
        )}

        {currentTab === 'house-tour' && (
          <HouseOverviewTourView
            plants={plants}
            pots={pots}
            aiConfigured={aiConfigured}
            onOpenAiSettings={() => setIsAiSettingsOpen(true)}
            onOpenInStudio={(roomImageUrl, roomTitle, initialPlants) => {
              setSelectedRoomForStudio({
                id: `house-room-${Date.now()}`,
                title: roomTitle,
                category: 'House Room',
                imageUrl: roomImageUrl,
                description: `${roomTitle} plant design arrangement`,
              });
              setCustomPhotoForStudio(null);
              setInitialPlantsForStudio(initialPlants);
              setCurrentTab('studio');
            }}
          />
        )}

        {currentTab === 'studio' && (
          <DesignStudio
            initialRoom={selectedRoomForStudio}
            initialCustomPhoto={customPhotoForStudio}
            initialPlacedPlants={initialPlantsForStudio}
            plants={plants}
            pots={pots}
            onSaveCustomPlant={handleSaveCustomPlant}
            onSaveCustomPot={handleSaveCustomPot}
            onSaveDesignToLibrary={handleSaveDesignToLibrary}
            aiConfigured={aiConfigured}
            onOpenAiSettings={() => setIsAiSettingsOpen(true)}
            onNavigateToContact={(schedule) => {
              setActiveScheduleForContact(schedule);
              setCurrentTab('contact');
            }}
            onUpdatePlantCatalogue={handleUpdatePlant}
            onDeletePlantFromCatalogue={handleDeletePlant}
            onDeletePlantPhoto={handleDeletePlantPhoto}
            onOpenHouseTour={() => setCurrentTab('house-tour')}
          />
        )}


        {currentTab === 'plants' && (
          <PlantCatalogueView
            plants={plants}
            onSelectPlantForStudio={(plant) => {
              setCurrentTab('studio');
            }}
            onOpenCustomPlantModal={() => setIsCustomPlantOpen(true)}
            onUpdatePlant={handleUpdatePlant}
            onDeletePlant={handleDeletePlant}
            onDeletePlantPhoto={handleDeletePlantPhoto}
          />
        )}

        {currentTab === 'pots' && (
          <PotCatalogueView
            pots={pots}
            onOpenCustomPotModal={() => setIsCustomPotOpen(true)}
          />
        )}

        {currentTab === 'my-designs' && (
          <MyDesignsView
            savedDesigns={savedDesigns}
            onLoadDesign={(design) => {
              setSelectedRoomForStudio({
                id: design.id,
                title: design.roomName || design.title,
                category: 'Saved Project',
                imageUrl: design.roomImage,
                description: 'Saved interior layout',
              });
              setCustomPhotoForStudio(null);
              setCurrentTab('studio');
            }}
            onDuplicateDesign={handleDuplicateDesign}
            onDeleteDesign={handleDeleteDesign}
            onCreateNewDesign={() => {
              setSelectedRoomForStudio(null);
              setCustomPhotoForStudio(null);
              setCurrentTab('studio');
            }}
            onOpenDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            savedDesigns={savedDesigns}
            onLoadDesign={(design) => {
              setSelectedRoomForStudio({
                id: design.id,
                title: design.roomName || design.title,
                category: 'Saved Project',
                imageUrl: design.roomImage,
                description: 'Saved interior layout',
              });
              setCustomPhotoForStudio(null);
              setCurrentTab('studio');
            }}
            onCreateNewDesign={() => {
              setSelectedRoomForStudio(null);
              setCustomPhotoForStudio(null);
              setCurrentTab('studio');
            }}
            onImportBenchmarkDesigns={handleImportBenchmarkDesigns}
          />
        )}

        {currentTab === 'contact' && (
          <ContactView
            currentPlantSchedule={activeScheduleForContact}
            onStartDesigning={() => setCurrentTab('studio')}
          />
        )}
      </main>

      {/* Global Modals */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        aiConfigured={aiConfigured}
      />

      <CustomPlantModal
        isOpen={isCustomPlantOpen}
        onClose={() => setIsCustomPlantOpen(false)}
        onSaveCustomPlant={handleSaveCustomPlant}
      />

      <CustomPotModal
        isOpen={isCustomPotOpen}
        onClose={() => setIsCustomPotOpen(false)}
        onSaveCustomPot={handleSaveCustomPot}
      />
    </div>
  );
}
