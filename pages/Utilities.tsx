import React, { useEffect, useState } from 'react';
import { Plant, PlantStatus } from '../types';
import { SnowflakeIcon, WrenchScrewdriverIcon, BoltIcon, CloudIcon, ComputerDesktopIcon, ActivityIcon, MapPinIcon, GasIcon, ChartBarIcon, WarningIcon } from '../components/icons';
import DashboardCard from '../components/DashboardCard';
import { Page } from '../components/Navigation';

interface UtilitiesProps {
    powerOutput: number;
    efficiency: number;
    plantStatus: PlantStatus;
    setCurrentPage: (page: Page) => void;
    activeRackCount: number;
    selectedPlant: Plant;
    t: (key: string) => string;
}

const SankeyConnector: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="w-16 h-16 text-gray-700 transform lg:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
    </div>
);

const TrigenerationView: React.FC<Omit<UtilitiesProps, 'selectedPlant'>> = ({ powerOutput, efficiency, plantStatus, setCurrentPage, activeRackCount, t }) => {
    
    const isOnline = plantStatus === PlantStatus.Online;
    const [ambientTemp] = React.useState(32.4);
    const [coolingDistribution, setCoolingDistribution] = useState({ tiac: 40, fog: 25, dataCenter: 35 });

    const powerInput = isOnline && efficiency > 0 ? powerOutput / (efficiency / 100) : 0;
    const wasteHeat = isOnline ? powerInput - powerOutput : 0;
    
    const chillerCOP = 0.694;
    const coolingProduction = isOnline ? wasteHeat * chillerCOP : 0;

    const tiacCooling = coolingProduction * (coolingDistribution.tiac / 100);
    const fogCooling = coolingProduction * (coolingDistribution.fog / 100);
    const dataCenterCooling = coolingProduction * (coolingDistribution.dataCenter / 100);

    const TOTAL_RACKS = 120;
    const COOLING_CAPACITY_PER_RACK_MWT = 3.5; // MWt (thermal megawatt)
    const dataCenterTotalCapacity = TOTAL_RACKS * COOLING_CAPACITY_PER_RACK_MWT;
    const potentialActiveRacks = dataCenterCooling / COOLING_CAPACITY_PER_RACK_MWT;

    const conventionalChillerCOP = 0.4; // Updated to reflect superior value of trigeneration
    const electricalEquivalentSaved = isOnline ? coolingProduction / conventionalChillerCOP : 0;

    const handleDistributionChange = (system: 'tiac' | 'fog', value: number) => {
        const otherSystem = system === 'tiac' ? 'fog' : 'tiac';
        const currentOtherValue = coolingDistribution[otherSystem];
        
        if (value + currentOtherValue > 100) {
            const newOtherValue = 100 - value;
            setCoolingDistribution({
                ...coolingDistribution,
                [system]: value,
                [otherSystem]: newOtherValue,
                dataCenter: 0
            });
        } else {
            setCoolingDistribution({
                ...coolingDistribution,
                [system]: value,
                dataCenter: 100 - value - currentOtherValue
            });
        }
    };
    
    const Slider: React.FC<{label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, value, onChange}) => (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-medium text-gray-300">{label}</label>
                <span className="font-mono font-semibold text-white bg-gray-900/50 px-2 py-0.5 rounded">{value.toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="100" value={value} onChange={onChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
    );

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch">
                <div className="lg:col-span-3">
                    <DashboardCard 
                        title={t('utilities.plantEnergyFlow')}
                        icon={<ActivityIcon className="w-6 h-6 text-yellow-400" />} 
                        className="h-full"
                        action={
                            <button
                                onClick={() => setCurrentPage('Power Plant Sankey')}
                                className="px-3 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                            >
                                {t('utilities.flowDetails')}
                            </button>
                        }
                    >
                        <div className="flex flex-col justify-center h-full space-y-4 text-sm">
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-400">{t('utilities.totalThermalPower')}</span>
                                <span className="font-mono text-lg font-semibold text-white">{powerInput.toFixed(0)} MW</span>
                            </div>
                            <div className="flex justify-between items-baseline pl-4">
                                <span className="text-gray-400">{t('utilities.electricalPower')}</span>
                                <span className="font-mono font-semibold text-cyan-400">{powerOutput.toFixed(0)} MW</span>
                            </div>
                            <div className="border-t border-gray-700 my-2"></div>
                            <div className="flex justify-between items-baseline bg-gray-900/50 p-2 rounded-lg">
                                <span className="font-semibold text-orange-400">{t('utilities.residualHeat')}</span>
                                <span className="font-mono text-xl font-bold text-orange-400">{wasteHeat.toFixed(0)} MW</span>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                <div className="lg:col-span-1 hidden lg:block">
                    <SankeyConnector />
                </div>

                <div className="lg:col-span-3">
                    <DashboardCard 
                        title={t('utilities.absorptionChiller')}
                        icon={<SnowflakeIcon className="w-6 h-6 text-cyan-400" />} 
                        className="h-full"
                        action={
                            <button
                                onClick={() => setCurrentPage('Chiller')}
                                className="px-3 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                            >
                                {t('utilities.viewDetails')}
                            </button>
                        }
                    >
                        <div className="flex flex-col justify-center items-center h-full text-center">
                            <p className="text-5xl font-bold tracking-tight text-cyan-400">{coolingProduction.toFixed(0)}</p>
                            <p className="text-lg text-gray-400">{t('utilities.mwCooling')}</p>
                            <p className={`mt-4 font-semibold ${isOnline ? 'text-green-400' : 'text-red-500'}`}>
                                {isOnline ? t('utilities.systemActive') : t('utilities.systemInactive')}
                            </p>
                        </div>
                    </DashboardCard>
                </div>

                <div className="lg:col-span-1 hidden lg:block">
                    <SankeyConnector />
                </div>

                <div className="lg:col-span-3">
                    <DashboardCard 
                        title={t('utilities.coolingAlignment')}
                        icon={<WrenchScrewdriverIcon className="w-6 h-6 text-gray-300" />} 
                        className="h-full"
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div className="space-y-3">
                                <div className="bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => setCurrentPage('Chiller Absorção -> Tiac')}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-gray-300">TIAC</span>
                                        <span className="font-mono text-white">{tiacCooling.toFixed(1)} MW</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Ambiente: {ambientTemp.toFixed(1)}°C ➔ Admissão: <strong className="text-cyan-400">{isOnline ? '15.0' : ambientTemp.toFixed(1)}°C</strong></p>
                                </div>
                                <div className="bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => setCurrentPage('Fog System Details')}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-gray-300">Fogging</span>
                                        <span className="font-mono text-white">{fogCooling.toFixed(1)} MW</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Boost de Potência <strong className="text-cyan-400">~{isOnline ? '220' : '0'} MW</strong></p>
                                </div>
                                <div className="bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700" onClick={() => setCurrentPage('Data Center')}>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-gray-300">Data Cloud</span>
                                        <span className="font-mono text-white">{dataCenterCooling.toFixed(1)} MW</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{t('utilities.rackPotential').replace('{count}', activeRackCount.toFixed(0)).replace('{total}', String(TOTAL_RACKS))}</p>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <DashboardCard 
                    title={t('utilities.trigenerationSavings')} 
                    icon={<BoltIcon className="w-6 h-6 text-green-400" />}
                >
                    <div className="flex flex-col justify-center items-center h-full text-center">
                        <p className="text-5xl font-bold tracking-tight text-green-400">{electricalEquivalentSaved.toFixed(0)}</p>
                        <p className="text-lg text-gray-400">MW {t('utilities.electricalEquivalent')}</p>
                    </div>
                </DashboardCard>
                 <DashboardCard 
                    title={t('utilities.allocatedToCloud')}
                    icon={<ComputerDesktopIcon className="w-6 h-6 text-purple-400" />}
                >
                    <div className="flex flex-col justify-center items-center h-full text-center">
                         <p className="text-5xl font-bold tracking-tight text-purple-400">{dataCenterCooling.toFixed(1)}</p>
                        <p className="text-lg text-gray-400">{t('utilities.mwCooling')}</p>
                         <p className="mt-4 text-gray-300">{t('utilities.rackPotential').replace('{count}', activeRackCount.toFixed(0)).replace('{total}', String(TOTAL_RACKS))}</p>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

const ConventionalView: React.FC<Pick<UtilitiesProps, 'selectedPlant' | 't'>> = ({ selectedPlant, t }) => {
    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard title={t('utilities.generalInfo')} icon={<MapPinIcon className="w-6 h-6"/>}>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">{t('config.location')}:</span> <span className="font-semibold">{t(selectedPlant.locationKey || '') || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('config.fuelMode')}:</span> <span className="font-semibold">{t(selectedPlant.fuelKey)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('system.technology')}:</span> <span className="font-semibold">{t(selectedPlant.cycleKey || '') || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('config.powerMW')}:</span> <span className="font-semibold">{selectedPlant.power} MW</span></div>
                    {selectedPlant.descriptionKey && <p className="pt-2 border-t border-gray-700 text-gray-400 italic">{t(selectedPlant.descriptionKey)}</p>}
                </div>
            </DashboardCard>
             <DashboardCard title={t('utilities.performance2023')} icon={<ChartBarIcon className="w-6 h-6"/>}>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">{t('system.generation')} 2023:</span> <span className="font-semibold text-cyan-400">{selectedPlant.generation2023?.toLocaleString('pt-BR') || 'N/A'} GWh</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('powerOutput.totalEfficiency')} Média:</span> <span className="font-semibold text-green-400">{selectedPlant.efficiency?.toFixed(1) || 'N/A'}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">{t('system.efficiencyAnalysis')}:</span> <span className="font-semibold text-orange-400">{selectedPlant.rate || 'N/A'} tCO₂e/GWh</span></div>
                </div>
            </DashboardCard>
             <DashboardCard title={t('utilities.emissions2023')} icon={<WarningIcon className="w-6 h-6"/>}>
                <div className="flex flex-col justify-center items-center h-full text-center">
                    <p className="text-5xl font-bold tracking-tight text-red-400">{selectedPlant.emissions2023?.toLocaleString('pt-BR') || 'N/A'}</p>
                    <p className="text-lg text-gray-400">mil tCO₂e</p>
                </div>
            </DashboardCard>
        </div>
    );
};


const Utilities: React.FC<UtilitiesProps> = ({ selectedPlant, ...props }) => {
    const isTrigenerationProject = 
        selectedPlant.type === 'standard' || 
        selectedPlant.name === 'Parque Térmico Pedreira' ||
        selectedPlant.fuelKey === 'fuel.NUCLEAR';
        
    return isTrigenerationProject ? <TrigenerationView {...props} /> : <ConventionalView selectedPlant={selectedPlant} t={props.t} />;
};

export default Utilities;
