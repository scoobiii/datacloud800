import React from 'react';
import DashboardCard from './DashboardCard';
import { NVIDIA_PLATFORMS } from '../data/nvidiaPlatforms';
// FIX: Import ComputerDesktopIcon to use as the icon for the DashboardCard.
import { ComputerDesktopIcon } from './icons';

const PlatformDetails: React.FC = () => {
  return (
    <DashboardCard title="Detalhes das Plataformas" icon={<ComputerDesktopIcon className="w-6 h-6" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NVIDIA_PLATFORMS.map((platform) => (
          <div key={platform.name} className="bg-gray-700/50 p-4 rounded-lg flex flex-col">
            <h4 className="font-bold text-lg mb-1" style={{color: platform.color}}>
              {platform.name}
            </h4>
            <p className="text-gray-300 text-sm">
              {platform.description}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default PlatformDetails;
