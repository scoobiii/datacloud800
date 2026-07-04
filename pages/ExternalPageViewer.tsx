import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { CloseIcon, InfoIcon } from '../components/icons';

interface ExternalPageViewerProps {
  url: string;
  onClose: () => void;
  t: (key: string) => string;
}

const ExternalPageViewer: React.FC<ExternalPageViewerProps> = ({ url, onClose, t }) => {
  return (
    <div className="mt-6 animate-fadeIn">
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
      `}</style>
      <DashboardCard 
        title={t('external.title')}
        icon={<InfoIcon className="w-6 h-6" />} 
        action={
            <button onClick={onClose} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm font-semibold" aria-label={t('external.back')}>
                <CloseIcon className="w-5 w-5" /> {t('external.back')}
            </button>
        }
    >
        <div className="w-full h-[80vh] bg-white rounded-lg overflow-hidden flex flex-col">
          <div className="p-2 bg-gray-700 text-xs text-center text-gray-300">
            <span>{t('external.viewing').replace('{url}', url)}</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
              {t('external.openInNewTab')}
            </a>.
          </div>
          <iframe
            src={url}
            title="Página Externa"
            className="w-full flex-grow border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
          ></iframe>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ExternalPageViewer;
