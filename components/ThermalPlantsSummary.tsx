import React from 'react';
import DashboardCard from './DashboardCard';
import { POWER_PLANTS } from '../data/plants';
import { FlameIcon } from './icons';

interface ThermalPlantsSummaryProps {
  t: (key: string) => string;
}

const MetricItem: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center p-2">
    <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
    <p className="text-xs md:text-sm text-gray-400 truncate">{label}</p>
  </div>
);

const ThermalPlantsSummary: React.FC<ThermalPlantsSummaryProps> = ({ t }) => {
  const thermalPlants = POWER_PLANTS.filter(p => p.type !== 'standard');

  const totalPlants = thermalPlants.length;
  const totalPower = thermalPlants.reduce((acc, plant) => acc + plant.power, 0);
  const totalEthanolDemand = thermalPlants.reduce((acc, plant) => acc + (plant.ethanolDemand || 0), 0);
  // FIX: Use `statusKey` instead of `status` and check against the translation key.
  const newConstructions = thermalPlants.filter(p => p.statusKey === 'plant.status.proposal').length;

  return (
    <DashboardCard title={t('config.thermalPlantsSummaryTitle')} icon={<FlameIcon className="w-6 h-6" />}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full items-center">
        <MetricItem value={totalPlants} label={t('config.totalPlants')} />
        <MetricItem value={totalPlants} label={t('config.ethanolCompatible')} />
        <MetricItem value={`${totalPower.toLocaleString('pt-BR')} MW`} label={t('config.totalPower')} />
        <MetricItem value={`${totalEthanolDemand.toFixed(1).replace('.',',')} m³/h`} label={t('config.ethanolDemand')} />
        <MetricItem value={newConstructions} label={t('config.newConstructions')} />
      </div>
    </DashboardCard>
  );
};

export default ThermalPlantsSummary;
