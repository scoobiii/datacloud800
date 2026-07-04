
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalDataPoint, PlantStatus } from '../types';
import DashboardCard from './DashboardCard';
import { BoltIcon, ThermometerIcon, DropletIcon, WarningIcon } from './icons';

interface PowerOutputProps {
  powerOutput: number;
  efficiency: number;
  historicalData: HistoricalDataPoint[];
  efficiencyGain: number;
  plantStatus: PlantStatus;
  dryBulbTemp: number;
  wetBulbTemp: number;
  humidity: number;
  powerLoss: number;
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
        {/* FIX: Use translation function for tooltip text */}
        <p className="label text-sm text-gray-300">{`${t('tooltip.time')}: ${label}`}</p>
        <p className="intro text-sm text-cyan-400">{`${t('tooltip.power')}: ${payload[0].value.toFixed(1)} MW`}</p>
      </div>
    );
  }
  return null;
};

const PowerOutput: React.FC<PowerOutputProps> = ({ 
  powerOutput, 
  efficiency, 
  historicalData, 
  efficiencyGain,
  plantStatus,
  dryBulbTemp,
  wetBulbTemp,
  humidity,
  powerLoss,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  t,
}) => {
  const isOnline = plantStatus === PlantStatus.Online;
  const displayEfficiency = isOnline ? efficiency + efficiencyGain : 0;
  
  return (
    <DashboardCard 
      // FIX: Use translation function for title
      title={t('powerOutput.title')} 
      icon={<BoltIcon className="w-6 h-6" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
      <div className="flex flex-col h-full">
        <div className="text-center">
            <p className="text-5xl font-bold tracking-tight text-cyan-400">{powerOutput.toFixed(1)}</p>
            <p className="text-lg text-gray-400">MW</p>
        </div>
        <div className="flex-grow h-24 mt-2 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              {/* FIX: Pass translation function to custom tooltip */}
              <Tooltip content={<CustomTooltip t={t} />} cursor={{fill: 'transparent'}}/>
              <Area 
                type="monotone" 
                dataKey="power" 
                stroke="#06b6d4" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorPower)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="my-3 space-y-3">
            {/* Ambient Conditions */}
            {/* FIX: Use translation function for ambient condition labels */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400 p-2 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-center gap-1.5">
                    <ThermometerIcon className="w-4 h-4" />
                    <span className="truncate">{t('powerOutput.dryBulb')}: <strong className="text-white font-mono">{dryBulbTemp.toFixed(1)}°C</strong></span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                    <ThermometerIcon className="w-4 h-4 opacity-70" />
                    <span className="truncate">{t('powerOutput.wetBulb')}: <strong className="text-white font-mono">{wetBulbTemp.toFixed(1)}°C</strong></span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                    <DropletIcon className="w-4 h-4" />
                    <span className="truncate">{t('powerOutput.humidity')}: <strong className="text-white font-mono">{humidity}%</strong></span>
                </div>
            </div>

            {/* Power Loss */}
            {isOnline && powerLoss > 0.1 && (
                <div className="p-3 bg-orange-900/50 border-l-4 border-orange-400 rounded-r-lg">
                    <div className="flex items-center gap-3">
                        <WarningIcon className="w-6 h-6 text-orange-400 flex-shrink-0" />
                        <div>
                            {/* FIX: Use translation function for power loss title and description */}
                            <p className="font-semibold text-orange-400 text-sm">{t('powerOutput.powerLossTitle')}</p>
                            <p className="text-lg font-bold font-mono text-white">-{powerLoss.toFixed(1)} MW</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 pl-9">
                       {t('powerOutput.powerLossDescription')}
                    </p>
                </div>
            )}
        </div>

        <div className="mt-auto pt-2 border-t border-gray-700 grid grid-cols-3 text-center divide-x divide-gray-700">
          <div>
            {/* FIX: Use translation function for efficiency labels */}
            <p className="text-sm text-gray-400">{t('powerOutput.baseEfficiency')}</p>
            <p className="font-semibold text-xl text-white">{isOnline ? efficiency.toFixed(1) : '0.0'}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">{t('powerOutput.utilitiesGain')}</p>
            <p 
              key={efficiencyGain.toFixed(2)}
              className={`font-semibold text-xl animate-pulse-gain ${efficiencyGain > 0.005 ? 'text-green-400' : 'text-white'}`}>
                +{efficiencyGain.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">{t('powerOutput.totalEfficiency')}</p>
            <p className="font-semibold text-xl text-cyan-400">{displayEfficiency.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse-gain {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-pulse-gain {
          animation: pulse-gain 0.5s ease-out;
        }
      `}</style>
    </DashboardCard>
  );
};

export default PowerOutput;
