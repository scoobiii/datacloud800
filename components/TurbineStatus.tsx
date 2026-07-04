import React from 'react';
import { Turbine } from '../types';
import DashboardCard from './DashboardCard';
import { CogIcon, WrenchScrewdriverIcon } from './icons';

type TurbineType = 'all' | 'Ciclo Combinado' | 'Ciclo Rankine';

interface TurbineStatusProps {
  turbines: Turbine[];
  onSelectTurbine: (id: number) => void;
  selectedTurbineId: number | null;
  turbineTypeFilter: TurbineType;
  setTurbineTypeFilter: (type: TurbineType) => void;
  onPerformMaintenance: (id: number) => void;
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  // FIX: Add t prop for translations
  t: (key: string) => string;
}

const statusClasses = {
    active: 'text-green-400 border-green-400',
    inactive: 'text-gray-500 border-gray-500',
    error: 'text-red-500 border-red-500 animate-pulse'
}

const FilterButton: React.FC<{label: string, value: TurbineType, activeFilter: TurbineType, setFilter: (type: TurbineType) => void}> = 
({ label, value, activeFilter, setFilter }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
        activeFilter === value
          ? 'bg-cyan-500 text-white shadow-md'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
);


const TurbineCard: React.FC<{ turbine: Turbine; isSelected: boolean; onSelect: () => void; onPerformMaintenance: (id: number) => void; t: (key: string) => string; }> = ({ turbine, isSelected, onSelect, onPerformMaintenance, t }) => {
    const score = turbine.maintenanceScore;
    let scoreColor = 'bg-green-500';
    if (score > 75) scoreColor = 'bg-red-500';
    else if (score > 50) scoreColor = 'bg-yellow-500';

    const handleMaintenanceClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onPerformMaintenance(turbine.id);
    };

    return (
      <button 
        onClick={onSelect} 
        className={`bg-gray-700 p-3 rounded-lg flex flex-col justify-between text-left transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 w-full ${isSelected ? 'ring-2 ring-cyan-400' : 'hover:bg-gray-600'}`}
        aria-pressed={isSelected}
        aria-label={`${t('turbineStatus.turbine')} ${turbine.id}`}
      >
          <div className="flex justify-between items-start mb-2">
              <div>
                {/* FIX: Use translation function */}
                <h4 className="font-bold text-white">{t('turbineStatus.turbine')} #{turbine.id}</h4>
                <p className="text-xs text-gray-400">{turbine.type}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 border rounded-full ${statusClasses[turbine.status]}`}>{t(`turbineStatus.status.${turbine.status}`)}</span>
          </div>
          <div className="grid grid-cols-3 text-center">
              <div>
                  {/* FIX: Use translation function */}
                  <p className="text-xs text-gray-400">{t('turbineStatus.rpm')}</p>
                  <p className="font-mono font-semibold">{Math.round(turbine.rpm)}</p>
              </div>
               <div>
                  <p className="text-xs text-gray-400">{t('turbineStatus.temp')}</p>
                  <p className="font-mono font-semibold">{Math.round(turbine.temp)}</p>
              </div>
               <div>
                  <p className="text-xs text-gray-400">{t('turbineStatus.pressure')}</p>
                  <p className="font-mono font-semibold">{Math.round(turbine.pressure)} bar</p>
              </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex justify-between items-center text-xs mb-1">
              {/* FIX: Use translation function */}
              <span className="text-gray-400 font-semibold">{t('turbineStatus.maintenance')}</span>
              <span className="font-mono font-bold text-white">{score.toFixed(0)}/100</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1.5">
              <div className={`${scoreColor} h-1.5 rounded-full`} style={{ width: `${score}%` }}></div>
            </div>
          </div>

          {score > 75 && (
              <div className="mt-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                      <WrenchScrewdriverIcon className="w-4 h-4" />
                      {/* FIX: Use translation function */}
                      <span className="text-xs font-semibold">{t('turbineStatus.maintenanceNeeded')}</span>
                  </div>
                  <button
                    onClick={handleMaintenanceClick}
                    className="w-full px-2 py-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"
                  >
                    {/* FIX: Use translation function */}
                    {t('turbineStatus.performMaintenance')}
                  </button>
              </div>
          )}
      </button>
    )
};

const TurbineStatus: React.FC<TurbineStatusProps> = ({ 
  turbines, 
  onSelectTurbine, 
  selectedTurbineId,
  turbineTypeFilter,
  setTurbineTypeFilter,
  onPerformMaintenance,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  t,
}) => {
  const totalIsoCapacity = turbines.reduce((acc, t) => acc + t.isoCapacity, 0);

  return (
    <DashboardCard 
      // FIX: Use translation function
      title={t('turbineStatus.title')} 
      icon={<CogIcon className="w-6 h-6" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
        <div className="flex flex-col h-full justify-between">
            <div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {/* FIX: Use translation function */}
                    <span className="text-sm font-semibold text-gray-400">{t('turbineStatus.filter')}:</span>
                    <FilterButton label={t('turbineStatus.all')} value="all" activeFilter={turbineTypeFilter} setFilter={setTurbineTypeFilter} />
                    <FilterButton label={t('turbineStatus.combinedCycle')} value="Ciclo Combinado" activeFilter={turbineTypeFilter} setFilter={setTurbineTypeFilter} />
                    <FilterButton label={t('turbineStatus.rankineCycle')} value="Ciclo Rankine" activeFilter={turbineTypeFilter} setFilter={setTurbineTypeFilter} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {turbines.map(turbine => (
                        <TurbineCard 
                          key={turbine.id} 
                          turbine={turbine}
                          isSelected={selectedTurbineId === turbine.id}
                          onSelect={() => onSelectTurbine(turbine.id)}
                          onPerformMaintenance={onPerformMaintenance}
                          t={t}
                        />
                    ))}
                </div>
            </div>
            <div className="text-xs text-center text-gray-500 mt-4 border-t border-gray-700 pt-2">
                {turbines.length > 0 ? (
                    // FIX: Use translation function
                    t('turbineStatus.summary').replace('{count}', String(turbines.length)).replace('{total}', String(totalIsoCapacity))
                ) : (
                    t('turbineStatus.noneFound')
                )}
            </div>
        </div>
    </DashboardCard>
  );
};

export default TurbineStatus;
