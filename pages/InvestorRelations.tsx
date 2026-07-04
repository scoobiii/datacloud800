import React, { useState, useMemo } from 'react';
import { BoltIcon, InfoIcon, ComputerDesktopIcon, ArrowDownTrayIcon, ChartPieIcon, CogIcon, WrenchScrewdriverIcon } from '../components/icons';

const InvestorRelations: React.FC = () => {
    // Sliders for interactive ROI modelling
    const [datacenterLoad, setDatacenterLoad] = useState<number>(15); // in MW
    const [energyMwhCost, setEnergyMwhCost] = useState<number>(380); // R$ per MWh
    const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<string | null>(null);

    // Sprint de Engenharia - Conformidade do Barramento 800VDC
    const [sprintPriorities, setSprintPriorities] = useState([
        {
            id: 'p1',
            title: 'Chaveamento Bidirecional Ativo (SSCB)',
            subsystem: 'Painel e Distribuição Principal',
            description: 'Substituição de disjuntores magnéticos por chaves semicondutoras de estado sólido capazes de deter faltas na escala de milissegundos para evitar arcos sob 800VDC.',
            impact: 'Extingue arcos voltaicos destrutivos e separa transientes da malha de cogregação termelétrica.',
            riskLevel: 'Alto',
            milestones: [
                { id: 'm1_1', title: 'Topologia de Chaveamento de Comutação Suave ZCS', completed: true },
                { id: 'm1_2', title: 'Testes de Rigidez em Carga de Bancada Externa', completed: true },
                { id: 'm1_3', title: 'Comissionamento Acoplado ao Sistema SMR Actuator', completed: false }
            ]
        },
        {
            id: 'p2',
            title: 'Barreiras de Isolamento Galvânico Classe H',
            subsystem: 'Retificação e Chiller de Absorção',
            description: 'Isolamento dielétrico das juntas frias e separadores físicos associados aos compressores secundários redundantes do Chiller LiBr.',
            impact: 'Garante integridade operacional e veda correntes de fuga parasitas com a infraestrutura principal do S-CO₂.',
            riskLevel: 'Médio',
            milestones: [
                { id: 'm2_1', title: 'Upgrade dielétrico do cabeamento de média tensão 1.2kVDC', completed: true },
                { id: 'm2_2', title: 'Acopladores ópticos profundos com isolamento galvânico', completed: true },
                { id: 'm2_3', title: 'Certificação formal de isolamento emitida por auditor IT', completed: true }
            ]
        },
        {
            id: 'p3',
            title: 'Giga-Ohmmetros Supervisoras Ativos',
            subsystem: 'Segurança Ativa e Sensores',
            description: 'Instalação de megômetros autônomos em regime contínuo para medição diferencial da resistência física de carcaça.',
            impact: 'Desconexão automática e segura do fluxo elétrico em < 5ms caso ocorra fuga para a terra.',
            riskLevel: 'Baixo',
            milestones: [
                { id: 'm3_1', title: 'Definição do sensor de microcorrentes diferenciais', completed: true },
                { id: 'm3_2', title: 'Programação do Firmware de Disparo Crítico no Barramento', completed: false },
                { id: 'm3_3', title: 'Instalação física nos racks do Data Center Lâminas', completed: false }
            ]
        },
        {
            id: 'p4',
            title: 'Filtro Ativo LCL PWM Integrado',
            subsystem: 'Atenuação de Harmônicos',
            description: 'Retificação síncrona robusta para amortecimento do ripple de terceira harmônica gerado pelos compressores elétricos da turbina.',
            impact: 'Zera as interferências eletromagnéticas em canais sensíveis das GPUs de treinamento do Data Center.',
            riskLevel: 'Médio',
            milestones: [
                { id: 'm4_1', title: 'Mapeamento espectral em simulação computacional', completed: true },
                { id: 'm4_2', title: 'Montagem física do bloco indutivo-capacitivo LCL', completed: true },
                { id: 'm4_3', title: 'Ajuste fino de ganho PI com telemetria síncrona', completed: false }
            ]
        }
    ]);

    const handleToggleMilestone = (priorityId: string, milestoneId: string) => {
        setSprintPriorities(prev => prev.map(priority => {
            if (priority.id !== priorityId) return priority;
            return {
                ...priority,
                milestones: priority.milestones.map(m => {
                    if (m.id !== milestoneId) return m;
                    return { ...m, completed: !m.completed };
                })
            };
        }));
    };

    const handleSimulateAllCompliant = () => {
        setSprintPriorities(prev => prev.map(priority => ({
            ...priority,
            milestones: priority.milestones.map(m => ({ ...m, completed: true }))
        })));
    };

    const handleResetPriorities = () => {
        setSprintPriorities([
            {
                id: 'p1',
                title: 'Chaveamento Bidirecional Ativo (SSCB)',
                subsystem: 'Painel e Distribuição Principal',
                description: 'Substituição de disjuntores magnéticos por chaves semicondutoras de estado sólido capazes de deter faltas na escala de milissegundos para evitar arcos sob 800VDC.',
                impact: 'Extingue arcos voltaicos destrutivos e separa transientes da malha de cogregação termelétrica.',
                riskLevel: 'Alto',
                milestones: [
                    { id: 'm1_1', title: 'Topologia de Chaveamento de Comutação Suave ZCS', completed: true },
                    { id: 'm1_2', title: 'Testes de Rigidez em Carga de Bancada Externa', completed: true },
                    { id: 'm1_3', title: 'Comissionamento Acoplado ao Sistema SMR Actuator', completed: false }
                ]
            },
            {
                id: 'p2',
                title: 'Barreiras de Isolamento Galvânico Classe H',
                subsystem: 'Retificação e Chiller de Absorção',
                description: 'Isolamento dielétrico das juntas frias e separadores físicos associados aos compressores secundários redundantes do Chiller LiBr.',
                impact: 'Garante integridade operacional e veda correntes de fuga parasitas com a infraestrutura principal do S-CO₂.',
                riskLevel: 'Médio',
                milestones: [
                    { id: 'm2_1', title: 'Upgrade dielétrico do cabeamento de média tensão 1.2kVDC', completed: true },
                    { id: 'm2_2', title: 'Acopladores ópticos profundos com isolamento galvânico', completed: true },
                    { id: 'm2_3', title: 'Certificação formal de isolamento emitida por auditor IT', completed: true }
                ]
            },
            {
                id: 'p3',
                title: 'Giga-Ohmmetros Supervisoras Ativos',
                subsystem: 'Segurança Ativa e Sensores',
                description: 'Instalação de megômetros autônomos em regime contínuo para medição diferencial da resistência física de carcaça.',
                impact: 'Desconexão automática e segura do fluxo elétrico em < 5ms caso ocorra fuga para a terra.',
                riskLevel: 'Baixo',
                milestones: [
                    { id: 'm3_1', title: 'Definição do sensor de microcorrentes diferenciais', completed: true },
                    { id: 'm3_2', title: 'Programação do Firmware de Disparo Crítico no Barramento', completed: false },
                    { id: 'm3_3', title: 'Instalação física nos racks do Data Center Lâminas', completed: false }
                ]
            },
            {
                id: 'p4',
                title: 'Filtro Ativo LCL PWM Integrado',
                subsystem: 'Atenuação de Harmônicos',
                description: 'Retificação síncrona robusta para amortecimento do ripple de terceira harmônica gerado pelos compressores elétricos da turbina.',
                impact: 'Zera as interferências eletromagnéticas em canais sensíveis das GPUs de treinamento do Data Center.',
                riskLevel: 'Médio',
                milestones: [
                    { id: 'm4_1', title: 'Mapeamento espectral em simulação computacional', completed: true },
                    { id: 'm4_2', title: 'Montagem física do bloco indutivo-capacitivo LCL', completed: true },
                    { id: 'm4_3', title: 'Ajuste fine de ganho PI com telemetria síncrona', completed: false }
                ]
            }
        ]);
    };

    // Calculate overall compliance percentage and ready counts
    const complianceStats = useMemo(() => {
        let totalMilestones = 0;
        let completedMilestones = 0;
        let prioritiesWithThreeThree = 0;

        sprintPriorities.forEach(p => {
            const completedInPriority = p.milestones.filter(m => m.completed).length;
            totalMilestones += p.milestones.length;
            completedMilestones += completedInPriority;
            if (completedInPriority === p.milestones.length) {
                prioritiesWithThreeThree += 1;
            }
        });

        const percent = Math.round((completedMilestones / totalMilestones) * 100);

        return {
            percent,
            completedMilestones,
            totalMilestones,
            prioritiesWithThreeThree,
            totalPriorities: sprintPriorities.length
        };
    }, [sprintPriorities]);

    // Dynamic calculators
    const calculatedRoi = useMemo(() => {
        // Average PUE difference between conventional AC (PUE 1.6) and our liquid absorption cooling (PUE 1.08)
        const powerSavedMw = datacenterLoad * (1.6 - 1.08); // 0.52 MW saved per MW load
        
        // Annual savings: power saved * 8760 hours * cost per MWh
        const annualSavingsRs = powerSavedMw * 8760 * energyMwhCost;
        
        // Estimate S-CO2 + Absorption CAPEX based on load
        const totalCapexRs = (datacenterLoad * 3.2 + 8.5) * 1000000; // estimated in Millions BRL
        
        // Payback period (months)
        const paybackMonths = Math.max(8, Number(((totalCapexRs / annualSavingsRs) * 12).toFixed(1)));
        
        // Carbon Credits (CBIO) emission offset (estimate 0.35 tonnes CO2 offset per MWh saved)
        const equivalentCo2SavedTons = Math.round(powerSavedMw * 8760 * 0.35);
        const cbioRevenueRs = equivalentCo2SavedTons * 120; // R$ 120 per credit/ton

        return {
            powerSavedMw: powerSavedMw.toFixed(2),
            annualSavingsRs: (annualSavingsRs / 1000000).toFixed(2), // Millions BRL
            paybackMonths,
            equivalentCo2SavedTons,
            cbioRevenueRs: (cbioRevenueRs / 1000).toFixed(1), // Thousands BRL
            totalCapexRs: (totalCapexRs / 1000000).toFixed(1) // Millions BRL
        };
    }, [datacenterLoad, energyMwhCost]);

    const activeSaasPlans = [
        {
            id: 'starter',
            name: 'Starter - Monitoramento Digital',
            price: 'R$ 45.000',
            frequency: 'mensal',
            desc: 'Apropriado para usinas termoelétricas que focam em digitalizar relatórios e entender métricas.',
            benefits: [
                'Telemetria básica em tempo real',
                'Histórico de até 30 dias de dados',
                'Relatório mensal de emissões de CO₂',
                'Suporte técnico via email comercial'
            ],
            badge: 'Básico'
        },
        {
            id: 'advanced',
            name: 'Advanced - Cogeração Ativa',
            price: 'R$ 120.000',
            frequency: 'mensal',
            desc: 'Melhor para ambientes que acoplam usinas a geradores térmicos de média densidade.',
            benefits: [
                'Controle básico de bypass do Chiller de Absorção',
                'Simulações e monitor em tempo real do mix flexível de hidrogênio (H₂)',
                'Exportação em lote via APIs seguras (JSON)',
                'Suporte 24h com SLA de resposta de 4 horas'
            ],
            badge: 'Recomendado',
            highlight: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise - Poligeração Total 800VDC',
            price: 'R$ 280.000',
            frequency: 'mensal + 0.5% receita livre',
            desc: 'Infraestrutura robusta de TI conectada fisicamente ao barramento e HVAC resiliente.',
            benefits: [
                'Comutação de milissegundos para HVAC 800 VDC',
                'Gestão automatizada do blend nuclear SMR',
                'Acesso irrestrito a Webhooks e subscrição gRPC',
                'Audit DevOps 3/3 assistido por agente inteligente',
                'Engenheiros dedicados com atendimento prioritário'
            ],
            badge: 'Industrial'
        }
    ];

    const handleContractAction = (planName: string) => {
        setSelectedPlanForBuy(planName);
    };

    return (
        <div className="space-y-6 pt-4 animate-fadeIn" id="investor_relations_page">
            {/* Upper banner from Mex Energia */}
            <div className="bg-gradient-to-r from-cyan-900 to-indigo-900 p-6 rounded-xl border border-cyan-800 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-block bg-cyan-500 text-gray-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            Mantenedora & Incorporadora
                        </div>
                        <h1 className="text-2xl font-bold text-white font-sans">MEX Energia - Relações com Investidores (RI)</h1>
                        <p className="text-sm text-cyan-200">
                            Monetização, licenciamento de SAS Services, cogregação termorregulada e retorno sobre investimentos em polígono térmico.
                        </p>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-lg border border-cyan-700/30 flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-[10px] text-gray-400 block font-mono font-bold">MONETIZAÇÃO DA USINA</span>
                            <span className="text-lg font-bold text-cyan-400 font-mono">Mex Energia S.A.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Interactive Simulator for investment payoff (Data Center + SMR utility integration) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Financial ROI input parameters and sliders */}
                <div className="lg:col-span-4 bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md space-y-6">
                    <div>
                        <h2 className="text-md font-bold text-gray-200 border-b border-gray-700 pb-2 flex items-center gap-2">
                            <ChartPieIcon className="w-4 h-4 text-cyan-400" />
                            <span>Simulador ROI de Poligeração</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Monitore o retorno elétrico do Data Center conectado ao ciclo S-CO₂ e Chiller da usina.
                        </p>
                    </div>

                    {/* Slider 1: Data Center Load */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-gray-300">Carga do Data Center:</span>
                            <span className="text-cyan-400 font-bold">{datacenterLoad} MW</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="60"
                            step="1"
                            value={datacenterLoad}
                            onChange={(e) => setDatacenterLoad(Number(e.target.value))}
                            className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                            <span>5 MW (Piloto)</span>
                            <span>60 MW (Hiperescala)</span>
                        </div>
                    </div>

                    {/* Slider 2: MWh Energy Pricing */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-gray-300">Valor da Tarifa de Energia:</span>
                            <span className="text-cyan-400 font-bold">R$ {energyMwhCost} / MWh</span>
                        </div>
                        <input
                            type="range"
                            min="200"
                            max="600"
                            step="10"
                            value={energyMwhCost}
                            onChange={(e) => setEnergyMwhCost(Number(e.target.value))}
                            className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                            <span>R$ 200 (Contrato Longo)</span>
                            <span>R$ 600 (Pico Spot)</span>
                        </div>
                    </div>

                    <div className="text-[11px] text-gray-400 bg-gray-850 p-3 rounded-md leading-relaxed border border-gray-750">
                        <span className="text-yellow-500 font-bold font-mono">Premissa Física:</span> Ao resfriar o Data Center com nosso Chiller de Absorção térmico integrado, removemos compressores AC rotativos caros, melhorando o PUE operacional de 1.6 para 1.08 automaticamente.
                    </div>
                </div>

                {/* Right Side: Projected outcomes inside cards */}
                <div className="lg:col-span-8 bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <h3 className="text-md font-bold text-gray-200 border-b border-gray-700 pb-2 flex items-center gap-2">
                            <BoltIcon className="w-4 h-4 text-yellow-400" />
                            <span>Retorno Projetado Sob Carga Híbrida</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                            
                            {/* Card 1: Power Saved */}
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-750 text-center">
                                <span className="text-[10px] text-gray-400 font-mono block">Potência Elétrica Salva</span>
                                <span className="text-xl font-bold font-mono text-cyan-400 block mt-1">{calculatedRoi.powerSavedMw} MW</span>
                                <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Demanda Reduzida</span>
                            </div>

                            {/* Card 2: Financial savings */}
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-750 text-center">
                                <span className="text-[10px] text-gray-400 font-mono block">Economia de Energia Anual</span>
                                <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">R$ {calculatedRoi.annualSavingsRs}M</span>
                                <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Dinheiro Preservado na Conta</span>
                            </div>

                            {/* Card 3: Payback period */}
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-750 text-center">
                                <span className="text-[10px] text-gray-400 font-mono block">Tempo de Payback Estimado</span>
                                <span className="text-xl font-bold font-mono text-yellow-500 block mt-1">{calculatedRoi.paybackMonths} meses</span>
                                <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Retorno de Investimento</span>
                            </div>

                            {/* Card 4: Emissions/carbon offset revenue */}
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-750 text-center">
                                <span className="text-[10px] text-gray-400 font-mono block">Receita de CBIOs (Carbono)</span>
                                <span className="text-xl font-bold font-mono text-purple-400 block mt-1">R$ {calculatedRoi.cbioRevenueRs}k</span>
                                <span className="text-[9px] text-gray-500 block font-mono mt-0.5">({calculatedRoi.equivalentCo2SavedTons} Toneladas CO₂e)</span>
                            </div>
                        </div>

                        {/* Chart or visual breakdown of monetization paths utilized by Mex Energia */}
                        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-750 rounded-lg">
                            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono mb-2">Estrutura de Geração de Receitas por MEX Energia</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
                                <div className="p-2 border-l-2 border-cyan-500 bg-gray-900 rounded-r">
                                    <strong className="text-cyan-400 block">1. Co-aluguel de Espaço Térmico</strong>
                                    Aluguel de racks de alta densidade integrados ao bypass redundante de 800VDC da própria usina nuclear.
                                </div>
                                <div className="p-2 border-l-2 border-emerald-500 bg-gray-900 rounded-r">
                                    <strong className="text-emerald-400 block">2. Licencenciamento SaaS do ADM</strong>
                                    Royalties provenientes da plataforma de governança inteligente comprados pelas operadoras nacionais (Equatorial).
                                </div>
                                <div className="p-2 border-l-2 border-purple-500 bg-gray-900 rounded-r">
                                    <strong className="text-purple-400 block">3. Comercialização de Vapor Termelétrico</strong>
                                    Venda de excedente de vapor industrial e frio LiBr para polos produtivos e agronegócios locais.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[11px] text-gray-400 text-right mt-3 font-mono">
                        *Estimativa simulada baseada em CAPEX ponderado de R$ {calculatedRoi.totalCapexRs} Milhões. Resultados de mercado livres de taxas regulatórias.
                    </div>
                </div>
            </div>

            {/* Sprint de Engenharia Component */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md space-y-6" id="sprint_engenharia_800vdc">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-700 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-cyan-950 text-cyan-400 rounded-lg">
                                <WrenchScrewdriverIcon className="w-5 h-5 text-cyan-400" />
                            </span>
                            <h2 className="text-lg font-bold text-gray-100">Sprint de Engenharia: Conformidade 800VDC</h2>
                        </div>
                        <p className="text-xs text-gray-400">
                            Acompanhe as prioridades de engenharia necessárias para atingir a conformidade total 3/3 do barramento de tensão contínua.
                        </p>
                    </div>

                    {/* Overall Score indicators */}
                    <div className="flex items-center gap-3 bg-gray-900/60 p-3 rounded-lg border border-gray-750 shrink-0 select-none">
                        <div className="text-left space-y-1">
                            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">Status de Prontidão</span>
                            <div className="flex items-baseline gap-1.5 leading-none">
                                <span className={`text-2xl font-black font-mono transition-colors duration-300 ${complianceStats.percent === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                    {complianceStats.percent}%
                                </span>
                                <span className="text-[11px] font-mono text-gray-500">
                                    ({complianceStats.prioritiesWithThreeThree}/{complianceStats.totalPriorities} Prontos)
                                </span>
                            </div>
                        </div>
                        {/* Interactive trigger simulations for demo */}
                        <div className="flex flex-col gap-1 pl-3 border-l border-gray-700">
                            <button
                                onClick={handleSimulateAllCompliant}
                                className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded transition-colors cursor-pointer"
                                title="Concluir todos os marcos automaticamente para auditoria 3/3"
                            >
                                Forçar 100%
                            </button>
                            <button
                                onClick={handleResetPriorities}
                                className="text-[9px] font-mono text-gray-400 hover:text-gray-300 font-semibold bg-gray-800 border border-gray-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
                            >
                                Resetar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid for individual priorities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sprintPriorities.map((priority) => {
                        const completedCount = priority.milestones.filter(m => m.completed).length;
                        const totalCount = priority.milestones.length;
                        const isReady = completedCount === totalCount; // 3/3 readiness score

                        return (
                            <div
                                key={priority.id}
                                className={`rounded-xl border p-5 transition-all duration-300 flex flex-col justify-between ${
                                    isReady 
                                    ? 'bg-emerald-950/15 border-emerald-500/40 shadow-md shadow-emerald-950/20' 
                                    : 'bg-gray-900/35 border-gray-700'
                                }`}
                            >
                                <div className="space-y-3">
                                    {/* Card Header with badges */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                                                {priority.subsystem}
                                            </span>
                                            <h3 className="font-bold text-gray-100 text-sm leading-tight">
                                                {priority.title}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {/* Readiness Badge - e.g. "Nota 3/3" */}
                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap transition-colors duration-300 ${
                                                isReady
                                                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                                                : 'bg-gray-950 border-gray-800 text-gray-400'
                                            }`}>
                                                Nota {completedCount}/3 {isReady ? '★' : ''}
                                            </span>
                                            {/* Risk Level Badge */}
                                            <span className={`text-[8px] font-mono font-bold uppercase px-1.5 rounded-full ${
                                                priority.riskLevel === 'Alto'
                                                ? 'bg-red-950/40 text-red-400 border border-red-900/45'
                                                : priority.riskLevel === 'Médio'
                                                ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/45'
                                                : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/45'
                                            }`}>
                                                Risco: {priority.riskLevel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-300 leading-relaxed min-h-[36px]">
                                        {priority.description}
                                    </p>

                                    {/* Technical Impact */}
                                    <div className="bg-gray-900 p-2.5 rounded border border-gray-800/40 text-[11px] text-gray-400 flex items-start gap-1.5">
                                        <InfoIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                                        <span><strong>Impacto:</strong> {priority.impact}</span>
                                    </div>
                                </div>

                                {/* Checklist of Milestones */}
                                <div className="mt-4 pt-4 border-t border-gray-800/60 space-y-2">
                                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500 block">
                                        Marcos do Sprint ({completedCount} de {totalCount} concluídos):
                                    </span>
                                    <div className="space-y-1.5">
                                        {priority.milestones.map((milestone) => (
                                            <label
                                                key={milestone.id}
                                                className={`flex items-start gap-2.5 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                                                    milestone.completed 
                                                    ? 'bg-emerald-950/15 text-gray-200' 
                                                    : 'hover:bg-gray-800/60 text-gray-450'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={milestone.completed}
                                                    onChange={() => handleToggleMilestone(priority.id, milestone.id)}
                                                    className="rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 mt-0.5 cursor-pointer"
                                                />
                                                <span className={`${milestone.completed ? 'line-through opacity-75' : ''}`}>
                                                    {milestone.title}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary / Educational Section on 3/3 Readiness */}
                <div className="bg-cyan-950/10 border border-cyan-900/30 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-cyan-950/60 text-cyan-400 rounded-lg shrink-0">
                        <CogIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-gray-200 font-mono uppercase tracking-wider">
                            Relevância Estratégica para Acionistas e Investidores
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            O barramento unificado de <strong>800V VDC</strong> (corrente contínua de alta tensão) é a espinha dorsal de transmissão secundária entre a microplanta de fissão nuclear SMR e a refrigeração termoelétrica de ultra-densidade. Atingir a <strong className="text-cyan-400">Nota 3/3 de Prontidão</strong> em todas as prioridades pavimenta a certificação DevOps para o licenciamento de nosso plano mais valioso de R$ 280.000/mês, mitigando perdas ôhmicas por dissipação calórica e simplificando a comutação rápida para nossas instalações de TI.
                        </p>
                    </div>
                </div>
            </div>

            {/* SaaS purchase plans area */}
            <div className="space-y-4">
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-gray-200">Como Contratar Nossos Serviços SaaS (Licenciamento MEX)</h2>
                    <p className="text-xs text-gray-400">
                        Escolha o nível de governança corporativa ideal para a infraestrutura de sua planta de poligeração.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activeSaasPlans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-350 shadow-md ${
                                plan.highlight 
                                ? 'bg-gray-800 border-cyan-500 scale-[1.02] shadow-cyan-950/20 ring-1 ring-cyan-500/30' 
                                : 'bg-gray-800/80 border-gray-700'
                            }`}
                        >
                            <div className="space-y-4">
                                {/* Title and badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-mono font-bold bg-gray-900 px-2.5 py-0.5 rounded text-cyan-400 border border-cyan-900/40">
                                        {plan.badge}
                                    </span>
                                    {plan.highlight && (
                                        <span className="text-[9px] uppercase font-mono font-bold bg-cyan-500 text-gray-950 px-2 py-0.5 rounded">
                                            Mais Vendido
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-md font-bold text-gray-100 font-sans">{plan.name}</h3>
                                    <p className="text-xs text-gray-400 min-h-[32px]">{plan.desc}</p>
                                </div>

                                {/* Price */}
                                <div>
                                    <span className="text-2xl font-bold text-white font-mono">{plan.price}</span>
                                    <span className="text-xs text-gray-400 font-mono font-semibold"> / {plan.frequency}</span>
                                </div>

                                {/* Benefits checklist */}
                                <ul className="space-y-2 text-xs border-t border-gray-700/50 pt-4 text-gray-300">
                                    {plan.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-cyan-400 font-mono font-bold text-[10px] mt-0.5">✔</span>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Buy action */}
                            <div className="mt-6 pt-4 border-t border-gray-700/50">
                                <button
                                    onClick={() => handleContractAction(plan.name)}
                                    className={`w-full py-2 rounded-lg text-xs font-bold font-mono transition-all uppercase ${
                                        plan.highlight 
                                        ? 'bg-cyan-500 hover:bg-cyan-400 text-gray-950 shadow-md shadow-cyan-500/10' 
                                        : 'bg-gray-900 hover:bg-gray-850 text-cyan-400 border border-cyan-900/60'
                                    }`}
                                >
                                    Enviar Solicitação Contratação
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal simulation of buying */}
            {selectedPlanForBuy && (
                <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
                                <ComputerDesktopIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Solicitação Recebida com Sucesso!</h3>
                                <p className="text-xs text-gray-400 font-mono">Processamento de Aquisição Mex Energia</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-4 border border-gray-750 rounded-lg text-sm text-gray-300 space-y-2">
                            <p><strong>Plano Selecionado:</strong> <span className="text-cyan-400 font-semibold">{selectedPlanForBuy}</span></p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Uma notificação eletrônica foi enviada para o canal de parcerias corporativas da <strong>Mex Energia</strong> com o seu email registrado: <span className="text-gray-200">sobrinhoSJ@gmail.com</span>. Um de nossos especialistas em cogregação de energia entrará em contato em até 24 horas industriais.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 text-xs font-mono pt-2">
                            <button
                                onClick={() => setSelectedPlanForBuy(null)}
                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-bold transition-all"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestorRelations;
