import React from 'react';
import { PlantStatus } from '../types';

interface ControlPanelProps {
  plantStatus: PlantStatus;
  setPlantStatus: (status: PlantStatus) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  plantStatus,
  setPlantStatus,
}) => {
  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-md flex flex-wrap items-center justify-start gap-y-4 gap-x-6">
      <div className="flex items-center gap-3" role="group" aria-label="Status da Usina">
        <span className="font-semibold text-gray-300">Status da Usina:</span>
        <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
          {Object.values(PlantStatus).map((status) => (
            <button
              key={status}
              onClick={() => setPlantStatus(status)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                plantStatus === status
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              aria-pressed={plantStatus === status}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;