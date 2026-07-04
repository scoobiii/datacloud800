import React from 'react';

const FlowArrow: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-gray-600 transform lg:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" />
                    </marker>
                </defs>
                <line 
                    x1="0" y1="12" x2="18" y2="12" 
                    strokeWidth="2" 
                    markerEnd="url(#arrowhead)"
                    strokeDasharray="8 4"
                    className="animate-flow"
                />
            </svg>
            <style>{`
                @keyframes flow {
                    to {
                        stroke-dashoffset: -12;
                    }
                }
                .animate-flow {
                    animation: flow 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default FlowArrow;
