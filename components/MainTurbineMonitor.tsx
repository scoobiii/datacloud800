import React, { useMemo } from 'react';
import { Turbine } from '../types';
import DashboardCard from './DashboardCard';
import { CloseIcon, CogIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

interface MainTurbineMonitorProps {
  turbine: Turbine;
  onClose: () => void;
  allTurbines: Turbine[];
  totalPowerOutput: number;
  t: (key: string) => string;
}

const MetricDisplay: React.FC<{ label: string; value: string | number; unit: string; className?: string }> = ({ label, value, unit, className = '' }) => (
    <div className={`text-center p-4 bg-gray-900 rounded-lg ${className}`}>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-gray-400">{unit}</p>
    </div>
);

const RPMHistoryTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-sm text-gray-300">{`${t('tooltip.time')}: ${label}`}</p>
          <p className="intro text-sm text-cyan-400">{`RPM: ${Math.round(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
};

const MainTurbineMonitor: React.FC<MainTurbineMonitorProps> = ({ turbine, onClose, allTurbines, totalPowerOutput, t }) => {
  const statusInfo = {
      active: { text: t('turbineStatus.status.active'), color: 'text-green-400' },
      inactive: { text: t('turbineStatus.status.inactive'), color: 'text-gray-500' },
      error: { text: t('turbineStatus.status.error'), color: 'text-red-500 animate-pulse' }
  }
  
  const activeTurbines = allTurbines.filter(t => t.status === 'active');
  const powerPerTurbine = activeTurbines.length > 0 ? totalPowerOutput / activeTurbines.length : 0;
  
  const powerContributionData = useMemo(() => [
      activeTurbines.reduce((acc, turbineObj) => {
          const key = `${t('turbineStatus.turbine')} #${turbineObj.id}`;
          acc[key] = powerPerTurbine;
          return acc;
      }, { name: 'Power' })
  ], [activeTurbines, powerPerTurbine, t]);

  const rpmHistoryData = useMemo(() => {
    if (!turbine.history) return [];
    return [...turbine.history].reverse();
  }, [turbine.history]);
  
  return (
    <div 
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div 
            className="w-full max-w-6xl bg-gray-800 rounded-lg shadow-2xl overflow-hidden" 
            onClick={e => e.stopPropagation()}
        >
            <DashboardCard 
                title={t('mainTurbineMonitor.title').replace('{id}', String(turbine.id))} 
                icon={<CogIcon className="w-6 h-6" />}
                action={
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label={t('dataCenter.rack.modal.close')}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                }
                className="max-h-[90vh]"
            >
              <div className="flex flex-col h-full overflow-y-auto pr-2">
                <div className="flex-shrink-0">
                    <div className={`text-center text-xl font-bold ${statusInfo[turbine.status].color}`}>
                        {t('mainTurbineMonitor.status')}: {statusInfo[turbine.status].text}
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <MetricDisplay label={t('mainTurbineMonitor.rotation')} value={Math.round(turbine.rpm)} unit="RPM" />
                        <MetricDisplay label={t('mainTurbineMonitor.temperature')} value={Math.round(turbine.temp)} unit="°C" />
                        <MetricDisplay label={t('mainTurbineMonitor.pressure')} value={Math.round(turbine.pressure)} unit="bar" />
                    </div>
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                        <h4 className="text-md font-semibold text-gray-300 mb-2">{t('mainTurbineMonitor.specs')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <span className="text-gray-400">{t('mainTurbineMonitor.manufacturer')}: </span>
                                <span className="text-white font-semibold">{turbine.manufacturer}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">{t('mainTurbineMonitor.model')}: </span>
                                <span className="text-white font-semibold">{turbine.model}</span>
                            </div>
                             <div>
                                <span className="text-gray-400">{t('mainTurbineMonitor.type')}: </span>
                                <span className="text-white font-semibold">{turbine.type}</span>
                            </div>
                             <div>
                                <span className="text-gray-400">{t('mainTurbineMonitor.isoCapacity')}: </span>
                                <span className="text-white font-semibold">{turbine.isoCapacity} MW</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
                  {/* Power Contribution Chart */}
                  <div className="flex flex-col h-full min-h-[200px]">
                    <h4 className="text-md font-semibold text-gray-300 text-center mb-2">
                      {t('mainTurbineMonitor.powerContribution')}
                    </h4>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={powerContributionData}
                                margin={{ top: 20, right: 20, left: 20, bottom: 25 }}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={10} domain={[0, 'dataMax']} unit=" MW" />
                                <YAxis type="category" dataKey="name" hide={true} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(42, 52, 73, 0.5)'}}
                                    wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449', borderRadius: '0.5rem', outline: 'none' }}
                                    contentStyle={{ backgroundColor: '#1A2233', border: 'none' }}
                                    labelStyle={{ color: '#e5e7eb', marginBottom: '0.5rem' }}
                                    formatter={(value: number, name: string) => [
                                        <span className="text-cyan-400">{`${value.toFixed(1)} MW`}</span>,
                                        <span className="text-gray-300">{name}</span>
                                    ]}
                                    labelFormatter={() => `${t('tooltip.total')}: ${totalPowerOutput.toFixed(0)} MW`}
                                />
                                <Legend wrapperStyle={{fontSize: "12px", position: 'absolute', bottom: 0 }} />
                                {activeTurbines.map((turbineObj, index) => {
                                     const isFirst = index === 0;
                                     const isLast = index === activeTurbines.length - 1;
                                     const radius: [number, number, number, number] = activeTurbines.length === 1 ? [8, 8, 8, 8] : isFirst ? [8, 0, 0, 8] : isLast ? [0, 8, 8, 0] : [0, 0, 0, 0];
                                     
                                    return (
                                        <Bar 
                                            key={`bar-${turbineObj.id}`}
                                            dataKey={`${t('turbineStatus.turbine')} #${turbineObj.id}`}
                                            stackId="a"
                                            name={`${t('turbineStatus.turbine')} #${turbineObj.id}`}
                                            fill={turbineObj.id === turbine.id ? '#06b6d4' : '#0891b2'}
                                            radius={radius}
                                        />
                                    );
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                  </div>
                  {/* RPM History Chart */}
                  <div className="flex flex-col h-full min-h-[200px]">
                    <h4 className="text-md font-semibold text-gray-300 text-center mb-2">
                      {t('mainTurbineMonitor.rpmHistory')}
                    </h4>
                    <div className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rpmHistoryData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRpm" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#9ca3af" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#9ca3af" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            domain={[3550, 3650]}
                            unit=" RPM"
                            width={55}
                          />
                          <Tooltip content={<RPMHistoryTooltip t={t} />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}}/>
                          <Area 
                            type="monotone" 
                            dataKey="rpm" 
                            stroke="#06b6d4" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorRpm)" 
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>
        </div>
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
        `}</style>
    </div>
  );
};

export default MainTurbineMonitor;
