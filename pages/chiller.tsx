import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThermometerIcon, DropletIcon, CogIcon, TrendingUpIcon, ActivityIcon } from '../components/icons';

// FIX: Add props interface for translation function
interface ChillerDashboardProps {
  t: (key: string) => string;
}

const ChillerDashboard: React.FC<ChillerDashboardProps> = ({ t }) => {
  const [data, setData] = useState<any[]>([]); // Use any[] for recharts flexibility
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pidParams, setPidParams] = useState({
    temperature: { kp: 2.5, ki: 0.8, kd: 0.3 },
    flow: { kp: 1.8, ki: 0.6, kd: 0.2 },
    concentration: { kp: 3.2, ki: 1.0, kd: 0.4 }
  });

  // Simulação de dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        chilledWaterTemp: 5.2 + Math.sin(Date.now() / 10000) * 0.8,
        hotWaterTemp: 180 + Math.sin(Date.now() / 8000) * 15,
        coolingWaterTemp: 32 + Math.sin(Date.now() / 12000) * 3,
        libr_concentration: 58.5 + Math.sin(Date.now() / 15000) * 2.5,
        flow_chilled: 2500 + Math.sin(Date.now() / 7000) * 200,
        flow_hot: 180 + Math.sin(Date.now() / 9000) * 20,
        cop: 1.35 + Math.sin(Date.now() / 20000) * 0.15,
        capacity: 15000 + Math.sin(Date.now() / 11000) * 1000,
        power_consumption: 45 + Math.sin(Date.now() / 13000) * 5
      };
      
      setData(prev => [...prev.slice(-19), newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentData = data.length > 0 ? data[data.length - 1] : {
    chilledWaterTemp: 5.2,
    hotWaterTemp: 180,
    coolingWaterTemp: 32,
    libr_concentration: 58.5,
    flow_chilled: 2500,
    flow_hot: 180,
    cop: 1.35,
    capacity: 15000,
    power_consumption: 45
  };

  const fuzzyLogicRules = [
    { condition: "Temp_Entrada > 185°C AND Concentração < 55%", action: "Aumentar vazão hot water", priority: "Alta" },
    { condition: "COP < 1.20", action: "Verificar trocadores", priority: "Crítica" },
    { condition: "Temp_Água_Gelada > 7°C", action: "Ajustar PID temperatura", priority: "Alta" },
    { condition: "Vazão_Água_Gelada < 2000 m³/h", action: "Verificar bombas", priority: "Média" }
  ];

  const getStatusColor = (value, min, max) => {
    if (value < min || value > max) return "text-red-500";
    if (value < min * 1.1 || value > max * 0.9) return "text-yellow-500";
    return "text-green-500";
  };

  const PIDController = ({ title, params, onUpdate }) => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-200">
        <CogIcon className="w-5 h-5" />
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(params).map(([key, value]) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-400">{key.toUpperCase()}</label>
            <input
              type="number"
              step="0.1"
              value={value as number}
              onChange={(e) => onUpdate(key, parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded mt-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('chiller.title')}</h1>
            <p className="text-gray-400">{t('chiller.subtitle')}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{t('chiller.lastUpdate')}</div>
            <div className="text-lg font-mono text-white">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t('chiller.chilledWaterTemp')}</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentData.chilledWaterTemp, 4, 7)}`}>
                {currentData.chilledWaterTemp?.toFixed(1)}°C
              </p>
            </div>
            <ThermometerIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t('chiller.thermalCOP')}</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentData.cop, 1.2, 1.5)}`}>
                {currentData.cop?.toFixed(2)}
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t('chiller.refrigerationCapacity')}</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentData.capacity, 14000, 16000)}`}>
                {(currentData.capacity/1000)?.toFixed(1)}k TR
              </p>
            </div>
            <ActivityIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t('chiller.librConcentration')}</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentData.libr_concentration, 55, 62)}`}>
                {currentData.libr_concentration?.toFixed(1)}%
              </p>
            </div>
            <DropletIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">{t('chiller.systemTemperatures')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}
                formatter={(value: number, name) => [typeof value === 'number' ? `${value.toFixed(1)}°C` : value, name]} />
              <Line type="monotone" dataKey="chilledWaterTemp" stroke="#3b82f6" name={t('chiller.chilledWater')} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hotWaterTemp" stroke="#ef4444" name={t('chiller.hotWater')} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="coolingWaterTemp" stroke="#f59e0b" name={t('chiller.coolingWater')} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">{t('chiller.efficiencyAndCapacity')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="left" stroke="#10b981" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }} />
              <Line yAxisId="left" type="monotone" dataKey="cop" stroke="#10b981" name="COP" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="capacity" stroke="#8b5cf6" name={t('chiller.capacityTR')} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controladores PID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <PIDController
          title={t('chiller.pidTemperature')}
          params={pidParams.temperature}
          onUpdate={(param, value) => 
            setPidParams(prev => ({
              ...prev,
              temperature: { ...prev.temperature, [param]: value }
            }))
          }
        />
        <PIDController
          title={t('chiller.pidFlow')}
          params={pidParams.flow}
          onUpdate={(param, value) => 
            setPidParams(prev => ({
              ...prev,
              flow: { ...prev.flow, [param]: value }
            }))
          }
        />
        <PIDController
          title={t('chiller.pidConcentration')}
          params={pidParams.concentration}
          onUpdate={(param, value) => 
            setPidParams(prev => ({
              ...prev,
              concentration: { ...prev.concentration, [param]: value }
            }))
          }
        />
      </div>

      {/* Historical Temperature Chart */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">{t('chiller.tempHistory')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} unit="°C" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}
                formatter={(value: number, name) => [typeof value === 'number' ? `${value.toFixed(1)}°C` : value, name]} />
              <Line type="monotone" dataKey="chilledWaterTemp" stroke="#3b82f6" name={t('chiller.chilledWater')} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hotWaterTemp" stroke="#ef4444" name={t('chiller.hotWater')} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="coolingWaterTemp" stroke="#f59e0b" name={t('chiller.coolingWater')} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      {/* Lógica Fuzzy e Alarmes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
            <ActivityIcon className="w-5 h-5" />
            {t('chiller.fuzzyLogic')}
          </h3>
          <div className="space-y-3">
            {fuzzyLogicRules.map((rule, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                rule.priority === 'Crítica' ? 'border-red-500 bg-red-900/20' :
                rule.priority === 'Alta' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-blue-500 bg-blue-900/20'
              }`}>
                <div className="text-sm font-medium text-gray-300">{rule.condition}</div>
                <div className="text-sm text-gray-400 mt-1">{t('chiller.action')} {rule.action}</div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                  rule.priority === 'Crítica' ? 'bg-red-500/30 text-red-300' :
                  rule.priority === 'Alta' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-blue-500/30 text-blue-300'
                }`}>
                  {rule.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">{t('chiller.processParameters')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
              <span className="text-sm font-medium text-gray-400">{t('chiller.chilledWaterFlow')}</span>
              <span className="font-mono text-white">{currentData.flow_chilled?.toFixed(0)} m³/h</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
              <span className="text-sm font-medium text-gray-400">{t('chiller.hotWaterFlow')}</span>
              <span className="font-mono text-white">{currentData.flow_hot?.toFixed(0)} m³/h</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
              <span className="text-sm font-medium text-gray-400">{t('chiller.powerConsumption')}</span>
              <span className="font-mono text-white">{currentData.power_consumption?.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
              <span className="text-sm font-medium text-gray-400">{t('chiller.evaporatorPressure')}</span>
              <span className="font-mono text-white">0.87 kPa</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
              <span className="text-sm font-medium text-gray-400">{t('chiller.absorberPressure')}</span>
              <span className="font-mono text-white">7.2 kPa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChillerDashboard;