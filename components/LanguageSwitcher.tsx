import React, { useState, useEffect, useRef } from 'react';
import { GlobeAltIcon, ChevronDownIcon } from './icons';

interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'PT', name: 'Português' },
  { code: 'EN', name: 'English' },
  { code: 'AR', name: 'العربية' },
  { code: 'ZH', name: '中文' },
  { code: 'JA', name: '日本語' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'AF', name: 'Afrikaans' },
  { code: 'HI', name: 'हिन्दी' },
  { code: 'TPI', name: 'Tupi-Guarani' },
];

interface LanguageSwitcherProps {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <GlobeAltIcon className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-semibold text-white">{currentLanguage.code}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 animate-fadeIn">
          <ul className="py-1" role="menu">
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-between"
                  role="menuitem"
                >
                  <span>{lang.name}</span>
                  {lang.code === language && <span className="text-cyan-400">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.2s ease-out; 
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
