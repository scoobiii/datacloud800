import React from 'react';
import DashboardCard from './DashboardCard';
import { CloseIcon, ChartPieIcon, ServerRackIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Rack } from './ServerRackStatus';

const CustomTempTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-sm text-gray-300">{`${t('dataCenter.rack.modal.tooltip.time')} ${label}`}</p>
          <p className="intro text-sm text-red-400">{`${t('dataCenter.rack.modal.tooltip.temp')} ${payload[0].value.toFixed(1)}°C`}</p>
        </div>
      );
    }
    return null;
};

const MetricDisplay: React.FC<{ label: string; value: string; colorClass?: string }> = ({ label, value, colorClass = 'text-white' }) => (
    <div className="bg-gray-900 p-3 rounded-lg text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</p>
    </div>
);

interface ServerRackDetailsModalProps {
  rack: Rack;
  onClose: () => void;
  t: (key: string) => string;
}

const ServerRackDetailsModal: React.FC<ServerRackDetailsModalProps> = ({ rack, onClose, t }) => {
    if (!rack) return null;

    const gpuLoad = rack.gpuLoad || 0;
    const cpuGpuTotal = rack.cpuLoad + gpuLoad;
    const cpuPercentage = cpuGpuTotal > 0 ? (rack.cpuLoad / cpuGpuTotal) * 100 : 0;
    const gpuPercentage = cpuGpuTotal > 0 ? (gpuLoad / cpuGpuTotal) * 100 : 0;

    const MAX_NETWORK_IO = 10; // Gbps, a reasonable baseline for visualization
    const ingressPercentage = Math.min((rack.networkIO.ingress / MAX_NETWORK_IO) * 100, 100);
    const egressPercentage = Math.min((rack.networkIO.egress / MAX_NETWORK_IO) * 100, 100);
    
    return (
        <div 
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-2xl" 
                onClick={e => e.stopPropagation()}
            >
                <DashboardCard
                    title={t('dataCenter.rack.modal.title').replace('{id}', String(rack.id))}
                    icon={<ServerRackIcon className="w-6 h-6" />}
                    action={
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label={t('dataCenter.rack.modal.close')}>
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <MetricDisplay label="CPU" value={`${rack.cpuLoad}%`} />
                        <MetricDisplay label="GPU" value={`${rack.gpuLoad || 0}%`} colorClass="text-cyan-400"/>
                        <MetricDisplay label={t('dataCenter.rack.modal.memory')} value={`${rack.memUsage}%`} />
                        <MetricDisplay label={t('dataCenter.rack.modal.temperature')} value={`${rack.temp}°C`} colorClass="text-red-400" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <ChartPieIcon className="w-5 h-5 text-cyan-400" />
                                {t('dataCenter.rack.modal.utilization')}
                            </h4>
                             <div className="w-full bg-gray-700 rounded-full h-6 flex overflow-hidden">
                                <div className="bg-white h-6 text-black text-xs font-bold flex items-center justify-center" style={{ width: `${cpuPercentage}%` }}>
                                   {rack.cpuLoad > 10 && `CPU ${cpuPercentage.toFixed(0)}%`}
                                </div>
                                <div className="bg-cyan-400 h-6 text-black text-xs font-bold flex items-center justify-center" style={{ width: `${gpuPercentage}%` }}>
                                   {gpuLoad > 10 && `GPU ${gpuPercentage.toFixed(0)}%`}
                                </div>
                            </div>

                            <h4 className="font-semibold text-gray-300 mt-6 mb-2">{t('dataCenter.rack.modal.network')}</h4>
                            <div className="flex flex-col gap-4">
                                <div className="bg-gray-700 p-3 rounded-lg">
                                    <div className="flex justify-between items-baseline">
                                        <p className="text-sm text-gray-400">{t('dataCenter.rack.modal.ingress')}</p>
                                        <p className="text-lg font-mono font-semibold text-green-400">{rack.networkIO.ingress.toFixed(2)} Gbps</p>
                                    </div>
                                    <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                                        <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${ingressPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-gray-700 p-3 rounded-lg">
                                    <div className="flex justify-between items-baseline">
                                        <p className="text-sm text-gray-400">{t('dataCenter.rack.modal.egress')}</p>
                                        <p className="text-lg font-mono font-semibold text-blue-400">{rack.networkIO.egress.toFixed(2)} Gbps</p>
                                    </div>
                                    <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${egressPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2">{t('dataCenter.rack.modal.tempHistory')}</h4>
                             <div className="w-full h-48">
                                <ResponsiveContainer>
                                    <LineChart data={rack.tempHistory} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} unit="°C" />
                                        <Tooltip content={<CustomTempTooltip t={t} />} />
                                        <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                </DashboardCard>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export default ServerRackDetailsModal;
