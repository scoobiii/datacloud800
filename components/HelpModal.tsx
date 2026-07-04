import React, { useState } from 'react';
import { CloseIcon, InfoIcon } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

type HelpTab = 'user' | 'tutorial' | 'glossary' | 'newAsset' | 'partners' | 'devops' | 'status';

// --- Content Components ---

const UserGuideContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">{t('help.tabs.userGuide')}</h3>
        <div className="space-y-4 text-gray-300">
            <p>{t('help.intro')}</p>
            <h4 className="font-semibold text-lg text-cyan-400 pt-2 border-t border-gray-700">{t('help.navigation.title')}</h4>
            <p>{t('help.navigation.desc')}</p>
            <h4 className="font-semibold text-lg text-cyan-400 pt-2 border-t border-gray-700">{t('help.dashboard.title')}</h4>
            <p>{t('help.dashboard.desc')}</p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-sm">
                <li><strong>{t('nav.powerPlant')}:</strong> {t('help.dashboard.powerPlant')}</li>
                <li><strong>{t('nav.utilities')}:</strong> {t('help.dashboard.utilities')}</li>
                <li><strong>{t('nav.dataCenter')}:</strong> {t('help.dashboard.dataCenter')}</li>
                <li><strong>{t('nav.financials')}:</strong> {t('help.dashboard.financials')}</li>
                <li><strong>{t('nav.configuration')}:</strong> {t('help.dashboard.configuration')}</li>
            </ul>
            <h4 className="font-semibold text-lg text-cyan-400 pt-2 border-t border-gray-700">{t('help.maximization.title')}</h4>
            <p>{t('help.maximization.desc')}</p>
        </div>
    </div>
);

const TutorialContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">{t('help.tutorial.title')}</h3>
        <p className="text-gray-400 mb-6">{t('help.tutorial.intro')}</p>
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">1. {t('help.tutorial.step1.title')}</h4>
                <p>{t('help.tutorial.step1.desc')}</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">2. {t('help.tutorial.step2.title')}</h4>
                <p>{t('help.tutorial.step2.desc')}</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">3. {t('help.tutorial.step3.title')}</h4>
                <p>{t('help.tutorial.step3.desc')}</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">4. {t('help.tutorial.step4.title')}</h4>
                <p>{t('help.tutorial.step4.desc')}</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">5. {t('help.tutorial.step5.title')}</h4>
                <p>{t('help.tutorial.step5.desc')}</p>
            </div>
        </div>
    </div>
);

const GlossaryContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
     <div>
        <h3 className="text-xl font-bold text-white mb-4">{t('help.tabs.glossary')}</h3>
        <div className="space-y-4">
            <p><strong>{t('glossary.pue.term')}:</strong> {t('glossary.pue.def')}</p>
            <p><strong>{t('glossary.trigeneration.term')}:</strong> {t('glossary.trigeneration.def')}</p>
            <p><strong>{t('glossary.tiac.term')}:</strong> {t('glossary.tiac.def')}</p>
            <p><strong>{t('glossary.sankey.term')}:</strong> {t('glossary.sankey.def')}</p>
        </div>
    </div>
);

const NewAssetGuideContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">{t('help.tabs.newAsset')}</h3>
        <p>{t('help.newAsset.intro')}</p>
        <ol className="list-decimal list-inside space-y-2 mt-4">
            <li>{t('help.newAsset.step1')}</li>
            <li>{t('help.newAsset.step2')}</li>
            <li>{t('help.newAsset.step3')}</li>
            <li>{t('help.newAsset.step4')}</li>
        </ol>
    </div>
);


const PartnersGuideContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
     <div className="pt-4">
        <h3 className="font-semibold text-xl text-cyan-400 mb-2">{t('help.tabs.partners')}</h3>
        <p className="text-gray-400 mb-4">{t('help.partners.intro')}</p>

        <h4 className="font-semibold text-lg text-cyan-400 mt-4 mb-2">{t('help.partners.dataCloudPotential.title')}</h4>
        <p className="text-gray-300 mb-4">{t('help.partners.dataCloudPotential.intro')}</p>

        <div className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-bold text-white">{t('help.partners.dataCloudPotential.phase1.title')}</h5>
                <p className="text-gray-300 text-sm mt-1" dangerouslySetInnerHTML={{ __html: t('help.partners.dataCloudPotential.phase1.p1') }} />
                <p className="text-gray-300 text-sm mt-2 font-semibold" dangerouslySetInnerHTML={{ __html: t('help.partners.dataCloudPotential.phase1.p2') }} />
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-bold text-white">{t('help.partners.dataCloudPotential.phase2.title')}</h5>
                <p className="text-gray-300 text-sm mt-1" dangerouslySetInnerHTML={{ __html: t('help.partners.dataCloudPotential.phase2.p1') }} />
                <p className="text-gray-300 text-sm mt-2 font-semibold" dangerouslySetInnerHTML={{ __html: t('help.partners.dataCloudPotential.phase2.p2') }} />
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-bold text-white">{t('help.partners.dataCloudPotential.efficiency.title')}</h5>
                <p className="text-gray-300 text-sm mt-1">{t('help.partners.dataCloudPotential.efficiency.p1')}</p>
            </div>
        </div>
    </div>
);

const DevOpsGuideContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">{t('help.tabs.devops')}</h3>
        <p>{t('help.devops.intro')}</p>
        <div className="bg-gray-900 p-4 rounded-md mt-4 font-mono text-sm text-gray-300">
            <p>{t('help.devops.config')}</p>
            <p className="mt-2 text-cyan-400">{t('help.devops.localStorage')}</p>
            <ul className="list-disc pl-5 mt-1 text-xs">
                <li>app-all-configs</li>
                <li>app-resource-config</li>
                <li>app-selected-plant</li>
                <li>app-available-plants</li>
                <li>app-user-settings</li>
            </ul>
        </div>
    </div>
);

const ProjectStatusContent: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <div>
        <h3 className="text-xl font-bold text-white mb-4">{t('help.status.title')}</h3>
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">{t('help.status.currentStatus')}</h4>
                <p>{t('help.status.currentStatus.desc')}</p>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">{t('help.status.changelog')}</h4>
                <div className="space-y-3">
                     <div className="bg-gray-700/50 p-3 rounded-lg">
                        <p className="font-semibold text-white">{t('help.status.v1_2_0')}</p>
                        <p className="text-sm text-gray-300">{t('help.status.v1_2_0.desc')}</p>
                    </div>
                     <div className="bg-gray-700/50 p-3 rounded-lg">
                        <p className="font-semibold text-white">{t('help.status.v1_1_0')}</p>
                        <p className="text-sm text-gray-300">{t('help.status.v1_1_0.desc')}</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">{t('help.status.roadmap')}</h4>
                <div className="space-y-3">
                    <div>
                        <p className="font-semibold text-white">{t('help.status.sprint4')}</p>
                        <p className="text-sm text-gray-300">{t('help.status.sprint4.desc')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-white">{t('help.status.sprint5')}</p>
                        <p className="text-sm text-gray-300">{t('help.status.sprint5.desc')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-white">{t('help.status.sprint6')}</p>
                        <p className="text-sm text-gray-300">{t('help.status.sprint6.desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


// --- Main Modal Component ---

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<HelpTab>('status');

  const tabs: { id: HelpTab, labelKey: string }[] = [
      { id: 'tutorial', labelKey: 'help.tabs.tutorial' },
      { id: 'user', labelKey: 'help.tabs.userGuide' },
      { id: 'glossary', labelKey: 'help.tabs.glossary' },
      { id: 'newAsset', labelKey: 'help.tabs.newAsset' },
      { id: 'partners', labelKey: 'help.tabs.partners' },
      { id: 'devops', labelKey: 'help.tabs.devops' },
      { id: 'status', labelKey: 'help.tabs.status' },
  ];

  const renderContent = () => {
    switch (activeTab) {
        case 'user': return <UserGuideContent t={t} />;
        case 'tutorial': return <TutorialContent t={t} />;
        case 'glossary': return <GlossaryContent t={t} />;
        case 'newAsset': return <NewAssetGuideContent t={t} />;
        case 'partners': return <PartnersGuideContent t={t} />;
        case 'devops': return <DevOpsGuideContent t={t} />;
        case 'status': return <ProjectStatusContent t={t} />;
        default: return <UserGuideContent t={t} />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <InfoIcon className="w-6 h-6 text-cyan-400" />
            <h2 id="help-modal-title" className="text-xl font-semibold text-white">
              {t('help.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label={t('help.close')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="flex flex-grow min-h-0">
          <nav className="w-1/4 p-4 border-r border-gray-700 flex-shrink-0 overflow-y-auto">
            <ul className="space-y-2">
              {tabs.sort((a, b) => a.id === 'status' ? -1 : 1).map(tab => ( // Puts Status on top
                  <li key={tab.id}>
                      <button 
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab.id 
                            ? 'bg-cyan-500 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                          {t(tab.labelKey)}
                      </button>
                  </li>
              ))}
            </ul>
          </nav>
          <main className="flex-1 p-6 overflow-y-auto text-gray-300">
            {renderContent()}
          </main>
        </div>

      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default HelpModal;
