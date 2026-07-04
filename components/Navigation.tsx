
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

// Update Page type to include submenu items
export type Page = 
    'Power Plant' | 
    'Utilities' | 
    'Data Center' | 
    'Financials' | 
    'Configuration' | 
    'Infrastructure' | 
    'MAUAX consortium' | 
    'inventario UTE' | 
    'Chiller' | 
    'PowerPlantSystem' |
    'API Documentation' |
    'Investor Relations (RI)' |
    // Submenu items for Utilities
    'Fluxo de Energia da Usina' |
    'Chiller Absorção' |
    'Chiller Absorção -> Tiac' |
    'Chiller Absorção -> Fog' |
    'Chiller Absorção -> Data Cloud' |
    'Fog System Details' |
    'Power Plant Sankey' |
    'Pitch MEX' |
    'ONS & ANEEL Grid' |
    'External Page'; // New page for viewing external content

interface NavItem {
    labelKey: string;
    page: Page;
    children?: NavItem[];
}

// Restructure nav items to support submenus
const navItems: NavItem[] = [
    { labelKey: 'nav.powerPlant', page: 'Power Plant' },
    { 
        labelKey: 'nav.utilities', 
        page: 'Utilities',
        children: [
            { labelKey: 'nav.utilities.flow', page: 'Fluxo de Energia da Usina' },
            { labelKey: 'nav.utilities.chiller', page: 'Chiller Absorção' },
            { labelKey: 'nav.utilities.chiller.tiac', page: 'Chiller Absorção -> Tiac' },
            { labelKey: 'nav.utilities.chiller.fog', page: 'Chiller Absorção -> Fog' },
            { labelKey: 'nav.utilities.chiller.dataCloud', page: 'Chiller Absorção -> Data Cloud' },
        ]
    },
    { labelKey: 'nav.dataCenter', page: 'Data Center' },
    { labelKey: 'nav.financials', page: 'Financials' },
    { labelKey: 'nav.configuration', page: 'Configuration' },
    { labelKey: 'nav.infrastructure', page: 'Infrastructure' },
    { labelKey: 'nav.consortium', page: 'MAUAX consortium' },
    { labelKey: 'nav.inventory', page: 'inventario UTE' },
    { labelKey: 'nav.onsAneelGrid', page: 'ONS & ANEEL Grid' },
    { labelKey: 'nav.apiDocs', page: 'API Documentation' },
    { labelKey: 'nav.ri', page: 'Investor Relations (RI)' },
    { labelKey: 'nav.pitchMex', page: 'Pitch MEX' },
];

interface NavigationProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  t: (key: string) => string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, t }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Check if the current page is a child of a nav item to keep the parent highlighted
    const isChildPageActive = (item: NavItem): boolean => {
        if (!item.children) return false;
        return item.children.some(child => child.page === currentPage);
    };

    return (
        <nav className="bg-gray-900 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-start h-16">
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <div 
                                    key={item.labelKey}
                                    className="relative"
                                    onMouseEnter={() => item.children && setOpenMenu(item.labelKey)}
                                    onMouseLeave={() => item.children && setOpenMenu(null)}
                                >
                                    <button
                                        onClick={() => setCurrentPage(item.page)}
                                        className={`flex items-center gap-1 transition-colors duration-200 ${
                                            currentPage === item.page || isChildPageActive(item) || (item.children && openMenu === item.labelKey)
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
                                        aria-haspopup={!!item.children}
                                        aria-expanded={openMenu === item.labelKey}
                                        aria-current={currentPage === item.page || isChildPageActive(item) ? 'page' : undefined}
                                    >
                                        {t(item.labelKey)}
                                        {item.children && <ChevronDownIcon className="w-4 h-4" />}
                                    </button>
                                    {item.children && openMenu === item.labelKey && (
                                        <div className="absolute z-10 mt-2 w-64 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                {item.children.map(child => (
                                                    <a
                                                        key={child.labelKey}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(child.page);
                                                            setOpenMenu(null);
                                                        }}
                                                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                                                        role="menuitem"
                                                    >
                                                        {t(child.labelKey)}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Animation for dropdown */}
            <style>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { 
                animation: fadeIn 0.2s ease-out; 
                }
            `}</style>
        </nav>
    );
};

export default Navigation;