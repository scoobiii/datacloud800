import React, { useState } from 'react';
import DashboardCard from '../DashboardCard';
import { WrenchScrewdriverIcon, ServerRackIcon } from '../icons';

interface CoolingDistributionProps {
    coolingProduction: number;
    isOnline: boolean;
    tiacCooling: number;
    fogCooling: number;
    dataCenterCooling: number;
}

interface SystemDisplayProps {
    title: string;
    emoji: string;
    coolingValue: number;
    children: React.ReactNode;
    isOnline: boolean;
}

const SystemDisplay: React.FC<SystemDisplayProps> = ({ title, emoji, coolingValue, children, isOnline }) => (
    <div className="bg-gray-700/50 p-2 rounded-lg">
        <div className="flex items-baseline justify-between">
            <span className="text-gray-300 font-semibold text-sm">{emoji} {title}</span>
            <span className={`font-mono text-base font-semibold ${isOnline ? 'text-white' : 'text-gray-500'}`}>{coolingValue.toFixed(1)} MW</span>
        </div>
        <div className="text-right text-xs text-gray-400 mt-1 min-h-[2rem]">
            {isOnline && children}
        </div>
    </div>
);


const CoolingDistribution: React.FC<CoolingDistributionProps> = ({ 
    coolingProduction, 
    isOnline,
    tiacCooling,
    fogCooling,
    dataCenterCooling
}) => {
    const [ambientTemp] = useState(32.4);
    const [ambientHumidity] = useState(85);
    
    const inletTemp = isOnline ? 15.0 : ambientTemp;
    const waterFlow = isOnline ? fogCooling * 0.42 : 0;
    
    // Data Center Metrics Simulation
    const pue = isOnline ? 1.05 : 1.45;
    const rackTemp = isOnline ? 17.0 : 35.0;


    return (
        <DashboardCard title="Distribuição de Frio" icon={<WrenchScrewdriverIcon className="w-6 h-6" />}>
            <div className="flex flex-col justify-between px-2">
                <div className="space-y-2">
                    <SystemDisplay title="TIAC System" emoji="❄️" coolingValue={tiacCooling} isOnline={isOnline}>
                        <div>
                            <span>Ambiente: {ambientTemp.toFixed(1)}°C ➔ Admissão: <span className="font-bold text-cyan-400">{inletTemp.toFixed(1)}°C</span></span>
                            <br/>
                            <span>Umidade: {ambientHumidity}% ➔ Admissão: <span className="font-bold text-cyan-400">60%</span></span>
                        </div>
                    </SystemDisplay>

                    <SystemDisplay title="Fog System" emoji="💨" coolingValue={fogCooling} isOnline={isOnline}>
                        <span>Fluxo de Água: <span className="font-bold text-cyan-400">{waterFlow.toFixed(2)} L/s</span></span>
                    </SystemDisplay>

                    {/* Data Center Custom Display */}
                    <div className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                        <ServerRackIcon className={`w-10 h-10 flex-shrink-0 ${isOnline ? 'text-cyan-400' : 'text-gray-500'}`} />
                        <div className="flex-grow">
                            <div className="flex items-baseline justify-between">
                                <span className="text-gray-300 font-semibold text-sm">Data Center</span>
                                <span className={`font-mono text-base font-semibold ${isOnline ? 'text-white' : 'text-gray-500'}`}>{dataCenterCooling.toFixed(1)} MW</span>
                            </div>
                            <p className="text-xs text-gray-500 text-left -mt-1">NVIDIA 800 VDC 500 KW</p>
                            <div className="flex justify-around mt-1 text-center">
                                <div>
                                    <p className="text-xs text-gray-400">PUE</p>
                                    <p className={`font-mono font-semibold ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>{pue.toFixed(2)}</p>
                                </div>
                                <div className="w-px bg-gray-600 mx-2"></div>
                                <div>
                                    <p className="text-xs text-gray-400">Temp. Rack</p>
                                    <p className={`font-mono font-semibold ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>{rackTemp.toFixed(1)}°C</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex items-baseline justify-between text-cyan-400">
                        <span className="font-semibold">Total Distribuído</span>
                        <span className={`font-mono text-xl font-bold ${!isOnline && 'text-gray-500'}`}>{coolingProduction.toFixed(0)} MW</span>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};

export default CoolingDistribution;