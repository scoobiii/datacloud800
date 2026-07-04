
export enum PlantStatus {
  Online = 'ONLINE',
  Offline = 'OFFLINE',
  Maintenance = 'MAINTENANCE',
}

export enum FuelMode {
  NaturalGas = 'NATURAL_GAS',
  Ethanol = 'ETHANOL',
  Biodiesel = 'BIODIESEL',
  FlexNGH2 = 'FLEX_NG_H2',
  FlexEthanolBiodiesel = 'FLEX_ETHANOL_BIODIESEL',
  Nuclear = 'NUCLEAR',
}

export interface HistoricalDataPoint {
  time: string;
  power: number;
}

export interface EmissionData {
  nox: number;
  sox: number;
  co: number;
  particulates: number;
}

export interface HistoricalEmissionPoint extends EmissionData {
  time: string;
}

export type TurbineStatus = 'active' | 'inactive' | 'error';

export interface Turbine {
  id: number;
  status: TurbineStatus;
  rpm: number;
  temp: number;
  pressure: number;
  type: 'Ciclo Rankine' | 'Ciclo Combinado';
  manufacturer: string;
  model: string;
  isoCapacity: number; // in MW
  history?: { time: string; rpm: number; temp: number; pressure: number }[];
  maintenanceScore: number; // Replaces needsMaintenance
}

export interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface LongHistoricalDataPoint {
  time: string;
  power: number;
  consumption: number;
}

export interface Plant {
  name: string; // The original name acts as a unique ID
  nameKey: string;
  power: number;
  fuelKey: string;
  
  type?: 'standard' | 'upgrade' | 'new';
  statusKey?: string;
  descriptionKey?: string;
  conversion?: number;
  ethanolDemand?: number;
  coordinates?: { lat: number; lng: number };
  identifier?: {
    type: 'location' | 'license';
    valueKey: string;
  };

  locationKey?: string;
  cycleKey?: string;
  generation2023?: number | null;
  emissions2023?: number | null;
  efficiency?: number | null;
  rate?: number | null;
  // FIX: Add optional status property for compatibility
  status?: string;
}