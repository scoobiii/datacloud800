import React from 'react';
import DashboardCard from './DashboardCard';
import { InfoIcon } from './icons';

interface NuclearPlantInfoProps {
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  t: (key: string) => string;
}

const NuclearPlantInfo: React.FC<NuclearPlantInfoProps> = ({
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  t,
}) => {
  return (
    <DashboardCard
      title={t('nuclear.title')}
      icon={<InfoIcon className="w-6 h-6 text-green-400" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
      className="h-full"
    >
      <div className="flex flex-col h-full justify-center items-center text-center">
        <div className="p-4 bg-green-900/50 border-l-4 border-green-400 rounded-r-lg">
            <h3 className="text-xl font-bold text-green-400">
                {t('nuclear.zeroEmissions')}
            </h3>
            <p className="mt-2 text-gray-300">
                {t('nuclear.zeroEmissionsDesc')}
            </p>
        </div>
        <div className="mt-6 text-sm text-gray-400">
            <h4 className="font-semibold text-gray-200 mb-2">{t('nuclear.wasteManagement')}</h4>
            <p>
                {t('nuclear.wasteManagementDesc')}
            </p>
        </div>
      </div>
    </DashboardCard>
  );
};

export default NuclearPlantInfo;
