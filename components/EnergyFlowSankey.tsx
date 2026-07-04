import React, { useEffect, useRef } from 'react';
import DashboardCard from './DashboardCard';
import { ActivityIcon } from './icons';

// Using window.mermaid as it's loaded from a script tag in index.html
declare const mermaid: any;

interface EnergyFlowSankeyProps {
    t: (key: string) => string;
}

const EnergyFlowSankey: React.FC<EnergyFlowSankeyProps> = ({ t }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const mermaidChart = `
sankey-beta
    "Power Grid", "Chiller", 23
    "Power Grid", "Humidifier", 3
    "Power Grid", "CRAC", 15
    "Power Grid", "IT Equipment", 47
    "Power Grid", "PDU", 3
    "Power Grid", "UPS", 6
    "Power Grid", "Auxiliary devices", 2
    "Power Grid", "Switchgear", 1

    "Chiller", "Heat out", 23
    "Humidifier", "Heat out", 3
    "CRAC", "Heat out", 15
    "IT Equipment", "Heat out", 47
    "PDU", "Heat out", 3
    "UPS", "Heat out", 6
    "Auxiliary devices", "Heat out", 2
    "Switchgear", "Heat out", 1

    style "Power Grid" fill:#A0E6F7
    style "Chiller" fill:#A0E6F7
    style "Humidifier" fill:#E0F7FA
    style "CRAC" fill:#F8BBD0
    style "IT Equipment" fill:#F8BBD0
    style "PDU" fill:#FADADD
    style "UPS" fill:#FADADD
    style "Auxiliary devices" fill:#C8E6C9
    style "Switchgear" fill:#C8E6C9
    style "Heat out" fill:#C8E6C9
    `;

    useEffect(() => {
        if (typeof mermaid !== 'undefined' && mermaidRef.current) {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'dark',
                    sankey: {
                        alignment: 'center',
                        links: {
                            color: 'gradient'
                        }
                    },
                     themeVariables: {
                        background: '#1f2937', // bg-gray-800
                        primaryColor: '#1A2233',
                        primaryTextColor: '#d1d5db',
                        lineColor: '#4b5563',
                        textColor: '#d1d5db',
                        nodeBorder: '#06b6d4',
                    }
                });
                
                const graphId = `sankey-datacenter-${Date.now()}`;
                mermaid.render(graphId, mermaidChart, (svgCode: string) => {
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = svgCode;
                    }
                });

            } catch (e) {
                console.error("Error rendering mermaid diagram in EnergyFlowSankey:", e);
            }
        }
    }, [mermaidChart]);

    return (
        <DashboardCard title={t('dataCenter.sankey.title')} icon={<ActivityIcon className="w-6 h-6" />}>
            <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto flex justify-center h-[70vh]">
                <div ref={mermaidRef} style={{ minWidth: '800px' }}>
                    {/* Mermaid diagram is injected here by useEffect */}
                </div>
            </div>
        </DashboardCard>
    );
};

export default EnergyFlowSankey;