import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { BoltIcon } from './icons';

interface PowerConsumptionProps {
  t: (key: string) => string;
}

const PowerConsumption: React.FC<PowerConsumptionProps> = ({ t }) => {
  const [pue, setPue] = useState(1.05);
  const [itLoad, setItLoad] = useState(485); // kW
  const [totalLoad, setTotalLoad] = useState(510); // kW
  const BASELINE_PUE = 1.5; // Industry average for less efficient data centers

  useEffect(() => {
    const interval = setInterval(() => {
      const newItLoad = Math.max(450, Math.min(500, itLoad + (Math.random() - 0.5) * 10));
      // With our trigeneration, cooling load is very low.
      const coolingLoad = newItLoad * 0.05; 
      const otherLoads = 5; 
      const newTotalLoad = newItLoad + coolingLoad + otherLoads;
      const newPue = newTotalLoad / newItLoad;

      setPue(newPue);
      setItLoad(newItLoad);
      setTotalLoad(newTotalLoad);
    }, 2500);

    return () => clearInterval(interval);
  }, [itLoad]);

  const coolingAndInfraLoad = totalLoad - itLoad;
  const energySavings = (BASELINE_PUE - pue) * itLoad;

  return (
    <DashboardCard title={t('dataCenter.powerConsumptionTitle')} icon={<BoltIcon className="w-6 h-6 text-yellow-400" />}>
      <div className="flex flex-col justify-around h-full text-center">
        <div className="grid grid-cols-2 divide-x divide-gray-700">
            <div>
              <p className="text-gray-400 text-sm">{t('dataCenter.pue')}</p>
              <p className="text-4xl font-bold text-green-400 tracking-tight">{pue.toFixed(3)}</p>
            </div>
             <div>
              <p className="text-gray-400 text-sm">{t('dataCenter.energySavings')}</p>
              <p className="text-4xl font-bold text-cyan-400 tracking-tight">{energySavings.toFixed(1)}</p>
              <p className="text-xs text-gray-500">kW ({t('dataCenter.vsBaseline').replace('{baseline}', String(BASELINE_PUE))})</p>
            </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-700 text-sm pt-4 border-t border-gray-700">
          <div>
            <p className="text-gray-400">{t('dataCenter.itLoad')}</p>
            <p className="font-mono text-lg font-semibold">{itLoad.toFixed(1)} kW</p>
          </div>
          <div>
            <p className="text-gray-400">{t('dataCenter.coolingAndInfra')}</p>
            <p className="font-mono text-lg font-semibold text-orange-400">{coolingAndInfraLoad.toFixed(1)} kW</p>
          </div>
          <div>
            <p className="text-gray-400">{t('dataCenter.totalLoad')}</p>
            <p className="font-mono text-lg font-semibold">{totalLoad.toFixed(1)} kW</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default PowerConsumption;
