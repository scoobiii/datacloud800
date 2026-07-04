import React from 'react';
import DashboardCard from '../DashboardCard';
import { SnowflakeIcon } from '../icons';

interface AbsorptionChillerProps {
    coolingProduction: number;
    isOnline: boolean;
}

const AbsorptionChiller: React.FC<AbsorptionChillerProps> = ({ coolingProduction, isOnline }) => {
    const statusText = isOnline ? 'Ativo' : 'Inativo';
    const statusColor = isOnline ? 'text-green-400' : 'text-red-500';

    return (
        <DashboardCard title="Chiller de Absorção" icon={<SnowflakeIcon className="w-6 h-6 text-cyan-400" />}>
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-400 text-sm mb-1">Produção de Frio</p>
                <p className={`text-5xl font-bold tracking-tight ${isOnline ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {coolingProduction.toFixed(0)}
                </p>
                <p className="text-lg text-gray-400">MW</p>
                 <p className={`mt-4 text-sm font-semibold ${statusColor}`}>
                    Status: {statusText}
                </p>
            </div>
        </DashboardCard>
    );
};

export default AbsorptionChiller;
