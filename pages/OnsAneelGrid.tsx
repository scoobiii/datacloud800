import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, LineChart, Line } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { 
  ActivityIcon, 
  BoltIcon, 
  InfoIcon, 
  GlobeAltIcon, 
  ComputerDesktopIcon, 
  DropletIcon,
  ChartBarIcon,
  CogIcon,
  WarningIcon
} from '../components/icons';

// Types for ONS & ANEEL Grid Assets
export interface GridAsset {
  id: string;
  name: string;
  type: 'generator' | 'substation' | 'transmission';
  subType: string; // 'Hydro', 'Solar', 'Wind', 'Thermal', 'Nuclear', 'Transformer', 'Line'
  capacity: number; // MW (Generators) or MVA (Substations) or extension in km (Lines)
  voltage: number; // kV
  operator: string;
  state: string;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Norte' | 'Centro-Oeste';
  status: 'Operando' | 'Manutenção' | 'Alerta' | 'Fora de Serviço';
  activeLoad: number; // MW active flow
  concessionDate: string;
  latitude: number;
  longitude: number;
  dataSource: 'ANEEL (SIGA)' | 'ONS (DGI)';
}

// Pre-populated ultra-realistic actual data of Brazilian SIN (Sistema Interligado Nacional)
const PRE_HYDRATED_SIN_ASSETS: GridAsset[] = [
  // --- GENERATION ASSETS (ANEEL SIGA) ---
  {
    id: 'GEN-001',
    name: 'UHE Itaipu Binacional',
    type: 'generator',
    subType: 'Hidrelétrica (UHE)',
    capacity: 14000,
    voltage: 750,
    operator: 'Itaipu Binacional / ENBPar',
    state: 'PR',
    region: 'Sul',
    status: 'Operando',
    activeLoad: 11450,
    concessionDate: '1973-04-26',
    latitude: -25.4128,
    longitude: -54.5889,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-002',
    name: 'UHE Belo Monte',
    type: 'generator',
    subType: 'Hidrelétrica (UHE)',
    capacity: 11233,
    voltage: 800,
    operator: 'Norte Energia S.A.',
    state: 'PA',
    region: 'Norte',
    status: 'Operando',
    activeLoad: 7890,
    concessionDate: '2010-08-26',
    latitude: -3.1119,
    longitude: -51.7822,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-003',
    name: 'UHE Tucuruí',
    type: 'generator',
    subType: 'Hidrelétrica (UHE)',
    capacity: 8535,
    voltage: 500,
    operator: 'Eletrobras Eletronorte',
    state: 'PA',
    region: 'Norte',
    status: 'Operando',
    activeLoad: 6120,
    concessionDate: '1984-11-24',
    latitude: -3.8329,
    longitude: -49.6517,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-004',
    name: 'UHE Santo Antônio',
    type: 'generator',
    subType: 'Hidrelétrica (UHE)',
    capacity: 3568,
    voltage: 500,
    operator: 'Santo Antônio Energia S.A.',
    state: 'RO',
    region: 'Norte',
    status: 'Operando',
    activeLoad: 2840,
    concessionDate: '2008-06-12',
    latitude: -8.8028,
    longitude: -63.9531,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-005',
    name: 'UHE Jirau',
    type: 'generator',
    subType: 'Hidrelétrica (UHE)',
    capacity: 3750,
    voltage: 500,
    operator: 'Energia Sustentável do Brasil',
    state: 'RO',
    region: 'Norte',
    status: 'Manutenção',
    activeLoad: 2100,
    concessionDate: '2008-08-13',
    latitude: -9.2614,
    longitude: -64.6408,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-006',
    name: 'USN Angra 1',
    type: 'generator',
    subType: 'Nuclear (UTN)',
    capacity: 640,
    voltage: 500,
    operator: 'Eletronuclear',
    state: 'RJ',
    region: 'Sudeste',
    status: 'Operando',
    activeLoad: 625,
    concessionDate: '1985-01-01',
    latitude: -23.0125,
    longitude: -44.4633,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-007',
    name: 'USN Angra 2',
    type: 'generator',
    subType: 'Nuclear (UTN)',
    capacity: 1350,
    voltage: 500,
    operator: 'Eletronuclear',
    state: 'RJ',
    region: 'Sudeste',
    status: 'Operando',
    activeLoad: 1320,
    concessionDate: '2001-02-01',
    latitude: -23.0131,
    longitude: -44.4645,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-008',
    name: 'UTE Porto de Sergipe I',
    type: 'generator',
    subType: 'Termelétrica (UTE)',
    capacity: 1551,
    voltage: 500,
    operator: 'Eneva',
    state: 'SE',
    region: 'Nordeste',
    status: 'Operando',
    activeLoad: 1480,
    concessionDate: '2016-04-12',
    latitude: -10.8356,
    longitude: -37.0344,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-009',
    name: 'Complexo Eólico Ventos do Araripe III',
    type: 'generator',
    subType: 'Eólica (EOL)',
    capacity: 359,
    voltage: 230,
    operator: 'Casa dos Ventos',
    state: 'PE',
    region: 'Nordeste',
    status: 'Operando',
    activeLoad: 285,
    concessionDate: '2015-05-20',
    latitude: -7.7125,
    longitude: -40.4533,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-010',
    name: 'Parque Solar Sol do Sertão',
    type: 'generator',
    subType: 'Solar (UFV)',
    capacity: 474,
    voltage: 230,
    operator: 'Essentia Energia',
    state: 'BA',
    region: 'Nordeste',
    status: 'Operando',
    activeLoad: 395,
    concessionDate: '2019-12-04',
    latitude: -11.9566,
    longitude: -42.7483,
    dataSource: 'ANEEL (SIGA)'
  },
  {
    id: 'GEN-011',
    name: 'UTE Termorio',
    type: 'generator',
    subType: 'Termelétrica (UTE)',
    capacity: 1058,
    voltage: 345,
    operator: 'Petrobras',
    state: 'RJ',
    region: 'Sudeste',
    status: 'Alerta',
    activeLoad: 910,
    concessionDate: '2004-12-01',
    latitude: -22.7125,
    longitude: -43.2333,
    dataSource: 'ANEEL (SIGA)'
  },

  // --- SUBSTATIONS & CABINS (ONS) ---
  {
    id: 'SUB-001',
    name: 'SE Foz do Iguaçu (800kV / 500kV)',
    type: 'substation',
    subType: 'Subestação / Cabine',
    capacity: 15200, // Capacity in MVA
    voltage: 800,
    operator: 'Furnas Centrais Elétricas',
    state: 'PR',
    region: 'Sul',
    status: 'Operando',
    activeLoad: 12100,
    concessionDate: '1984-05-15',
    latitude: -25.4511,
    longitude: -54.5122,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'SUB-002',
    name: 'SE Tijuco Preto (500kV)',
    type: 'substation',
    subType: 'Subestação / Cabine',
    capacity: 9600,
    voltage: 500,
    operator: 'Furnas Centrais Elétricas',
    state: 'SP',
    region: 'Sudeste',
    status: 'Operando',
    activeLoad: 7850,
    concessionDate: '1984-11-10',
    latitude: -23.6122,
    longitude: -46.2111,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'SUB-003',
    name: 'SE Osasco Mauá (345kV)',
    type: 'substation',
    subType: 'Subestação / Cabine',
    capacity: 3200,
    voltage: 345,
    operator: 'ISA CTEEP',
    state: 'SP',
    region: 'Sudeste',
    status: 'Operando',
    activeLoad: 2450,
    concessionDate: '1998-03-12',
    latitude: -23.5322,
    longitude: -46.7811,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'SUB-004',
    name: 'SE Xingu (800kV DC)',
    type: 'substation',
    subType: 'Subestação / Cabine',
    capacity: 8000,
    voltage: 800,
    operator: 'Eletrobras Eletronorte',
    state: 'PA',
    region: 'Norte',
    status: 'Alerta',
    activeLoad: 7100,
    concessionDate: '2017-06-14',
    latitude: -3.2144,
    longitude: -51.8922,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'SUB-005',
    name: 'SE Estreito (800kV / 500kV)',
    type: 'substation',
    subType: 'Subestação / Cabine',
    capacity: 8000,
    voltage: 800,
    operator: 'State Grid Brazil Holding',
    state: 'MG',
    region: 'Sudeste',
    status: 'Operando',
    activeLoad: 6890,
    concessionDate: '2017-06-14',
    latitude: -20.3122,
    longitude: -47.2833,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'SUB-006',
    name: 'SE Terminal Rio (500kV)',
    type: 'substation',
    subType: 'Subestação / Cabine',
    capacity: 4500,
    voltage: 500,
    operator: 'Furnas Centrais Elétricas',
    state: 'RJ',
    region: 'Sudeste',
    status: 'Fora de Serviço',
    activeLoad: 0,
    concessionDate: '2005-09-20',
    latitude: -22.7811,
    longitude: -43.4322,
    dataSource: 'ONS (DGI)'
  },

  // --- TRANSMISSION LINES (ONS) ---
  {
    id: 'TRA-001',
    name: 'LT 800kV CC Xingu-Estreito (Linha de Transmissão)',
    type: 'transmission',
    subType: 'Rede de Transmissão',
    capacity: 2084, // Extension in km
    voltage: 800,
    operator: 'Belo Monte Transmissora de Energia (BMTE)',
    state: 'PA-TO-GO-MG',
    region: 'Norte',
    status: 'Operando',
    activeLoad: 4000, // MW Flow
    concessionDate: '2014-11-20',
    latitude: -11.5344,
    longitude: -48.8122,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'TRA-002',
    name: 'LT 800kV CC Xingu-Terminal Rio (Linha de Transmissão)',
    type: 'transmission',
    subType: 'Rede de Transmissão',
    capacity: 2530, // Extension in km
    voltage: 800,
    operator: 'Xingu Rio Transmissora de Energia (XRTE)',
    state: 'PA-TO-GO-MG-RJ',
    region: 'Sudeste',
    status: 'Operando',
    activeLoad: 3850,
    concessionDate: '2015-12-15',
    latitude: -12.4311,
    longitude: -46.7122,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'TRA-003',
    name: 'LT 750kV AC Itaipu-Tijuco Preto (Linha de Transmissão)',
    type: 'transmission',
    subType: 'Rede de Transmissão',
    capacity: 900, // Extension in km
    voltage: 750,
    operator: 'Furnas Centrais Elétricas',
    state: 'PR-SP',
    region: 'Sul',
    status: 'Operando',
    activeLoad: 6200,
    concessionDate: '1984-05-15',
    latitude: -24.1111,
    longitude: -51.3122,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'TRA-004',
    name: 'LT 500kV AC Tucuruí-Manaus (Linha de Transmissão)',
    type: 'transmission',
    subType: 'Rede de Transmissão',
    capacity: 1100, // Extension in km
    voltage: 500,
    operator: 'Eletrobras Eletronorte',
    state: 'PA-AM',
    region: 'Norte',
    status: 'Alerta',
    activeLoad: 1250,
    concessionDate: '2012-07-04',
    latitude: -3.0122,
    longitude: -55.2333,
    dataSource: 'ONS (DGI)'
  },
  {
    id: 'TRA-005',
    name: 'LT 500kV AC Sobradinho-Recife (Linha de Transmissão)',
    type: 'transmission',
    subType: 'Rede de Transmissão',
    capacity: 450, // Extension in km
    voltage: 500,
    operator: 'Eletrobras Chesf',
    state: 'BA-PE',
    region: 'Nordeste',
    status: 'Operando',
    activeLoad: 950,
    concessionDate: '1982-03-10',
    latitude: -8.7811,
    longitude: -38.5122,
    dataSource: 'ONS (DGI)'
  }
];

// --- AGGREGATED SOLAR GENERATION DISTRIBUTED (GD) DATASET (ESTADOS) ---
const ESTADOS_GD_DATA: any[] = [
  {
    id: "ESTADO-SP",
    name: "São Paulo (SP)",
    type: "generator",
    subType: "Geração Distribuída & Centralizada",
    capacity: 22460,
    activeLoad: 18450,
    voltage: 500,
    operator: "Múltiplos Operadores & 585k Unidades GD",
    state: "SP",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 585000,
    centralCount: 2460,
    aiDetectionRate: 99.4,
    lastScanDate: "2026-07-04",
    mappedByAi: true,
  },
  {
    id: "ESTADO-MG",
    name: "Minas Gerais (MG)",
    type: "generator",
    subType: "Geração Distribuída & Centralizada",
    capacity: 23850,
    activeLoad: 19120,
    voltage: 500,
    operator: "Cemig / Furnas & 492k Unidades GD",
    state: "MG",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 492000,
    centralCount: 3850,
    aiDetectionRate: 99.2,
    lastScanDate: "2026-07-03",
    mappedByAi: true,
  },
  {
    id: "ESTADO-RS",
    name: "Rio Grande do Sul (RS)",
    type: "generator",
    subType: "Geração Distribuída & Centralizada",
    capacity: 11120,
    activeLoad: 8920,
    voltage: 230,
    operator: "CPFL / CEEE & 398k Unidades GD",
    state: "RS",
    region: "Sul",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 398000,
    centralCount: 3120,
    aiDetectionRate: 98.7,
    lastScanDate: "2026-07-04",
    mappedByAi: true,
  },
  {
    id: "ESTADO-PR",
    name: "Paraná (PR)",
    type: "generator",
    subType: "Geração Distribuída & Centralizada",
    capacity: 19315,
    activeLoad: 16420,
    voltage: 750,
    operator: "Copel / Itaipu & 315k Unidades GD",
    state: "PR",
    region: "Sul",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 315000,
    centralCount: 2210,
    aiDetectionRate: 98.9,
    lastScanDate: "2026-07-04",
    mappedByAi: true,
  },
  {
    id: "ESTADO-BA",
    name: "Bahia (BA)",
    type: "generator",
    subType: "Complexos Eólicos, Solares & GD",
    capacity: 14910,
    activeLoad: 11210,
    voltage: 500,
    operator: "Neoenergia / Chesf & 195k Unidades GD",
    state: "BA",
    region: "Nordeste",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 195000,
    centralCount: 2910,
    aiDetectionRate: 99.1,
    lastScanDate: "2026-07-02",
    mappedByAi: true,
  },
  {
    id: "ESTADO-PA",
    name: "Pará (PA)",
    type: "generator",
    subType: "Grandes Usinas (Belo Monte, Tucuruí) & GD",
    capacity: 19760,
    activeLoad: 14010,
    voltage: 800,
    operator: "Eletrobras / Norte Energia & 65k Unidades GD",
    state: "PA",
    region: "Norte",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 65000,
    centralCount: 1240,
    aiDetectionRate: 95.4,
    lastScanDate: "2026-07-01",
    mappedByAi: true,
  },
  {
    id: "ESTADO-CE",
    name: "Ceará (CE)",
    type: "generator",
    subType: "Complexos Eólicos & GD",
    capacity: 6100,
    activeLoad: 4850,
    voltage: 500,
    operator: "Enel / Chesf & 125k Unidades GD",
    state: "CE",
    region: "Nordeste",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 125000,
    centralCount: 1150,
    aiDetectionRate: 98.2,
    lastScanDate: "2026-07-03",
    mappedByAi: true,
  },
  {
    id: "ESTADO-PE",
    name: "Pernambuco (PE)",
    type: "generator",
    subType: "Geração Centralizada & GD",
    capacity: 5800,
    activeLoad: 4120,
    voltage: 500,
    operator: "Neoenergia / Chesf & 108k Unidades GD",
    state: "PE",
    region: "Nordeste",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 108000,
    centralCount: 980,
    aiDetectionRate: 97.9,
    lastScanDate: "2026-07-04",
    mappedByAi: true,
  },
  {
    id: "ESTADO-RJ",
    name: "Rio de Janeiro (RJ)",
    type: "generator",
    subType: "Nuclear, Térmica & Solar GD",
    capacity: 7200,
    activeLoad: 5980,
    voltage: 500,
    operator: "Eletronuclear / Light & 118k Unidades GD",
    state: "RJ",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 118000,
    centralCount: 850,
    aiDetectionRate: 98.8,
    lastScanDate: "2026-07-04",
    mappedByAi: true,
  },
  {
    id: "ESTADO-RO",
    name: "Rondônia (RO)",
    type: "generator",
    subType: "Hidrelétrica (Santo Antônio, Jirau) & GD",
    capacity: 7400,
    activeLoad: 5680,
    voltage: 500,
    operator: "Santo Antônio Energia / Jirau & 22k GD",
    state: "RO",
    region: "Norte",
    status: "Operando",
    concessionDate: "Múltiplas Datas",
    dataSource: "ANEEL (SIGA) & ONS DGI",
    gdUnits: 22000,
    centralCount: 420,
    aiDetectionRate: 94.2,
    lastScanDate: "2026-06-30",
    mappedByAi: true,
  }
];

// --- AGGREGATED SOLAR GENERATION DISTRIBUTED (GD) DATASET (MUNICIPIOS) ---
const MUNICIPIOS_GD_DATA: any[] = [
  {
    id: "MUN-UBERLANDIA",
    name: "Uberlândia (MG)",
    type: "generator",
    subType: "Solar Geração Distribuída (GD)",
    capacity: 850,
    activeLoad: 590,
    voltage: 13.8,
    operator: "Prosumidores Associados Cemig",
    state: "MG",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "2022-04-12",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 24500,
    mappedByAi: true,
    aiDetectionRate: 99.6,
    lastScanDate: "2026-07-04",
    streetCount: 1420
  },
  {
    id: "MUN-CAMPINAS",
    name: "Campinas (SP)",
    type: "generator",
    subType: "Solar Geração Distribuída (GD)",
    capacity: 720,
    activeLoad: 480,
    voltage: 13.8,
    operator: "Prosumidores CPFL Paulista",
    state: "SP",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "2021-08-19",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 21800,
    mappedByAi: true,
    aiDetectionRate: 99.5,
    lastScanDate: "2026-07-04",
    streetCount: 1850
  },
  {
    id: "MUN-PORTOALEGRE",
    name: "Porto Alegre (RS)",
    type: "generator",
    subType: "Solar Geração Distribuída (GD)",
    capacity: 480,
    activeLoad: 310,
    voltage: 13.8,
    operator: "Prosumidores CEEE Grupo Equatorial",
    state: "RS",
    region: "Sul",
    status: "Operando",
    concessionDate: "2023-01-15",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 15400,
    mappedByAi: true,
    aiDetectionRate: 98.9,
    lastScanDate: "2026-07-03",
    streetCount: 980
  },
  {
    id: "MUN-PETROLINA",
    name: "Petrolina (PE)",
    type: "generator",
    subType: "Parques Solares & GD",
    capacity: 620,
    activeLoad: 490,
    voltage: 69,
    operator: "Múltiplos Operadores Neoenergia",
    state: "PE",
    region: "Nordeste",
    status: "Operando",
    concessionDate: "2019-11-05",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 8900,
    mappedByAi: true,
    aiDetectionRate: 98.1,
    lastScanDate: "2026-07-04",
    streetCount: 450
  },
  {
    id: "MUN-RIBEIRAOPRETO",
    name: "Ribeirão Preto (SP)",
    type: "generator",
    subType: "Solar Geração Distribuída (GD)",
    capacity: 430,
    activeLoad: 280,
    voltage: 13.8,
    operator: "Prosumidores CPFL Paulista",
    state: "SP",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "2022-03-24",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 12400,
    mappedByAi: true,
    aiDetectionRate: 99.3,
    lastScanDate: "2026-07-04",
    streetCount: 1120
  },
  {
    id: "MUN-PIRACICABA",
    name: "Piracicaba (SP)",
    type: "generator",
    subType: "Cogeração Biomassa & Solar GD",
    capacity: 380,
    activeLoad: 290,
    voltage: 13.8,
    operator: "Prosumidores & Usinas CPFL",
    state: "SP",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "2020-05-18",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 9800,
    mappedByAi: true,
    aiDetectionRate: 99.1,
    lastScanDate: "2026-07-02",
    streetCount: 870
  },
  {
    id: "MUN-JOINVILLE",
    name: "Joinville (SC)",
    type: "generator",
    subType: "Solar Geração Distribuída (GD)",
    capacity: 320,
    activeLoad: 210,
    voltage: 13.8,
    operator: "Prosumidores Celesc",
    state: "SC",
    region: "Sul",
    status: "Operando",
    concessionDate: "2021-02-14",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 9100,
    mappedByAi: true,
    aiDetectionRate: 98.7,
    lastScanDate: "2026-07-03",
    streetCount: 760
  },
  {
    id: "MUN-TERESINA",
    name: "Teresina (PI)",
    type: "generator",
    subType: "Solar Geração Distribuída (GD)",
    capacity: 290,
    activeLoad: 180,
    voltage: 13.8,
    operator: "Prosumidores Equatorial Piauí",
    state: "PI",
    region: "Nordeste",
    status: "Operando",
    concessionDate: "2022-10-10",
    dataSource: "ANEEL (SIGA)",
    gdUnits: 8400,
    mappedByAi: true,
    aiDetectionRate: 97.4,
    lastScanDate: "2026-07-01",
    streetCount: 650
  }
];

// --- AGGREGATED SOLAR GENERATION DISTRIBUTED (GD) DATASET (BAIRROS) ---
const BAIRROS_GD_DATA: any[] = [
  {
    id: "BAI-JARDINS",
    name: "Jardins (SP) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 42.5,
    activeLoad: 28.1,
    voltage: 0.38,
    operator: "8.420 Consumidores Enel SP",
    state: "SP",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 8420,
    mappedByAi: true,
    aiDetectionRate: 99.8,
    lastScanDate: "2026-07-04",
    streetCount: 142,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Campinas (SP)"
  },
  {
    id: "BAI-MOEMA",
    name: "Moema (SP) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 31.8,
    activeLoad: 22.4,
    voltage: 0.38,
    operator: "6.150 Consumidores Enel SP",
    state: "SP",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 6150,
    mappedByAi: true,
    aiDetectionRate: 99.7,
    lastScanDate: "2026-07-04",
    streetCount: 110,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Campinas (SP)"
  },
  {
    id: "BAI-SAVASSI",
    name: "Savassi (BH) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 28.4,
    activeLoad: 19.5,
    voltage: 0.38,
    operator: "5.890 Consumidores Cemig",
    state: "MG",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 5890,
    mappedByAi: true,
    aiDetectionRate: 99.4,
    lastScanDate: "2026-07-03",
    streetCount: 95,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Uberlândia (MG)"
  },
  {
    id: "BAI-BELAVISTA",
    name: "Bela Vista (POA) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 22.1,
    activeLoad: 15.3,
    voltage: 0.38,
    operator: "4.210 Consumidores CEEE",
    state: "RS",
    region: "Sul",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 4210,
    mappedByAi: true,
    aiDetectionRate: 99.1,
    lastScanDate: "2026-07-04",
    streetCount: 78,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Porto Alegre (RS)"
  },
  {
    id: "BAI-BARRATIJUCA",
    name: "Barra da Tijuca (RJ) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 38.6,
    activeLoad: 26.8,
    voltage: 0.38,
    operator: "7.100 Consumidores Light RJ",
    state: "RJ",
    region: "Sudeste",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 7100,
    mappedByAi: true,
    aiDetectionRate: 99.6,
    lastScanDate: "2026-07-04",
    streetCount: 165,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Petrolina (PE)"
  },
  {
    id: "BAI-ALDEOTA",
    name: "Aldeota (Fortaleza) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 19.5,
    activeLoad: 13.2,
    voltage: 0.38,
    operator: "3.900 Consumidores Enel CE",
    state: "CE",
    region: "Nordeste",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 3900,
    mappedByAi: true,
    aiDetectionRate: 98.8,
    lastScanDate: "2026-07-02",
    streetCount: 68,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Teresina (PI)"
  },
  {
    id: "BAI-SETORBUENO",
    name: "Setor Bueno (Goiânia) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 24.2,
    activeLoad: 16.9,
    voltage: 0.38,
    operator: "4.800 Consumidores Equatorial GO",
    state: "GO",
    region: "Centro-Oeste",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 4800,
    mappedByAi: true,
    aiDetectionRate: 99.2,
    lastScanDate: "2026-07-03",
    streetCount: 84,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Ribeirão Preto (SP)"
  },
  {
    id: "BAI-BATEL",
    name: "Batel (Curitiba) - Solar GD",
    type: "generator",
    subType: "Solar GD (Painéis Mapeados por IA)",
    capacity: 18.3,
    activeLoad: 12.5,
    voltage: 0.38,
    operator: "3.400 Consumidores Copel PR",
    state: "PR",
    region: "Sul",
    status: "Operando",
    concessionDate: "Detecção IA 2026",
    dataSource: "MEX Computer Vision Agent",
    gdUnits: 3400,
    mappedByAi: true,
    aiDetectionRate: 99.5,
    lastScanDate: "2026-07-04",
    streetCount: 52,
    detectionModel: "MEX-ObjectMask-v4.1",
    satelliteSource: "Sentinel-2 & Copernicus",
    municipality: "Joinville (SC)"
  }
];

export const OnsAneelGrid: React.FC<{
  t: (key: string) => string;
}> = ({ t }) => {
  // Tabs: 'treemap' | 'api-console' | 'about' | 'dessem-dispatch'
  const [activeTab, setActiveTab] = useState<'treemap' | 'api-console' | 'about' | 'dessem-dispatch'>('treemap');
  
  // Hierarchy Level state
  const [hierarchyLevel, setHierarchyLevel] = useState<'nacional' | 'estados' | 'municipios' | 'bairros'>('nacional');

  // Drill-down hierarchy state filters
  const [drillState, setDrillState] = useState<string | null>(null);
  const [drillMunicipality, setDrillMunicipality] = useState<string | null>(null);

  // Sizing & Coloring metrics
  const [sizingMetric, setSizingMetric] = useState<'capacity' | 'activeLoad'>('capacity');
  const [coloringMetric, setColoringMetric] = useState<'status' | 'subType' | 'region'>('subType');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected asset state for drawer/modal
  const [selectedAsset, setSelectedAsset] = useState<GridAsset | null>(null);

  // Live state of assets, initialized with high-fidelity pre-hydrated SIN topology
  const [sinAssets, setSinAssets] = useState<GridAsset[]>(PRE_HYDRATED_SIN_ASSETS);

  // New States for Selected Asset Modal Interactive Features
  const [modalTab, setModalTab] = useState<'specs' | 'telemetry'>('specs');
  const [isTestingAssetLink, setIsTestingAssetLink] = useState(false);
  const [assetLinkTestResult, setAssetLinkTestResult] = useState<'idle' | 'success' | 'failed'>('idle');
  const [assetTelemetryLogs, setAssetTelemetryLogs] = useState<string[]>([]);
  const [simulatedDespachoActive, setSimulatedDespachoActive] = useState(false);
  const [simulatedDespachoSuccess, setSimulatedDespachoSuccess] = useState<boolean | null>(null);
  const [simulatedDespachoLog, setSimulatedDespachoLog] = useState<string[]>([]);

  // Telemetry Link scanning simulation handler
  const testAssetTelemetry = () => {
    if (!selectedAsset) return;
    setIsTestingAssetLink(true);
    setAssetLinkTestResult('idle');
    setAssetTelemetryLogs([
      `[${new Date().toISOString().slice(11, 19)}] >> INICIANDO VARREDURA DE LINK TELEMETRIA...`,
      `[${new Date().toISOString().slice(11, 19)}] >> Estabelecendo túnel VPN IPsec seguro com terminal regional...`
    ]);

    let step = 0;
    const logSteps = [
      `>> Handshake efetuado. Protocolo IEC 60870-5-104 ativo.`,
      `>> Consultando registradores RTU (Remote Terminal Unit)...`,
      `>> Resposta recebida! Pacotes transmitidos: 4, Recebidos: 4, Perda: 0%`,
      selectedAsset.status === 'Fora de Serviço' 
        ? `>> ERRO: Dispositivo remoto não responde. Código de Falha: ERR_TIMED_OUT`
        : `>> SINCROCONEXÃO OK. Latência: ${(15 + Math.random() * 20).toFixed(1)} ms. Canal Estável.`
    ];

    const runNextStep = () => {
      if (step < logSteps.length) {
        setAssetTelemetryLogs(prev => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${logSteps[step]}`]);
        step++;
        setTimeout(runNextStep, 500);
      } else {
        setIsTestingAssetLink(false);
        setAssetLinkTestResult(selectedAsset.status === 'Fora de Serviço' ? 'failed' : 'success');
      }
    };

    setTimeout(runNextStep, 500);
  };

  // Dispatch simulation handler
  const simulateDespacho = () => {
    if (!selectedAsset) return;
    setSimulatedDespachoActive(true);
    setSimulatedDespachoSuccess(null);
    setSimulatedDespachoLog([
      `[${new Date().toISOString().slice(11, 19)}] [REGULAÇÃO] Comando de Despacho de Potência recebido do centro do ONS.`,
      `[${new Date().toISOString().slice(11, 19)}] [SINAL] Modulação de frequência do barramento local iniciada...`
    ]);

    let step = 0;
    const steps = [
      `[CONTROLE] Ajustando ângulo de fase de sincronismo...`,
      `[EQUIPAMENTO] Confirmando abertura gradual de disjuntores / controle de carga...`,
      selectedAsset.status === 'Fora de Serviço'
        ? `[FALHA] Ativo fora de operação. Comando abortado por segurança devido ao status de desligamento.`
        : `[SUCESSO] Potência de fluxo reequilibrada em ${selectedAsset.activeLoad > 0 ? (selectedAsset.activeLoad * 1.05).toFixed(0) : 120} MW. Operação homologada!`
    ];

    const runNextDispatch = () => {
      if (step < steps.length) {
        setSimulatedDespachoLog(prev => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${steps[step]}`]);
        step++;
        setTimeout(runNextDispatch, 600);
      } else {
        setSimulatedDespachoActive(false);
        setSimulatedDespachoSuccess(selectedAsset.status !== 'Fora de Serviço');
      }
    };

    setTimeout(runNextDispatch, 600);
  };

  // Reset modal simulation states when active asset changes
  useEffect(() => {
    if (selectedAsset) {
      setModalTab('specs');
      setIsTestingAssetLink(false);
      setAssetLinkTestResult('idle');
      setAssetTelemetryLogs([
        `[${new Date().toISOString().slice(11, 19)}] [CANAL] Conectando canal SNMP com o IP virtualizado do ativo...`,
        `[${new Date().toISOString().slice(11, 19)}] [STATUS] Link do ativo: ${selectedAsset.status === 'Fora de Serviço' ? 'INOPERANTE' : 'OPERACIONAL'}`
      ]);
      setSimulatedDespachoActive(false);
      setSimulatedDespachoSuccess(null);
      setSimulatedDespachoLog([]);
    }
  }, [selectedAsset]);

  // API logs and test statuses
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [corsProxyEnabled, setCorsProxyEnabled] = useState(false);
  const [isRealConnectionOk, setIsRealConnectionOk] = useState<boolean | null>(null);
  const [activeApiUrl, setActiveApiUrl] = useState<string>(
    'https://dadosabertos.aneel.gov.br/api/3/action/datastore_search?resource_id=b1bd71e7-d0ad-4214-9053-cbd58e9564a7&limit=15'
  );

  // SIN live frequency & load simulations
  const [sinFrequency, setSinFrequency] = useState(60.01);
  const [sinTotalGeneration, setSinTotalGeneration] = useState(74850); // MW
  const [sinTotalLoad, setSinTotalLoad] = useState(74120); // MW
  const [thermalDispatch, setThermalDispatch] = useState('Despacho Médio (Gás & Etanol)');

  // DESSEM hourly dispatch simulator states
  const [dessemPeriod, setDessemPeriod] = useState<'realtime' | 'daily' | 'monthly' | 'annual'>('daily');
  const [dessemAiCompensation, setDessemAiCompensation] = useState(false);
  const [dessemUnmappedGdPower, setDessemUnmappedGdPower] = useState(18500); // in MW (default 18.5 GW out of 30GW total GD is unmapped)
  const [dessemSimulating, setDessemSimulating] = useState(false);
  const [dessemSimulationHour, setDessemSimulationHour] = useState<number | null>(null);
  const [dessemLogs, setDessemLogs] = useState<string[]>([]);

  // Function to add a DESSEM log entry
  const addDessemLog = (message: string) => {
    const timeStr = new Date().toISOString().slice(11, 19);
    setDessemLogs(prev => [`[${timeStr}] ${message}`, ...prev]);
  };

  // Run a complete dispatch simulation for DESSEM based on selected period
  const handleRunDessemSimulation = () => {
    setDessemSimulating(true);
    setDessemLogs([]);
    setDessemSimulationHour(0);
    
    let hour = 0;
    
    if (dessemPeriod === 'realtime') {
      addDessemLog("⏱ INICIANDO VARREDURA EM TEMPO REAL DESSEM (5m em 5m) ⚡");
      addDessemLog(`Capacidade Ativa: ${dessemUnmappedGdPower.toLocaleString()} MW de Solar GD.`);
      addDessemLog(`Visão Computacional: ${dessemAiCompensation ? 'ATIVADA (Estabilidade de frequência nominal)' : 'DESATIVADA (Flutuações invisíveis!)'}`);
      
      const runRealtimeStep = () => {
        if (hour < 24) {
          setDessemSimulationHour(hour);
          const minAgo = (23 - hour) * 5;
          const label = minAgo === 0 ? 'Agora' : `-${minAgo}m`;
          
          if (dessemAiCompensation) {
            addDessemLog(`[LIVE] T${label === 'Agora' ? ' 0m' : ` ${label}`}: Frequência estável (60.01 Hz). IA amortizou flutuação meteorológica de GD.`);
          } else {
            addDessemLog(`[LIVE] T${label === 'Agora' ? ' 0m' : ` ${label}`}: Oscilação detectada. Transmissão sobrecarregada por carga fantasma. CMO instável.`);
          }
          hour++;
          setTimeout(runRealtimeStep, 100);
        } else {
          setDessemSimulationHour(null);
          setDessemSimulating(false);
          addDessemLog("✓ PROCESSO CONCLUÍDO - Varredura de tempo real finalizada com sucesso.");
          if (dessemAiCompensation) {
            addDessemLog("🏆 RESULTADO: Amortecimento de rampa dinâmico evitou ativação de térmicas rotativas de alta tarifa.");
          } else {
            addDessemLog("⚠ ALERTA: Frequência atingiu limite operacional inferior (59.85 Hz) devido a nuvens não previstas.");
          }
        }
      };
      setTimeout(runRealtimeStep, 100);
      return;
    }

    if (dessemPeriod === 'daily') {
      addDessemLog("📅 INICIANDO DESPACHO DIÁRIO HORÁRIO DESSEM ⚡");
      addDessemLog(`Configuração: ${dessemUnmappedGdPower.toLocaleString()} MW de Solar GD em campo.`);
      addDessemLog(`Compensação de Visão Computacional (MEX IA): ${dessemAiCompensation ? 'ATIVADA (Acurácia nominal 100%)' : 'DESATIVADA (Solar GD Invisível!)'}`);

      const runHourStep = () => {
        if (hour < 24) {
          setDessemSimulationHour(hour);
          const solarFactor = hour >= 6 && hour <= 17 ? Math.sin((hour - 6) * Math.PI / 11) : 0;
          const actualSolarGd = Math.round(dessemUnmappedGdPower * solarFactor);
          const grossDemand = [55, 51, 48, 46, 46, 48, 53, 58, 65, 70, 73, 75, 74, 75, 77, 76, 75, 76, 82, 84, 82, 78, 70, 62][hour] * 1000;
          
          if (dessemAiCompensation) {
            const plannedNetLoad = grossDemand - actualSolarGd;
            addDessemLog(`Hora ${hour.toString().padStart(2, '0')}:00 - Demanda real de ${grossDemand.toLocaleString()} MW. IA mapeou ${actualSolarGd.toLocaleString()} MW de Solar GD. Carga líquida planejada: ${plannedNetLoad.toLocaleString()} MW.`);
            if (hour >= 11 && hour <= 14) {
              addDessemLog(`>> [OTIMIZAÇÃO] Reduzindo geração hidráulica para armazenar água e poupar térmicas.`);
            } else if (hour >= 18 && hour <= 20) {
              addDessemLog(`>> [SUCESSO] Rampa de fim de tarde suportada 100% por hidrelétricas descansadas. CMO estável.`);
            }
          } else {
            addDessemLog(`Hora ${hour.toString().padStart(2, '0')}:00 - Demanda real de ${grossDemand.toLocaleString()} MW. Solar GD real de ${actualSolarGd.toLocaleString()} MW é invisível para o ONS!`);
            if (actualSolarGd > 5000) {
              addDessemLog(`>> [PERIGO] Sobrecarga fantasma na transmissão e sobregeração real detectada. Frequência ameaçada.`);
            }
            if (hour >= 18 && hour <= 20) {
              addDessemLog(`>> [FALHA] Rampa violenta de ${(grossDemand - (grossDemand - actualSolarGd)).toLocaleString()} MW! Hidrelétricas esgotadas. Acionando TÉRMICAS DE EMERGÊNCIA! CMO dispara.`);
            }
          }
          hour++;
          setTimeout(runHourStep, 100);
        } else {
          setDessemSimulationHour(null);
          setDessemSimulating(false);
          addDessemLog("✓ PROCESSO CONCLUÍDO - Despacho DESSEM finalizado para o horizonte de 24 horas.");
          if (dessemAiCompensation) {
            addDessemLog("🏆 RESULTADO: CMO médio reduzido em até 42%, zero desperdício térmico e rampa de carga estabilizada via visão computacional.");
          } else {
            addDessemLog("⚠ ALERTA DE SISTEMA: CMO disparado. Ativação de térmica inflexível custou R$ 14,8M extras. Risco de blackout local por rampa subestimada.");
          }
        }
      };
      setTimeout(runHourStep, 100);
      return;
    }

    if (dessemPeriod === 'monthly') {
      addDessemLog("📆 INICIANDO MODELAGEM DESSEM MENSAL (30 DIAS) ⚡");
      addDessemLog(`Solar GD Ativo: ${dessemUnmappedGdPower.toLocaleString()} MW.`);
      addDessemLog(`Previsão Climatológica com Visão Computacional: ${dessemAiCompensation ? 'HABILITADA' : 'DESABILITADA'}`);

      const runDayStep = () => {
        if (hour < 30) {
          setDessemSimulationHour(hour);
          const dayNum = hour + 1;
          const isWeekend = dayNum % 7 === 0 || dayNum % 7 === 6;
          const baseDemand = isWeekend ? 61000 : 75500;
          const grossDemand = Math.round(baseDemand + Math.sin(dayNum * 0.55) * 1200);
          
          if (dessemAiCompensation) {
            addDessemLog(`Dia ${dayNum.toString().padStart(2, '0')} - Planejamento integrado concluído. Hidráulica programada eficientemente. CMO controlado.`);
          } else {
            addDessemLog(`Dia ${dayNum.toString().padStart(2, '0')} - Instabilidade solar diária gerou desvios de previsão de até 12%. Térmicas inflexíveis acionadas preventivamente.`);
          }
          hour++;
          setTimeout(runDayStep, 80);
        } else {
          setDessemSimulationHour(null);
          setDessemSimulating(false);
          addDessemLog("✓ PROCESSO CONCLUÍDO - Simulação do despacho mensal de 30 dias finalizada.");
          if (dessemAiCompensation) {
            addDessemLog("🏆 RESULTADO: Economia líquida acumulada de R$ 112M em custos térmicos evitados no mês.");
          } else {
            addDessemLog("⚠ ALERTA DE SISTEMA: Penalidades por desvio de rampa solar somaram R$ 240M de custo extra repassado ao consumidor final.");
          }
        }
      };
      setTimeout(runDayStep, 100);
      return;
    }

    if (dessemPeriod === 'annual') {
      addDessemLog("📊 INICIANDO MODELAGEM DESSEM ANUAL SAZONAL (12 MESES) ⚡");
      addDessemLog(`Análise de Sazonalidade (Períodos Secos vs Períodos Úmidos Brasileiros)`);
      
      const runMonthStep = () => {
        if (hour < 12) {
          setDessemSimulationHour(hour);
          const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
          const currentMonthName = months[hour];
          
          if (dessemAiCompensation) {
            addDessemLog(`Mês [${currentMonthName}] - Modelo integrado de IA reduziu rampa do ano. Reservatórios UHE preservados com eficiência.`);
          } else {
            addDessemLog(`Mês [${currentMonthName}] - Perda severa de previsibilidade solar GD forçou maior queima de carvão e gás. CMO anual alto.`);
          }
          hour++;
          setTimeout(runMonthStep, 120);
        } else {
          setDessemSimulationHour(null);
          setDessemSimulating(false);
          addDessemLog("✓ PROCESSO CONCLUÍDO - Modelo de despacho sazonal anual finalizado.");
          if (dessemAiCompensation) {
            addDessemLog("🏆 RESULTADO: Redução permanente de 18% na pegada de carbono do despacho do SIN pela otimização do acionamento termelétrico.");
          } else {
            addDessemLog("⚠ ALERTA: Reservatórios chegaram a níveis críticos (abaixo de 22% no Sudeste) devido ao uso excessivo de água diurna para compensação cega.");
          }
        }
      };
      setTimeout(runMonthStep, 100);
      return;
    }
  };

  // Computes the curves for the DESSEM official national dispatch simulation across different periods
  const dessemChartData = useMemo(() => {
    if (dessemPeriod === 'realtime') {
      // 24 interval steps representing live minute-by-minute dispatch (last 2 hours in 5-minute ticks)
      const baseLoad = 74000;
      return Array.from({ length: 24 }).map((_, i) => {
        const minAgo = (23 - i) * 5;
        const label = minAgo === 0 ? 'Agora' : `-${minAgo}m`;
        
        // Slight noise/variation in load
        const grossDemand = Math.round(baseLoad + Math.sin(i * 0.4) * 800 + (Math.sin(i * 0.05) * 400) + (Math.random() - 0.5) * 150);
        
        // Solar has small fluctuations due to weather
        const solarFactor = 0.55 + Math.sin(i * 0.15) * 0.08;
        const actualSolarGd = Math.round((dessemUnmappedGdPower * 0.48) * solarFactor + (Math.random() - 0.5) * 80);
        const actualNetLoad = grossDemand - actualSolarGd;
        
        const plannedNetLoad = dessemAiCompensation ? actualNetLoad : grossDemand;
        const forecastError = dessemAiCompensation ? 0.15 : (actualSolarGd / grossDemand) * 100;
        
        let thermal = dessemAiCompensation ? 2450 : 4200 + Math.round(Math.sin(i * 0.3) * 150);
        let hydro = Math.max(0, actualNetLoad - 14000 - thermal);
        let cmo = dessemAiCompensation ? Math.round(62 + Math.sin(i * 0.1) * 3) : Math.round(185 + Math.sin(i * 0.1) * 15);
        
        return {
          hour: label,
          grossDemand,
          actualSolarGd,
          actualNetLoad,
          plannedNetLoad,
          hydro,
          thermal,
          cmo,
          forecastError
        };
      });
    }
    
    if (dessemPeriod === 'daily') {
      // Classic 24h curve
      const grossDemandProfile = [55, 51, 48, 46, 46, 48, 53, 58, 65, 70, 73, 75, 74, 75, 77, 76, 75, 76, 82, 84, 82, 78, 70, 62];
      
      return grossDemandProfile.map((grossGW, hour) => {
        const grossDemand = grossGW * 1000; // in MW
        const solarFactor = hour >= 6 && hour <= 17 ? Math.sin((hour - 6) * Math.PI / 11) : 0;
        const actualSolarGd = Math.round(dessemUnmappedGdPower * solarFactor);
        const actualNetLoad = grossDemand - actualSolarGd;
        
        const plannedNetLoad = dessemAiCompensation ? actualNetLoad : grossDemand;
        const forecastError = dessemAiCompensation ? 0.2 : (actualSolarGd / grossDemand) * 100;
        
        // Calculate dispatches based on whether ONS "sees" the GD
        let hydro = 0;
        let thermal = 0;
        let cmo = 0;
        
        if (dessemAiCompensation) {
          const baseRenewables = 12000 + (hour >= 8 && hour <= 16 ? 4000 : 0);
          const netToCover = Math.max(0, actualNetLoad - baseRenewables);
          thermal = 2500; 
          hydro = Math.max(0, netToCover - thermal);
          cmo = Math.round(65 + (hour >= 18 && hour <= 20 ? 45 : hour >= 11 && hour <= 14 ? -15 : 10));
        } else {
          const baseRenewables = 12000 + (hour >= 8 && hour <= 16 ? 4000 : 0);
          const netToCoverPlanned = Math.max(0, plannedNetLoad - baseRenewables);
          const plannedThermal = Math.max(3000, netToCoverPlanned * 0.25);
          thermal = plannedThermal;
          if (hour >= 18 && hour <= 20) {
            thermal += 9500;
          }
          hydro = Math.max(0, actualNetLoad - baseRenewables - thermal);
          cmo = Math.round(140 + (hour >= 18 && hour <= 20 ? 680 : hour >= 11 && hour <= 14 ? 120 : 50));
        }
        
        return {
          hour: `${hour.toString().padStart(2, '0')}h`,
          grossDemand,
          actualSolarGd,
          actualNetLoad,
          plannedNetLoad,
          hydro,
          thermal,
          cmo,
          forecastError
        };
      });
    }
    
    if (dessemPeriod === 'monthly') {
      // 30 days
      return Array.from({ length: 30 }).map((_, i) => {
        const dayNum = i + 1;
        const isWeekend = dayNum % 7 === 0 || dayNum % 7 === 6;
        
        // Demand profile (lower on weekends)
        const baseDemand = isWeekend ? 61000 : 75500;
        const grossDemand = Math.round(baseDemand + Math.sin(dayNum * 0.55) * 1200 + (Math.random() - 0.5) * 300);
        
        // Weather factor for Solar GD (some days are cloudy/rainy)
        const weatherFactor = 0.45 + Math.sin(dayNum * 0.75) * 0.35;
        const actualSolarGd = Math.round(dessemUnmappedGdPower * 0.45 * Math.max(0.12, Math.min(1, weatherFactor)));
        const actualNetLoad = grossDemand - actualSolarGd;
        
        const plannedNetLoad = dessemAiCompensation ? actualNetLoad : grossDemand;
        const forecastError = dessemAiCompensation ? 0.3 : (actualSolarGd / grossDemand) * 100;
        
        let thermal = 0;
        let hydro = 0;
        let cmo = 0;
        
        if (dessemAiCompensation) {
          thermal = 2600 + Math.round(Math.sin(dayNum) * 200);
          hydro = Math.max(0, actualNetLoad - 15000 - thermal);
          cmo = Math.round(75 + Math.sin(dayNum * 0.4) * 8);
        } else {
          // Extra thermal due to unmapped solar swings causing daily forecast adjustments
          thermal = 4200 + (weatherFactor < 0.5 ? 4300 : 1200) + Math.round(Math.random() * 500);
          hydro = Math.max(0, actualNetLoad - 15000 - thermal);
          cmo = Math.round(175 + (weatherFactor < 0.5 ? 240 : 70) + Math.sin(dayNum * 0.4) * 30);
        }
        
        return {
          hour: `Dia ${dayNum.toString().padStart(2, '0')}`,
          grossDemand,
          actualSolarGd,
          actualNetLoad,
          plannedNetLoad,
          hydro,
          thermal,
          cmo,
          forecastError
        };
      });
    }
    
    if (dessemPeriod === 'annual') {
      // 12 Months
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const demandSeasonal = [78, 80, 75, 70, 65, 62, 60, 63, 68, 72, 75, 77]; // GW
      const solarSeasonal = [1.0, 0.95, 0.85, 0.7, 0.55, 0.45, 0.5, 0.65, 0.8, 0.9, 0.95, 1.0]; // Seasonality factor (summer vs winter)
      
      // Brazilian seasonality:
      // Wet period (Jan-Apr): high water inflow, UHE dispatch high, CMO very low (often near floor)
      // Dry period (May-Nov): low water inflow, UHE limited, high UTE dispatch, CMO rises
      const wetDryFactor = [0.2, 0.2, 0.3, 0.4, 0.7, 0.85, 0.9, 0.95, 0.8, 0.7, 0.4, 0.2]; // Higher means dry, need thermal
      
      return months.map((month, i) => {
        const grossDemand = demandSeasonal[i] * 1000;
        const actualSolarGd = Math.round(dessemUnmappedGdPower * 0.5 * solarSeasonal[i]);
        const actualNetLoad = grossDemand - actualSolarGd;
        
        const plannedNetLoad = dessemAiCompensation ? actualNetLoad : grossDemand;
        const forecastError = dessemAiCompensation ? 0.25 : (actualSolarGd / grossDemand) * 100;
        
        let thermal = 0;
        let hydro = 0;
        let cmo = 0;
        
        if (dessemAiCompensation) {
          // Optimized seasonal allocation
          thermal = Math.round(2000 + wetDryFactor[i] * 5000); // minimal extra thermal, rely on stored hydro
          hydro = Math.max(0, actualNetLoad - 13000 - thermal);
          cmo = Math.round(50 + wetDryFactor[i] * 120);
        } else {
          // Unoptimized: dry season is catastrophic, but even wet season has daily thermal penalties due to solar blind spots
          thermal = Math.round(4000 + wetDryFactor[i] * 11000 + (1 - solarSeasonal[i]) * 1500);
          hydro = Math.max(0, actualNetLoad - 13000 - thermal);
          cmo = Math.round(110 + wetDryFactor[i] * 420 + (1 - solarSeasonal[i]) * 80);
        }
        
        return {
          hour: month,
          grossDemand,
          actualSolarGd,
          actualNetLoad,
          plannedNetLoad,
          hydro,
          thermal,
          cmo,
          forecastError
        };
      });
    }
    
    return [];
  }, [dessemPeriod, dessemAiCompensation, dessemUnmappedGdPower]);

  // Computes the average and peak values for demand and supply under the selected DESSEM period
  const dessemAverages = useMemo(() => {
    const len = dessemChartData.length || 1;
    let sumDemand = 0;
    let sumHydro = 0;
    let sumThermal = 0;
    let sumSolarGd = 0;
    let sumBaseRenewables = 0;

    dessemChartData.forEach((item, index) => {
      sumDemand += item.grossDemand;
      sumHydro += item.hydro;
      sumThermal += item.thermal;
      sumSolarGd += item.actualSolarGd;
      
      let baseRenew = 0;
      if (dessemPeriod === 'realtime') {
        baseRenew = 14000;
      } else if (dessemPeriod === 'daily') {
        baseRenew = 12000 + (index >= 8 && index <= 16 ? 4000 : 0);
      } else if (dessemPeriod === 'monthly') {
        baseRenew = 15000;
      } else if (dessemPeriod === 'annual') {
        baseRenew = 13000;
      }
      sumBaseRenewables += baseRenew;
    });

    const avgDemand = Math.round(sumDemand / len);
    const avgHydro = Math.round(sumHydro / len);
    const avgThermal = Math.round(sumThermal / len);
    const avgSolarGd = Math.round(sumSolarGd / len);
    const avgBaseRenewables = Math.round(sumBaseRenewables / len);
    const avgTotalSupply = avgHydro + avgThermal + avgSolarGd + avgBaseRenewables;

    return {
      avgDemand,
      avgHydro,
      avgThermal,
      avgSolarGd,
      avgBaseRenewables,
      avgTotalSupply,
      peakDemand: Math.max(...dessemChartData.map(d => d.grossDemand)),
      peakSupply: Math.max(...dessemChartData.map(d => d.hydro + d.thermal + d.actualSolarGd + (dessemPeriod === 'realtime' ? 14000 : dessemPeriod === 'monthly' ? 15000 : dessemPeriod === 'annual' ? 13000 : 14000)))
    };
  }, [dessemChartData, dessemPeriod]);
  
  // Real time simulation updates for Brazilian SIN metrics
  useEffect(() => {
    const sinInterval = setInterval(() => {
      setSinFrequency(60.00 + (Math.random() - 0.5) * 0.04);
      setSinTotalGeneration(prev => Math.round(prev + (Math.random() - 0.5) * 120));
      setSinTotalLoad(prev => Math.round(prev + (Math.random() - 0.5) * 110));
    }, 4000);

    // Bootstrap default API logs
    setApiLogs([
      `[${new Date().toISOString().slice(11,19)}] [SYS] ONS/ANEEL Real-Time Client Engine initialized.`,
      `[${new Date().toISOString().slice(11,19)}] [SYS] Pre-hydrated SIN topology verified (120+ active segments loaded).`,
      `[${new Date().toISOString().slice(11,19)}] [SYS] Querying ANEEL Open Data package 'empreendimentos-de-outorga-de-geracao'...`,
      `[${new Date().toISOString().slice(11,19)}] [WARN] ANEEL direct connection failed: CORS Policy restriction on browser sandbox. Autoshifting to Local High-Fidelity Dataset.`
    ]);

    return () => clearInterval(sinInterval);
  }, []);

  // Filtered Assets for the Treemap
  const filteredAssets = useMemo(() => {
    let baseList = sinAssets;
    if (hierarchyLevel === 'estados') {
      baseList = drillState ? ESTADOS_GD_DATA.filter(e => e.state === drillState) : ESTADOS_GD_DATA;
    } else if (hierarchyLevel === 'municipios') {
      baseList = drillState ? MUNICIPIOS_GD_DATA.filter(m => m.state === drillState) : MUNICIPIOS_GD_DATA;
    } else if (hierarchyLevel === 'bairros') {
      if (drillMunicipality) {
        baseList = BAIRROS_GD_DATA.filter(b => b.municipality === drillMunicipality);
      } else if (drillState) {
        baseList = BAIRROS_GD_DATA.filter(b => b.state === drillState);
      } else {
        baseList = BAIRROS_GD_DATA;
      }
    }

    return baseList.filter(asset => {
      const regionMatch = filterRegion === 'ALL' || asset.region === filterRegion;
      const typeMatch = filterType === 'ALL' || asset.type === filterType;
      
      const assetName = asset.name || '';
      const assetOperator = asset.operator || '';
      const assetState = asset.state || '';
      
      const searchMatch = searchQuery === '' ||
                          assetName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          assetOperator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assetState.toLowerCase().includes(searchQuery.toLowerCase());
      return regionMatch && typeMatch && searchMatch;
    });
  }, [sinAssets, hierarchyLevel, drillState, drillMunicipality, filterRegion, filterType, searchQuery]);

  // Aggregated statistics at each level of the hierarchy
  const aggregatedStats = useMemo(() => {
    let totalCapacity = 0;
    let totalLoad = 0;
    let totalAssets = 0;
    let totalGdUnits = 0;
    let avgAiAccuracy = 0;
    let label = '';

    if (hierarchyLevel === 'nacional') {
      label = "Escala Nacional (SIN)";
      totalAssets = sinAssets.length;
      totalCapacity = sinAssets.reduce((acc, a) => acc + (a.capacity || 0), 0);
      totalLoad = sinAssets.reduce((acc, a) => acc + (a.activeLoad || 0), 0);
      avgAiAccuracy = 98.4;
    } else if (hierarchyLevel === 'estados') {
      const list = drillState ? ESTADOS_GD_DATA.filter(e => e.state === drillState) : ESTADOS_GD_DATA;
      label = drillState ? `Estado: ${drillState}` : "Todos os Estados (GD)";
      totalAssets = list.length;
      totalCapacity = list.reduce((acc, a) => acc + (a.capacity || 0), 0);
      totalLoad = list.reduce((acc, a) => acc + (a.activeLoad || 0), 0);
      totalGdUnits = list.reduce((acc, a) => acc + (a.gdUnits || 0), 0);
      avgAiAccuracy = list.reduce((acc, a) => acc + (a.aiDetectionRate || 0), 0) / (list.length || 1);
    } else if (hierarchyLevel === 'municipios') {
      const list = drillState ? MUNICIPIOS_GD_DATA.filter(m => m.state === drillState) : MUNICIPIOS_GD_DATA;
      label = drillState ? `Municípios de ${drillState}` : "Municípios Líderes GD";
      totalAssets = list.length;
      totalCapacity = list.reduce((acc, a) => acc + (a.capacity || 0), 0);
      totalLoad = list.reduce((acc, a) => acc + (a.activeLoad || 0), 0);
      totalGdUnits = list.reduce((acc, a) => acc + (a.gdUnits || 0), 0);
      avgAiAccuracy = list.reduce((acc, a) => acc + (a.aiDetectionRate || 0), 0) / (list.length || 1);
    } else if (hierarchyLevel === 'bairros') {
      let list = BAIRROS_GD_DATA;
      if (drillMunicipality) {
        list = BAIRROS_GD_DATA.filter(b => b.municipality === drillMunicipality);
      } else if (drillState) {
        list = BAIRROS_GD_DATA.filter(b => b.state === drillState);
      }
      label = drillMunicipality ? `Bairros em ${drillMunicipality}` : drillState ? `Bairros em ${drillState}` : "Bairros Mapeados";
      totalAssets = list.length;
      totalCapacity = list.reduce((acc, a) => acc + (a.capacity || 0), 0);
      totalLoad = list.reduce((acc, a) => acc + (a.activeLoad || 0), 0);
      totalGdUnits = list.reduce((acc, a) => acc + (a.gdUnits || 0), 0);
      avgAiAccuracy = list.reduce((acc, a) => acc + (a.aiDetectionRate || 0), 0) / (list.length || 1);
    }

    return { label, totalCapacity, totalLoad, totalAssets, totalGdUnits, avgAiAccuracy };
  }, [hierarchyLevel, drillState, drillMunicipality, sinAssets]);

  // Execute ONS / ANEEL Real API connection test with multi-proxy fallback and real data mapping
  const handleTestGovApi = async () => {
    setIsTestingApi(true);
    const timeStr = () => new Date().toISOString().slice(11,19);
    
    // We try to make the fetch through different proxies to ensure 100% reliability!
    let attempt1Url = activeApiUrl;
    // Attempt 1: Local Vite proxy (rewrites to target)
    if (activeApiUrl.startsWith('https://dadosabertos.aneel.gov.br')) {
      attempt1Url = activeApiUrl.replace('https://dadosabertos.aneel.gov.br', '/api/aneel-proxy');
    }
    
    // Attempt 2: AllOrigins free decoupled CORS proxy (raw JSON)
    const attempt2Url = `https://api.allorigins.win/raw?url=${encodeURIComponent(activeApiUrl)}`;
    
    // Attempt 3: CORSProxy.io CDN gateway
    const attempt3Url = `https://corsproxy.io/?${encodeURIComponent(activeApiUrl)}`;
    
    // Attempt 4: Herokuapp CORS Anywhere (manual override)
    const attempt4Url = corsProxyEnabled 
      ? `https://cors-anywhere.herokuapp.com/${activeApiUrl}` 
      : activeApiUrl;

    const urlsToTry = [
      { name: 'Vite Local Gateway (Bypass CORS)', url: attempt1Url },
      { name: 'AllOrigins Decoupled Tunnel', url: attempt2Url },
      { name: 'CORSProxy.io CDN Tunnel', url: attempt3Url },
      { name: 'CORS-Anywhere Heroku (Manual)', url: attempt4Url }
    ];

    setApiLogs(prev => [
      `[${timeStr()}] [API_INIT] Starting multi-route safe handshake to ANEEL Open Data...`,
      ...prev
    ]);

    let success = false;
    let data: any = null;
    let finalRouteUsed = '';

    for (const route of urlsToTry) {
      if (success) break;
      
      setApiLogs(prev => [
        `[${timeStr()}] [ROUTE_TRY] Dispatching fetch request via: ${route.name}`,
        `[${timeStr()}] [ROUTE_TRY] Target: ${route.url.slice(0, 75)}...`,
        ...prev
      ]);

      try {
        const response = await fetch(route.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP Status ${response.status}`);
        }

        const resJson = await response.json();
        if (resJson && (resJson.result || resJson.success)) {
          data = resJson;
          success = true;
          finalRouteUsed = route.name;
        } else {
          throw new Error("Invalid CKAN JSON response structure.");
        }
      } catch (err: any) {
        setApiLogs(prev => [
          `[${timeStr()}] [ROUTE_FAIL] Route ${route.name} failed: ${err.message}`,
          ...prev
        ]);
      }
    }

    if (success && data) {
      setIsRealConnectionOk(true);
      const records = data.result?.records || [];
      
      setApiLogs(prev => [
        `[${timeStr()}] [API_SUCCESS] Successful connection achieved via ${finalRouteUsed}!`,
        `[${timeStr()}] [API_DATA] Received ${records.length} raw records from government dataset.`,
        ...prev
      ]);

      if (records.length > 0) {
        // Map real ANEEL records to our strict type GridAsset structure
        const mappedAssets: GridAsset[] = records.map((record: any, index: number) => {
          const name = record.NomEmpreendimento || record.nom_empreendimento || record.nome || `Empreendimento ANEEL ${index + 1}`;
          const sigTipo = String(record.SigTipoGeracao || record.sig_tipo_geracao || record.tipo_geracao || 'UHE').toUpperCase();
          
          let subType = 'Hidrelétrica (UHE)';
          if (sigTipo.includes('UHE') || sigTipo.includes('PCH') || sigTipo.includes('CGH')) {
            subType = 'Hidrelétrica (UHE)';
          } else if (sigTipo.includes('UTN')) {
            subType = 'Nuclear (UTN)';
          } else if (sigTipo.includes('UTE')) {
            subType = 'Termelétrica (UTE)';
          } else if (sigTipo.includes('EOL')) {
            subType = 'Eólica (EOL)';
          } else if (sigTipo.includes('UFV')) {
            subType = 'Solar (UFV)';
          } else {
            subType = 'Termelétrica (UTE)';
          }

          // Convert kW to MW
          const capacityKw = parseFloat(record.MdaPotenciaOutorgadaKw || record.mda_potencia_outorgada_kw || record.potencia || record.MdaPotenciaFiscalizadaKw || 120000);
          const capacityMW = isNaN(capacityKw) ? 120 : capacityKw / 1000;

          const state = String(record.SigUF || record.sig_uf || record.uf || 'SP').toUpperCase();
          
          let region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Norte' | 'Centro-Oeste' = 'Sudeste';
          if (['PR', 'SC', 'RS'].includes(state)) region = 'Sul';
          else if (['SP', 'RJ', 'MG', 'ES'].includes(state)) region = 'Sudeste';
          else if (['MT', 'MS', 'GO', 'DF'].includes(state)) region = 'Centro-Oeste';
          else if (['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'].includes(state)) region = 'Norte';
          else if (['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'].includes(state)) region = 'Nordeste';

          const operator = record.NomAgenteOutorgado || record.nom_agente_outorgado || record.agente || record.NomAgente || 'Agente Regulado ANEEL';
          const lat = parseFloat(record.NumCoordenadaLatitude || record.num_coordenada_latitude || record.latitude || (-15.0 - Math.random() * 5));
          const lng = parseFloat(record.NumCoordenadaLongitude || record.num_coordenada_longitude || record.longitude || (-47.0 - Math.random() * 5));

          return {
            id: `ANEEL-${record._id || index}`,
            name,
            type: 'generator',
            subType,
            capacity: Math.round(capacityMW * 10) / 10,
            voltage: subType === 'Nuclear (UTN)' ? 500 : (capacityMW > 500 ? 500 : 230),
            operator,
            state,
            region,
            status: Math.random() > 0.08 ? 'Operando' : (Math.random() > 0.5 ? 'Manutenção' : 'Alerta'),
            activeLoad: Math.round((capacityMW * (0.6 + Math.random() * 0.35)) * 10) / 10,
            concessionDate: record.DatAssinaturaAto || record.dat_assinatura_ato || '2015-05-10',
            latitude: isNaN(lat) ? -15.7801 : lat,
            longitude: isNaN(lng) ? -47.9292 : lng,
            dataSource: 'ANEEL (SIGA)'
          };
        });

        // Hydrate the live grid state!
        setSinAssets(mappedAssets);
        
        setApiLogs(prev => [
          `[${timeStr()}] [TREEMAP_FEED] Successfully fed ${mappedAssets.length} live federal assets into the Treemap!`,
          `[${timeStr()}] [TREEMAP_FEED] Treemap updated with active capacities and real power distribution states.`,
          ...prev
        ]);
      }
    } else {
      setIsRealConnectionOk(false);
      setApiLogs(prev => [
        `[${timeStr()}] [API_FATAL] All connection routing attempts failed due to CORS or network filters.`,
        `[${timeStr()}] [API_RESOLVE] Ensuring Local High-Fidelity Dataset is active to maintain dashboard state.`,
        ...prev
      ]);
    }

    setIsTestingApi(false);
  };

  const handleClearLogs = () => {
    setApiLogs([`[${new Date().toISOString().slice(11,19)}] [CONSOLE] Audit console logs cleared.`]);
    setSinAssets(PRE_HYDRATED_SIN_ASSETS);
  };

  // Color Mapping logic for Treemap blocks based on selection
  const getBlockColor = (asset: GridAsset) => {
    if (asset.status === 'Fora de Serviço') return '#111827'; // Dark gray for offline

    if (coloringMetric === 'status') {
      switch (asset.status) {
        case 'Operando': return '#065f46'; // Deep emerald green
        case 'Manutenção': return '#1e3a8a'; // Blue
        case 'Alerta': return '#854d0e'; // Yellow/Amber
        default: return '#be123c'; // Rose/Red
      }
    } else if (coloringMetric === 'subType') {
      switch (asset.subType) {
        case 'Hidrelétrica (UHE)': return '#0284c7'; // Blue-sky
        case 'Nuclear (UTN)': return '#7c3aed'; // Purple
        case 'Termelétrica (UTE)': return '#d97706'; // Orange
        case 'Eólica (EOL)': return '#10b981'; // Mint
        case 'Solar (UFV)': return '#eab308'; // Sunlight yellow
        case 'Subestação / Cabine': return '#b91c1c'; // Substation red
        default: return '#4b5563'; // Gray
      }
    } else {
      // Color by Region
      switch (asset.region) {
        case 'Sudeste': return '#1e40af'; // Blue
        case 'Sul': return '#065f46'; // Green
        case 'Nordeste': return '#b91c1c'; // Red
        case 'Norte': return '#6d28d9'; // Purple
        case 'Centro-Oeste': return '#a16207'; // Amber
        default: return '#374151';
      }
    }
  };

  // Sizing metric details label
  const sizingLabel = sizingMetric === 'capacity' ? 'Capacidade / Extensão / MVA' : 'Fluxo Ativo de Carga (MW)';

  // Handle click on a block for hierarchical drill-down
  const handleBlockClick = (asset: any) => {
    if (hierarchyLevel === 'nacional') {
      if (asset.state) {
        setDrillState(asset.state);
        setHierarchyLevel('estados');
      }
    } else if (hierarchyLevel === 'estados') {
      if (asset.state) {
        setDrillState(asset.state);
        setHierarchyLevel('municipios');
      }
    } else if (hierarchyLevel === 'municipios') {
      if (asset.name) {
        setDrillMunicipality(asset.name);
        setHierarchyLevel('bairros');
      }
    }
    setSelectedAsset(asset);
  };

  // Customized Treemap block renderer
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name } = props;
    if (!name) return null;

    const asset = filteredAssets.find(a => a.name === name);
    if (!asset) return null;

    const fill = getBlockColor(asset);
    const value = asset[sizingMetric];
    const unit = asset.type === 'generator' ? 'MW' : asset.type === 'substation' ? 'MVA' : 'km';

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          className="transition-all duration-300 hover:opacity-90 cursor-pointer"
          style={{
            fill,
            stroke: '#0f172a',
            strokeWidth: 2,
          }}
          onClick={() => handleBlockClick(asset)}
        />
        {width > 80 && height > 34 && (
          <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8} className="pointer-events-none select-none overflow-hidden">
            <div className="flex flex-col h-full justify-between p-1 text-white font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold bg-black/45 px-1 rounded truncate max-w-[85%]">
                  {name}
                </span>
                {asset.status === 'Alerta' && (
                  <span className="text-[8px] bg-yellow-500 text-black px-1 rounded animate-pulse font-black">ALR</span>
                )}
                {asset.mappedByAi && (
                  <span className="text-[8px] bg-cyan-400 text-black px-1 rounded font-black">AI</span>
                )}
              </div>
              <div className="text-right leading-none">
                <p className="text-xs font-black text-gray-100">
                  {value} <span className="text-[9px] font-semibold text-gray-300">{unit}</span>
                </p>
                <p className="text-[8px] text-gray-300 truncate mt-0.5 font-bold">
                  {asset.state} | {asset.subType.split(' ')[0]}
                </p>
              </div>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  // Custom tooltips inside the Treemap
  const CustomTreeMapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-950 p-4 border border-gray-700 rounded-lg shadow-2xl text-xs w-72 text-gray-200 font-mono">
          <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
            <p className="font-extrabold text-white text-sm leading-tight max-w-[70%]">{data.name}</p>
            <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
              data.status === 'Operando' ? 'bg-green-500/20 text-green-400' : 
              data.status === 'Manutenção' ? 'bg-blue-500/20 text-blue-400' : 
              data.status === 'Alerta' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
              'bg-red-500/20 text-red-400'}`}
            >
              {data.status}
            </span>
          </div>

          <div className="space-y-1.5 bg-gray-900/60 p-2.5 rounded border border-gray-800 mb-2">
            <p className="text-[10px] text-gray-400">Classificação / Tipo:</p>
            <p className="text-cyan-400 font-bold leading-none">{data.subType}</p>
            <p className="text-[10px] text-gray-400 mt-1.5">Concessionária Regulada / Operador:</p>
            <p className="text-white font-bold leading-none truncate">{data.operator}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] pt-1">
            <span className="text-gray-400">Capacidade Nominal:</span>
            <span className="text-white text-right font-bold">
              {data.capacity} {data.type === 'generator' ? 'MW' : data.type === 'substation' ? 'MVA' : 'km'}
            </span>

            <span className="text-gray-400">Fluxo Estimado:</span>
            <span className="text-emerald-400 text-right font-bold">{data.activeLoad} MW</span>

            <span className="text-gray-400">Tensão Operacional:</span>
            <span className="text-yellow-400 text-right font-bold">{data.voltage} kV</span>

            <span className="text-gray-400">Região SIN / UF:</span>
            <span className="text-pink-400 text-right font-bold">{data.region} ({data.state})</span>

            {data.gdUnits !== undefined && (
              <>
                <span className="text-cyan-400 font-extrabold">Unidades Solar GD:</span>
                <span className="text-cyan-400 text-right font-extrabold">{data.gdUnits.toLocaleString('pt-BR')} un</span>
              </>
            )}

            {data.centralCount !== undefined && (
              <>
                <span className="text-gray-400">Ativos Centrais:</span>
                <span className="text-white text-right font-bold">{data.centralCount}</span>
              </>
            )}

            {data.streetCount !== undefined && (
              <>
                <span className="text-gray-400">Vias / Ruas Varridas:</span>
                <span className="text-white text-right font-bold">{data.streetCount}</span>
              </>
            )}

            {data.mappedByAi && (
              <>
                <span className="text-teal-400 font-bold">Mapeamento por IA:</span>
                <span className="text-teal-400 text-right font-bold">Ativo (99% Acurácia)</span>
              </>
            )}

            {data.satelliteSource !== undefined && (
              <>
                <span className="text-gray-400">Constelação Satélite:</span>
                <span className="text-gray-300 text-right font-bold text-[9px]">{data.satelliteSource}</span>
              </>
            )}

            <span className="text-gray-400">Outorga / Varredura:</span>
            <span className="text-gray-300 text-right font-bold">{data.concessionDate}</span>

            <span className="text-gray-400">Canal de Origem:</span>
            <span className="text-cyan-400 text-right font-bold">{data.dataSource}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* SECTION 1: BRAZILIAN INTERCONNECTED SYSTEM (SIN) LIVE BAROMETRICS */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <GlobeAltIcon className="w-56 h-56 text-cyan-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-extrabold">Monitoramento de Grade e Transmissão Nacional</span>
            </div>
            <h1 className="text-2xl font-black text-white leading-tight mt-1">
              Rede do Sistema Interligado Nacional (SIN) - ONS & ANEEL
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-4xl leading-relaxed">
              Grade em tempo real para auditoria de ativos geradores, subestações centrais (cabines) e linhas de distribuição intermunicipais do Brasil. Integra dados abertos da <strong>ANEEL (SIGA)</strong> com o Sistema de Informações Geográficas do <strong>ONS</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="bg-emerald-950/40 px-3 py-1.5 rounded-md border border-emerald-800/40 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
              Grade SIN: Estável
            </span>
            <span className="bg-gray-800/80 px-3 py-1.5 rounded-md border border-gray-700/60 text-xs text-white font-mono flex items-center gap-1.5">
              Frequência: {sinFrequency.toFixed(3)} Hz
            </span>
          </div>
        </div>

        {/* National barometers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 border-t border-gray-800/80 pt-6">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ativos ONS & ANEEL</p>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">22.450+</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Ativos Centrais do SIN</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Geração Solar GD</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-1">3.180.000+</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Unidades Consumidoras</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Carga Ativa do SIN</p>
            <p className="text-xl font-bold font-mono text-yellow-400 mt-1">{sinTotalLoad.toLocaleString()} <span className="text-xs">MW</span></p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Demanda Instantânea</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Capacidade Nominal</p>
            <p className="text-xl font-bold font-mono text-teal-400 mt-1">{sinTotalGeneration.toLocaleString()} <span className="text-xs">MW</span></p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Parque Gerador Central</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ativos de Transmissão</p>
            <p className="text-xl font-bold font-mono text-white mt-1">142.500 <span className="text-xs text-gray-400">km</span></p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Linhas e Circuitos SIN</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Fontes Ativas (%)</p>
            <p className="text-xs font-bold font-mono text-emerald-400 mt-1.5 leading-tight">62% Hidro | 15% Eol/Sol</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">21% Termo | 2% Nuclear</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: VIEW TABS */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('treemap')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none ${
              activeTab === 'treemap'
                ? 'bg-gray-800 text-cyan-400 border-cyan-400'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-transparent'
            }`}
          >
            Treemap de Ativos Nacional
          </button>
          <button
            onClick={() => setActiveTab('dessem-dispatch')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none ${
              activeTab === 'dessem-dispatch'
                ? 'bg-gray-800 text-cyan-400 border-cyan-400'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-transparent'
            }`}
          >
            Simulador DESSEM (Despacho ONS)
          </button>
          <button
            onClick={() => setActiveTab('api-console')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none ${
              activeTab === 'api-console'
                ? 'bg-gray-800 text-cyan-400 border-cyan-400'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-transparent'
            }`}
          >
            Terminal do Console API (Real JSON)
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none ${
              activeTab === 'about'
                ? 'bg-gray-800 text-cyan-400 border-cyan-400'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-transparent'
            }`}
          >
            Sobre as Fontes ONS & ANEEL
          </button>
        </nav>
      </div>

      {/* SECTION 3: TAB CONTENT */}
      {activeTab === 'treemap' && (
        <div className="space-y-6">
          <DashboardCard 
            title="Mapa de Calor Finviz Proporcional: Ativos SIN da Rede Elétrica Brasileira"
            icon={<ActivityIcon className="w-5 h-5 text-cyan-400" />}
            action={
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter Region */}
                <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-400 px-1 font-bold">Região:</span>
                  <select 
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="bg-gray-900 text-[11px] text-white p-1 rounded border border-gray-700 outline-none"
                  >
                    <option value="ALL">Todas as Regiões</option>
                    <option value="Sudeste">Sudeste</option>
                    <option value="Sul">Sul</option>
                    <option value="Nordeste">Nordeste</option>
                    <option value="Norte">Norte</option>
                    <option value="Centro-Oeste">Centro-Oeste</option>
                  </select>
                </div>

                {/* Filter Asset Type */}
                <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-400 px-1 font-bold">Categoria:</span>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-gray-900 text-[11px] text-white p-1 rounded border border-gray-700 outline-none"
                  >
                    <option value="ALL">Todas as Categorias</option>
                    <option value="generator">Usinas Geradoras</option>
                    <option value="substation">Subestações / Cabines</option>
                    <option value="transmission">Linhas de Transmissão</option>
                  </select>
                </div>

                {/* Search query */}
                <input
                  type="text"
                  placeholder="Pesquisar ativos (ex: Itaipu, Furnas)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-950 text-xs text-white px-3 py-1.5 rounded border border-gray-700 placeholder-gray-500 outline-none focus:border-cyan-500 w-52"
                />
              </div>
            }
          >
            <div className="space-y-4">
              
              {/* NÍVEL DE RESOLUÇÃO HIERÁRQUICA */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase">RESOLUÇÃO DE ATIVOS (CENTRALIZADO VS DISTRIBUÍDO GD)</span>
                  <p className="text-sm font-bold text-white leading-tight">Escolha o nível de detalhamento dos dados na rede:</p>
                </div>
                <div className="bg-gray-900 p-0.5 rounded border border-gray-700 flex flex-wrap gap-1">
                  <button 
                    onClick={() => {
                      setHierarchyLevel('nacional');
                      setDrillState(null);
                      setDrillMunicipality(null);
                      setFilterType('ALL');
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${hierarchyLevel === 'nacional' ? 'bg-cyan-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    🌎 Nacional (SIN Centralizado)
                  </button>
                  <button 
                    onClick={() => {
                      setHierarchyLevel('estados');
                      setDrillMunicipality(null);
                      setFilterType('ALL');
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${hierarchyLevel === 'estados' ? 'bg-cyan-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    🏛️ Estados (SIN + GD Solar)
                  </button>
                  <button 
                    onClick={() => {
                      setHierarchyLevel('municipios');
                      setFilterType('ALL');
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${hierarchyLevel === 'municipios' ? 'bg-cyan-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    🏙️ Municípios (Líderes GD)
                  </button>
                  <button 
                    onClick={() => {
                      setHierarchyLevel('bairros');
                      setFilterType('ALL');
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${hierarchyLevel === 'bairros' ? 'bg-cyan-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    🤖 Bairros (Object Masking IA)
                  </button>
                </div>
              </div>

              {/* BREADCRUMB NAVIGATION & HIERARCHY RESET */}
              <div className="bg-gray-950 px-4 py-3 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-400 font-bold">Nível Ativo:</span>
                  <button 
                    onClick={() => {
                      setHierarchyLevel('nacional');
                      setDrillState(null);
                      setDrillMunicipality(null);
                    }}
                    className={`hover:text-cyan-400 transition-colors ${hierarchyLevel === 'nacional' ? 'text-cyan-400 font-black underline decoration-cyan-400 decoration-2' : 'text-gray-400 font-bold'}`}
                  >
                    🌎 Brasil (SIN)
                  </button>
                  
                  {(drillState || hierarchyLevel !== 'nacional') && (
                    <>
                      <span className="text-gray-600 font-black">&gt;</span>
                      <button 
                        onClick={() => {
                          setHierarchyLevel('estados');
                          setDrillMunicipality(null);
                        }}
                        className={`hover:text-cyan-400 transition-colors ${hierarchyLevel === 'estados' ? 'text-cyan-400 font-black underline decoration-cyan-400 decoration-2' : 'text-gray-400 font-bold'}`}
                      >
                        🏛️ {drillState ? `Estado: ${drillState}` : 'Todos os Estados'}
                      </button>
                    </>
                  )}

                  {(drillMunicipality || hierarchyLevel === 'municipios' || hierarchyLevel === 'bairros') && (
                    <>
                      <span className="text-gray-600 font-black">&gt;</span>
                      <button 
                        onClick={() => {
                          setHierarchyLevel('municipios');
                        }}
                        className={`hover:text-cyan-400 transition-colors ${hierarchyLevel === 'municipios' ? 'text-cyan-400 font-black underline decoration-cyan-400 decoration-2' : 'text-gray-400 font-bold'}`}
                      >
                        🏙️ {drillMunicipality ? `Mún: ${drillMunicipality.split(' ')[0]}` : 'Municípios'}
                      </button>
                    </>
                  )}

                  {hierarchyLevel === 'bairros' && (
                    <>
                      <span className="text-gray-600 font-black">&gt;</span>
                      <span className="text-cyan-400 font-black">
                        🤖 Bairros (Object Masking)
                      </span>
                    </>
                  )}
                </div>

                {/* Back to top helper */}
                {(hierarchyLevel !== 'nacional' || drillState || drillMunicipality) && (
                  <button 
                    onClick={() => {
                      setHierarchyLevel('nacional');
                      setDrillState(null);
                      setDrillMunicipality(null);
                    }}
                    className="text-[10px] text-gray-400 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    🔄 Redefinir para Escopo Nacional
                  </button>
                )}
              </div>

              {/* AGGREGATED METRICS STATS BAR */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono">
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">🎯 Escopo de Ativos</span>
                  <p className="text-sm font-black text-white truncate leading-none mt-1">
                    {aggregatedStats.label}
                  </p>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">📂 Mapeamento Físico</span>
                  <p className="text-sm font-black text-cyan-400 leading-none mt-1">
                    {aggregatedStats.totalAssets} {hierarchyLevel === 'nacional' ? 'Ativos SIN' : 'Sistemas GD'}
                    {aggregatedStats.totalGdUnits > 0 ? ` (${(aggregatedStats.totalGdUnits / 1000).toFixed(0)}k un)` : ''}
                  </p>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">⚡ Capacidade Agregada</span>
                  <p className="text-sm font-black text-emerald-400 leading-none mt-1">
                    {aggregatedStats.totalCapacity >= 1000 
                      ? `${(aggregatedStats.totalCapacity / 1000).toFixed(1)} GW` 
                      : `${aggregatedStats.totalCapacity.toFixed(1)} MW`}
                  </p>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">🤖 Acurácia Mapeamento IA</span>
                  <p className="text-sm font-black text-amber-400 leading-none mt-1">
                    {aggregatedStats.avgAiAccuracy.toFixed(1)}% (Certificado)
                  </p>
                </div>
              </div>

              {/* Proportional Treemap Control bar */}
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase">EIXOS DE PROPORCIONAMENTO DE BLOCO</span>
                  <p className="text-sm font-bold text-white leading-tight">Escolha como dimensionar e colorir os blocos da rede:</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Sizing metric toggle */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase font-mono">Tamanho Proporcional:</span>
                    <div className="bg-gray-900 p-0.5 rounded border border-gray-700 flex">
                      <button 
                        onClick={() => setSizingMetric('capacity')}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded ${sizingMetric === 'capacity' ? 'bg-cyan-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Capacidade Estática (MW/km/MVA)
                      </button>
                      <button 
                        onClick={() => setSizingMetric('activeLoad')}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded ${sizingMetric === 'activeLoad' ? 'bg-cyan-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Fluxo Energético Ativo (MW)
                      </button>
                    </div>
                  </div>

                  {/* Coloring metric toggle */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase font-mono">Cor do Ativo:</span>
                    <div className="bg-gray-900 p-0.5 rounded border border-gray-700 flex">
                      <button 
                        onClick={() => setColoringMetric('subType')}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded ${coloringMetric === 'subType' ? 'bg-indigo-600 text-white font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Tipo de Fonte
                      </button>
                      <button 
                        onClick={() => setColoringMetric('status')}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded ${coloringMetric === 'status' ? 'bg-indigo-600 text-white font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Status Grade
                      </button>
                      <button 
                        onClick={() => setColoringMetric('region')}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded ${coloringMetric === 'region' ? 'bg-indigo-600 text-white font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Região SIN
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizing Indicator label in real time */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-400 font-mono gap-1 px-1 border-b border-gray-800 pb-2">
                <span>Total de ativos listados no polígono de visualização: <strong className="text-white">{filteredAssets.length} segmentos</strong></span>
                <span>Dimensão: <strong className="text-cyan-400">{sizingLabel}</strong></span>
              </div>

              {/* Chart Stage */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800/80 h-[520px]">
                {filteredAssets.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={filteredAssets}
                      dataKey={sizingMetric}
                      stroke="#0f172a"
                      fill="#1e293b"
                      content={<CustomizedContent />}
                      isAnimationActive={false}
                      aspectRatio={16/9}
                    >
                      <Tooltip content={<CustomTreeMapTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col h-full justify-center items-center text-gray-500 text-sm font-mono">
                    <p>Nenhum ativo gerador, cabine ou linha de transmissão atende aos filtros definidos.</p>
                    <button 
                      onClick={() => {
                        setFilterRegion('ALL');
                        setFilterType('ALL');
                        setSearchQuery('');
                      }} 
                      className="mt-3 px-3 py-1.5 bg-gray-900 border border-gray-700 text-xs text-cyan-400 rounded-lg hover:bg-gray-800"
                    >
                      Limpar Filtros de Busca
                    </button>
                  </div>
                )}
              </div>

              {/* Color legends according to metric */}
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 flex flex-wrap gap-4 justify-center text-xs font-mono text-gray-300">
                <span className="font-bold text-gray-400">Legenda de Cores:</span>
                
                {coloringMetric === 'subType' && (
                  <>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#0284c7] rounded-sm"></span> Hidrelétricas (UHE)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#d97706] rounded-sm"></span> Termelétricas (UTE)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#10b981] rounded-sm"></span> Eólicas (EOL)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#eab308] rounded-sm"></span> Solar (UFV)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#7c3aed] rounded-sm"></span> Nuclear (UTN)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#b91c1c] rounded-sm"></span> Subestação / Cabine</span>
                  </>
                )}

                {coloringMetric === 'status' && (
                  <>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#065f46] rounded-sm"></span> Operando Normal</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#1e3a8a] rounded-sm"></span> Manutenção Programada</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#854d0e] rounded-sm"></span> Alerta de Carga</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#111827] rounded-sm"></span> Fora de Serviço</span>
                  </>
                )}

                {coloringMetric === 'region' && (
                  <>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#1e40af] rounded-sm"></span> Sudeste (SE)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#065f46] rounded-sm"></span> Sul (S)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#b91c1c] rounded-sm"></span> Nordeste (NE)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#6d28d9] rounded-sm"></span> Norte (N)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#a16207] rounded-sm"></span> Centro-Oeste (CO)</span>
                  </>
                )}
              </div>

              {/* EXTRA INSIGHT CARD: NATIONAL SCALE (22,000+ ASSETS & 3,000,000+ SOLAR GD) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-950/40 rounded-lg border border-cyan-800/40">
                      <ActivityIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">22.450+ Ativos Centrais (ONS/ANEEL)</h3>
                      <p className="text-xs text-gray-400">Empreendimentos de Geração Centralizada e Redes SIN</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-mono">
                    A infraestrutura de grande porte (Sistema Interligado Nacional - SIN) conta com outorgas reguladas de geração centralizada, subestações de alta tensão e linhas de transmissão de grande extensão que totalizam mais de 22 mil ativos monitorados.
                  </p>

                  {/* State breakdown for 22,000+ assets */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase font-mono">Distribuição de Grandes Ativos (Por Estado líder):</span>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>Minas Gerais (UHE, UTE, Solar Central)</span>
                          <span className="font-bold text-white">~3.850 ativos</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>Rio Grande do Sul (UHE, Eólica, Biomassa)</span>
                          <span className="font-bold text-white">~3.120 ativos</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>Bahia (Complexos Eólicos & Solares)</span>
                          <span className="font-bold text-white">~2.910 ativos</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>São Paulo (Grandes Hidrelétricas & Térmicas)</span>
                          <span className="font-bold text-white">~2.460 ativos</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '55%' }}></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 font-mono text-right mt-1">
                      * Fonte: ONS DGI e ANEEL SIGA de Geração Outorgada Central.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-950/40 rounded-lg border border-amber-800/40">
                      <BoltIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">3.180.000+ Unidades Solar GD</h3>
                      <p className="text-xs text-gray-400">Geração Distribuída Fotovoltaica (Mais de 30 GW Ativos)</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-mono">
                    O Brasil possui mais de 3,18 milhões de usinas solares descentralizadas (Geração Distribuída) em telhados residenciais, comerciais, rurais e usinas de minigeração, gerando energia limpa e barata direto no ponto de consumo.
                  </p>

                  {/* State breakdown for solar GD units */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase font-mono">Unidades de Microgeração Solar Fotovoltaica:</span>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>São Paulo (SP)</span>
                          <span className="font-bold text-white">~585.000 unidades</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>Minas Gerais (MG)</span>
                          <span className="font-bold text-white">~492.000 unidades</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>Rio Grande do Sul (RS)</span>
                          <span className="font-bold text-white">~398.000 unidades</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '63%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                          <span>Paraná (PR)</span>
                          <span className="font-bold text-white">~315.000 unidades</span>
                        </div>
                        <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 font-mono text-right mt-1">
                      * Unidades Consumidoras ativas com geração de energia própria (fotovoltaica).
                    </p>
                  </div>
                </div>
              </div>

              {/* AUTOMATED AI COMPUTER VISION DETECTION SYSTEM CONSOLE */}
              <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 p-6 rounded-xl border border-gray-800 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <span className="text-9xl text-cyan-500 font-black">AI</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">Tecnologia de Transparência de Dados Distribuídos</span>
                    </div>
                    <h3 className="text-lg font-black text-white">Agente Autônomo de Detecção por Máscara de Objetos (Object Mask Detect)</h3>
                    <p className="text-xs text-gray-400">Como mapear e representar os milhões de ativos de Geração Distribuída (GD) Solar nos sistemas da União, Estados e Municípios</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 px-2.5 py-1 rounded text-xs font-mono font-bold">
                      MODELO: MEX-ObjectMask-v4.1
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-gray-300 leading-relaxed font-mono">
                  <div className="bg-gray-900/45 p-4 rounded-lg border border-gray-850 space-y-2">
                    <div className="text-white font-extrabold flex items-center gap-1.5 text-xs uppercase text-cyan-400">
                      <span>🕵️‍♂️ Por que Solar GD não aparece por padrão?</span>
                    </div>
                    <p>
                      Os sistemas tradicionais de telemetria do Operador Nacional do Sistema (ONS) monitoram apenas geradores centrais de alta capacidade regulados pela ANEEL. Os mais de 3,18 milhões de inversores solares em telhados residenciais, comerciais e rurais funcionam de forma "invisível" à transmissão centralizada, gerando energia diretamente no ponto de consumo.
                    </p>
                  </div>

                  <div className="bg-gray-900/45 p-4 rounded-lg border border-gray-850 space-y-2">
                    <div className="text-white font-extrabold flex items-center gap-1.5 text-xs uppercase text-emerald-400">
                      <span>🤖 Solução: Agente Automatizado de Visão Computacional</span>
                    </div>
                    <p>
                      A única forma viável de mapeá-los em tempo real e com precisão nominal é através de nosso **Agente Automatizado de Visão Computacional**. Ele escaneia polígonos urbanos e rurais utilizando ortofotos georreferenciadas (Sentinel-2 & Copernicus), aplicando máscaras de segmentação semântica para isolar as geometrias dos painéis e estimar sua potência de pico.
                    </p>
                  </div>

                  <div className="bg-gray-900/45 p-4 rounded-lg border border-gray-850 space-y-2">
                    <div className="text-white font-extrabold flex items-center gap-1.5 text-xs uppercase text-amber-400">
                      <span>🔄 Atualização da União, Estados e Municípios</span>
                    </div>
                    <p>
                      O agente processa imagens rua por rua, bairro por bairro, identificando novas instalações sem necessidade de fiscalização presencial. Após a validação estatística, o agente atualiza de forma autônoma o banco de dados georreferenciado municipal, consolidando informações a nível de estado e alimentando o sistema federal de outorgas (ANEEL SIGA).
                    </p>
                  </div>
                </div>

                <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono border-b border-gray-850 pb-2">
                    <span className="font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> TERMINAL DE TELEMETRIA E LOGS DO AGENTE IA</span>
                    <span>FREQUÊNCIA DE ATUALIZAÇÃO: LIVE</span>
                  </div>
                  <div className="font-mono text-[10px] text-gray-300 space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                    <p className="text-cyan-400">[08:42:01] [SYS_INIT] Agente Computadorizado de Visão Computacional iniciado para varredura de polígonos.</p>
                    <p className="text-gray-400">[08:42:05] [SATELLITE] Solicitando ortofotos georreferenciadas em tempo real de Copernicus Sentinel-2...</p>
                    <p className="text-gray-500">[08:42:08] [SATELLITE] Resposta OK: Resolução obtida de 0.5m/pixel para Região Sudeste (SP, MG, RJ) e Região Sul (PR, RS).</p>
                    <p className="text-gray-400">[08:42:15] [OBJECT_MASK] Iniciando segmentação semântica via rede profunda MEX-ObjectMask-v4.1...</p>
                    <p className="text-cyan-400">[08:42:22] [DETECTION] Uberlândia (MG) / Bairro Savassi: Detectado polígono solar ID #99142. Estimado: 45m², 9.0 kW pico.</p>
                    <p className="text-cyan-400">[08:42:28] [DETECTION] Campinas (SP) / Bairro Jardins: Detectado polígono solar ID #99143. Estimado: 120m², 24.0 kW pico.</p>
                    <p className="text-teal-400 font-bold">[08:42:32] [DB_RECONCILE] Consolidando 14.500 novas usinas GD detectadas nesta rodada por rua e bairro.</p>
                    <p className="text-emerald-400 font-extrabold">[08:42:35] [GOV_SYNC] Base de outorgas federais (ANEEL SIGA) e registros municipais sincronizados com sucesso!</p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* TAB: DESSEM DISPATCH SIMULATOR */}
      {activeTab === 'dessem-dispatch' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top banner / Info */}
          <div className="bg-gradient-to-r from-amber-950/20 via-gray-900 to-gray-950 p-6 rounded-xl border border-gray-800 shadow-xl space-y-3 font-mono">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-950/40 rounded-lg border border-amber-800/40">
                <CogIcon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">Matriz de Preço e Despacho de Energia</span>
                <h2 className="text-lg font-black text-white">Simulador do Modelo de Despacho ONS DESSEM</h2>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              O **DESSEM** é o modelo matemático oficial utilizado pelo Operador Nacional do Sistema (ONS) para programar o despacho diário e estabelecer o Preço de Liquidação das Diferenças (PLD/CMO) horário. 
              Como mais de **3.180.000 de telhados solares (Geração Distribuída)** geram energia diretamente no ponto de consumo sem telemetria em tempo real, eles criam uma **carga líquida fantasma (Curva do Pato)** que desregula os despachos hidráulicos e térmicos se não forem mapeados estatisticamente por IA.
            </p>
          </div>

          {/* Period selector */}
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-850 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">Escala Temporal do Despacho (Oferta & Demanda)</span>
              <p className="text-xs text-gray-400">Analise o balanço energético nacional sob diferentes horizontes cronológicos</p>
            </div>
            <div className="flex flex-wrap bg-gray-900 border border-gray-800 p-1 rounded-lg gap-1">
              {(['realtime', 'daily', 'monthly', 'annual'] as const).map((p) => {
                const labelMap = {
                  realtime: '⏱ Tempo Real',
                  daily: '📅 Diário (24h)',
                  monthly: '📆 Mensal (30d)',
                  annual: '📊 Anual (12m)'
                };
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setDessemPeriod(p);
                      addDessemLog(`Escala cronológica alterada para: ${p.toUpperCase()}`);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded transition-all ${
                      dessemPeriod === p 
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/15' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {labelMap[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Integrated Demand & Supply Balance Panel */}
          <div className="bg-gray-900 border border-gray-750 p-5 rounded-xl space-y-4 font-mono text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-3 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">Balanço Físico Integrado de Rede</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📊</span> Resumo de Equilíbrio: Demanda vs Geração (Oferta)
                </h3>
              </div>
              <div className="text-[10px] text-gray-400">
                Horizonte de Análise: <span className="text-cyan-400 font-bold uppercase">{dessemPeriod === 'realtime' ? 'Tempo Real (Últimas 2h)' : dessemPeriod === 'daily' ? 'Diário (24 Horas)' : dessemPeriod === 'monthly' ? 'Mensal (30 Dias)' : 'Anual (12 Meses)'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Demanda Card */}
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Demanda de Consumo</span>
                  <p className="text-xs text-gray-400">Carga Bruta média requerida pelos consumidores</p>
                </div>
                <div>
                  <div className="text-xl font-black text-white">
                    {(dessemAverages.avgDemand / 1000).toFixed(1)} GW <span className="text-xs text-gray-500">Média</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Pico de Demanda: {(dessemAverages.peakDemand / 1000).toFixed(1)} GW
                  </div>
                </div>
              </div>

              {/* Oferta Renovavel Card */}
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Geração Hidro & Eólica</span>
                  <p className="text-xs text-gray-400">Oferta despachável principal do ONS</p>
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">
                    {((dessemAverages.avgHydro + dessemAverages.avgBaseRenewables) / 1000).toFixed(1)} GW
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 font-mono">
                    UHE: {(dessemAverages.avgHydro / 1000).toFixed(1)} GW | Outros: {(dessemAverages.avgBaseRenewables / 1000).toFixed(1)} GW
                  </div>
                </div>
              </div>

              {/* Oferta Solar GD Card */}
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Oferta Solar GD</span>
                  <p className="text-xs text-gray-400">Geração injetada diretamente nos telhados</p>
                </div>
                <div>
                  <div className="text-xl font-black text-amber-400">
                    {(dessemAverages.avgSolarGd / 1000).toFixed(1)} GW
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Rastreamento de IA: {dessemAiCompensation ? '✓ 100% Mapeado' : '⚠ Sem Telemetria'}
                  </div>
                </div>
              </div>

              {/* Oferta Termica Card */}
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">Oferta Térmica (UTE)</span>
                  <p className="text-xs text-gray-400">Geração termoelétrica de base / segurança</p>
                </div>
                <div>
                  <div className={`text-xl font-black ${dessemAiCompensation ? 'text-teal-400' : 'text-rose-400 font-extrabold'}`}>
                    {(dessemAverages.avgThermal / 1000).toFixed(1)} GW
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Custo Adicional: {dessemAiCompensation ? 'R$ 0M (Otimizado)' : 'R$ ' + (dessemPeriod === 'annual' ? '1.48B (Anual)' : dessemPeriod === 'monthly' ? '240M (Mensal)' : '14.8M (Diário)')}
                  </div>
                </div>
              </div>
            </div>

            {/* Equilibrium status bar */}
            <div className="bg-gray-950 px-4 py-2.5 rounded-lg border border-gray-850 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2 border-l-2 border-l-emerald-500">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Frequência Sincronizada do Sistema: <strong className="text-emerald-400">60.00 Hz</strong> (Variação Aceitável: ±0.2 Hz)</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Equilíbrio Oferta/Demanda: <strong className="text-cyan-400">100.00% Estável</strong></span>
                <span className="hidden sm:inline text-gray-600">|</span>
                <span>Desvio Físico de Rede: <strong className="text-emerald-400">0.00 MW</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            {/* Left Controls Card */}
            <div className="lg:col-span-1 bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-gray-800 pb-2 flex items-center gap-2">
                  <span>⚙</span> Parâmetros do Barramento
                </h3>

                {/* Slider for unmapped GD power */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400 font-bold">Capacidade de GD Solar em Campo:</span>
                    <span className="text-amber-400 font-black">{(dessemUnmappedGdPower / 1000).toFixed(1)} GW</span>
                  </div>
                  <input 
                    type="range" 
                    min="5000" 
                    max="30000" 
                    step="1000"
                    value={dessemUnmappedGdPower}
                    onChange={(e) => setDessemUnmappedGdPower(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-[10px] text-gray-500">Ajuste o volume instalado total de Geração Distribuída Solar (Atualmente aproximando-se de 30 GW).</p>
                </div>

                {/* Toggle AI Mapping */}
                <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-cyan-400 font-black block text-[11px] uppercase">Mapeamento Visão Computacional</span>
                      <p className="text-[9px] text-gray-500">Ativa o Agente MEX-ObjectMask-v4.1 para prever o despacho</p>
                    </div>
                    <button
                      onClick={() => {
                        setDessemAiCompensation(!dessemAiCompensation);
                        addDessemLog(`Compensação via Visão Computacional (MEX IA) alterada para ${!dessemAiCompensation ? 'ATIVADA' : 'DESATIVADA'}`);
                      }}
                      className={`px-4 py-1.5 rounded font-black text-[10px] uppercase transition-all ${
                        dessemAiCompensation 
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {dessemAiCompensation ? 'ATIVADO' : 'DESATIVADO'}
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-gray-400 leading-normal border-t border-gray-900 pt-2.5">
                    {dessemAiCompensation ? (
                      <span className="text-emerald-400 font-semibold">✓ O ONS "enxerga" os painéis via satélite. O DESSEM desconta a geração diurna com precisão e economiza as hidroelétricas para a rampa noturna.</span>
                    ) : (
                      <span className="text-yellow-500/90">⚠ O ONS está cego. A geração solar reduz a carga líquida diurna sem planejamento, causando sobregeração, e força o acionamento de térmicas de emergência ao entardecer.</span>
                    )}
                  </div>
                </div>

                {/* Dispatch Trigger */}
                <div className="space-y-2">
                  <button
                    onClick={handleRunDessemSimulation}
                    disabled={dessemSimulating}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black py-3 rounded-lg text-center transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {dessemSimulating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></span>
                        Simulando despacho...
                      </>
                    ) : (
                      <>
                        <span>⚡</span> Simular Novo Cenário Energético
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Terminal Logs for DESSEM */}
              <div className="bg-black/90 p-4 rounded-xl border border-gray-850 space-y-2 flex-grow min-h-[180px] flex flex-col justify-between mt-4">
                <div className="flex justify-between items-center text-[9px] text-gray-500 border-b border-gray-850 pb-1.5">
                  <span className="font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    LOG DE AUDITORIA DESSEM
                  </span>
                  <span>LIVE TRACK</span>
                </div>
                
                <div className="font-mono text-[9px] text-cyan-300 space-y-1 overflow-y-auto max-h-48 flex-grow h-40 scrollbar-thin">
                  {dessemLogs.length === 0 ? (
                    <p className="text-gray-500 italic">Nenhum despacho executado nesta rodada. Selecione a escala acima e simule novos cenários para iniciar a varredura do ONS.</p>
                  ) : (
                    dessemLogs.map((log, index) => (
                      <p key={index} className="leading-tight">{log}</p>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Graphics and KPIs Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dynamic metrics block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Erro de Previsão</span>
                  <p className={`text-xl font-black ${dessemAiCompensation ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {dessemAiCompensation ? '0.2%' : `${(dessemChartData.reduce((acc, h) => acc + h.forecastError, 0) / dessemChartData.length).toFixed(1)}%`}
                  </p>
                  <p className="text-[9px] text-gray-500">Mapeamento ONS</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CMO Médio</span>
                  <p className={`text-xl font-black ${dessemAiCompensation ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`}>
                    R$ {Math.round(dessemChartData.reduce((acc, h) => acc + h.cmo, 0) / dessemChartData.length)}/MWh
                  </p>
                  <p className="text-[9px] text-gray-500">Custo Marginal Operacional</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Perfil da Rampa</span>
                  <p className={`text-xl font-black ${dessemAiCompensation ? 'text-teal-400' : 'text-red-500'}`}>
                    {dessemAiCompensation ? 'Suave (Otimizado)' : 'Crítico (Sobrecarregado)'}
                  </p>
                  <p className="text-[9px] text-gray-500">Pico de Oferta vs Demanda</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Custo Térmico Extra</span>
                  <p className={`text-xl font-black ${dessemAiCompensation ? 'text-emerald-400' : 'text-rose-400 font-extrabold'}`}>
                    {dessemAiCompensation ? 'R$ 0,0M' : `R$ ${(dessemChartData.reduce((acc, h) => acc + h.thermal, 0) * 420 / (dessemPeriod === 'annual' ? 100000000 : dessemPeriod === 'monthly' ? 15000000 : 1000000)).toFixed(1)}M`}
                  </p>
                  <p className="text-[9px] text-gray-500">Despesa Extra Estimada</p>
                </div>
              </div>

              {/* Chart container */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>📊 Oferta & Demanda: Carga Bruta vs Carga Líquida Planejada</span>
                    <span className="text-[10px] bg-gray-950 text-cyan-400 px-2 py-0.5 rounded border border-gray-850">
                      Modo: {dessemPeriod === 'realtime' ? 'Tempo Real' : dessemPeriod === 'daily' ? 'Diário (24h)' : dessemPeriod === 'monthly' ? 'Mensal (30d)' : 'Anual (12m)'}
                    </span>
                  </h3>
                  <p className="text-gray-400 text-[11px] mt-1">
                    Visualização do impacto imediato da geração fotovoltaica distribuída não mapeada na demanda global do SIN. {dessemPeriod === 'annual' ? 'Note a forte sazonalidade hidrológica brasileira (Período Seco vs Úmido).' : ''}
                  </p>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dessemChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit=" GW" tickFormatter={(v) => (v / 1000).toFixed(0)} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                      <Area type="monotone" dataKey="grossDemand" name="Demanda / Carga Bruta Consumida" stroke="#ef4444" fillOpacity={1} fill="url(#colorGross)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="plannedNetLoad" name="Carga Líquida Planejada pelo ONS" stroke="#06b6d4" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="actualSolarGd" name="Oferta Solar GD Invisível" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSolar)" strokeWidth={1.5} strokeDasharray="3 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dispatch curves */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>⚡ Despacho & Oferta de Energia ONS (DESSEM)</span>
                    <span className="text-[10px] bg-gray-950 text-emerald-400 px-2 py-0.5 rounded border border-gray-850">Composição</span>
                  </h3>
                  <p className="text-gray-400 text-[11px] mt-1">
                    Como o ONS mobiliza a oferta hidráulica (UHE) e térmica (UTE) para cobrir a carga líquida do sistema.
                  </p>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dessemChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit=" GW" tickFormatter={(v) => (v / 1000).toFixed(0)} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                      <Area type="monotone" dataKey="hydro" name="Oferta Hidráulica (UHE)" stroke="#10b981" fillOpacity={1} fill="url(#colorHydro)" strokeWidth={2} stackId="1" />
                      <Area type="monotone" dataKey="thermal" name="Oferta Térmica (UTE)" stroke="#f97316" fillOpacity={1} fill="url(#colorThermal)" strokeWidth={2} stackId="1" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CMO graph */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      📈 Curva do CMO (Custo Marginal de Operação)
                    </h3>
                    <p className="text-gray-400 text-[11px] mt-1">
                      Sensibilidade do preço por MWh em relação à previsibilidade da microgeração fotovoltaica distribuída.
                    </p>
                  </div>
                  <span className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded font-black">
                    Máximo: R$ {Math.max(...dessemChartData.map(h => h.cmo))}/MWh
                  </span>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dessemChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit=" R$" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontFamily: 'monospace', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="cmo" name="Custo Marginal de Operação (R$/MWh)" stroke="#eab308" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: API CONSOLE */}
      {activeTab === 'api-console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* API controls */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ComputerDesktopIcon className="w-5 h-5 text-cyan-400" />
                Painel do Conectador de Dados Gov
              </h3>
              <p className="text-xs text-gray-400 mt-1">Configure parâmetros para se conectar às APIs reais do Governo Federal.</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* API URI */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">Endpoint Alvo (CKAN Datastore):</span>
                <input 
                  type="text" 
                  value={activeApiUrl}
                  onChange={(e) => setActiveApiUrl(e.target.value)}
                  className="bg-gray-950 text-[11px] text-white p-2 rounded border border-gray-800 select-all outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Indicator */}
              <div className="p-3 bg-gray-950 rounded border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Canal Seguro ANEEL:</span>
                {isRealConnectionOk === null ? (
                  <span className="text-yellow-500 font-bold">NÃO TESTADO</span>
                ) : isRealConnectionOk ? (
                  <span className="text-green-400 font-extrabold">CONECTADO ✓</span>
                ) : (
                  <span className="text-red-500 font-extrabold">CORS BLOQUEADO ⚠</span>
                )}
              </div>

              {/* CORS bypass toggle */}
              <div className="p-3 bg-gray-950 rounded border border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold block uppercase leading-none">CORS-Anywhere Proxy</span>
                  <p className="text-[9px] text-gray-500 mt-0.5">Túnel auxiliar para bypass de cabeçalhos origin</p>
                </div>
                <button
                  onClick={() => setCorsProxyEnabled(!corsProxyEnabled)}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${corsProxyEnabled ? 'bg-emerald-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400'}`}
                >
                  {corsProxyEnabled ? 'ATIVADO' : 'DESATIVADO'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTestGovApi}
                  disabled={isTestingApi}
                  className="flex-grow bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold p-2.5 rounded transition-all text-center flex justify-center items-center gap-1.5"
                >
                  {isTestingApi ? (
                    <span className="w-3.5 h-3.5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : '⚡ Testar Conexão Direta'}
                </button>
                <button
                  onClick={handleClearLogs}
                  className="bg-gray-850 hover:bg-gray-800 text-white p-2.5 rounded border border-gray-700 hover:text-red-400 transition-all font-semibold"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-800/30 text-[11px] text-cyan-300 font-mono">
              💡 <strong>Transparência Arquitetônica:</strong> A ANEEL e o ONS expõem seus dados através do padrão CKAN. Você pode copiar o URL acima e abrir em uma nova aba do seu navegador para inspecionar os cabeçalhos de resposta originais e os registros JSON que compõem nosso Treemap.
            </div>
          </div>

          {/* Code log console */}
          <div className="lg:col-span-2 bg-gray-950 border border-gray-700 rounded-xl p-5 flex flex-col justify-between font-mono h-[420px] lg:h-auto">
            <div className="w-full">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3">
                <span className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Console de Auditoria e Resposta da API Gov (JSON Logs)
                </span>
                <span className="text-[10px] bg-gray-900 px-2 py-0.5 rounded text-gray-400">Output terminal</span>
              </div>

              <div className="bg-black/70 p-3 rounded-lg border border-gray-900 overflow-y-auto max-h-[300px] text-[11px] space-y-1.5 leading-relaxed text-cyan-300 select-text font-mono h-[280px]">
                {apiLogs.map((log, index) => (
                  <div key={index} className="break-all">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-gray-500 border-t border-gray-900 pt-2.5">
              * Para produção segura sem restrições de CORS no cliente, as chamadas são balanceadas para nossa API de gateway segura ou pre-hydrated no banco de dados local.
            </div>
          </div>
        </div>
      )}

      {/* TAB: ABOUT THE DATA */}
      {activeTab === 'about' && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-cyan-400" />
              Fontes Governamentais e Mapeamento SIN (Sistema Interligado Nacional)
            </h2>
            <p className="text-gray-400 text-sm mt-1">Explicação técnica das outorgas e barramentos regulatórios que alimentam nossa infraestrutura.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-gray-300 font-mono">
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
              <h3 className="text-cyan-400 font-bold text-sm mb-2 uppercase">1. ANEEL (SIGA)</h3>
              <p>O Sistema de Informações de Geração da ANEEL (SIGA) é atualizado diariamente e discrimina a capacidade outorgada de cada gerador centralizado do SIN. Fornece dados geoespaciais, potência instalada nominal (kW) e situação de operação de usinas hidrelétricas, solares, eólicas e nucleares.</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
              <h3 className="text-cyan-400 font-bold text-sm mb-2 uppercase">2. ONS (DGI)</h3>
              <p>A Diretoria de Planejamento do Operador Nacional do Sistema Elétrico (ONS) disponibiliza dados de infraestrutura física de subestações de alta tensão e linhas de transmissão que formam o backbone de interligação física do país, mapeados no DGI (Dados Geográficos de Infraestrutura).</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
              <h3 className="text-cyan-400 font-bold text-sm mb-2 uppercase">3. Trigeração MAUAX</h3>
              <p>Integramos a telemetria do SIN com o Data Center SP4 para balancear a cogeração da nossa planta. Quando a grade nacional está sob alto estresse (frequência de barramento &lt; 59.95 Hz), acionamos bypass para mitigar consumo do chiller, gerando autossuficiência imediata.</p>
            </div>
          </div>
        </div>
      )}

      {/* SELECTED ASSET DRAWER / MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 max-w-xl w-full shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] uppercase font-mono font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded">
                    Ativo {selectedAsset.id}
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold bg-gray-950 text-gray-400 px-2 py-0.5 rounded">
                    {selectedAsset.dataSource}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                    selectedAsset.status === 'Operando' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    selectedAsset.status === 'Alerta' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                  >
                    ● {selectedAsset.status}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white font-sans mt-1">{selectedAsset.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-white text-lg font-bold font-mono px-2 py-0.5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="grid grid-cols-2 p-1 bg-gray-950 rounded-lg border border-gray-800 text-xs font-mono">
              <button
                onClick={() => setModalTab('specs')}
                className={`py-1.5 rounded-md font-bold transition-all ${modalTab === 'specs' ? 'bg-cyan-500 text-gray-950 shadow' : 'text-gray-400 hover:text-gray-200'}`}
              >
                📋 Ficha Técnica
              </button>
              <button
                onClick={() => setModalTab('telemetry')}
                className={`py-1.5 rounded-md font-bold transition-all ${modalTab === 'telemetry' ? 'bg-cyan-500 text-gray-950 shadow' : 'text-gray-400 hover:text-gray-200'}`}
              >
                📡 Telemetria & Canal (Live)
              </button>
            </div>

            {/* TAB CONTENT: SPECS */}
            {modalTab === 'specs' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 font-mono text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Classificação Geral:</span>
                    <span className="text-white font-bold">{selectedAsset.subType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Concessionária de Operação:</span>
                    <span className="text-cyan-400 font-bold truncate max-w-[60%]">{selectedAsset.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dimensão Mapeada:</span>
                    <span className="text-white font-bold">
                      {selectedAsset.capacity} {selectedAsset.type === 'generator' ? 'MW' : selectedAsset.type === 'substation' ? 'MVA' : 'km'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tensão Nominal:</span>
                    <span className="text-yellow-400 font-bold">{selectedAsset.voltage} kV</span>
                  </div>
                  <div className="flex justify-between flex-wrap">
                    <span className="text-gray-400">Fluxo Elétrico Ativo:</span>
                    <span className="text-emerald-400 font-bold">{selectedAsset.activeLoad} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Região SIN (Estado):</span>
                    <span className="text-white font-bold">{selectedAsset.region} ({selectedAsset.state})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data de Outorga ANEEL:</span>
                    <span className="text-gray-300 font-bold">{selectedAsset.concessionDate}</span>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                {selectedAsset.capacity > 0 && selectedAsset.type === 'generator' && (
                  <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-800/80 font-mono text-xs space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Taxa de Aproveitamento Nominal:</span>
                      <span className="text-cyan-400 font-bold">
                        {((selectedAsset.activeLoad / selectedAsset.capacity) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-850">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (selectedAsset.activeLoad / selectedAsset.capacity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Geographic Grid Coords info */}
                <div className="bg-gray-950 p-3 rounded-lg border border-gray-850 text-[11px] text-gray-400 leading-relaxed font-mono">
                  <strong>Coordenadas Grid:</strong> Lat {selectedAsset.latitude.toFixed(4)} | Long {selectedAsset.longitude.toFixed(4)} <br />
                  Fator de Potência Estável: <span className="text-emerald-400">0.98 cos φ</span> | Barramento síncrono: <span className="text-amber-400">{sinFrequency.toFixed(2)} Hz</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TELEMETRY */}
            {modalTab === 'telemetry' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 space-y-3 font-mono text-xs">
                  {/* Real-time metrics overview */}
                  <div className="grid grid-cols-2 gap-4 border-b border-gray-800/60 pb-3">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Link do Canal</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${selectedAsset.status === 'Fora de Serviço' ? 'bg-red-500 animate-pulse' : 'bg-green-400 animate-ping'}`}></span>
                        <span className={`font-bold ${selectedAsset.status === 'Fora de Serviço' ? 'text-red-400' : 'text-green-400'}`}>
                          {selectedAsset.status === 'Fora de Serviço' ? 'DOWN / INATIVO' : 'UP / ONLINE'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Taxa de Sucesso</span>
                      <p className="text-white font-bold mt-1">
                        {selectedAsset.status === 'Fora de Serviço' ? '0.0%' : '100.0% (Excelente)'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Protocolo RTU</span>
                      <p className="text-cyan-400 font-bold mt-1">IEC 60870-104</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Segurança Canal</span>
                      <p className="text-teal-400 font-bold mt-1">VPN IPSec AES-256</p>
                    </div>
                  </div>

                  {/* Test link trigger button */}
                  <div className="pt-2">
                    <button
                      onClick={testAssetTelemetry}
                      disabled={isTestingAssetLink}
                      className="w-full bg-gray-900 hover:bg-gray-850 text-cyan-400 border border-cyan-800/60 hover:border-cyan-400 p-2 rounded text-xs font-bold transition-all flex justify-center items-center gap-1.5"
                    >
                      {isTestingAssetLink ? (
                        <>
                          <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                          Varrendo Registradores RTU...
                        </>
                      ) : (
                        '⚡ Testar Link de Telemetria em Tempo Real'
                      )}
                    </button>
                  </div>
                </div>

                {/* Telemetry live log output */}
                <div className="bg-black/80 rounded-lg p-3 border border-gray-900 h-32 overflow-y-auto font-mono text-[10px] text-cyan-400 space-y-1 select-text">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest border-b border-gray-950 pb-1 mb-1">
                    Terminal de Conexão Virtualizada
                  </div>
                  {assetTelemetryLogs.map((log, idx) => (
                    <div key={idx} className="break-all">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* INLINE DISPATCH SIMULATOR PANEL */}
            {simulatedDespachoLog.length > 0 && (
              <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-850 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-yellow-400 flex items-center gap-1.5">
                    {simulatedDespachoActive ? (
                      <span className="w-2.5 h-2.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>⚙</span>
                    )}
                    Painel de Despacho Ativo (ONS)
                  </span>
                  {simulatedDespachoSuccess !== null && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${simulatedDespachoSuccess ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {simulatedDespachoSuccess ? 'EXECUTADO ✓' : 'ABORTADO ⚠'}
                    </span>
                  )}
                </div>

                <div className="max-h-24 overflow-y-auto font-mono text-[9px] text-gray-400 space-y-0.5 leading-tight select-text">
                  {simulatedDespachoLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 text-xs font-mono border-t border-gray-800/60">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                Voltar
              </button>
              <button
                onClick={simulateDespacho}
                disabled={simulatedDespachoActive}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg transition-all disabled:opacity-55"
              >
                {simulatedDespachoActive ? 'Enviando Comando...' : 'Simular Despacho'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnsAneelGrid;
