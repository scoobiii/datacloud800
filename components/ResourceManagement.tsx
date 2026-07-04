import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import DashboardCard from './DashboardCard';
import { WrenchScrewdriverIcon, DropletIcon, FlameIcon, GasIcon } from './icons';
import { ResourceConfig } from '../App';

interface ResourceDataPoint {
  time: string;
  water: number;
  gas: number;
  ethanol: number;
  biodiesel: number;
  h2: number;
}

interface Storage {
  level: number;
  capacity: number;
}

interface ResourceManagementProps {
  waterConsumption: number;
  gasConsumption: number;
  ethanolConsumption: number;
  biodieselConsumption: number;
  h2Consumption: number;
  waterStorage: Storage;
  gasStorage: Storage;
  ethanolStorage: Storage;
  biodieselStorage: Storage;
  h2Storage: Storage;
  historicalData: ResourceDataPoint[];
  resourceConfig: ResourceConfig;
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  // FIX: Add t prop for translations
  t: (key: string) => string;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        {/* FIX: Use translation function */}
        <p className="label text-sm text-gray-300">{`${t('tooltip.time')}: ${label}`}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {`${p.name}: ${p.value.toFixed(1)} ${p.unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StorageIndicator: React.FC<{ label: string; storage: Storage; unit: string; colorClass: string }> = ({ label, storage, unit, colorClass }) => {
  const percentage = storage.capacity > 0 ? (storage.level / storage.capacity) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1 text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono text-white">{storage.level.toLocaleString('pt-BR')}/{storage.capacity.toLocaleString('pt-BR')} {unit}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
        <div 
          className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        >
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                {percentage.toFixed(0)}%
            </span>
        </div>
      </div>
    </div>
  );
};


const ResourceToggle: React.FC<{ label: string; color: string; isActive: boolean; onClick: () => void;}> = ({ label, color, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all duration-200 border ${isActive ? 'text-white' : 'text-gray-400 opacity-60'}`}
        style={{
            borderColor: color,
            backgroundColor: isActive ? color : 'transparent',
        }}
    >
        {label}
    </button>
);

const ResourceManagement: React.FC<ResourceManagementProps> = ({
  waterConsumption,
  gasConsumption,
  ethanolConsumption,
  biodieselConsumption,
  h2Consumption,
  waterStorage,
  gasStorage,
  ethanolStorage,
  biodieselStorage,
  h2Storage,
  historicalData,
  resourceConfig,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  t,
}) => {
  const [visibleLines, setVisibleLines] = useState({
      water: true,
      gas: true,
      ethanol: false,
      biodiesel: false,
      h2: false
  });

  const toggleLine = (line: keyof typeof visibleLines) => {
      setVisibleLines(prev => ({...prev, [line]: !prev[line]}));
  };

  const lineConfig = {
      water: { color: "#3b82f6", name: "Água (m³/h)", unit: "m³/h" },
      gas: { color: "#f97316", name: "Gás (m³/h)", unit: "m³/h" },
      ethanol: { color: "#6ee7b7", name: "Etanol (m³/h)", unit: "m³/h" },
      biodiesel: { color: "#22c55e", name: "Biodiesel (m³/h)", unit: "m³/h" },
      h2: { color: "#34d399", name: "H₂ (kg/h)", unit: "kg/h" },
  };

  return (
    <DashboardCard
      // FIX: Use translation function
      title={t('resourceManagement.title')}
      icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
      className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="space-y-2 mb-2 flex-grow overflow-y-auto pr-2">
          {/* Water Section */}
          {resourceConfig.water && (
            <div className="bg-gray-900/50 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <DropletIcon className="w-5 h-5 text-blue-400" />
                <div>
                    {/* FIX: Use translation function */}
                    <h4 className="font-semibold text-blue-400 text-sm">{t('resourceManagement.water')}</h4>
                    <p className="text-xs text-gray-400">{t('resourceManagement.consumption')}: <strong className="font-mono text-white">{waterConsumption.toFixed(1)} m³/h</strong></p>
                </div>
                </div>
                <StorageIndicator label={t('resourceManagement.reservoir')} storage={waterStorage} unit="m³" colorClass="bg-blue-500" />
            </div>
          )}

          {/* Gas Section */}
          {resourceConfig.gas && (
            <div className="bg-gray-900/50 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <FlameIcon className="w-5 h-5 text-orange-400" />
                <div>
                    {/* FIX: Use translation function */}
                    <h4 className="font-semibold text-orange-400 text-sm">{t('resourceManagement.gas')}</h4>
                    <p className="text-xs text-gray-400">{t('resourceManagement.consumption')}: <strong className="font-mono text-white">{gasConsumption.toLocaleString('pt-BR')} m³/h</strong></p>
                </div>
                </div>
                <StorageIndicator label={t('resourceManagement.storage')} storage={gasStorage} unit="m³" colorClass="bg-orange-500" />
            </div>
          )}

          {/* Ethanol Section */}
          {resourceConfig.ethanol && (
            <div className="bg-gray-900/50 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <GasIcon className="w-5 h-5 text-teal-300" />
                <div>
                    {/* FIX: Use translation function */}
                    <h4 className="font-semibold text-teal-300 text-sm">{t('resourceManagement.ethanol')}</h4>
                    <p className="text-xs text-gray-400">{t('resourceManagement.consumption')}: <strong className="font-mono text-white">{ethanolConsumption.toFixed(1)} m³/h</strong></p>
                </div>
                </div>
                <StorageIndicator label={t('resourceManagement.storage')} storage={ethanolStorage} unit="m³" colorClass="bg-teal-400" />
            </div>
          )}
          
          {/* Biodiesel Section */}
          {resourceConfig.biodiesel && (
            <div className="bg-gray-900/50 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <GasIcon className="w-5 h-5 text-green-400" />
                <div>
                    {/* FIX: Use translation function */}
                    <h4 className="font-semibold text-green-400 text-sm">{t('resourceManagement.biodiesel')}</h4>
                    <p className="text-xs text-gray-400">{t('resourceManagement.consumption')}: <strong className="font-mono text-white">{biodieselConsumption.toFixed(1)} m³/h</strong></p>
                </div>
                </div>
                <StorageIndicator label={t('resourceManagement.storage')} storage={biodieselStorage} unit="m³" colorClass="bg-green-500" />
            </div>
          )}
          
          {/* H2 Section */}
          {resourceConfig.h2 && (
            <div className="bg-gray-900/50 p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <GasIcon className="w-5 h-5 text-emerald-400" />
                <div>
                    {/* FIX: Use translation function */}
                    <h4 className="font-semibold text-emerald-400 text-sm">{t('resourceManagement.h2')}</h4>
                    <p className="text-xs text-gray-400">{t('resourceManagement.consumption')}: <strong className="font-mono text-white">{h2Consumption.toFixed(1)} kg/h</strong></p>
                </div>
                </div>
                <StorageIndicator label={t('resourceManagement.storage')} storage={h2Storage} unit="kg" colorClass="bg-emerald-500" />
            </div>
          )}
        </div>

        {/* Historical Chart */}
        <div className="flex-shrink-0 h-40 -mx-4 -mb-4 border-t border-gray-700 pt-2">
           <div className="flex justify-center gap-2 mb-2 px-4">
               {Object.keys(lineConfig)
                .filter(key => resourceConfig[key as keyof ResourceConfig])
                .map(key => (
                   <ResourceToggle 
                       key={key}
                       label={key.charAt(0).toUpperCase() + key.slice(1)}
                       color={lineConfig[key as keyof typeof lineConfig].color}
                       isActive={visibleLines[key as keyof typeof visibleLines]}
                       onClick={() => toggleLine(key as keyof typeof visibleLines)}
                   />
               ))}
           </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              {/* FIX: Pass translation function to custom tooltip */}
              <Tooltip content={<CustomTooltip t={t} />} />
              <Legend wrapperStyle={{fontSize: "10px", position: 'absolute', bottom: 0 }} iconSize={8} />
              {Object.entries(visibleLines).map(([key, isVisible]) => (
                  (isVisible && resourceConfig[key as keyof ResourceConfig]) && (
                      <Line 
                          key={key}
                          type="monotone" 
                          dataKey={key} 
                          name={lineConfig[key as keyof typeof lineConfig].name}
                          stroke={lineConfig[key as keyof typeof lineConfig].color}
                          strokeWidth={2} dot={false} 
                          unit={lineConfig[key as keyof typeof lineConfig].unit}
                      />
                  )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ResourceManagement;