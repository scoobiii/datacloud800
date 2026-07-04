import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

// Define a clear interface for the modal's props
interface HotspotModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

interface GasTurbineDiagramProps {
  t: (key: string) => string;
}

const GasTurbineDiagram: React.FC<GasTurbineDiagramProps> = ({ t }) => {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveHotspotId(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const HotspotModal: React.FC<HotspotModalProps> = ({ id, title, children }) => {
    if (activeHotspotId !== id) return null;
    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={() => setActiveHotspotId(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`hotspot-title-${id}`}
        >
            <div 
                className="bg-white p-6 rounded-lg max-w-3xl w-full text-gray-800 relative transform transition-all animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={() => setActiveHotspotId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label={t('diagram.closeModal')}>
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 id={`hotspot-title-${id}`} className="text-2xl font-bold mb-4 text-cyan-600">{title}</h2>
                <div className="hotspot-content text-left overflow-y-auto max-h-[70vh]">
                    {children}
                </div>
            </div>
        </div>
    );
  };
  
  return (
    <div className="mt-6 text-center">
       <style>{`
          .hotspot-content img.alignleft {
            float: left;
            margin-right: 1.5em;
            margin-bottom: 1em;
            max-width: 330px;
            border-radius: 8px;
          }
           .hotspot-content h3 {
             font-size: 1.25rem;
             font-weight: 700;
             margin-bottom: 0.5rem;
           }
           .hotspot-content p {
             line-height: 1.6;
             clear: both;
           }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      <h1 className="text-3xl font-bold text-white mb-2">{t('diagram.title')}</h1>
      <p className="text-gray-400 mb-4">{t('diagram.subtitle')}</p>
      <div className="bg-white inline-block p-2 rounded-lg shadow-xl">
        <img
          width="1280"
          height="720"
          src="https://www.meefog.com/wp-content/uploads/2023/01/MeeFog_Typical-GT-Diagram_Web_Outlined-2.png"
          alt="Gas Turbine Diagram"
          useMap="#hotspots-image-map"
          className="max-w-full h-auto"
        />
      </div>
      <map name="hotspots-image-map">
        <area
            shape="rect"
            coords="380,848,693,931"
            href="#"
            title="Pump Skid"
            alt="Pump Skid"
            onClick={(e) => { e.preventDefault(); setActiveHotspotId('pump-skid'); }}
            style={{cursor: 'pointer'}}
        />
        <area
            shape="rect"
            coords="274,74,543,560"
            href="#"
            title="Evaporative Cooling Fog Nozzle Manifold"
            alt="Evaporative Cooling Fog Nozzle Manifold"
            onClick={(e) => { e.preventDefault(); setActiveHotspotId('evap-cooling'); }}
            style={{cursor: 'pointer'}}
        />
        <area
            shape="rect"
            coords="1204,641,1369,950"
            href="#"
            title="Wet Compression Nozzle Manifold"
            alt="Wet Compression Nozzle Manifold"
            onClick={(e) => { e.preventDefault(); setActiveHotspotId('wet-compression'); }}
            style={{cursor: 'pointer'}}
        />
      </map>

      <HotspotModal id="pump-skid" title="Pump Skid">
        <React.Fragment>
          <img
            className="alignleft"
            src="https://www.meefog.com/wp-content/uploads/2022/12/Pump-Skid.png"
            width="329"
            height="287"
            alt="Pump Skid"
          />
          <h3><strong>Pump Skid</strong></h3>
          <p>Stainless-steel welded frame with oversized inlet water filter. Water lubricated direct drive pumps means no oil or drive belts to change. Variable frequency drives are used to reduce flow for staging.</p>
        </React.Fragment>
      </HotspotModal>
      <HotspotModal id="evap-cooling" title="Evaporative Cooling Fog Nozzle Manifold">
        <React.Fragment>
          <img
            className="alignleft"
            src="https://www.meefog.com/wp-content/uploads/Evaporative-Cooling-Fog-Nozzle-Manifold.jpg"
            alt="Evaporative Cooling Manifold"
            width="403"
            height="302"
          />
          <h3><strong>Evaporative Cooling Fog Nozzle Manifold</strong></h3>
          <p>Cools to wet bulb temperature with droplets evaporating prior to entering compressor. Fog nozzles mounted on stainless steel tubing are wired for FOD avoidance. These precision nozzles are manufactured and tested in our own facility.</p>
        </React.Fragment>
      </HotspotModal>
      <HotspotModal id="wet-compression" title="Wet Compression Nozzle Manifold">
        <React.Fragment>
          <img
            className="alignleft"
            src="https://www.meefog.com/wp-content/uploads/2022/12/Wet-Compression-Nozzle-Manifold.png"
            width="339"
            height="339"
            alt="Wet Compression Manifold"
          />
          <h3><strong>Wet Compression Nozzle Manifold</strong></h3>
          <p>Fog droplets evaporate inside the compressor, giving an intercooling effect that reduces the work of compression. Water sprayed into the compressor will reduce NOx as well, but only about half as much as water sprayed into the combustors, because much of the air bypasses the combustion process.</p>
        </React.Fragment>
      </HotspotModal>
    </div>
  );
};

export default GasTurbineDiagram;
