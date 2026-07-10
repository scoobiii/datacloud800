import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Sun, 
  Maximize2, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Zap, 
  Sparkles, 
  DollarSign, 
  Leaf, 
  Eye, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  Compass, 
  Grid
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

// ----------------------------------------------------
// TYPES & INTERFACES
// ----------------------------------------------------
interface Building {
  id: string;
  name: string;
  totalRoofArea: number; // m²
  material: 'Concreto' | 'Metálico' | 'Cerâmico' | 'Asfalto';
  tilt: number; // degrees
  orientation: 'Norte' | 'Sul' | 'Leste' | 'Oeste' | 'Nordeste' | 'Noroeste';
  integrity: 'Excelente' | 'Boa' | 'Regular';
  hasSolarInit: boolean; // initial state
  x: number; // custom SVG relative coordinate (0-100)
  y: number; // custom SVG relative coordinate (0-100)
  points: string; // SVG polygon points
}

interface RegionConfig {
  id: string;
  name: string;
  state: string;
  neighborhood: string;
  baseIrradiance: number; // kWh/m²/day
  baseTariff: number; // R$/kWh
  co2Factor: number; // kg CO2/kWh
  buildings: Building[];
}

// ----------------------------------------------------
// RAW SATELLITE SIMULATION DATA
// ----------------------------------------------------
const SOLAR_REGIONS: RegionConfig[] = [
  {
    id: 'reg-campinas',
    name: 'Campinas',
    state: 'SP',
    neighborhood: 'Jardins',
    baseIrradiance: 5.2,
    baseTariff: 0.85,
    co2Factor: 0.096,
    buildings: [
      { id: 'cam-b1', name: 'Supermercado CompreBem', totalRoofArea: 1400, material: 'Metálico', tilt: 15, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 10, y: 15, points: '10,15 35,15 30,35 5,35' },
      { id: 'cam-b2', name: 'Edifício Silva Telles', totalRoofArea: 450, material: 'Concreto', tilt: 0, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: true, x: 45, y: 10, points: '45,10 65,10 65,25 45,25' },
      { id: 'cam-b3', name: 'Centro de Convenções', totalRoofArea: 1800, material: 'Metálico', tilt: 10, orientation: 'Norte', integrity: 'Boa', hasSolarInit: false, x: 75, y: 15, points: '75,15 95,20 90,45 70,40' },
      { id: 'cam-b4', name: 'Residencial Jardins A', totalRoofArea: 380, material: 'Cerâmico', tilt: 22, orientation: 'Noroeste', integrity: 'Boa', hasSolarInit: true, x: 15, y: 45, points: '15,45 35,40 40,55 20,60' },
      { id: 'cam-b5', name: 'Escola Estadual', totalRoofArea: 950, material: 'Concreto', tilt: 5, orientation: 'Leste', integrity: 'Regular', hasSolarInit: false, x: 45, y: 35, points: '45,35 60,32 65,55 50,58' },
      { id: 'cam-b6', name: 'Clube Campineiro', totalRoofArea: 1100, material: 'Asfalto', tilt: 8, orientation: 'Nordeste', integrity: 'Boa', hasSolarInit: true, x: 10, y: 70, points: '10,70 30,68 35,90 15,92' },
      { id: 'cam-b7', name: 'Hospital do Coração', totalRoofArea: 1250, material: 'Concreto', tilt: 0, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 45, y: 68, points: '45,68 65,65 70,88 50,91' },
      { id: 'cam-b8', name: 'Shopping Galleria', totalRoofArea: 2500, material: 'Metálico', tilt: 12, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 72, y: 55, points: '72,55 95,50 98,85 75,90' }
    ]
  },
  {
    id: 'reg-petrolina',
    name: 'Petrolina',
    state: 'PE',
    neighborhood: 'Bela Vista',
    baseIrradiance: 6.2,
    baseTariff: 0.90,
    co2Factor: 0.096,
    buildings: [
      { id: 'pet-b1', name: 'Cooperativa Agrícola', totalRoofArea: 2200, material: 'Metálico', tilt: 10, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 10, y: 10, points: '10,10 40,10 35,35 5,35' },
      { id: 'pet-b2', name: 'Terminal Frutícola', totalRoofArea: 1600, material: 'Metálico', tilt: 15, orientation: 'Norte', integrity: 'Boa', hasSolarInit: true, x: 50, y: 15, points: '50,15 75,15 75,35 50,35' },
      { id: 'pet-b3', name: 'Packing House Sol', totalRoofArea: 2800, material: 'Metálico', tilt: 12, orientation: 'Nordeste', integrity: 'Excelente', hasSolarInit: false, x: 15, y: 45, points: '15,45 45,45 40,70 10,70' },
      { id: 'pet-b4', name: 'Shopping Petrolina', totalRoofArea: 3200, material: 'Concreto', tilt: 5, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: true, x: 55, y: 45, points: '55,45 90,45 90,70 55,70' },
      { id: 'pet-b5', name: 'Centro Educacional', totalRoofArea: 900, material: 'Concreto', tilt: 0, orientation: 'Sul', integrity: 'Boa', hasSolarInit: false, x: 20, y: 78, points: '20,78 45,78 45,95 20,95' },
      { id: 'pet-b6', name: 'Indústria de Sucos', totalRoofArea: 3500, material: 'Metálico', tilt: 10, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 55, y: 78, points: '55,78 95,78 95,95 55,95' }
    ]
  },
  {
    id: 'reg-uberlandia',
    name: 'Uberlândia',
    state: 'MG',
    neighborhood: 'Savassi',
    baseIrradiance: 5.6,
    baseTariff: 0.82,
    co2Factor: 0.096,
    buildings: [
      { id: 'ube-b1', name: 'Centro de Distribuição Aliança', totalRoofArea: 3200, material: 'Metálico', tilt: 15, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 10, y: 10, points: '10,10 45,10 40,35 5,35' },
      { id: 'ube-b2', name: 'UFU Campus Savassi', totalRoofArea: 1900, material: 'Concreto', tilt: 5, orientation: 'Nordeste', integrity: 'Excelente', hasSolarInit: true, x: 55, y: 15, points: '55,15 85,15 80,38 50,38' },
      { id: 'ube-b3', name: 'Condomínio Industrial', totalRoofArea: 3000, material: 'Metálico', tilt: 12, orientation: 'Norte', integrity: 'Boa', hasSolarInit: false, x: 10, y: 45, points: '10,45 40,45 35,70 5,70' },
      { id: 'ube-b4', name: 'Hypermercado Savassi', totalRoofArea: 1800, material: 'Asfalto', tilt: 0, orientation: 'Norte', integrity: 'Boa', hasSolarInit: true, x: 50, y: 48, points: '50,48 78,48 75,70 47,70' },
      { id: 'ube-b5', name: 'Sede Comercial MEX', totalRoofArea: 800, material: 'Concreto', tilt: 0, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: true, x: 15, y: 78, points: '15,78 40,78 40,95 15,95' },
      { id: 'ube-b6', name: 'Laboratório Biotec', totalRoofArea: 1200, material: 'Cerâmico', tilt: 20, orientation: 'Leste', integrity: 'Regular', hasSolarInit: false, x: 55, y: 78, points: '55,78 85,78 80,95 50,95' }
    ]
  },
  {
    id: 'reg-teresina',
    name: 'Teresina',
    state: 'PI',
    neighborhood: 'Aldeota',
    baseIrradiance: 6.5,
    baseTariff: 0.88,
    co2Factor: 0.096,
    buildings: [
      { id: 'ter-b1', name: 'Polo Comercial Aldeota', totalRoofArea: 1500, material: 'Concreto', tilt: 5, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: true, x: 10, y: 15, points: '10,15 40,15 35,40 5,40' },
      { id: 'ter-b2', name: 'Centro Logístico Norte', totalRoofArea: 2800, material: 'Metálico', tilt: 10, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 50, y: 10, points: '50,10 85,15 80,40 45,35' },
      { id: 'ter-b3', name: 'Residencial Solarium', totalRoofArea: 600, material: 'Cerâmico', tilt: 25, orientation: 'Noroeste', integrity: 'Boa', hasSolarInit: true, x: 10, y: 50, points: '10,50 35,45 40,65 15,70' },
      { id: 'ter-b4', name: 'Hospital Primavera', totalRoofArea: 1600, material: 'Concreto', tilt: 0, orientation: 'Norte', integrity: 'Boa', hasSolarInit: false, x: 50, y: 48, points: '50,48 80,45 85,70 55,73' },
      { id: 'ter-b5', name: 'Universidade Piauí', totalRoofArea: 2400, material: 'Concreto', tilt: 5, orientation: 'Nordeste', integrity: 'Excelente', hasSolarInit: true, x: 15, y: 78, points: '15,78 45,75 48,95 18,98' },
      { id: 'ter-b6', name: 'Hiper Teresina', totalRoofArea: 2600, material: 'Metálico', tilt: 12, orientation: 'Norte', integrity: 'Excelente', hasSolarInit: false, x: 55, y: 78, points: '55,78 85,75 90,95 60,98' }
    ]
  }
];

export const SolarInfrastructure: React.FC = () => {
  // ----------------------------------------------------
  // LOCAL STATES
  // ----------------------------------------------------
  const [selectedRegionId, setSelectedRegionId] = useState<string>('reg-campinas');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  
  // Custom solar status of each building inside all regions
  // Key format: regionId_buildingId: boolean
  const [solarStatusMap, setSolarStatusMap] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    SOLAR_REGIONS.forEach(region => {
      region.buildings.forEach(building => {
        initialMap[`${region.id}_${building.id}`] = building.hasSolarInit;
      });
    });
    return initialMap;
  });

  // Slider adjustments
  const [panelEfficiency, setPanelEfficiency] = useState<number>(20.0); // %
  const [performanceRatio, setPerformanceRatio] = useState<number>(78.0); // %
  const [usableAreaFactor, setUsableAreaFactor] = useState<number>(60.0); // %
  const [isMapMaximised, setIsMapMaximised] = useState<boolean>(false);
  const [radarIndicator, setRadarIndicator] = useState<boolean>(true);

  // Auto-scanning heartbeat effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarIndicator(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // COMPUTED CALCULATIONS
  // ----------------------------------------------------
  const currentRegion = useMemo(() => {
    return SOLAR_REGIONS.find(r => r.id === selectedRegionId) || SOLAR_REGIONS[0];
  }, [selectedRegionId]);

  // Handle single building click
  const currentBuilding = useMemo(() => {
    if (!selectedBuildingId) return null;
    return currentRegion.buildings.find(b => b.id === selectedBuildingId) || null;
  }, [selectedBuildingId, currentRegion]);

  // Aggregate metrics for selected region
  const regionMetrics = useMemo(() => {
    let totalDetectedRoofs = currentRegion.buildings.length;
    let totalSolarRoofs = 0;
    let totalArea = 0; // m²
    let totalSolarArea = 0; // m²
    let totalPotentialSolarArea = 0; // m²
    
    currentRegion.buildings.forEach(b => {
      totalArea += b.totalRoofArea;
      const key = `${currentRegion.id}_${b.id}`;
      const hasSolar = !!solarStatusMap[key];
      
      const usableArea = b.totalRoofArea * (usableAreaFactor / 100);
      
      if (hasSolar) {
        totalSolarRoofs += 1;
        totalSolarArea += usableArea;
      } else {
        totalPotentialSolarArea += usableArea;
      }
    });

    const unutilizedRoofsCount = totalDetectedRoofs - totalSolarRoofs;

    // Calculation model:
    // Annual Energy (kWh) = Area (m²) * Irradiance (kWh/m²/day) * Efficiency (%) * PR (%) * 365 (days)
    const effDecimal = panelEfficiency / 100;
    const prDecimal = performanceRatio / 100;
    const irr = currentRegion.baseIrradiance;

    const existingYieldMWh = (totalSolarArea * irr * effDecimal * prDecimal * 365) / 1000;
    const potentialYieldMWh = (totalPotentialSolarArea * irr * effDecimal * prDecimal * 365) / 1000;
    const maxTotalYieldMWh = existingYieldMWh + potentialYieldMWh;

    const carbonSavedTons = maxTotalYieldMWh * currentRegion.co2Factor; // tonnes CO2 saved at max transition
    const baselineCarbonSavedTons = existingYieldMWh * currentRegion.co2Factor;
    const incrementalCarbonSavedTons = potentialYieldMWh * currentRegion.co2Factor;

    const savingsBRL = maxTotalYieldMWh * 1000 * currentRegion.baseTariff;
    const incrementalSavingsBRL = potentialYieldMWh * 1000 * currentRegion.baseTariff;
    const baselineSavingsBRL = existingYieldMWh * 1000 * currentRegion.baseTariff;

    // CAPEX Estimate: R$ 4,500.00 per kWp installed
    // 1 kWp of solar requires ~5 m² of high efficiency panels
    // Estimated kWp = Area (m²) * panelEfficiency * 1 (STC 1000W/m²)
    const incrementalCapacitykWp = (totalPotentialSolarArea * effDecimal);
    const estimatedCAPEX = incrementalCapacitykWp * 4500; // R$ Capex required

    // Simple payback in years = Capex / Annual Incremental Savings
    const paybackYears = incrementalSavingsBRL > 0 ? (estimatedCAPEX / incrementalSavingsBRL) : 0;

    return {
      totalDetectedRoofs,
      totalSolarRoofs,
      unutilizedRoofsCount,
      totalArea,
      totalSolarArea,
      totalPotentialSolarArea,
      existingYieldMWh,
      potentialYieldMWh,
      maxTotalYieldMWh,
      carbonSavedTons,
      baselineCarbonSavedTons,
      incrementalCarbonSavedTons,
      savingsBRL,
      baselineSavingsBRL,
      incrementalSavingsBRL,
      estimatedCAPEX,
      paybackYears,
      totalCapacitykWp: (totalSolarArea + totalPotentialSolarArea) * effDecimal
    };
  }, [currentRegion, solarStatusMap, panelEfficiency, performanceRatio, usableAreaFactor]);

  // Compare all regions metrics for comparison bar charts
  const crossRegionComparisonData = useMemo(() => {
    return SOLAR_REGIONS.map(reg => {
      let existingArea = 0;
      let potentialArea = 0;
      
      reg.buildings.forEach(b => {
        const key = `${reg.id}_${b.id}`;
        const hasSolar = !!solarStatusMap[key];
        const usable = b.totalRoofArea * (usableAreaFactor / 100);
        if (hasSolar) {
          existingArea += usable;
        } else {
          potentialArea += usable;
        }
      });

      const effDecimal = panelEfficiency / 100;
      const prDecimal = performanceRatio / 100;
      
      const existingMWh = (existingArea * reg.baseIrradiance * effDecimal * prDecimal * 365) / 1000;
      const potentialMWh = (potentialArea * reg.baseIrradiance * effDecimal * prDecimal * 365) / 1000;

      return {
        name: reg.name,
        'Geração Existente (MWh)': Number(existingMWh.toFixed(1)),
        'Potencial Adicional (MWh)': Number(potentialMWh.toFixed(1)),
        'Total Possível (MWh)': Number((existingMWh + potentialMWh).toFixed(1)),
        irradiance: reg.baseIrradiance
      };
    });
  }, [solarStatusMap, panelEfficiency, performanceRatio, usableAreaFactor]);

  // Monthly yield profile simulation for selected region
  const monthlyProfileData = useMemo(() => {
    // Standard solar profile across months for Brazil (Southern Hemisphere influence)
    // SP has lower yield in winter (June/July), Teresina/Petrolina is hot and high all year with minor wind/cloud variance.
    const monthlyFactors: Record<string, number[]> = {
      'reg-campinas': [1.1, 1.05, 0.95, 0.85, 0.75, 0.7, 0.75, 0.88, 1.0, 1.05, 1.12, 1.15],
      'reg-petrolina': [1.02, 0.98, 0.95, 0.92, 0.88, 0.85, 0.9, 0.98, 1.05, 1.15, 1.18, 1.12],
      'reg-uberlandia': [1.08, 1.02, 0.98, 0.9, 0.8, 0.75, 0.78, 0.9, 1.0, 1.05, 1.1, 1.12],
      'reg-teresina': [0.9, 0.85, 0.88, 0.92, 0.95, 1.0, 1.08, 1.15, 1.2, 1.18, 1.1, 1.0]
    };

    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const factors = monthlyFactors[currentRegion.id] || monthlyFactors['reg-campinas'];
    const avgMonthlyExisting = regionMetrics.existingYieldMWh / 12;
    const avgMonthlyPotential = regionMetrics.potentialYieldMWh / 12;

    return months.map((month, i) => {
      const f = factors[i];
      return {
        month,
        'Geração Atual': Number((avgMonthlyExisting * f).toFixed(2)),
        'Geração Adicional': Number((avgMonthlyPotential * f).toFixed(2)),
        'Total': Number(((avgMonthlyExisting + avgMonthlyPotential) * f).toFixed(2))
      };
    });
  }, [currentRegion, regionMetrics]);

  // ----------------------------------------------------
  // INTERACTIVE ACTIONS
  // ----------------------------------------------------
  const toggleBuildingSolar = (buildingId: string) => {
    const key = `${selectedRegionId}_${buildingId}`;
    setSolarStatusMap(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const equipAllBuildings = () => {
    setSolarStatusMap(prev => {
      const updated = { ...prev };
      currentRegion.buildings.forEach(b => {
        updated[`${selectedRegionId}_${b.id}`] = true;
      });
      return updated;
    });
  };

  const clearAllBuildings = () => {
    setSolarStatusMap(prev => {
      const updated = { ...prev };
      currentRegion.buildings.forEach(b => {
        updated[`${selectedRegionId}_${b.id}`] = false;
      });
      return updated;
    });
  };

  return (
    <div className="mt-4 space-y-6 text-gray-200 font-sans" id="solar-infrastructure-module">
      
      {/* 1. Header Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 p-6 rounded-2xl border border-gray-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950/70 text-emerald-400 rounded-xl border border-emerald-800/50 shadow-inner">
              <Sun className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider bg-emerald-900/30 border border-emerald-800/40 px-2 py-0.5 rounded">
                  IA Geospatial Mapping
                </span>
                <span className="text-xs text-gray-500 font-mono">v3.1 - SAT Scan</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Mapeamento de Infraestrutura Solar</h2>
            </div>
          </div>

          {/* Region Tabs Selection */}
          <div className="flex flex-wrap items-center gap-2">
            {SOLAR_REGIONS.map(region => (
              <button
                key={region.id}
                onClick={() => {
                  setSelectedRegionId(region.id);
                  setSelectedBuildingId(null);
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
                  selectedRegionId === region.id
                    ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-gray-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black'
                    : 'bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-300'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{region.name} ({region.state})</span>
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-300 leading-relaxed max-w-5xl">
          Análise geoespacial com algoritmos de Computer Vision que identificam áreas úteis de telhados e quantificam a penetração de geração distribuída solar fotovoltaica. 
          Selecione uma região, interaja com o <strong>Scanner de Satélite</strong> clicando nos telhados para simular a instalação de novas usinas e calcular o retorno financeiro e ambiental instantâneo.
        </p>
      </div>

      {/* 2. Interactive Section - Map (Left) and Details/Simulation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SCANNER VIEWPORT PORT (8 Columns on desktop) */}
        <div className={`${isMapMaximised ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col space-y-4`}>
          <div className="bg-gray-950/90 border border-gray-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
            
            {/* HUD Indicators */}
            <div className="absolute top-4 left-4 z-10 bg-gray-900/90 border border-gray-800 px-3.5 py-2 rounded-xl text-[10px] space-y-1 backdrop-blur-sm shadow-lg pointer-events-none font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-white font-bold uppercase">SATELLITE LIVE FEED</span>
              </div>
              <div className="text-gray-400">
                Resolução: <span className="text-emerald-400">0.3m/px</span> | Banda: <span className="text-emerald-400">RGB+NIR</span>
              </div>
              <div className="text-gray-400">
                Região: <span className="text-emerald-400">{currentRegion.neighborhood}, {currentRegion.name}</span>
              </div>
            </div>

            {/* Viewport controls (Top right) */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsMapMaximised(!isMapMaximised)}
                className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-lg hover:text-white transition-colors shadow-lg"
                title="Maximizar visualização do mapa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Radar Sweep Animation representation */}
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/4 w-full pointer-events-none transition-all duration-[4000ms] ease-in-out ${radarIndicator ? 'translate-y-full' : '-translate-y-0'}`} />

            {/* Main Interactive Map Canvas */}
            <div className="relative flex-grow flex items-center justify-center min-h-[350px] my-6">
              
              {/* Background Satellite Stylized Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40 rounded-lg"></div>
              
              {/* Central Map Graphic (SVG) */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full max-h-[420px] aspect-square drop-shadow-3xl z-10 select-none"
              >
                {/* Simulated Roads/Avenues layout */}
                <path d="M 0,38 L 100,38" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="2" fill="none" />
                <path d="M 40,0 L 40,100" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="2" fill="none" />
                <path d="M 70,0 L 70,100" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.3" />
                <path d="M 0,65 L 100,65" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.3" />

                <text x="3" y="36" className="text-[2.2px] fill-gray-500 font-mono uppercase tracking-wider">Av. Central Principal</text>
                <text x="42" y="5" className="text-[2.2px] fill-gray-500 font-mono uppercase tracking-wider [writing-mode:vertical-lr]">Rua de Conexão Norte</text>

                {/* Draw each building */}
                {currentRegion.buildings.map(building => {
                  const key = `${currentRegion.id}_${building.id}`;
                  const hasSolar = !!solarStatusMap[key];
                  const isSelected = selectedBuildingId === building.id;

                  return (
                    <g key={building.id} className="cursor-pointer group">
                      <polygon
                        points={building.points}
                        onClick={() => setSelectedBuildingId(building.id)}
                        className={`transition-all duration-300 ${
                          isSelected 
                            ? 'fill-cyan-950/70 stroke-cyan-400 stroke-[0.8]'
                            : hasSolar
                              ? 'fill-emerald-950/50 hover:fill-emerald-900/60 stroke-emerald-500 stroke-[0.4]'
                              : 'fill-gray-900/80 hover:fill-gray-800/90 stroke-gray-700 hover:stroke-gray-500 stroke-[0.3]'
                        }`}
                      />
                      
                      {/* Solar panel overlays drawn inside the polygon if enabled */}
                      {hasSolar && (
                        <polygon
                          points={building.points}
                          onClick={() => setSelectedBuildingId(building.id)}
                          className="fill-none stroke-cyan-400/60 stroke-[0.3] pointer-events-none"
                          style={{
                            fill: 'url(#solar-panel-grid-pattern)',
                            opacity: 0.85
                          }}
                        />
                      )}

                      {/* Small Status Identifier Badge/Dot inside building centroid */}
                      <circle
                        cx={building.x + 3}
                        cy={building.y + 4}
                        r="1.2"
                        className={`pointer-events-none transition-colors duration-300 ${
                          hasSolar ? 'fill-emerald-400 animate-pulse' : 'fill-amber-500/80'
                        }`}
                      />
                    </g>
                  );
                })}

                {/* SVG Definitions for solar panel textures */}
                <defs>
                  <pattern id="solar-panel-grid-pattern" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                    <rect width="2.6" height="2.6" fill="#083344" stroke="#06b6d4" strokeWidth="0.1" rx="0.2" />
                  </pattern>
                </defs>
              </svg>
            </div>

            {/* Map Legend & Quick Conversion Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-800/80 pt-4 mt-2 gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px]">Legenda:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-gray-900 border border-gray-700 rounded-sm"></span>
                  <span className="text-gray-300 font-medium">Sem Painel Solar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-emerald-950 border border-emerald-500 rounded-sm relative overflow-hidden">
                    <span className="absolute inset-0 bg-cyan-400/20" />
                  </span>
                  <span className="text-emerald-400 font-medium">Equipado (Solar Ativo)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-cyan-950 border border-cyan-400 rounded-sm"></span>
                  <span className="text-cyan-400 font-medium">Selecionado no HUD</span>
                </div>
              </div>

              {/* Action buttons for whole region */}
              <div className="flex items-center gap-2">
                <button
                  onClick={equipAllBuildings}
                  className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-300 border border-emerald-800/60 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Equipar Todos
                </button>
                <button
                  onClick={clearAllBuildings}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-gray-300 border border-gray-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Limpar Todos
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* DETAILED HUD PANEL & PARAMETERS (4 Columns on desktop) */}
        {!isMapMaximised && (
          <div className="lg:col-span-4 flex flex-col space-y-6">

            {/* SELECTED BUILDING DETAILED HUD CARD */}
            <AnimatePresence mode="wait">
              {selectedBuildingId && currentBuilding ? (
                <motion.div
                  key={currentBuilding.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900 border border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-4"
                >
                  {/* Building Header */}
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider font-bold">INSPECIONANDO ATIVO</span>
                    </div>
                    <button
                      onClick={() => setSelectedBuildingId(null)}
                      className="text-gray-500 hover:text-white text-xs font-mono font-bold"
                    >
                      [FECHAR]
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight leading-snug">{currentBuilding.name}</h3>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">ID Único: {currentBuilding.id}</p>
                  </div>

                  {/* Quick specs table */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-400">Área do Telhado:</span>
                      <span className="text-white font-bold">{currentBuilding.totalRoofArea} m²</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-400">Área Útil Painéis ({usableAreaFactor}%):</span>
                      <span className="text-cyan-400 font-bold">{Math.round(currentBuilding.totalRoofArea * (usableAreaFactor / 100))} m²</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-400">Material do Telhado:</span>
                      <span className="text-white">{currentBuilding.material}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-400">Inclin. / Orientação:</span>
                      <span className="text-white flex items-center gap-1">
                        <span>{currentBuilding.tilt}°</span>
                        <Compass className="w-3 h-3 text-gray-500" />
                        <span>{currentBuilding.orientation}</span>
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-850 pb-1.5">
                      <span className="text-gray-400">Integridade Estrutural:</span>
                      <span className={`font-bold ${
                        currentBuilding.integrity === 'Excelente' ? 'text-emerald-400' :
                        currentBuilding.integrity === 'Boa' ? 'text-cyan-400' : 'text-amber-400'
                      }`}>{currentBuilding.integrity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacidade Preditiva:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {((currentBuilding.totalRoofArea * (usableAreaFactor / 100) * (panelEfficiency / 100))).toFixed(1)} kWp
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Action Switch inside the Inspection Panel */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs text-white font-bold block">Status do Painel Solar</span>
                        <span className="text-[10px] text-gray-500">Integrado à Geração GD</span>
                      </div>
                      <button
                        onClick={() => toggleBuildingSolar(currentBuilding.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          solarStatusMap[`${currentRegion.id}_${currentBuilding.id}`] ? 'bg-emerald-500' : 'bg-gray-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            solarStatusMap[`${currentRegion.id}_${currentBuilding.id}`] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="text-[10px] text-gray-400 leading-normal border-t border-gray-850 pt-2 flex items-center gap-1.5">
                      <div className="p-1 bg-gray-900 rounded border border-gray-800">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <div>
                        Geração estimada: <strong className="text-yellow-400 font-mono">
                          {((currentBuilding.totalRoofArea * (usableAreaFactor / 100) * currentRegion.baseIrradiance * (panelEfficiency / 100) * (performanceRatio / 100) * 365) / 1000).toFixed(2)} MWh/ano
                        </strong>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="empty-inspection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl h-48 flex flex-col items-center justify-center text-center space-y-2 border-dashed"
                >
                  <Eye className="w-6 h-6 text-gray-600 animate-pulse" />
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-wider font-bold">Nenhum Ativo Inspecionado</span>
                  <p className="text-[10px] text-gray-600 max-w-[200px]">Clique em qualquer prédio ou telhado no mapa ao lado para ver sua telemetria detalhada.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GLOBAL REGION CONSTANTS ADJUSTMENT SLIDERS */}
            <div className="bg-gray-900 border border-gray-850 rounded-2xl p-5 shadow-xl space-y-5 flex-grow">
              
              <div className="border-b border-gray-800 pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Parâmetros da Simulação</span>
                </h4>
              </div>

              {/* Slider 1: Panel Efficiency */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Eficiência dos Painéis:</span>
                  <span className="text-emerald-400 font-bold">{panelEfficiency.toFixed(1)}%</span>
                </div>
                <input 
                  type="range" 
                  min="15.0" 
                  max="25.0" 
                  step="0.5"
                  value={panelEfficiency}
                  onChange={(e) => setPanelEfficiency(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-950 rounded-lg"
                />
                <span className="text-[8px] text-gray-500 block leading-tight font-sans">
                  Representa a eficiência de conversão fotovoltaica das células em condições de teste padrão (STC).
                </span>
              </div>

              {/* Slider 2: System Performance Ratio */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa Desempenho (PR):</span>
                  <span className="text-emerald-400 font-bold">{performanceRatio.toFixed(1)}%</span>
                </div>
                <input 
                  type="range" 
                  min="60.0" 
                  max="90.0" 
                  step="1.0"
                  value={performanceRatio}
                  onChange={(e) => setPerformanceRatio(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-950 rounded-lg"
                />
                <span className="text-[8px] text-gray-500 block leading-tight font-sans">
                  Perdas operacionais acumuladas por temperatura, fiação, inversores e sujeira sobre os módulos.
                </span>
              </div>

              {/* Slider 3: Usable Area Factor */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Uso do Telhado (Área Útil):</span>
                  <span className="text-cyan-400 font-bold">{usableAreaFactor}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  step="5"
                  value={usableAreaFactor}
                  onChange={(e) => setUsableAreaFactor(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-gray-950 rounded-lg"
                />
                <span className="text-[8px] text-gray-500 block leading-tight font-sans">
                  Porcentagem útil real do telhado desconsiderando sombras de obstáculos, chaminés, caixas de água e beirais.
                </span>
              </div>

              {/* Region Presets display */}
              <div className="bg-gray-950/80 p-3 rounded-xl border border-gray-850 space-y-2 text-[10px] font-mono">
                <div className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Presets Ativos da Região</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Média de Irradiação:</span>
                  <span className="text-yellow-400 font-bold">{currentRegion.baseIrradiance} kWh/m²/dia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tarifa Elétrica Estimada:</span>
                  <span className="text-white">R$ {currentRegion.baseTariff.toFixed(2)}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fator de Carbono:</span>
                  <span className="text-emerald-400 font-bold">{currentRegion.co2Factor} kg CO₂/kWh</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* 3. Calculations Outcome Dashboard Indicators (D3 style metric panels) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Existing vs Mapped roofs count */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-800/80 transition-all duration-300 flex items-center justify-between shadow-lg group">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Taxa de Penetração Solar</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{regionMetrics.totalSolarRoofs}</span>
              <span className="text-xs text-gray-400">de {regionMetrics.totalDetectedRoofs} telhados</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">
              Adocão: {Math.round((regionMetrics.totalSolarRoofs / regionMetrics.totalDetectedRoofs) * 100)}% do bairro
            </span>
          </div>
          <div className="p-3 bg-gray-950 text-emerald-400 rounded-xl group-hover:bg-emerald-900/20 transition-colors">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Mapped vs Potential yield MWh */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-800/80 transition-all duration-300 flex items-center justify-between shadow-lg group">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Geração Regional Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-400">{regionMetrics.maxTotalYieldMWh.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</span>
              <span className="text-xs text-gray-400">MWh/ano</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono block">
              Existente: {regionMetrics.existingYieldMWh.toFixed(1)} MWh | Adicional: <span className="text-yellow-400">{regionMetrics.potentialYieldMWh.toFixed(1)} MWh</span>
            </span>
          </div>
          <div className="p-3 bg-gray-950 text-emerald-400 rounded-xl group-hover:bg-emerald-900/20 transition-colors">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        {/* Metric 3: Carbon Savings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-800/80 transition-all duration-300 flex items-center justify-between shadow-lg group">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Evitação de Carbono (CO₂)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-green-400">{regionMetrics.carbonSavedTons.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
              <span className="text-xs text-gray-400">ton/ano</span>
            </div>
            <span className="text-[10px] text-green-400 font-mono block">
              Evitado Adicional: {regionMetrics.incrementalCarbonSavedTons.toFixed(2)} tCO₂
            </span>
          </div>
          <div className="p-3 bg-gray-950 text-green-400 rounded-xl group-hover:bg-green-900/20 transition-colors">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Economy Savings in BRL */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-800/80 transition-all duration-300 flex items-center justify-between shadow-lg group">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Potencial de Economia Comercial</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-cyan-400">
                {(regionMetrics.savingsBRL / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
              </span>
              <span className="text-xs text-gray-400">R$/ano</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono block">
              Ganho Incremental: R$ {(regionMetrics.incrementalSavingsBRL / 1000).toFixed(0)}k/ano
            </span>
          </div>
          <div className="p-3 bg-gray-950 text-cyan-400 rounded-xl group-hover:bg-cyan-900/20 transition-colors">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 4. Payback & ROI Simulation Panel (Visualized Capex Conversion Model) */}
      <div className="bg-gray-900/95 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Análise de Viabilidade Econômica (Fase de Transição Solar)</span>
            </h3>
            <p className="text-xs text-gray-400 leading-normal">
              Viabilidade calculada para equipar os <span className="text-yellow-400 font-black">{regionMetrics.unutilizedRoofsCount} telhados subutilizados</span> restantes na área de {currentRegion.name}.
            </p>
          </div>
          
          <div className="px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl flex items-center gap-2.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black font-mono">Payback Projetado</span>
            <span className={`text-lg font-black font-mono ${regionMetrics.paybackYears <= 4.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {regionMetrics.paybackYears > 0 ? `${regionMetrics.paybackYears.toFixed(1)} Anos` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Capex Card */}
          <div className="bg-gray-950 p-4.5 rounded-xl border border-gray-850 space-y-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block">Investimento Estimado (CAPEX)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-bold">R$</span>
              <span className="text-2xl font-black text-white">{regionMetrics.estimatedCAPEX.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
              Baseado no custo médio de instalação comercial e industrial de <strong>R$ 4.500/kWp</strong>. Inclui custos de módulos fotovoltaicos, inversores e engenharia civil.
            </p>
          </div>

          {/* Opex savings card */}
          <div className="bg-gray-950 p-4.5 rounded-xl border border-gray-850 space-y-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block">Economia Operacional Direta</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-bold">R$</span>
              <span className="text-2xl font-black text-emerald-400">{regionMetrics.incrementalSavingsBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              <span className="text-xs text-gray-400">/ano</span>
            </div>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
              Economia anual de OPEX em faturas de energia para as empresas locais após transição completa do potencial solar ocioso nas quadras inspecionadas.
            </p>
          </div>

          {/* Social offset equivalent */}
          <div className="bg-gray-950 p-4.5 rounded-xl border border-gray-850 space-y-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block">Impacto Social Equivalente</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-cyan-400">
                {Math.round(regionMetrics.maxTotalYieldMWh * 1000 / 2200).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-gray-400">Residências</span>
            </div>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
              Equivalência em consumo residencial médio brasileiro (~2.200 kWh/ano por família) alimentado em sua totalidade por energia limpa, autogerada localmente.
            </p>
          </div>

        </div>

      </div>

      {/* 5. Rich Graphical Analytics Dashboard Panels (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MONTHLY YIELD FORECAST CHART (7 Columns) */}
        <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Sazonalidade Mensal Estimada</h4>
              <p className="text-[10px] text-gray-500">Estimativa baseada nos índices de radiação histórica de {currentRegion.name}</p>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Valores em MWh</span>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyProfileData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradient-existing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradient-potential" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Geração Atual" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#gradient-existing)" 
                  stackId="1"
                />
                <Area 
                  type="monotone" 
                  dataKey="Geração Adicional" 
                  stroke="#eab308" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#gradient-potential)" 
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REGIONAL BENCHMARK COMPARISON CHART (5 Columns) */}
        <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comparativo Multi-Polo</h4>
              <p className="text-[10px] text-gray-500">Benchmark de aproveitamento solar entre as regiões mapeadas</p>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">MWh Totais</span>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={crossRegionComparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Bar dataKey="Geração Existente (MWh)" stackId="a" fill="#10b981">
                  {crossRegionComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === currentRegion.name ? '#10b981' : '#047857'} />
                  ))}
                </Bar>
                <Bar dataKey="Potencial Adicional (MWh)" stackId="a" fill="#eab308">
                  {crossRegionComparisonData.map((entry, index) => (
                    <Cell key={`cell-add-${index}`} fill={entry.name === currentRegion.name ? '#eab308' : '#ca8a04'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SolarInfrastructure;
