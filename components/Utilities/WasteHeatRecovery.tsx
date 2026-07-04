import React from 'react';
import DashboardCard from '../DashboardCard';
import { FlameIcon } from '../icons';

interface WasteHeatRecoveryProps {
    wasteHeat: number;
    isOnline: boolean;
}

const WasteHeatRecovery: React.FC<WasteHeatRecoveryProps> = ({ wasteHeat, isOnline }) => {
    return (
        <DashboardCard title="Recuperação de Calor" icon={<FlameIcon className="w-6 h-6 text-orange-400" />}>
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-400 text-sm mb-1">Potência Térmica Disponível</p>
                <p className={`text-5xl font-bold tracking-tight ${isOnline ? 'text-orange-400' : 'text-gray-500'}`}>
                    {wasteHeat.toFixed(0)}
                </p>
                <p className="text-lg text-gray-400">MW</p>
                <p className={`mt-4 text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-500'}`}>
                    {isOnline ? 'Sistema Ativo' : 'Sistema Inativo'}
                </p>
            </div>
        </DashboardCard>
    );
};

export default WasteHeatRecovery;
