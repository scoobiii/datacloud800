import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import ServerRackDetailsModal from './ServerRackDetailsModal';
import { ServerRackIcon } from './icons';

export interface Rack {
  id: number;
  cpuLoad: number;
  gpuLoad: number;
  memUsage: number;
  temp: number;
  status: 'online' | 'high-load' | 'offline';
  networkIO: {
    ingress: number;
    egress: number;
  };
  tempHistory: { time: string; temp: number }[];
}

interface ServerRackStatusProps {
  onRackDataUpdate: (count: number) => void;
  t: (key: string) => string;
}

const generateInitialRackData = (): Rack[] => {
  return Array.from({ length: 120 }, (_, i) => {
    const statusRoll = Math.random();
    let status: 'online' | 'high-load' | 'offline' = 'online';
    if (statusRoll > 0.95) {
      status = 'offline';
    } else if (statusRoll > 0.85) {
      status = 'high-load';
    }

    return {
      id: i + 1,
      cpuLoad: status === 'offline' ? 0 : Math.round(10 + Math.random() * (status === 'high-load' ? 80 : 50)),
      gpuLoad: status === 'offline' ? 0 : Math.round(5 + Math.random() * (status === 'high-load' ? 85 : 45)),
      memUsage: status === 'offline' ? 0 : Math.round(20 + Math.random() * 60),
      temp: status === 'offline' ? 18 : Math.round(22 + Math.random() * (status === 'high-load' ? 18 : 8)),
      status,
      networkIO: {
        ingress: status === 'offline' ? 0 : parseFloat((Math.random() * 5).toFixed(2)),
        egress: status === 'offline' ? 0 : parseFloat((Math.random() * 3).toFixed(2)),
      },
      tempHistory: Array.from({ length: 15 }, (_, j) => ({
        time: `${14-j}s`,
        temp: status === 'offline' ? 18 : Math.round(22 + Math.random() * (status === 'high-load' ? 18 : 8) - (Math.random() * 3)),
      })),
    };
  });
};

const CompactRackCard: React.FC<{ rack: Rack; onClick: () => void, t: (key: string) => string; }> = ({ rack, onClick, t }) => {
  const statusBorderColor = {
    online: 'border-green-500/50',
    'high-load': 'border-yellow-500/70',
    offline: 'border-red-500/70',
  };

  const isOffline = rack.status === 'offline';
  const tempColor = rack.temp > 38 ? 'text-red-400' : 'text-gray-200';

  return (
    <button
      onClick={onClick}
      className={`bg-gray-800 p-2 rounded-lg text-left transition-all duration-200 border-2 ${statusBorderColor[rack.status]} hover:bg-gray-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${isOffline ? 'opacity-60' : ''}`}
      aria-label={t('dataCenter.rack.details').replace('{id}', String(rack.id))}
    >
      <h4 className="font-bold text-white text-sm truncate">Rack {rack.id}</h4>
      <div className="mt-1 text-xs text-gray-400 space-y-1 font-mono">
        <div className="flex justify-between">
          <span>CPU:</span>
          <span className="font-semibold text-gray-200">{isOffline ? '-' : `${rack.cpuLoad}%`}</span>
        </div>
        <div className="flex justify-between">
          <span>GPU:</span>
          <span className="font-semibold text-gray-200">{isOffline ? '-' : `${rack.gpuLoad}%`}</span>
        </div>
        <div className="flex justify-between">
          <span>MEM:</span>
          <span className="font-semibold text-gray-200">{isOffline ? '-' : `${rack.memUsage}%`}</span>
        </div>
        <div className="flex justify-between">
          <span>Temp:</span>
          <span className={`font-semibold ${tempColor}`}>{isOffline ? '-' : `${rack.temp}°C`}</span>
        </div>
        <div className="flex justify-between">
          <span>I/O:</span>
          <span className="font-semibold text-gray-200 truncate" title={`${rack.networkIO.ingress.toFixed(1)} In / ${rack.networkIO.egress.toFixed(1)} Out Gbps`}>{isOffline ? '-' : `${rack.networkIO.ingress.toFixed(1)}/${rack.networkIO.egress.toFixed(1)}`}</span>
        </div>
      </div>
    </button>
  );
};

const ServerRackStatus: React.FC<ServerRackStatusProps> = ({ onRackDataUpdate, t }) => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);

  useEffect(() => {
    setRacks(generateInitialRackData());

    const interval = setInterval(() => {
      setRacks(prevRacks =>
        prevRacks.map(rack => {
          if (rack.status === 'offline') return rack;

          const newCpuLoad = Math.max(10, Math.min(99, rack.cpuLoad + (Math.random() - 0.5) * 10));
          const newGpuLoad = Math.max(5, Math.min(99, rack.gpuLoad + (Math.random() - 0.5) * 15));
          const newMemUsage = Math.max(20, Math.min(95, rack.memUsage + (Math.random() - 0.5) * 5));
          const newTemp = Math.max(22, Math.min(45, rack.temp + (Math.random() - 0.45) * 2));
          
          let newStatus = rack.status;
          if (newCpuLoad > 85 || newGpuLoad > 90 || newTemp > 40) {
            newStatus = 'high-load';
          } else if (rack.status === 'high-load' && newCpuLoad < 70 && newGpuLoad < 75 && newTemp < 35) {
            newStatus = 'online';
          }

          const newHistoryPoint = {
            time: '0s',
            temp: newTemp,
          };

          const updatedHistory = [newHistoryPoint, ...rack.tempHistory.slice(0, 14)].map((p, i) => ({...p, time: `${i}s`}));

          return {
            ...rack,
            cpuLoad: Math.round(newCpuLoad),
            gpuLoad: Math.round(newGpuLoad),
            memUsage: Math.round(newMemUsage),
            temp: Math.round(newTemp),
            status: newStatus,
            networkIO: {
              ingress: parseFloat(Math.max(0, rack.networkIO.ingress + (Math.random() - 0.5)).toFixed(2)),
              egress: parseFloat(Math.max(0, rack.networkIO.egress + (Math.random() - 0.5) * 0.5).toFixed(2)),
            },
            tempHistory: updatedHistory
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const summary = racks.reduce(
    (acc, rack) => {
      acc[rack.status]++;
      return acc;
    },
    { online: 0, 'high-load': 0, offline: 0 }
  );
  
  useEffect(() => {
    const activeCount = summary.online + summary['high-load'];
    onRackDataUpdate(activeCount);
  }, [summary, onRackDataUpdate]);


  return (
    <>
      <DashboardCard title={t('dataCenter.rackStatusTitle')} icon={<ServerRackIcon className="w-6 h-6" />}>
        <div className="flex justify-center gap-6 mb-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{summary.online}</p>
            <p className="text-sm text-gray-400">{t('dataCenter.rack.online')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{summary['high-load']}</p>
            <p className="text-sm text-gray-400">{t('dataCenter.rack.highLoad')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{summary.offline}</p>
            <p className="text-sm text-gray-400">{t('dataCenter.rack.offline')}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {racks.map(rack => (
            <CompactRackCard
              key={rack.id}
              rack={rack}
              onClick={() => setSelectedRack(rack)}
              t={t}
            />
          ))}
        </div>
      </DashboardCard>
      {selectedRack && (
        <ServerRackDetailsModal
          rack={selectedRack}
          onClose={() => setSelectedRack(null)}
          t={t}
        />
      )}
    </>
  );
};

export default ServerRackStatus;
