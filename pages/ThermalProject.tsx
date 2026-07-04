import React, { useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
// FIX: Import necessary icons for DashboardCard.
import { ActivityIcon, SnowflakeIcon, ThermometerIcon, CloudIcon, ChartBarIcon, InfoIcon } from '../components/icons';


// Using window.mermaid as it's loaded from a script tag in index.html
declare const mermaid: any;

const ThermalProject: React.FC = () => {
    
    // New Mermaid diagram from user prompt
    const mermaidGraph = `
    graph TD
        subgraph "1. Entrada e Condicionamento de Ar"
            ArAmbiente["Ar Ambiente"] --> TIAC{"TIAC - Turbine Inlet Air Cooling"};
            
            subgraph "Geração de Frio (Trigeração)"
                Chiller["**Chiller de Absorção**<br/>Capacidade: 10,5 MW Frio<br/>CAPEX: $20M | OPEX: $0.4M/ano<br/>ROI Contrib.: 18%"] -- "Água Gelada 7°C" --> SerpentinaTIAC["Serpentina de Resfriamento"];
                SerpentinaTIAC --> TIAC;
            end
            
            TIAC -- "Ar Frio e Denso @ 15°C / 60% UR" --> Turbinas;
        end

        subgraph "2. Geração de Energia e Calor"
            %% -- Seção de Combustível Inspirada no Dashboard -- %%
            subgraph "Configuração de Combustível"
                direction LR
                subgraph "Modo de Operação"
                    style FlexGN_H2 fill:#0891b2,stroke:#fff,color:#fff
                    GN[("Gás Natural")]
                    Etanol[("Etanol")]
                    Biodiesel[("Biodiesel")]
                    FlexGN_H2[("Flex (GN/H2)")]
                    FlexEtanol[("Flex (Etanol/Biodiesel)")]
                end
                
                subgraph "Ajuste de Mix Flexível (H₂)"
                    SliderH2{"Hidrogênio (H₂) Mix: 20%"}-- Controle --> FlexGN_H2;
                end

                FlexGN_H2 -- "Combustível Selecionado" --> Combustivel["**Combustível Selecionado**<br/>Custo (OPEX): $380M/ano<br/>(Redução de 5% com 20% H₂)"];
            end
            %% ------------------------------------------------- %%

            Combustivel --> Turbinas;
            
            Turbinas("<b>Turbinas a Gás (5 Unidades)</b><br/>Siemens SGT-9000HL / 8000H<br/>Potência Base (ISO): 2.555 MW");
            
            subgraph "Aumento de Potência (Power Augmentation)"
                FogSystem["**Sistema de Fogging (MeeFog)**<br/>CAPEX: $15M | OPEX: $0.3M/ano<br/>ROI Contrib.: 25%"] -- "+450 MW de Boost" --> Turbinas;
                Chiller -- "Água Gelada" --> FogSystem;
            end

            Turbinas -- "Potência Mecânica Total: ~3.000 MW" --> Geradores["Geradores Elétricos"];
            Geradores -- "<b>Potência Elétrica Bruta: ~3.000 MW</b>" --> Rede["<b>Energia para a Rede Elétrica</b><br/>Receita: $1.25 Bilhão/ano"];
            
            Turbinas -- "Gases de Exaustão @ ~600°C" --> HRSG("<b>Caldeira de Recuperação (HRSG)</b>");
            HRSG --> TurbinaVapor("Turbina a Vapor");
            TurbinaVapor --> Geradores;
            HRSG -- "Calor Residual @ ~90°C<br/>Energia Térmica: ~15 MW" --> CircuitoAguaQuente("Circuito de Água Quente");
        end

        subgraph "3. Aproveitamento e Rejeição de Calor"
            CircuitoAguaQuente -- "Alimenta" --> Chiller;
            Chiller -- "Rejeição de Calor" --> TorreSeca["<b>Dry Cooler (Torre Seca)</b><br/>Consumo de Água: 0 m³<br/>CAPEX: Elevado"];
            
            subgraph "Serviços Adicionais"
                Chiller -- "Frio para" --> Datacenter["<b>Datacenter TIER IV</b><br/>Carga TI: 10 MW<br/>Receita: $15M/ano"];
            end
            
            HRSG -- "Gases Resfriados @ ~90°C" --> Chamine["Chaminé"];
        end

        style Combustivel fill:#f9f,stroke:#333,stroke-width:2px
        style Rede fill:#ccf,stroke:#333,stroke-width:2px
        style Datacenter fill:#9f9,stroke:#333,stroke-width:2px
    `;
    
    useEffect(() => {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'dark',
                themeVariables: {
                    background: '#121826',
                    primaryColor: '#1A2233',
                    primaryTextColor: '#d1d5db',
                    lineColor: '#4b5563',
                    textColor: '#d1d5db',
                    nodeBorder: '#06b6d4',
                }
            });
        }
    }, []);

    // FIX: Added `icon` prop to satisfy DashboardCardProps.
    const FinancialInfoCard: React.FC<{title: string; capex: string; opex: string; contribution: string; icon: React.ReactNode; children?: React.ReactNode}> = ({ title, capex, opex, contribution, icon, children }) => (
        <DashboardCard title={title} icon={icon}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-400">CAPEX</p>
                        <p className="text-xl font-bold text-white">{capex}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">OPEX (Anual)</p>
                        <p className="text-xl font-bold text-white">{opex}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Contribuição Principal</p>
                        <p className="text-xl font-bold text-cyan-400">{contribution}</p>
                    </div>
                </div>
                {children && <div className="border-t border-gray-700 pt-4 mt-4 text-sm text-gray-300"><p>{children}</p></div>}
            </div>
        </DashboardCard>
    );

    return (
        <div className="mt-6 space-y-6">
            <h2 className="text-3xl font-bold text-white">Parque Térmico Pedreira - Análise de Projeto</h2>
            
            <DashboardCard title="Fluxograma do Processo Integrado" icon={<ActivityIcon className="w-6 h-6" />}>
                <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto flex justify-center">
                    <div className="mermaid">
                        {mermaidGraph}
                    </div>
                </div>
            </DashboardCard>
            
            <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Análise de Custo e Contribuição (CAPEX/OPEX)</h3>
                <p className="text-gray-400 mb-6">Para avaliar o impacto de cada subsistema, é essencial tratá-los como "subprojetos" dentro do complexo maior. Os valores são estimativas de mercado para um projeto desta escala (Potência total &gt; 2.5 GW).</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <FinancialInfoCard
                        title="1.1. Chiller de Absorção"
                        capex="$15 - $25 Milhões"
                        opex="$0.3M - $0.5M"
                        contribution="~10,5 MW de Frio 'Grátis'"
                        icon={<SnowflakeIcon className="w-6 h-6" />}
                    >
                       Este é o coração do sistema de trigeração. Sua função é converter calor residual (gratuito) em frio (valioso). Transforma um passivo (calor) em um ativo (refrigeração) que será "vendido" internamente para os outros sistemas (TIAC, Fogging, Datacenter).
                    </FinancialInfoCard>
                    <FinancialInfoCard
                        title="1.2. TIAC (Turbine Inlet Air Cooling)"
                        capex="$8 - $12 Milhões"
                        opex="$0.1M - $0.2M"
                        contribution="+15% a 25% Potência"
                        icon={<ThermometerIcon className="w-6 h-6" />}
                    >
                        Usa o frio do chiller para garantir que a turbina opere sempre em sua máxima potência de base, independentemente do clima. Evita a perda de centenas de MW em dias quentes, garantindo a entrega da capacidade máxima quando a demanda (e o preço) é maior.
                    </FinancialInfoCard>
                    <FinancialInfoCard
                        title="1.3. Fogging (Compressão Úmida - MeeFog)"
                        capex="$10 - $18 Milhões"
                        opex="$0.2M - $0.4M"
                        contribution="+10% a 20% Potência"
                        icon={<CloudIcon className="w-6 h-6" />}
                    >
                        Injeta uma névoa ultrafina para dar um "boost" de potência, aumentando a geração para além da capacidade nominal. Gera centenas de MW adicionais "on-demand", permitindo capturar picos de preço no mercado ou cumprir metas de despacho mais altas.
                    </FinancialInfoCard>
                </div>
            </div>

            <DashboardCard title="Consolidação de Receitas Anuais" icon={<ChartBarIcon className="w-6 h-6" />}>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                     <div>
                        <p className="text-sm text-gray-400">Venda de Energia Elétrica</p>
                        <p className="text-2xl font-bold text-cyan-400">~$1,25 Bilhão</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-400">Serviços de Cloud/Datacenter</p>
                        <p className="text-2xl font-bold text-purple-400">$10 - $20 Milhões</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-400">Venda de Créditos de Carbono</p>
                        <p className="text-2xl font-bold text-green-400">~$7,5 Milhões</p>
                     </div>
                     <div className="bg-gray-900/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Receita Total Anual Bruta</p>
                        <p className="text-2xl font-bold text-white">~ $1,27 Bilhão</p>
                     </div>
                 </div>
            </DashboardCard>
            
            <DashboardCard title="Conclusão Financeira" icon={<InfoIcon className="w-6 h-6" />}>
                <div className="space-y-3 text-gray-300">
                    <p><strong className="text-white">Investimento Total em Eficiência:</strong> O CAPEX combinado dos sistemas Chiller + TIAC + Fogging é de aproximadamente <span className="font-semibold text-yellow-400">$33 a $55 milhões</span>.</p>
                    <p><strong className="text-white">Retorno do Investimento em Eficiência:</strong> Esses sistemas, juntos, podem aumentar a receita de energia em mais de 25% em dias quentes (aumento de potência de &gt;400 MW) e habilitar as receitas do datacenter e de créditos de carbono. O retorno sobre este investimento específico é extremamente rápido, muitas vezes <span className="font-semibold text-green-400">inferior a 2 anos</span>.</p>
                    <p className="pt-2 border-t border-gray-700">A análise mostra que, embora o custo inicial seja significativo, a contribuição de cada subsistema para a performance e receita da planta é massiva. A sinergia entre eles é o que torna o Parque Térmico Pedreira um projeto financeiramente robusto e tecnologicamente superior.</p>
                </div>
            </DashboardCard>

        </div>
    );
};

export default ThermalProject;