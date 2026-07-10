import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Navigation, { Page } from './components/Navigation';
import PowerPlant from './pages/PowerPlant';
import Utilities from './pages/Utilities';
import DataCenter from './pages/DataCenter';
import Infrastructure from './pages/Infrastructure';
import SolarInfrastructure from './pages/SolarInfrastructure';
import Financials from './pages/Financials';
import Configuration from './pages/Configuration';
import MexEcoBr from './pages/MexEcoBr';
import ChillerDashboard from './pages/chiller';
import PowerPlantSystem from './pages/PowerPlantSystem';
import GasTurbineDiagram from './components/GasTurbineDiagram';
import PowerPlantSankey from './components/PowerPlantSankey';
import ExternalPageViewer from './pages/ExternalPageViewer';
import HelpModal from './components/HelpModal'; // Import the new HelpModal component
import MexInteligencia from './pages/MexInteligencia';
import ApiDocumentation from './pages/ApiDocumentation';
import InvestorRelations from './pages/InvestorRelations';
import OnsAneelGrid from './pages/OnsAneelGrid';
import { PlantStatus, FuelMode, TurbineStatus, Plant } from './types';
import { calculateEfficiencyGain } from './lib/simulation';
import { POWER_PLANTS as initialPowerPlants } from './data/plants';
import { useTranslations } from './hooks/useTranslations';
import { useSettings } from './hooks/useSettings';

export type TurbineStatusConfig = { [key: number]: TurbineStatus };

// --- Configuration Persistence with localStorage ---
// This section handles saving and loading user preferences to ensure they persist across browser sessions.

// Interface for a single plant's config
export interface PlantConfig {
  fuelMode: FuelMode;
  flexMix: { h2: number; biodiesel: number };
  turbineStatusConfig: TurbineStatusConfig;
  turbineMaintenanceScores: { [key: number]: number };
}

// Interface for resource visibility config
export interface ResourceConfig {
    water: boolean;
    gas: boolean;
    ethanol: boolean;
    biodiesel: boolean;
    h2: boolean;
}

// Interface for all stored configs
interface AllConfigs {
    [plantName: string]: PlantConfig;
}

// Storage Keys
const CONFIG_STORAGE_KEY = 'app-all-configs'; // Stores all plant-specific settings
const RESOURCE_CONFIG_KEY = 'app-resource-config'; // Stores resource visibility
const SELECTED_PLANT_STORAGE_KEY = 'app-selected-plant'; // Stores the last selected plant
const PLANTS_STORAGE_KEY = 'app-available-plants'; // Stores the list of plants, including user-added ones

// Default configuration for a new or unconfigured plant
const defaultConfig: PlantConfig = {
  fuelMode: FuelMode.NaturalGas,
  flexMix: { h2: 20, biodiesel: 30 },
  turbineStatusConfig: {
    1: 'active', 2: 'active', 3: 'active', 4: 'active', 5: 'inactive',
  },
  turbineMaintenanceScores: { 1: 10, 2: 15, 3: 85, 4: 20, 5: 5 },
};

// Default resource visibility settings
const defaultResourceConfig: ResourceConfig = {
    water: true,
    gas: true,
    ethanol: true,
    biodiesel: true,
    h2: true,
};

// Loader function for all plant configurations
const loadAllConfigs = (): AllConfigs => {
  try {
    // Attempt to retrieve saved configurations from localStorage.
    const savedConfigString = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfigString) {
      // If data exists, parse it from JSON and return.
      return JSON.parse(savedConfigString);
    }
  } catch (error) {
    // Log any errors during loading/parsing and fall back to a default state.
    console.error("Failed to load or parse configs from localStorage", error);
  }
  // Return an empty object if no saved data is found or an error occurs.
  return {};
};

// Loader function for resource visibility
const loadResourceConfig = (): ResourceConfig => {
    try {
        const savedConfigString = localStorage.getItem(RESOURCE_CONFIG_KEY);
        if (savedConfigString) {
            return JSON.parse(savedConfigString);
        }
    } catch (error) {
        console.error("Failed to load resource config from localStorage", error);
    }
    return defaultResourceConfig;
};

// Loader function for the list of available plants
const loadAvailablePlants = (): Plant[] => {
    try {
        const savedPlantsString = localStorage.getItem(PLANTS_STORAGE_KEY);
        if (savedPlantsString) {
            return JSON.parse(savedPlantsString);
        }
    } catch (error) {
        console.error("Failed to load plants from localStorage", error);
    }
    return initialPowerPlants;
};

const App: React.FC = () => {
  const [currentPage, _setCurrentPage] = useState<Page>('Power Plant');
  const [previousPage, setPreviousPage] = useState<Page>('Power Plant');
  const [externalPageUrl, setExternalPageUrl] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // State for help modal
  const { language, setLanguage } = useSettings();
  const { t } = useTranslations(language);

  const setCurrentPage = (page: Page) => {
    if (currentPage !== 'External Page') {
      setPreviousPage(currentPage);
    }
    _setCurrentPage(page);
  };
  
  // Shared state
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250.0);
  const [efficiency, setEfficiency] = useState(58.5);
  const [maxCapacity, setMaxCapacity] = useState(2500);
  const [efficiencyGain, setEfficiencyGain] = useState(0);
  const [activeRackCount, setActiveRackCount] = useState(0); // State for active racks

  // --- Configuration State (Initialized from localStorage) ---
  const [allConfigs, setAllConfigs] = useState<AllConfigs>(loadAllConfigs);
  const [resourceConfig, setResourceConfigState] = useState<ResourceConfig>(loadResourceConfig);
  const [availablePlants, setAvailablePlants] = useState<Plant[]>(loadAvailablePlants);
  const [selectedPlantName, setSelectedPlantNameState] = useState<string>(() => {
    const savedPlant = localStorage.getItem(SELECTED_PLANT_STORAGE_KEY);
    // Ensure the saved plant still exists in the list before selecting it.
    if (savedPlant && loadAvailablePlants().find(p => p.name === savedPlant)) {
        return savedPlant;
    }
    return loadAvailablePlants()[0]?.name || 'MAUAX Bio PowerPlant (standard)';
  });

  // Derived state for the currently selected plant's configuration
  const currentConfig = useMemo(() => {
    return allConfigs[selectedPlantName] || defaultConfig;
  }, [allConfigs, selectedPlantName]);
  
  const selectedPlant = useMemo(() => {
    return availablePlants.find(p => p.name === selectedPlantName) || availablePlants[0];
  }, [availablePlants, selectedPlantName]);

  // --- Automatic Persistence Effects ---
  // These effects automatically save the relevant state to localStorage whenever it changes.
  
  // Persist all plant configurations (fuel mode, flex mix, turbine status, etc.)
  useEffect(() => {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(allConfigs));
    } catch(error) {
        console.error("Failed to save all plant configs to localStorage", error);
    }
  }, [allConfigs]);

  // Persist the list of available plants (including user-added ones)
  useEffect(() => {
    try {
        localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(availablePlants));
    } catch(error) {
        console.error("Failed to save available plants to localStorage", error);
    }
  }, [availablePlants]);
  
  // --- State Setters with Persistence ---
  // These functions update state and explicitly save to localStorage.
  
  const setSelectedPlantName = (name: string) => {
    try {
        // Save the newly selected plant name to localStorage immediately.
        localStorage.setItem(SELECTED_PLANT_STORAGE_KEY, name);
    } catch (error) {
        console.error("Failed to save selected plant to localStorage", error);
    }
    setSelectedPlantNameState(name);
  };

  // Generic updater for the current plant's configuration, which triggers the persistence effect.
  const updateCurrentConfig = (newConfig: Partial<PlantConfig>) => {
      setAllConfigs(prev => ({
          ...prev,
          [selectedPlantName]: {
              ...(prev[selectedPlantName] || defaultConfig),
              ...newConfig,
          }
      }));
  };

  const setResourceConfig = (newConfig: ResourceConfig) => {
    try {
        localStorage.setItem(RESOURCE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
        console.error("Failed to save resource config to localStorage", error);
    }
    setResourceConfigState(newConfig);
  };
  
  // Effect to handle messages from the iframe in MexEcoBr
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'object' && event.data !== null && 'type' in event.data) {
        const { type, page, url } = event.data;

        if (type === 'navigate' && typeof page === 'string') {
          setCurrentPage(page as Page);
        } else if (type === 'viewExternal' && typeof url === 'string') {
          setExternalPageUrl(url);
          setCurrentPage('External Page');
        } else if (type === 'openExternal' && typeof url === 'string') {
          // Fallback to opening in a new tab for non-embeddable sites.
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentPage]); // Re-add listener to capture `currentPage` correctly for `setPreviousPage`

  // --- Configuration Setter Functions ---
  const setFuelMode = (fuelMode: FuelMode) => updateCurrentConfig({ fuelMode });
  
  const setFlexMix = (updater: React.SetStateAction<{ h2: number; biodiesel: number }>) => {
      const newFlexMix = typeof updater === 'function' 
          ? updater(currentConfig.flexMix) 
          : updater;
      updateCurrentConfig({ flexMix: newFlexMix });
  };
  
  const setTurbineStatusConfig = (updater: React.SetStateAction<TurbineStatusConfig>) => {
      const newStatus = typeof updater === 'function'
          ? updater(currentConfig.turbineStatusConfig)
          : updater;
      updateCurrentConfig({ turbineStatusConfig: newStatus });
  };
  
  const setTurbineMaintenanceScores = (updater: React.SetStateAction<{ [key: number]: number }>) => {
      const newScores = typeof updater === 'function' 
          ? updater(currentConfig.turbineMaintenanceScores || {}) 
          : updater;
      updateCurrentConfig({ turbineMaintenanceScores: newScores });
  };

  const addPlant = () => {
    setAvailablePlants(prev => {
      const newProjectName = `${t('config.newProjectName')} ${prev.filter(p => p.name.startsWith(t('config.newProjectName'))).length + 1}`;
      const newPlant: Plant = {
        name: newProjectName,
        nameKey: '', // User-created plants don't have a translation key
        power: 100,
        fuelKey: 'fuel.NATURAL_GAS',
        identifier: { type: 'location', valueKey: 'plants.identifier.notDefined' },
        descriptionKey: 'plants.mauaxBioPowerPlant.description', // Placeholder
        statusKey: 'plant.status.proposal',
        type: 'new',
        coordinates: { lat: 0, lng: 0 },
      };
      // Automatically select the new plant
      setSelectedPlantName(newPlant.name);
      return [...prev, newPlant];
    });
  };

  const updatePlant = (plantNameToUpdate: string, updatedPlant: Plant) => {
    setAvailablePlants(prev => prev.map(p => p.name === plantNameToUpdate ? updatedPlant : p));
  };


  useEffect(() => {
    const plant = availablePlants.find(p => p.name === selectedPlantName);
    if (plant) {
      setMaxCapacity(plant.power);
      setEfficiency(plant.efficiency ?? 58.5);
      
      if (plantStatus === PlantStatus.Online) {
        setPowerOutput(plant.power * (0.85 + Math.random() * 0.1));
      } else {
        setPowerOutput(0);
      }

      // If no configuration exists for the selected plant, create a default one.
      if (!allConfigs[selectedPlantName]) {
        let newFuelMode = FuelMode.NaturalGas;
        if (plant.name === 'MAUAX Bio PowerPlant (standard)') {
          newFuelMode = FuelMode.FlexNGH2;
        } else if (plant.fuelKey.includes('ETHANOL')) {
          newFuelMode = FuelMode.Ethanol;
        } else if (plant.fuelKey.includes('BIODIESEL')) {
          newFuelMode = FuelMode.Biodiesel;
        } else if (plant.fuelKey.includes('NUCLEAR')) {
          newFuelMode = FuelMode.Nuclear;
        }
        updateCurrentConfig({ fuelMode: newFuelMode });
      }
    } else if (availablePlants.length > 0) {
        // If selected plant doesn't exist (e.g., deleted), select the first one
        setSelectedPlantName(availablePlants[0].name);
    }
  }, [selectedPlantName, plantStatus, availablePlants]);

  useEffect(() => {
    const gain = calculateEfficiencyGain({
      plantStatus,
      powerOutput,
      selectedPlant: {
        type: selectedPlant?.type,
        name: selectedPlant?.name,
        efficiency: selectedPlant?.efficiency,
        fuelKey: selectedPlant?.fuelKey
      },
      efficiency,
    });
    setEfficiencyGain(gain);
  }, [plantStatus, powerOutput, selectedPlant, efficiency]);

  const renderPage = () => {
    switch (currentPage) {
      case 'Power Plant':
        return <PowerPlant 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          efficiencyGain={efficiencyGain}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          turbineMaintenanceScores={currentConfig.turbineMaintenanceScores || {}}
          setTurbineMaintenanceScores={setTurbineMaintenanceScores}
          resourceConfig={resourceConfig}
          maxCapacity={maxCapacity}
          t={t}
        />;
      case 'Utilities':
      case 'Fluxo de Energia da Usina':
      case 'Chiller Absorção -> Tiac':
      case 'Chiller Absorção -> Fog':
      case 'Chiller Absorção -> Data Cloud':
        return <Utilities 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          setCurrentPage={setCurrentPage}
          activeRackCount={activeRackCount}
          selectedPlant={selectedPlant}
          t={t}
        />;
      case 'Data Center':
        return <DataCenter onActiveRackUpdate={setActiveRackCount} t={t} />;
      case 'Infrastructure':
        return <Infrastructure />;
      case 'Solar Infrastructure':
        return <SolarInfrastructure />;
      case 'MAUAX consortium':
        return <MexEcoBr />;
      case 'Pitch MEX':
        return <MexInteligencia t={t} />;
      case 'Financials':
        return <Financials 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          activeRackCount={activeRackCount}
          t={t}
        />;
      case 'Configuration':
        return <Configuration
          selectedPlantName={selectedPlantName}
          setSelectedPlantName={setSelectedPlantName}
          fuelMode={currentConfig.fuelMode}
          setFuelMode={setFuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          plantStatus={plantStatus}
          setPlantStatus={setPlantStatus}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          setTurbineStatusConfig={setTurbineStatusConfig}
          turbineMaintenanceScores={currentConfig.turbineMaintenanceScores || {}}
          setTurbineMaintenanceScores={setTurbineMaintenanceScores}
          availablePlants={availablePlants}
          addPlant={addPlant}
          updatePlant={updatePlant}
          resourceConfig={resourceConfig}
          setResourceConfig={setResourceConfig}
          t={t}
        />;
      case 'Chiller':
      case 'Chiller Absorção':
        return <ChillerDashboard t={t} />;
      case 'inventario UTE':
      case 'PowerPlantSystem':
        return <PowerPlantSystem t={t} />;
      case 'Fog System Details':
        return <GasTurbineDiagram t={t} />;
      case 'Power Plant Sankey':
        return <PowerPlantSankey 
            powerOutput={powerOutput}
            efficiency={efficiency}
            setCurrentPage={setCurrentPage}
            t={t}
        />;
      case 'API Documentation':
        return <ApiDocumentation />;
      case 'Investor Relations (RI)':
        return <InvestorRelations />;
      case 'ONS & ANEEL Grid':
        return <OnsAneelGrid t={t} />;
      case 'External Page':
        return externalPageUrl ? (
          <ExternalPageViewer url={externalPageUrl} onClose={() => setCurrentPage(previousPage)} t={t} />
        ) : (
          <div className="text-center mt-8">
            <p>{t('external.noUrl')}</p>
            <button onClick={() => setCurrentPage(previousPage)} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg">{t('external.back')}</button>
          </div>
        );
      default:
        return <PowerPlant 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          efficiencyGain={efficiencyGain}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          turbineMaintenanceScores={currentConfig.turbineMaintenanceScores || {}}
          setTurbineMaintenanceScores={setTurbineMaintenanceScores}
          resourceConfig={resourceConfig}
          maxCapacity={maxCapacity}
          t={t}
        />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} t={t} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
        <Header 
          plantStatus={plantStatus} 
          powerOutput={powerOutput} 
          selectedPlantName={t(selectedPlant.nameKey) || selectedPlant.name}
          maxCapacity={maxCapacity}
          language={language}
          setLanguage={setLanguage}
          onHelpClick={() => setIsHelpModalOpen(true)} // Pass handler to open modal
          t={t}
        />
        {renderPage()}
      </div>
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
        t={t} 
      />
    </div>
  );
};

export default App;