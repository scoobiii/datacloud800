import React, { useEffect, useRef } from 'react';
import DashboardCard from './DashboardCard';
import { ActivityIcon } from './icons';
import { Page } from './Navigation';

// Using window.mermaid as it's loaded from a script tag in index.html
declare const mermaid: any;

interface PowerPlantSankeyProps {
    powerOutput: number;
    efficiency: number;
    setCurrentPage: (page: Page) => void;
    t: (key: string) => string;
}

const PowerPlantSankey: React.FC<PowerPlantSankeyProps> = ({ powerOutput, efficiency, setCurrentPage, t }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    // Calculations based on Utilities.tsx logic
    const powerInput = efficiency > 0 ? powerOutput / (efficiency / 100) : 0;
    const wasteHeat = powerInput - powerOutput;
    const chillerCOP = 0.694;
    const coolingProduction = wasteHeat * chillerCOP;
    
    // Example distribution
    const tiacCooling = coolingProduction * 0.4;
    const fogCooling = coolingProduction * 0.25;
    const dataCenterCooling = coolingProduction * 0.35;

    const mermaidChart = `
sankey-beta
    "Combustível (${powerInput.toFixed(0)} MWth)", "Turbinas a Gás", ${powerInput.toFixed(0)}
    
    "Turbinas a Gás", "Energia Elétrica", ${powerOutput.toFixed(0)}
    "Turbinas a Gás", "Calor Residual", ${wasteHeat.toFixed(0)}
    
    "Energia Elétrica", "Rede Elétrica", ${powerOutput.toFixed(0)}
    
    "Calor Residual", "Chiller de Absorção", ${wasteHeat.toFixed(0)}
    "Chiller de Absorção", "Rejeição de Calor", ${(wasteHeat - coolingProduction).toFixed(0)}
    "Chiller de Absorção", "Produção de Frio", ${coolingProduction.toFixed(0)}
    
    "Produção de Frio", "Sistema TIAC", ${tiacCooling.toFixed(0)}
    "Produção de Frio", "Sistema Fog", ${fogCooling.toFixed(0)}
    "Produção de Frio", "Data Center", ${dataCenterCooling.toFixed(0)}
    `;

    useEffect(() => {
        if (typeof mermaid !== 'undefined' && mermaidRef.current) {
            try {
                mermaid.initialize({
                    startOnLoad: false, 
                    theme: 'dark',
                    sankey: {
                        alignment: 'center'
                    },
                    themeVariables: {
                        background: '#1f2937',
                        primaryColor: '#1A2233',
                        primaryTextColor: '#d1d5db',
                        lineColor: '#4b5563',
                        textColor: '#d1d5db',
                    }
                });

                const graphId = `sankey-powerplant-${Date.now()}`;
                mermaid.render(graphId, mermaidChart, (svgCode: string) => {
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = svgCode;
                    }
                });

            } catch (e) {
                console.error("Mermaid initialization error in PowerPlantSankey:", e);
            }
        }
    }, [mermaidChart]);

    return (
        <div className="mt-6 animate-fadeIn">
            <DashboardCard 
                title={t('sankey.title')} 
                icon={<ActivityIcon className="w-6 h-6" />}
                action={
                    <button onClick={() => setCurrentPage('Utilities')} className="px-3 py-1.5 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md hover:bg-cyan-500 hover:text-white">
                        {t('sankey.back')}
                    </button>
                }
            >
                <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto flex justify-center h-[75vh]">
                    <div ref={mermaidRef} style={{ minWidth: '900px' }}>
                        {/* Mermaid diagram is injected here by useEffect */}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};

export default PowerPlantSankey;