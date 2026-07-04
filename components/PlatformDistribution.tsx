import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import DashboardCard from './DashboardCard';
import { ServerRackIcon } from './icons';
import { NVIDIA_PLATFORMS, PLATFORM_DISTRIBUTION_DATA } from '../data/nvidiaPlatforms';

// FIX: The data for the chart was not correctly structured. This now uses the percentages from nvidiaPlatforms.ts.
const data = [{ name: 'distribution', ...PLATFORM_DISTRIBUTION_DATA }];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        // Reverse for correct tooltip order
        const reversedPayload = [...payload].reverse();
        return (
            <div className="bg-gray-700 p-3 border border-gray-600 rounded-md shadow-lg text-sm">
                <p className="font-bold text-white mb-2">Composição da Infraestrutura</p>
                {reversedPayload.map((pld: any, index: number) => (
                    <div key={index} className="flex justify-between items-center gap-4">
                        <span style={{ color: pld.fill }}>■ {pld.dataKey}:</span>
                        <span className="font-mono font-semibold text-white">{pld.value}%</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const PlatformDistribution: React.FC = () => {
    return (
        <DashboardCard title="Distribuição de Plataformas no MAUAX DAO DataCloud" icon={<ServerRackIcon className="w-6 h-6"/>}>
            <div className="text-center mb-2">
                <p className="text-gray-400">
                    Modernizando o data center com IA e computação acelerada
                </p>
            </div>
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(42, 52, 73, 0.5)' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
                        {NVIDIA_PLATFORMS.map((platform, index) => {
                            // FIX: The `radius` prop was incorrectly placed on a `Cell` component which caused a TypeScript error.
                            // It has been moved to the `Bar` component. The logic below correctly rounds the outer corners
                            // of the entire stacked bar.
                            const isFirst = index === 0;
                            const isLast = index === NVIDIA_PLATFORMS.length - 1;
                            const radius: [number, number, number, number] = NVIDIA_PLATFORMS.length === 1
                                ? [8, 8, 8, 8]
                                : isFirst 
                                ? [8, 0, 0, 8] 
                                : isLast 
                                ? [0, 8, 8, 0] 
                                : [0, 0, 0, 0];

                            return (
                                <Bar 
                                    key={platform.name} 
                                    dataKey={platform.name} 
                                    stackId="a" 
                                    fill={platform.color}
                                    background={{ fill: '#1A2233' }}
                                    radius={radius}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </DashboardCard>
    );
};

export default PlatformDistribution;
