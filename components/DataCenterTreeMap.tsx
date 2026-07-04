/**
 * @file DataCenterTreeMap.tsx
 * @description Supercharged dashboard for the ODATA Osasco SP4 Data Center, featuring a Finviz-style proportional treemap, an interactive 800VDC electrical busbar and liquid cooling (HVAC) schematic, secure remote transmission logs (Protocolo Seguro), and a core-by-core server telemetry detail views.
 * @version 2.0.0
 * @date 2026-05-31
 * @author Senior DevOps & Energy Engineers
 * @signature MAUAX Agile Consortium & GOS7
 */
import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import DashboardCard from './DashboardCard';
import { ServerRackIcon, InfoIcon, ActivityIcon, DropletIcon } from './icons';

// Types for ODATA Osasco Data Center hardware & simulation
export type DataCenterMetric = 'totalEnergyConsumption' | 'temp' | 'cpuCoresUsed' | 'gpuUtilization' | 'networkIO' | 'memoryUsage';

export interface OdataRackNode {
  name: string; // "Rack-01" etc
  id: number;
  status: 'Online' | 'High Load' | 'Offline';
  clientApp: string; // "MEX BioTech AI", "Prefeitura de Mauá", etc.
  platformType: 'DGX SuperPOD' | 'HGX Platform' | 'Grace CPU Cluster' | 'MGX Modular Server';
  vmCount: number;
  cpusCount: number;
  gpusCount: number;
  cpuCoresCount: number;
  gpuTensorCoresCount: number;
  
  // Real-time proportional values
  temp: number; // avg temp in °C
  cpuCoresUsed: number; // core count used
  gpuUtilization: number; // % usage
  networkIO: number; // traffic in Gbps
  totalEnergyConsumption: number; // consumption in kW on 800VDC busbar
  memoryUsage: number; // RAM in GB
  
  // Voltage and amperage on the 800VDC direct current busbar
  vdcVoltage: number;
  vdcCurrent: number;

  // GPU & CPU Core-by-Core Temperatures (°C)
  coreTemps: number[];
}

// Client Tenants for ODATA Osasco rack allocation
const CLIENT_TENANTS = [
  { name: 'MEX BioTech AI Engine', color: '#10b981', racks: [1, 20] },
  { name: 'Prefeitura de Mauá - Smart Portal', color: '#3b82f6', racks: [21, 40] },
  { name: 'Petrobras - Modelagem Geológica', color: '#f59e0b', racks: [41, 60] },
  { name: 'Sabesp - Inteligência Hídrica', color: '#06b6d4', racks: [61, 80] },
  { name: 'UNIPampa - BioData Storage', color: '#d946ef', racks: [81, 100] },
  { name: 'Edivaldo AI Analytics & GOS7 DevOps', color: '#ec4899', racks: [101, 120] }
];

const getClientForRack = (rackId: number) => {
  const tenant = CLIENT_TENANTS.find(t => rackId >= t.racks[0] && rackId <= t.racks[1]);
  return tenant ? tenant.name : 'Odata Private Tenant';
};

// Generates comprehensive realistic simulated hardware metrics
const generateOdataRacks = (): OdataRackNode[] => {
  return Array.from({ length: 120 }, (_, i) => {
    const rackId = i + 1;
    const clientApp = getClientForRack(rackId);
    
    // Status roll
    const rand = Math.random();
    let status: 'Online' | 'High Load' | 'Offline' = 'Online';
    if (rand > 0.96) {
      status = 'Offline';
    } else if (rand > 0.83) {
      status = 'High Load';
    }

    // Hardware specifications based on client type
    let platformType: OdataRackNode['platformType'] = 'MGX Modular Server';
    let gpusCount = 16;
    let cpusCount = 8;
    if (rackId <= 20) {
      platformType = 'DGX SuperPOD';
      gpusCount = 32;
      cpusCount = 16;
    } else if (rackId > 40 && rackId <= 60) {
      platformType = 'HGX Platform';
      gpusCount = 24;
      cpusCount = 12;
    } else if (rackId > 20 && rackId <= 40) {
      platformType = 'Grace CPU Cluster';
      gpusCount = 4; // Mostly Grace CPUs
      cpusCount = 32;
    }

    const cpuCoresCount = cpusCount * 128; // e.g. 128 cores per CPU
    const gpuTensorCoresCount = gpusCount * 64; // arbitrary virtualized Tensor core blocks

    // Static specs vs dynamic usage values
    let temp = 18; // default cooling intake
    let cpuCoresUsed = 0;
    let gpuUtilization = 0;
    let networkIO = 0;
    let totalEnergyConsumption = 12.0; // standby draw in kW
    let memoryUsage = 0;
    let vdcVoltage = 800.2;
    let vdcCurrent = 15.0;

    if (status !== 'Offline') {
      const loadMultiplier = status === 'High Load' ? 1.4 : 0.8;
      gpuUtilization = Math.round(Math.min(100, Math.max(10, (40 + Math.random() * 50) * loadMultiplier)));
      cpuCoresUsed = Math.round(Math.min(cpuCoresCount, (cpuCoresCount * (0.3 + Math.random() * 0.5)) * loadMultiplier));
      temp = Math.round(21 + Math.random() * 10 + (gpuUtilization / 10)); // Liquid cooling maintains below 38°C mostly
      networkIO = parseFloat(( (50 + Math.random() * 300) * loadMultiplier ).toFixed(1));
      memoryUsage = Math.round( (256 + Math.random() * 1280) * (status === 'High Load' ? 1.2 : 0.9) );
      
      // 800VDC current draw is directly proportional to power consumption
      totalEnergyConsumption = parseFloat( (150 + (gpuUtilization * 3) + (cpuCoresUsed / cpuCoresCount) * 80).toFixed(1) );
      vdcVoltage = parseFloat( (800 + (Math.random() - 0.5) * 5).toFixed(1) );
      vdcCurrent = parseFloat( (totalEnergyConsumption / (vdcVoltage / 1000)).toFixed(2) );
    }

    // Core temperatures array
    const coreTemps = Array.from({ length: 8 }, () => {
      if (status === 'Offline') return 18;
      const baseline = temp - 4;
      return Math.round(baseline + Math.random() * 8);
    });

    return {
      name: `Rack-${rackId.toString().padStart(3, '0')}`,
      id: rackId,
      status,
      clientApp,
      platformType,
      vmCount: status === 'Offline' ? 0 : Math.round(10 + Math.random() * 25),
      cpusCount,
      gpusCount,
      cpuCoresCount,
      gpuTensorCoresCount,
      temp,
      cpuCoresUsed,
      gpuUtilization,
      networkIO,
      totalEnergyConsumption,
      memoryUsage,
      vdcVoltage,
      vdcCurrent,
      coreTemps
    };
  });
};

export const DataCenterTreeMap: React.FC<{
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  t: (key: string) => string;
}> = ({ isMaximizable, isMaximized, onToggleMaximize, t }) => {
  // Real-time telemetry structures 
  const [racks, setRacks] = useState<OdataRackNode[]>([]);
  const [selectedRack, setSelectedRack] = useState<OdataRackNode | null>(null);
  
  // Interactive variables
  const [sizingMetric, setSizingMetric] = useState<DataCenterMetric>('totalEnergyConsumption');
  const [filterTenant, setFilterTenant] = useState<string>('ALL');
  
  // DC Busbar and HVAC state simulation
  const [busVoltage, setBusVoltage] = useState(800.5);
  const [busLeakageIndex, setBusLeakageIndex] = useState(0.42);
  const [rectifierActive, setRectifierActive] = useState(true);
  
  // Liquid Cooling specific parameters
  const [coolantFlow, setCoolantFlow] = useState(452.8); // GPM
  const [cduInletTemp, setCduInletTemp] = useState(18.2); // °C
  const [cduOutletTemp, setCduOutletTemp] = useState(31.8); // °C
  const [pidSetPoint, setPidSetPoint] = useState(24.0); // °C target
  const [fuzzyDiagnostic, setFuzzyDiagnostic] = useState(true);

  // Secure Protocol Dashboard (Protocolo Seguro) simulator
  const [secureToken, setSecureToken] = useState('SHA256: 0x8a92fb4cde10375aef91c8309');
  const [ipsecTunnelOpen, setIpsecTunnelOpen] = useState(true);
  const [snmpV3Encryption, setSnmpV3Encryption] = useState(true);
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);

  // Telemetry loop trigger
  useEffect(() => {
    const initial = generateOdataRacks();
    setRacks(initial);

    // Bootstrap secure protocol audit logs
    setSecurityLogs([
      `[${new Date().toISOString().slice(11,19)}] SSH TLS 1.3 tunnel established to ODATA Osasco.`,
      `[${new Date().toISOString().slice(11,19)}] IPsec tunnel verified at 800VDC power substation.`,
      `[${new Date().toISOString().slice(11,19)}] SNMPv3 polling activated for 120 liquid cooled racks.`,
      `[${new Date().toISOString().slice(11,19)}] Webhook TLS handshake completed with MAUAX trigeneration controller.`
    ]);

    const interval = setInterval(() => {
      // Dynamic updates to mimic live sensor fluctuations
      setRacks(prev => prev.map(rack => {
        if (rack.status === 'Offline') return rack;
        
        const delta = (Math.random() - 0.5);
        const newCpuUsed = Math.min(rack.cpuCoresCount, Math.max(10, rack.cpuCoresUsed + Math.round(delta * 20)));
        const newGpuUtil = Math.min(100, Math.max(5, rack.gpuUtilization + Math.round(delta * 8)));
        const newTemp = Math.round(Math.min(55, Math.max(15, rack.temp + (Math.random() - 0.48) * 1.5)));
        const newIO = parseFloat(Math.min(400, Math.max(10, rack.networkIO + delta * 25)).toFixed(1));
        const newMem = Math.min(1536, Math.max(128, rack.memoryUsage + Math.round(delta * 40)));
        const newPower = parseFloat((newCpuUsed * 0.08 + newGpuUtil * 3.1 + newMem * 0.01 + 80).toFixed(1));
        
        const newVoltage = parseFloat((800 + (Math.random() - 0.5) * 5).toFixed(1));
        const newCurrent = parseFloat((newPower / (newVoltage / 1000)).toFixed(2));
        
        const newCoreTemps = rack.coreTemps.map(ct => {
          const coreDelta = Math.round((Math.random() - 0.5) * 3);
          return Math.min(65, Math.max(18, ct + coreDelta));
        });

        return {
          ...rack,
          cpuCoresUsed: newCpuUsed,
          gpuUtilization: newGpuUtil,
          temp: newTemp,
          networkIO: newIO,
          memoryUsage: newMem,
          totalEnergyConsumption: newPower,
          vdcVoltage: newVoltage,
          vdcCurrent: newCurrent,
          coreTemps: newCoreTemps
        };
      }));

      // Fluctuate central 800VDC readings
      setBusVoltage(prev => parseFloat((800 + (Math.random() - 0.5) * 3).toFixed(2)));
      setBusLeakageIndex(prev => parseFloat(Math.max(0.1, Math.min(1.2, prev + (Math.random() - 0.5) * 0.04)).toFixed(3)));
      setCoolantFlow(prev => parseFloat((450 + (Math.random() - 0.5) * 10).toFixed(1)));
      
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRotateTelemetryKeys = () => {
    const characters = 'ABCDEF0123456789';
    let result = 'SHA256: 0x';
    for (let i = 0; i < 24; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setSecureToken(result);
    setSecurityLogs(prev => [
      `[${new Date().toISOString().slice(11,19)}] SECURITY: Telemetry session keys rotated successfully.`,
      ...prev.slice(0, 10)
    ]);
  };

  const handleTestVdcConectivity = () => {
    setSecurityLogs(prev => [
      `[${new Date().toISOString().slice(11,19)}] COMMAND: Executando teste de isolamento termo-elétrico em 800VDC...`,
      `[${new Date().toISOString().slice(11,19)}] TELEMETRY: Resposta OK. Linha neutra de aterramento estável (< 0.2V).`,
      ...prev.slice(0, 10)
    ]);
  };

  const handleClearSecureLogs = () => {
    setSecurityLogs([`[${new Date().toISOString().slice(11,19)}] Log console cleared by administrator session.`]);
  };

  // Filtering criteria applied on data for the Treemap
  const filteredData = useMemo(() => {
    if (filterTenant === 'ALL') return racks;
    return racks.filter(r => r.clientApp === filterTenant);
  }, [racks, filterTenant]);

  // Consolidates global totals to answer specific ODATA hardware request details
  const globalTotals = useMemo(() => {
    return racks.reduce((acc, rack) => {
      if (rack.status !== 'Offline') {
        acc.activeRacks++;
        acc.totalGpus += rack.gpusCount;
        acc.totalCpus += rack.cpusCount;
        acc.totalCpuCores += rack.cpuCoresCount;
        acc.totalGpuTensorCores += rack.gpuTensorCoresCount;
        acc.activeCpuCoresUsed += rack.cpuCoresUsed;
        acc.totalEnergy += rack.totalEnergyConsumption;
        acc.vmsActive += rack.vmCount;
      } else {
        acc.inactiveRacks++;
      }
      return acc;
    }, {
      activeRacks: 0,
      inactiveRacks: 0,
      totalGpus: 0,
      totalCpus: 0,
      totalCpuCores: 0,
      totalGpuTensorCores: 0,
      activeCpuCoresUsed: 0,
      totalEnergy: 0,
      vmsActive: 0
    });
  }, [racks]);

  // Labels and metric configurations
  const metricConfigs = {
    totalEnergyConsumption: { label: t('dataCenter.treemap.energyConsumption') || 'Consumo (kW)', color: 'text-yellow-400', unit: 'kW' },
    temp: { label: t('dataCenter.rack.modal.temperature') || 'Temperatura (°C)', color: 'text-red-400', unit: '°C' },
    cpuCoresUsed: { label: 'Uso de CPU', color: 'text-emerald-400', unit: 'Cores' },
    gpuUtilization: { label: 'Uso de GPU (%)', color: 'text-cyan-400', unit: '%' },
    networkIO: { label: 'Tráfego de Rede', color: 'text-blue-400', unit: 'Gbps' },
    memoryUsage: { label: 'Memória Ativa', color: 'text-purple-400', unit: 'GB' },
  };

  // Custom Treemap Box renderer imitating Finviz heatmap styles
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name } = props;
    
    if (indexMissingCheck(props)) return null;

    // Direct look-up in live state to bypass Recharts lag or missing prop mapping
    const matched = racks.find(r => r.name === name);
    const status = matched ? matched.status : (props.status || 'Online');
    const temp = matched ? matched.temp : (props.temp || 25);
    const gpuUtilization = matched ? matched.gpuUtilization : (props.gpuUtilization || 0);
    const totalEnergyConsumption = matched ? matched.totalEnergyConsumption : (props.totalEnergyConsumption || 0);
    const clientApp = matched ? matched.clientApp : (props.clientApp || '');

    // Gradient based on selected metric intensity
    let fill = '#1e293b'; // off gray
    if (status === 'Offline') {
      fill = '#111827';
    } else {
      if (sizingMetric === 'temp') {
        const value = temp;
        if (value < 25) fill = '#0f766e'; // Teal 700 (Very Cool)
        else if (value < 34) fill = '#1e3a8a'; // Blue 900 (Optimal Cooling)
        else if (value < 42) fill = '#854d0e'; // Amber 800 (Warming up)
        else fill = '#991b1b'; // Red 800 (Thermal Threat)
      } else if (sizingMetric === 'gpuUtilization') {
        const value = gpuUtilization;
        if (value < 30) fill = '#065f46'; // Green 800
        else if (value < 75) fill = '#1f2937'; // Balanced Black Slate
        else fill = '#be123c'; // Rose 700 (Compute Heavy)
      } else if (sizingMetric === 'totalEnergyConsumption') {
        const value = totalEnergyConsumption;
        if (value < 100) fill = '#0f172a'; // Deep Slate
        else if (value < 300) fill = '#0284c7'; // Sky Blue
        else fill = '#d97706'; // Orange 600
      } else {
        // Fallback standard heat based
        if (status === 'High Load') fill = '#e11d48'; // Rose Red
        else fill = '#10b981'; // Emerald Active
      }
    }

    const valueToDisplay = matched ? matched[sizingMetric] : (props[sizingMetric] || 0);
    const unit = metricConfigs[sizingMetric].unit;

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
            stroke: '#111827',
            strokeWidth: 1.5,
          }}
          onClick={() => {
            if (matched) setSelectedRack(matched);
          }}
        />
        {width > 64 && height > 28 && (
          <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8} className="pointer-events-none select-none overflow-hidden">
            <div className="flex flex-col h-full justify-between p-0.5 text-white">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold bg-black/40 px-1 rounded truncate tracking-tighter" style={{ fontSize: width < 90 ? '9px' : '11px' }}>
                  {name}
                </span>
                {status === 'Offline' && (
                  <span className="text-[9px] text-red-500 font-extrabold px-1 rounded bg-red-950/40">OFF</span>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono font-extrabold text-xs truncate leading-none text-gray-200" style={{ fontSize: width < 100 ? '10px' : '12px' }}>
                  {status === 'Offline' ? '-' : `${valueToDisplay} ${unit}`}
                </p>
                {width > 120 && (
                  <p className="text-[9px] text-gray-400 capitalize truncate mt-0.5" style={{ fontSize: '8px' }}>
                    {clientApp ? clientApp.split(' ')[0] : 'System'}
                  </p>
                )}
              </div>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  const indexMissingCheck = (props: any) => {
    return !props || !props.name;
  };

  // Custom tooltips inside the Treemap 
  const CustomTreeMapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: OdataRackNode = payload[0].payload;
      return (
        <div className="bg-gray-950 p-4 border border-gray-700 rounded-lg shadow-2xl text-xs w-64 text-gray-200">
          <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
            <p className="font-extrabold text-white text-sm font-mono">{data.name}</p>
            <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase ${
              data.status === 'Online' ? 'bg-green-500/20 text-green-400' : 
              data.status === 'High Load' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700/50 text-gray-400'}`}
            >
              {data.status}
            </span>
          </div>
          
          <div className="space-y-1 bg-gray-900/50 p-2 rounded border border-gray-800 mb-2 font-mono">
            <p className="text-[10px] text-gray-400">Cliente / Organização:</p>
            <p className="text-white font-bold leading-none truncate">{data.clientApp}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">Plataforma: {data.platformType}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[11px] pt-1 border-t border-gray-900">
            <span className="text-gray-400">VMs Ativas:</span>
            <span className="text-white text-right font-bold">{data.vmCount}</span>
            
            <span className="text-gray-400">NVIDIA GPUs:</span>
            <span className="text-cyan-400 text-right font-bold">{data.gpusCount}x</span>
            
            <span className="text-gray-400">CPU Cores:</span>
            <span className="text-emerald-400 text-right font-bold">{data.cpuCoresUsed}/{data.cpuCoresCount}</span>
            
            <span className="text-gray-400">GPU Util:</span>
            <span className="text-cyan-400 text-right font-bold">{data.gpuUtilization}%</span>

            <span className="text-gray-400">Consumo (VDC):</span>
            <span className="text-yellow-400 text-right font-bold">{data.totalEnergyConsumption} kW</span>

            <span className="text-gray-400">Linha 800VDC:</span>
            <span className="text-yellow-500 text-right font-bold">{data.vdcVoltage}V / {data.vdcCurrent}A</span>

            <span className="text-gray-400">Temp Média:</span>
            <span className="text-red-400 text-right font-bold">{data.temp} °C</span>

            <span className="text-gray-400">Tráfego I/O:</span>
            <span className="text-blue-400 text-right font-bold">{data.networkIO} Gbps</span>

            <span className="text-gray-400">Memória RAM:</span>
            <span className="text-purple-400 text-right font-bold">{data.memoryUsage} GB</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: TOPOLOGY HARDWARE EXPLANATION HEADER */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 p-6 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ServerRackIcon className="w-56 h-56 text-cyan-400" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-extrabold">Infratrutura ODATA Osasco SP4 & MAUAX</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight mt-1">
              Topologia do Cluster Data Cloud de Alta Densidade
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-3xl leading-relaxed">
              Estruturado para computação de inteligência artificial de exaescala via trigeração MAUAX. Integra barramentos redundantes de <strong>800VDC</strong> com refrigeração líquida integrada direta na placa (Direct-to-Chip Water Blocks) para servidores NVIDIA Grace Hopper, Grace, HGX e MGX.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-800/80 px-3 py-1.5 rounded-md border border-gray-700/60 text-xs text-white font-mono flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span> 800VDC Direct Bus
            </span>
            <span className="bg-cyan-950/40 px-3 py-1.5 rounded-md border border-cyan-800/40 text-xs text-cyan-300 font-mono flex items-center gap-1.5">
              <DropletIcon className="w-3.5 h-3.5" /> Liquid Cooling Active
            </span>
          </div>
        </div>

        {/* Dynamic Topology totals of ODATA SP4 based on server allocation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 border-t border-gray-800/80 pt-6">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">CPUs Totais (Grace)</p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{globalTotals.totalCpus.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{globalTotals.totalCpuCores.toLocaleString()} Cores CPU</p>
          </div>
          
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">GPUs de IA (NVIDIA)</p>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">{globalTotals.totalGpus.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">~{(globalTotals.totalGpuTensorCores).toLocaleString()} Tensor Blocks</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Racks ODATA SP4</p>
            <p className="text-xl font-bold font-mono text-white mt-1">120 <span className="text-xs text-gray-400">Total</span></p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{globalTotals.activeRacks} Ativos | {globalTotals.inactiveRacks} Off</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">VM Slices Distribuidas</p>
            <p className="text-xl font-bold font-mono text-purple-400 mt-1">{globalTotals.vmsActive.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Containers em K8s</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Demanda do Barramento</p>
            <p className="text-xl font-bold font-mono text-yellow-400 mt-1">{(globalTotals.totalEnergy / 1000).toFixed(2)} MW</p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">PUE Atual: ~1.08</p>
          </div>

          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sistemas Clientes</p>
            <p className="text-xl font-bold font-mono text-pink-400 mt-1">6 <span className="text-xs text-gray-400">Projetos</span></p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Multi-Tenant Organizado</p>
          </div>
        </div>

        {/* Sector Grouping details (Server apps, VMs & Racks details) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-[11px] text-gray-400 bg-gray-900/30 p-3 rounded-lg border border-gray-800/30">
          <div className="font-mono">
            <span className="font-bold text-white uppercase block mb-1">Setor Alpha (Racks 1-40)</span>
            <p>• MEX BioTech AI Engine: 20 Racks [NVIDIA Dual Port MGX, 640 GPUs]</p>
            <p>• Prefeitura de Mauá - Smart Portal: 20 Racks [Grace CPU slots, zero idle]</p>
          </div>
          <div className="font-mono">
            <span className="font-bold text-white uppercase block mb-1">Setor Beta (Racks 41-80)</span>
            <p>• Petrobras - Modelagem Geofísica: 20 Racks [HGX Supercomputing stack]</p>
            <p>• Sabesp - Inteligência Hídrica: 20 Racks [DGX H100 Clusters]</p>
          </div>
          <div className="font-mono">
            <span className="font-bold text-white uppercase block mb-1">Setor Gamma (Racks 81-120)</span>
            <p>• UNIPampa - BioData Storage: 20 Racks [High-capacity IO storage]</p>
            <p>• Edivaldo AI & GOS7 DevOps: 20 Racks [Dynamic hybrid host slices]</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE MAIN FINVIZ DENSE TREEMAP */}
      <DashboardCard 
        title="Finviz Live Heatmap: Telemetria Proporcional de Racks"
        icon={<ActivityIcon className="w-5 h-5 text-cyan-400" />}
        isMaximizable={isMaximizable}
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
        action={
          <div className="flex flex-wrap items-center gap-2 bg-gray-950 p-1.5 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 px-1 font-bold">Filtro Cliente:</span>
            <select 
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="bg-gray-900 text-xs text-white p-1 rounded border border-gray-700 outline-none focus:border-cyan-500"
            >
              <option value="ALL">Visualizar Todos (120 Racks)</option>
              {CLIENT_TENANTS.map(tenant => (
                <option key={tenant.name} value={tenant.name}>{tenant.name.split(' - ')[0]}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="flex flex-col h-full min-h-[580px] justify-between">
          
          {/* Real-time Dynamic Sizing Selector ("ao selecionar por rack temperatura uso de nucleos cpu gpu trafego consumo uso de memoria mostre tree por tamanho proporcional") */}
          <div className="bg-gray-950/70 p-3 rounded-lg border border-gray-800 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-cyan-400 font-extrabold uppercase">Eixo Adicional de Dimensionamento Finviz</p>
              <p className="text-sm font-bold text-white mt-0.5">Selecione a métrica para definir o tamanho proporcional dos blocos:</p>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-gray-900/80 p-1 rounded-lg border border-gray-800">
              <button 
                onClick={() => setSizingMetric('totalEnergyConsumption')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded transition-all ${sizingMetric === 'totalEnergyConsumption' ? 'bg-yellow-500 text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
                title="Consumo Proporcional por Rack em kW"
              >
                ⚡ Consumo (kW)
              </button>
              <button 
                onClick={() => setSizingMetric('temp')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded transition-all ${sizingMetric === 'temp' ? 'bg-red-500 text-white shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
                title="Temperatura de Operação por Core"
              >
                🌡️ Temperatura
              </button>
              <button 
                onClick={() => setSizingMetric('cpuCoresUsed')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded transition-all ${sizingMetric === 'cpuCoresUsed' ? 'bg-emerald-500 text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
                title="Saturação de Núcleos de CPU"
              >
                💻 Núcleos CPU
              </button>
              <button 
                onClick={() => setSizingMetric('gpuUtilization')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded transition-all ${sizingMetric === 'gpuUtilization' ? 'bg-cyan-500 text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
                title="Aproveitamento Tensor de GPUs"
              >
                🤖 Carga GPU
              </button>
              <button 
                onClick={() => setSizingMetric('networkIO')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded transition-all ${sizingMetric === 'networkIO' ? 'bg-blue-500 text-white shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
                title="Tráfego Instantâneo de Entrada/Saída"
              >
                🌐 Tráfego Rede
              </button>
              <button 
                onClick={() => setSizingMetric('memoryUsage')}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded transition-all ${sizingMetric === 'memoryUsage' ? 'bg-purple-500 text-white shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
                title="Capacidade Alocada de RAM"
              >
                💾 Memória
              </button>
            </div>
          </div>

          {/* Sizing Indicator label in real time */}
          <div className="flex justify-between items-center text-xs text-gray-400 font-mono mb-2 px-1">
            <span>Legenda Finviz: <span className="text-green-500 font-extrabold">■ Cool / Normal</span> ➔ <span className="text-yellow-500 font-extrabold">■ High load</span> ➔ <span className="text-red-500 font-extrabold">■ Alert Limit</span></span>
            <span>Tamanho proporcional a: <strong className={metricConfigs[sizingMetric].color}>{metricConfigs[sizingMetric].label}</strong></span>
          </div>

          {/* Chart Section */}
          <div className="flex-grow min-h-[420px] bg-gray-950/40 p-2 rounded-lg border border-gray-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={filteredData}
                dataKey={sizingMetric}
                stroke="#111827"
                fill="#8884d8"
                content={<CustomizedContent t={t} />}
                isAnimationActive={false}
                aspectRatio={16/9}
              >
                <Tooltip content={<CustomTreeMapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
          
          <p className="text-center text-[10px] text-gray-500 font-mono mt-2">
            💡 Dica: Clique em qualquer bloco acima para abrir uma janela de auditoria profunda e mapeamento de temperaturas por núcleo.
          </p>
        </div>
      </DashboardCard>

      {/* SECTION 3: DC BARRAMENTO 800VDC & NVIDIA LIQUID COOLING (HVAC) DASHBOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Electrical diagram card (800VDC Busbar) */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-gray-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                  Barramento elétrico Corrente Contínua (DC Barramento 800VDC)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Alimentação CC em cascata de baixíssima perda para os supercomputadores de IA</p>
              </div>
              <span className="text-xs bg-yellow-950 text-yellow-400 font-mono px-2 py-0.5 rounded font-black border border-yellow-800/50">800VDC NOMINAL</span>
            </div>

            {/* Electrical components & active schematics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 font-mono">
                <span className="text-[10px] text-gray-400 uppercase">Tensão Operacional</span>
                <p className="text-lg font-bold text-yellow-400 mt-1">{busVoltage.toFixed(2)} VDC</p>
                <span className="text-[9px] text-green-400 font-bold">✓ Ripple Estável (&lt;0.5%)</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 font-mono">
                <span className="text-[10px] text-gray-400 uppercase">Isolação de Vazamento</span>
                <p className="text-lg font-bold text-white mt-1">{busLeakageIndex.toFixed(3)} mA</p>
                <span className="text-[9px] text-emerald-400 font-bold">✓ Norma ABNT OK</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 font-mono">
                <span className="text-[10px] text-gray-400 uppercase">Perdas Térmicas</span>
                <p className="text-lg font-bold text-red-400 mt-1">0.38 <span className="text-xs font-normal text-gray-400">%</span></p>
                <span className="text-[9px] text-gray-500">Subestação Mauá-Odata</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 font-mono">
                <span className="text-[10px] text-gray-400 uppercase">Retificador Ativo</span>
                <p className={`text-lg font-bold mt-1 ${rectifierActive ? 'text-green-400' : 'text-red-500'}`}>
                  {rectifierActive ? 'CONECTADO' : 'FLUTUANTE'}
                </p>
                <span className="text-[9px] text-gray-500">IGBT High-Performance</span>
              </div>
            </div>

            {/* Interactive schematic of energy integration */}
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 flex flex-col justify-center items-center">
              <span className="text-[9px] text-gray-500 font-mono self-start uppercase">ESQUEMÁTICO INTEGRADO DE FLUXO ENERGÉTICO (800VDC LINE)</span>
              
              <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-2 mt-4 pb-2 text-[10px] text-gray-400 font-mono text-center">
                
                <div className="bg-gray-900 p-2 rounded border border-gray-800 w-36 relative">
                  <span className="text-emerald-400 block font-bold">UTE MAUAX Bio</span>
                  <span>Co-gerador Gas/H₂</span>
                  <p className="text-[9px] text-gray-500 mt-1">Geração de Termo-Frio</p>
                  <div className="hidden sm:block absolute top-1/2 -right-4 w-4 h-[1px] bg-cyan-500"></div>
                </div>

                <div className="bg-gray-900 p-2 rounded border border-gray-800 w-40 relative">
                  <span className="text-yellow-400 block font-bold">Retificador CC 800V</span>
                  <span>Pontes Inversoras Act.</span>
                  <p className="text-[9px] text-teal-400 mt-1">Bypass AC Direct Link</p>
                  <div className="hidden sm:block absolute top-1/2 -right-4 w-4 h-[1px] bg-cyan-500"></div>
                </div>

                <div className="bg-gray-900 p-2 rounded bg-cyan-950/30 border border-cyan-800/50 w-40 relative">
                  <span className="text-cyan-400 block font-bold">NVIDIA Liquid CDUs</span>
                  <span>Controladores de Vazão</span>
                  <p className="text-[9px] text-white mt-1">Ganhos de Trigeração</p>
                  <div className="hidden sm:block absolute top-1/2 -right-4 w-4 h-[1px] bg-cyan-500"></div>
                </div>

                <div className="bg-gray-900 p-2 rounded border border-gray-800 w-36">
                  <span className="text-pink-400 block font-bold">120 ODATA Racks</span>
                  <span>Compute Stack SP4</span>
                  <p className="text-[9px] text-yellow-500 mt-1">Direct DC Bus Supply</p>
                </div>

              </div>

              {/* Action utilities */}
              <div className="w-full border-t border-gray-900 mt-3 pt-3 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={handleTestVdcConectivity}
                  className="bg-gray-900 hover:bg-gray-800 text-yellow-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded border border-yellow-500/30 transition-all"
                >
                  ⚡ Testar Conectividade 800VDC
                </button>
                <button
                  onClick={() => setRectifierActive(!rectifierActive)}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded border border-gray-800 transition-all"
                >
                  🔄 Alternar Modo Retificador
                </button>
              </div>
            </div>

          </div>
          
          <div className="text-[9px] text-gray-500 mt-3 font-mono">
            * O barramento de 800VDC evita perdas de conversão indireta (CA-CC-CA-CC) no data center, gerando uma preservação energética superior a 14.5% no PUE térmico.
          </div>
        </div>

        {/* HVAC & Liquid cooling specific parameters (CDU Loop) */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DropletIcon className="w-5 h-5 text-cyan-400" />
                HVAC & NVIDIA Liquid Cooling Loop
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Vazão Primária (CDU)</span>
                <div>
                  <span className="font-extrabold text-white text-sm">{coolantFlow.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">Gal/Min</span>
                </div>
              </div>

              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Temperatura Entrada Fluidos</span>
                <div>
                  <span className="font-extrabold text-cyan-400 text-sm">{cduInletTemp.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">°C</span>
                </div>
              </div>

              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Temperatura Retorno Computadores</span>
                <div>
                  <span className="font-extrabold text-red-400 text-sm">{cduOutletTemp.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">°C</span>
                </div>
              </div>

              <div className="bg-gray-950 p-2.5 rounded border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Eficiência de Rejeção</span>
                <div>
                  <span className="font-extrabold text-green-400 text-sm">94.88</span>
                  <span className="text-gray-500 ml-1">% HeatEx</span>
                </div>
              </div>

              {/* Dynamic feedback adjustments */}
              <div className="border-t border-gray-800 pt-3 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-gray-400 uppercase">Setpoint de PID Térmico:</span>
                  <span className="text-cyan-400 font-extrabold font-mono">{pidSetPoint.toFixed(1)} °C</span>
                </div>
                <input 
                  type="range" 
                  min="16" 
                  max="28" 
                  step="0.5"
                  value={pidSetPoint}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPidSetPoint(val);
                    setCduInletTemp(Math.max(14, val - 6 + Math.random() * 0.4));
                  }}
                  className="w-full accent-cyan-500 h-1 bg-gray-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Lógica Fuzzy switcher */}
              <div className="flex items-center justify-between mt-3 bg-gray-950 p-2 rounded border border-gray-800/80">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold block uppercase leading-none">Otimização Fuzzy Lógica</span>
                  <p className="text-[9px] text-gray-500 mt-0.5">Auto regular vazão por delta térmico</p>
                </div>
                <button
                  onClick={() => setFuzzyDiagnostic(!fuzzyDiagnostic)}
                  className={`px-3 py-1 text-[10px] font-bold rounded font-mono ${fuzzyDiagnostic ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  {fuzzyDiagnostic ? 'ATIVADO' : 'DESACTIV'}
                </button>
              </div>

            </div>
          </div>

          <div className="bg-cyan-950/20 p-2.5 rounded border border-cyan-800/30 text-[10px] text-cyan-300 font-mono mt-3">
             💡 <strong>Fato de Eficiência:</strong> A trigeração MAUAX utiliza vapor vindo do calor residual UTE para alimentar e movimentar o chiller de absorção de LiBr, zerando a eletricidade secundária no compressor do HVAC.
          </div>
        </div>

      </div>

      {/* SECTION 4: PROTOCOLO SEGURO DE COMUNICAÇÃO & RELATÓRIO EXTERNO */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-3 mb-4 gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="inline-block p-1 bg-green-500/10 text-green-400 rounded-md">🔒</span>
              Protocolo Seguro de Telemetria e Central de Monitoramento Externo
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Barramento de segurança criptográfica de dados e túnel SNMPv3 encabeçado</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRotateTelemetryKeys}
              className="bg-gray-950 hover:bg-gray-800 text-[10px] text-cyan-400 font-mono px-3 py-1.5 rounded border border-cyan-500/30 font-bold transition-colors"
            >
              🔑 Rotacionar Chaves TLS
            </button>
            <button
              onClick={handleClearSecureLogs}
              className="bg-gray-950 hover:bg-gray-800 text-[10px] text-gray-400 font-mono px-3 py-1.5 rounded border border-gray-800 transition-colors"
            >
              Limpar Console
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-gray-950 p-3 rounded border border-gray-800 text-xs font-mono">
            <span className="text-[10px] text-gray-400 uppercase font-black block mb-2">STATUS DE PROTOCOLO</span>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>VPN IPsec Tunnel:</span>
                <span className={ipsecTunnelOpen ? 'text-green-400 font-bold' : 'text-red-500'}>
                  {ipsecTunnelOpen ? '✓ SECURE ENCRYPTED' : '❌ DISCONNECTED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Criptografia MD5-SHA (SNMPv3):</span>
                <span className={snmpV3Encryption ? 'text-emerald-400 font-bold' : 'text-red-500'}>
                  {snmpV3Encryption ? '✓ AES-256 ACTIVE' : '❌ NO ENCRYPT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Porta de Escuta VPN:</span>
                <span className="text-white">UDP 4500 (Tunneling)</span>
              </div>
              <div className="flex justify-between">
                <span>Vulnerabilidade Scan PID:</span>
                <span className="text-green-400 font-semibold">✓ Zero Flaws Registred</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-900 flex justify-between items-center">
              <span className="text-[9px] text-gray-500">Chave de Telemetria:</span>
              <span className="text-[10px] text-cyan-400 font-bold max-w-[130px] truncate" title={secureToken}>
                {secureToken}
              </span>
            </div>
          </div>

          {/* Secure Live DevOps Tunnel logs */}
          <div className="md:col-span-2 bg-gray-950 p-3 rounded border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase font-mono font-black block mb-2">CONSOLE DE TRÁFEGO DE AUDITORIA CRIPTOGRÁFICA</span>
            <div className="bg-black/40 rounded p-2 border border-gray-900 h-28 overflow-y-auto font-mono text-[10px] text-gray-300 space-y-1">
              {securityLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-cyan-500">➜</span>
                  <span className={log.includes('SECURITY:') ? 'text-cyan-300 font-bold' : log.includes('COMMAND:') ? 'text-yellow-400' : 'text-gray-300'}>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* RACK INTERACTIVE OVERLAY MODAL */}
      {selectedRack && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="max-w-xl w-full bg-gray-900 rounded-xl border border-gray-700 shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedRack(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold font-mono bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              ×
            </button>

            <div className="flex items-center gap-2 mb-3">
              <ServerRackIcon className="w-6 h-6 text-cyan-400" />
              <div>
                <span className="text-[9px] text-cyan-400 uppercase font-mono font-black">{selectedRack.platformType}</span>
                <h3 className="text-xl font-extrabold text-white leading-none">{selectedRack.name} - Auditoria de Hardware</h3>
              </div>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-850 mb-4 font-mono text-[11px] space-y-1.5 text-gray-350">
              <p className="text-gray-500 text-[10px]">Cliente Atribuído:</p>
              <p className="text-sm text-white font-black leading-none">{selectedRack.clientApp}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-900">
                <p>NVIDIA Grace CPUs: <strong className="text-white">{selectedRack.cpusCount}x</strong></p>
                <p>NVIDIA GPUs (H100/B200): <strong className="text-cyan-400">{selectedRack.gpusCount}x</strong></p>
                <p>Núcleos de CPU Totais: <strong className="text-white">{selectedRack.cpuCoresCount.toLocaleString()}</strong></p>
                <p>Núcleos Tensor GPUs: <strong className="text-cyan-300">{(selectedRack.gpuTensorCoresCount * 10).toLocaleString()}</strong></p>
              </div>
            </div>

            {/* Core-by-core Temperature indicators layout */}
            <h4 className="text-xs font-bold text-gray-300 uppercase font-mono tracking-wider mb-2">
              🌡️ Distribuição Térmica por Núcleo (Direct-to-Chip Plate)
            </h4>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {selectedRack.coreTemps.map((ct, coreIdx) => {
                let heatCol = 'bg-cyan-500/20 text-cyan-400 border-cyan-800/40';
                if (ct > 36) heatCol = 'bg-red-500/20 text-red-400 border-red-800/40';
                else if (ct > 28) heatCol = 'bg-yellow-500/20 text-yellow-400 border-yellow-800/45';
                
                return (
                  <div key={coreIdx} className={`p-2 rounded text-center border font-mono ${heatCol}`}>
                    <span className="text-[9px] text-gray-400 block uppercase">NÚCLEO {coreIdx + 1}</span>
                    <span className="text-xs font-bold">{ct} °C</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 font-mono text-xs">
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800">
                <span className="text-[10px] text-gray-500 block uppercase">Uso de Cores Ativos</span>
                <span className="text-sm font-extrabold text-emerald-400">{selectedRack.cpuCoresUsed} Cores em Run</span>
              </div>
              <div className="bg-gray-950 p-2.5 rounded border border-gray-800">
                <span className="text-[10px] text-gray-500 block uppercase">Consumo sob 800VDC</span>
                <span className="text-sm font-extrabold text-yellow-400">{selectedRack.totalEnergyConsumption} kW Draw</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRack(null)}
              className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Fechar Visualização de Auditoria
            </button>

          </div>
        </div>
      )}

      {/* Animation declarations inside block */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
};

export default DataCenterTreeMap;
