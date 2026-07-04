import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { SnowflakeIcon } from './icons';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface CoolingDataPoint {
  time: number;
  load: number;
}

interface EfficiencyDataPoint {
    time: number;
    efficiency: number;
}

const LoadTooltip = ({ active, payload, t }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="intro text-sm text-cyan-400">{`${t('dataCenter.tooltip.load')} ${payload[0].value.toFixed(1)} kW`}</p>
        </div>
      );
    }
    return null;
};

const EfficiencyTooltip = ({ active, payload, t }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="intro text-sm text-green-400">{`${t('dataCenter.tooltip.efficiency')} ${payload[0].value.toFixed(2)} kW/Ton`}</p>
        </div>
      );
    }
    return null;
};

interface CoolingLoadProps {
  t: (key: string) => string;
}

const CoolingLoad: React.FC<CoolingLoadProps> = ({ t }) => {
  const [currentLoad, setCurrentLoad] = useState(25); // kW
  const [historicalLoad, setHistoricalLoad] = useState<CoolingDataPoint[]>([]);
  const [efficiency, setEfficiency] = useState(0.15); // kW/Ton
  const [historicalEfficiency, setHistoricalEfficiency] = useState<EfficiencyDataPoint[]>([]);


  useEffect(() => {
    // Initialize historical data
    setHistoricalLoad(Array.from({ length: 10 }, (_, i) => ({
        time: Date.now() - (9 - i) * 3000,
        load: 25 + (Math.random() - 0.5) * 4,
    })));
    setHistoricalEfficiency(Array.from({ length: 10 }, (_, i) => ({
        time: Date.now() - (9 - i) * 3000,
        efficiency: 0.15 + (Math.random() - 0.5) * 0.04,
    })));
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // Update Load
      const newLoad = Math.max(20, Math.min(35, currentLoad + (Math.random() - 0.5) * 2));
      setCurrentLoad(newLoad);
      setHistoricalLoad(prev => {
        const newPoint = { time: Date.now(), load: newLoad };
        return [...prev.slice(1), newPoint];
      });

      // Update Efficiency (lower is better)
      const newEfficiency = Math.max(0.12, Math.min(0.25, efficiency + (Math.random() - 0.5) * 0.02));
      setEfficiency(newEfficiency);
      setHistoricalEfficiency(prev => {
        const newPoint = { time: Date.now(), efficiency: newEfficiency };
        return [...prev.slice(1), newPoint];
      })
    }, 3000);

    return () => clearInterval(interval);
  }, [currentLoad, efficiency]);

  return (
    <DashboardCard title={t('dataCenter.coolingLoadTitle')} icon={<SnowflakeIcon className="w-6 h-6 text-cyan-400" />}>
        <div className="grid grid-rows-2 h-full gap-2">
            {/* Metric 1: Cooling Load */}
            <div className="flex flex-col">
                <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-400 tracking-tight">{currentLoad.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">{t('dataCenter.currentLoad')}</p>
                </div>
                <div className="flex-grow h-10 mt-1 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalLoad}>
                            <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip content={<LoadTooltip t={t} />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}}/>
                            <Line 
                                type="monotone" 
                                dataKey="load" 
                                stroke="#06b6d4" 
                                strokeWidth={2} 
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Metric 2: Cooling Efficiency */}
            <div className="flex flex-col border-t border-gray-700 pt-2">
                <div className="text-center">
                    <p className="text-3xl font-bold text-green-400 tracking-tight">{efficiency.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{t('dataCenter.efficiency')}</p>
                </div>
                <div className="flex-grow h-10 mt-1 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalEfficiency}>
                            <YAxis hide={true} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
                            <Tooltip content={<EfficiencyTooltip t={t} />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}}/>
                            <Line 
                                type="monotone" 
                                dataKey="efficiency" 
                                stroke="#22c55e"
                                strokeWidth={2} 
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </DashboardCard>
  );
};

export default CoolingLoad;
