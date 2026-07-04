
import React, { useMemo, useState } from 'react';
import { Alert, EmissionData, HistoricalEmissionPoint } from '../types';
import DashboardCard from './DashboardCard';
import { WarningIcon, InfoIcon, CloseIcon } from './icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EmissionsMonitorProps {
  emissions: EmissionData;
  historicalEmissions: HistoricalEmissionPoint[];
  alerts: Alert[];
  onDismiss: (id: number) => void;
  onClearAll: () => void;
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  t: (key: string) => string;
}

interface EmissionBarProps {
    label: string;
    value: number;
    max: number;
    unit: string;
}

const pollutantConfig = {
  co: { name: 'CO', color: '#facc15' },
  nox: { name: 'NOx', color: '#f87171' },
  sox: { name: 'SOx', color: '#fbbf24' },
};

const EmissionBar: React.FC<EmissionBarProps> = ({ label, value, max, unit}) => {
    const percentage = (value / max) * 100;
    let barColor = 'bg-green-500';
    if (percentage > 85) barColor = 'bg-red-500';
    else if (percentage > 60) barColor = 'bg-yellow-500';

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-semibold text-white">{value.toFixed(1)} {unit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    const pointData = payload.reduce((acc, p) => {
      acc[p.dataKey] = p.value;
      return acc;
    }, {});

    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg text-sm w-48">
        <p className="font-bold text-gray-300 mb-2">{`${t('tooltip.day')}: ${label}`}</p>
        {Object.entries(pollutantConfig).map(([key, config]) => {
          const histKey = key;
          const forecastKey = `forecast${key.charAt(0).toUpperCase() + key.slice(1)}`;
          const histValue = pointData[histKey];
          const forecastValue = pointData[forecastKey];
          const value = histValue ?? forecastValue;

          if (value === undefined) return null;

          return (
            <div key={config.name} className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: config.color}}></div>
                <span className="font-semibold" style={{color: config.color}}>{config.name}:</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-white">{value.toFixed(1)}</span>
                <span className="text-xs text-gray-400">{histValue !== undefined ? `(${t('emissions.historicalShort')})` : `(${t('emissions.forecastShort')})`}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const alertConfig = {
    critical: {
        icon: <WarningIcon className="w-5 h-5 text-red-400" />,
        color: 'border-l-4 border-red-400'
    },
    warning: {
        icon: <WarningIcon className="w-5 h-5 text-yellow-400" />,
        color: 'border-l-4 border-yellow-400'
    },
    info: {
        icon: <InfoIcon className="w-5 h-5 text-blue-400" />,
        color: 'border-l-4 border-blue-400'
    }
}

const EmissionsMonitor: React.FC<EmissionsMonitorProps> = ({ 
  emissions, 
  historicalEmissions,
  alerts,
  onDismiss,
  onClearAll,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  t
}) => {
  const [view, setView] = useState<'emissions' | 'alerts'>('emissions');
  
  const forecastData = useMemo(() => {
    if (!historicalEmissions || historicalEmissions.length === 0) return [];
    
    const lastPoint = historicalEmissions[historicalEmissions.length - 1];
    if (!lastPoint) return [];

    const forecast: HistoricalEmissionPoint[] = [];
    let { nox, sox, co, particulates } = lastPoint;

    for (let i = 1; i <= 7; i++) {
        nox *= (1 + (Math.random() - 0.3) * 0.1); // Fluctuate forecast
        sox *= (1 + (Math.random() - 0.3) * 0.1);
        co *= (1 + (Math.random() - 0.4) * 0.05);
        particulates *= (1 + (Math.random() - 0.4) * 0.05);

        forecast.push({
            time: `D+${i}`,
            nox: Math.max(0, nox),
            sox: Math.max(0, sox),
            co: Math.max(0, co),
            particulates: Math.max(0, particulates),
        });
    }
    return forecast;
  }, [historicalEmissions]);
  
  const chartData = useMemo(() => {
    if (!historicalEmissions || historicalEmissions.length === 0) return [];
    
    const historicalPart = historicalEmissions.map(h => ({ ...h }));
    const lastHistoricalPoint = historicalPart[historicalPart.length - 1];

    const forecastPart = [
        { 
            time: lastHistoricalPoint.time,
            forecastNox: lastHistoricalPoint.nox,
            forecastSox: lastHistoricalPoint.sox,
            forecastCo: lastHistoricalPoint.co,
        },
        ...forecastData.map(f => ({
            time: f.time,
            forecastNox: f.nox,
            forecastSox: f.sox,
            forecastCo: f.co,
        }))
    ];

    const allTimes = [...new Set([...historicalPart.map(p => p.time), ...forecastPart.map(p => p.time)])];
    
    return allTimes.map(time => {
        const historicalPoint = historicalPart.find(p => p.time === time);
        const forecastPoint = forecastPart.find(p => p.time === time);
        return {
            time,
            ...(historicalPoint && { nox: historicalPoint.nox, sox: historicalPoint.sox, co: historicalPoint.co }),
            ...(forecastPoint && { forecastNox: forecastPoint.forecastNox, forecastSox: forecastPoint.forecastSox, forecastCo: forecastPoint.forecastCo })
        };
    });
  }, [historicalEmissions, forecastData]);

  const renderEmissionsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 h-full">
        <div className="space-y-4 my-auto">
            <EmissionBar label="NOx" value={emissions.nox} max={30} unit="kg/h" />
            <EmissionBar label="SOx" value={emissions.sox} max={10} unit="kg/h" />
            <EmissionBar label="CO" value={emissions.co} max={50} unit="kg/h" />
        </div>
        <div className="w-full h-full flex flex-col">
            <div className="text-center text-xs text-gray-400 mb-2">
                {t('emissions.period')}: D-6 {t('emissions.to')} D+7
            </div>
            <div className="flex-grow min-h-[180px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} interval={chartData.length - 2} tickFormatter={(value, index) => index === 0 ? 'D-6' : 'D+7'} />
                        <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit=" kg/h" domain={[0, 40]} ticks={[0, 10, 20, 30]} />
                        <Tooltip content={<CustomTooltip t={t} />} />
                        <Line type="monotone" dataKey="co" stroke={pollutantConfig.co.color} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="forecastCo" stroke={pollutantConfig.co.color} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="nox" stroke={pollutantConfig.nox.color} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="forecastNox" stroke={pollutantConfig.nox.color} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="sox" stroke={pollutantConfig.sox.color} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="forecastSox" stroke={pollutantConfig.sox.color} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="flex justify-center flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-2 px-4">
                {Object.values(pollutantConfig).map(p => (
                    <div key={p.name} className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span style={{ color: p.color }}>{p.name}</span>
                    </div>
                ))}
                
                <div className="border-l border-gray-600 h-4 mx-2"></div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-gray-400"></div>
                    <span className="text-gray-400">{t('emissions.historical')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="16" height="2" className="text-gray-400"><line x1="0" y1="1" x2="16" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/></svg>
                    <span className="text-gray-400">{t('emissions.forecast')}</span>
                </div>
            </div>
        </div>
    </div>
  );

  const renderAlertsView = () => (
    <div className="h-full flex flex-col">
      {alerts.length > 0 && (
        <div className="flex justify-end mb-2 -mt-2">
          <button
            onClick={onClearAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none"
            aria-label={t('emissions.clearAll')}
          >
            {t('emissions.clearAll')}
          </button>
        </div>
      )}
      <div className="space-y-3 flex-grow overflow-y-auto pr-2">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className={`bg-gray-700 p-3 rounded-md flex items-start gap-3 ${alertConfig[alert.level].color}`}>
            <div>{alertConfig[alert.level].icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-200">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
            </div>
             <button 
                onClick={() => onDismiss(alert.id)} 
                className="text-gray-500 hover:text-white transition-colors duration-200 p-1 -m-1 rounded-full" 
                aria-label={`Dispensar alerta: ${alert.message}`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )) : <p className="text-center text-gray-500 pt-8">{t('emissions.noAlerts')}</p>}
      </div>
    </div>
  );

  return (
    <DashboardCard 
      title={t('emissions.title')}
      icon={<WarningIcon className="w-6 h-6" />} 
      className="h-full"
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
        <div className="flex flex-col h-full">
            <div className="flex justify-center mb-4 -mt-2">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
                    <button
                        onClick={() => setView('emissions')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                            view === 'emissions'
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={view === 'emissions'}
                    >
                        {t('emissions.tabEmissions')}
                    </button>
                    <button
                        onClick={() => setView('alerts')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                            view === 'alerts'
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={view === 'alerts'}
                    >
                        {t('emissions.tabAlerts')} ({alerts.length})
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {view === 'emissions' ? renderEmissionsView() : renderAlertsView()}
            </div>
        </div>
    </DashboardCard>
  );
};

export default EmissionsMonitor;
