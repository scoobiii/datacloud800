import React from 'react';
import { PlantStatus } from '../types';
import { BoltIcon, ChartBarIcon, QuestionMarkCircleIcon } from './icons';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  plantStatus: PlantStatus;
  powerOutput: number;
  selectedPlantName: string;
  maxCapacity: number;
  language: string;
  setLanguage: (language: string) => void;
  onHelpClick: () => void; // Added prop to handle help modal opening
  t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ plantStatus, powerOutput, selectedPlantName, maxCapacity, language, setLanguage, onHelpClick, t }) => {
  const statusInfo = {
    [PlantStatus.Online]: { text: t('plantStatus.ONLINE'), color: 'bg-green-500' },
    [PlantStatus.Offline]: { text: t('plantStatus.OFFLINE'), color: 'bg-red-500' },
    [PlantStatus.Maintenance]: { text: t('plantStatus.MAINTENANCE'), color: 'bg-yellow-500' },
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="bg-cyan-500 p-2 rounded-lg">
          <ChartBarIcon className="h-8 w-8 text-white" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white">{selectedPlantName.replace(' (standard)', '')}</h1>
            <p className="text-gray-400">{t('header.subtitle')}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        <LanguageSwitcher language={language} setLanguage={setLanguage} />
        <button
          onClick={onHelpClick}
          className="p-2 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          aria-label={t('nav.help')}
          title={t('nav.help')}
        >
          <QuestionMarkCircleIcon className="w-6 h-6 text-gray-400" />
        </button>
        <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center space-x-2">
            <BoltIcon className="h-6 w-6 text-cyan-400" />
            <div>
                <p className="text-sm font-semibold leading-tight text-cyan-400">{powerOutput.toFixed(1)} MW</p>
                <p className="text-xs text-gray-400 leading-tight">{t('header.currentProduction')}</p>
            </div>
        </div>
        <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
            <div>
                <p className="text-sm font-semibold leading-tight">{maxCapacity} MW</p>
                <p className="text-xs text-gray-400 leading-tight">{t('header.maxCapacity')}</p>
            </div>
        </div>
        <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center space-x-3">
            <span className={`h-3 w-3 rounded-full ${statusInfo[plantStatus].color} self-center`}></span>
             <div>
                <p className="text-sm font-semibold leading-tight">{statusInfo[plantStatus].text}</p>
                <p className="text-xs text-gray-400 leading-tight">{t('header.status')}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
