import React, { useState } from 'react';
import { InfoIcon, BoltIcon, CogIcon, WrenchScrewdriverIcon, SnowflakeIcon, ComputerDesktopIcon } from '../components/icons';

const ApiDocumentation: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'js' | 'python'>('curl');
    const [chillerBypassed, setChillerBypassed] = useState<boolean>(false);
    const [sprintTasks, setSprintTasks] = useState([
        { id: 1, title: 'Definição de Guardrails do Sistema', completed: true, desc: 'Instruir IA com regras rígidas de segurança termoelétrica.' },
        { id: 2, title: 'Conversão em Schema JSON Estrito', completed: true, desc: 'Implementar validação estrita para o modelo de IA no DevOps.' },
        { id: 3, title: 'Injeção de Prompts Caóticos de Teste (Chaos Prompts)', completed: false, desc: 'Simular anomalias físicas na turbina via LLM para conferência de segurança.' },
        { id: 4, title: 'Métricas de Token e Monitor de SLA de Resposta', completed: false, desc: 'Acoplar logs preditivos de inferência direta de IA nos cronogramas DevOps.' }
    ]);

    const codeSnippets = {
        curl: {
            auth: `curl -X POST https://api.nexenergia.com.br/v1/oauth/token \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=client_credentials&client_id=MEX_ID&client_secret=SECRET"`,
            metrics: `curl -X GET https://api.nexenergia.com.br/v1/powerplant/metrics \\\n  -H "Authorization: Bearer eyJhbGciOi..."`,
            postTelemetry: `curl -X POST https://api.nexenergia.com.br/v1/datacenter/racks/telemetry \\\n  -H "Content-Type: application/json" \\\n  -d '{"rack_id": "RACK-CZ-99", "current_kw_draw": 35.8}'`
        },
        js: {
            auth: `// Buscar token de acesso OAuth2\nconst response = await fetch('https://api.nexenergia.com.br/v1/oauth/token', {\n  method: 'POST',\n  body: new URLSearchParams({\n    grant_type: 'client_credentials',\n    client_id: 'MEX_ID',\n    client_secret: 'SECRET'\n  })\n});\nconst { access_token } = await response.json();`,
            metrics: `// Obter telemetria em tempo real\nconst res = await fetch('https://api.nexenergia.com.br/v1/powerplant/metrics', {\n  headers: { 'Authorization': \`Bearer \${token}\` }\n});\nconst metrics = await res.json();\nconsole.log("Eficiência Termelétrica:", metrics.overall_thermal_efficiency_pct);`,
            postTelemetry: `// Inserir dados de TI do Data Center\nawait fetch('https://api.nexenergia.com.br/v1/datacenter/racks/telemetry', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    rack_id: "RACK-01A",\n    current_kw_draw: 45.2,\n    cpu_utilization_pct: 78.5\n  })\n});`
        },
        python: {
            auth: `# Obter token JWT\nimport requests\ndata = {\n    "grant_type": "client_credentials",\n    "client_id": "MEX_ID",\n    "client_secret": "SECRET"\n}\nres = requests.post("https://api.nexenergia.com.br/v1/oauth/token", data=data)\ntoken = res.json()["access_token"]`,
            metrics: `# Ler telemetria termoelétrica\nheaders = {"Authorization": f"Bearer {token}"}\nmetrics = requests.get("https://api.nexenergia.com.br/v1/powerplant/metrics", headers=headers).json()\nprint(f"Produção Ativa: {metrics['active_power_output_mw']} MW")`,
            postTelemetry: `# Registrar métricas do Data Center\npayload = {\n    "rack_id": "RACK-02B",\n    "current_kw_draw": 32.1,\n    "cpu_utilization_pct": 89.0\n}\nrequests.post("https://api.nexenergia.com.br/v1/datacenter/racks/telemetry", json=payload)`
        }
    };

    const toggleChillerBypass = () => {
        setChillerBypassed(!chillerBypassed);
    };

    const toggleSprintTask = (id: number) => {
        setSprintTasks(sprintTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const totalTasks = sprintTasks.length;
    const completedTasks = sprintTasks.filter(t => t.completed).length;
    const taskProgressPercentage = Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="space-y-6 pt-4 animate-fadeIn" id="api_documentation_page">
            {/* Header section with Summary metrics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold font-sans text-cyan-400">Portal de Integração & Documentação NEX</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Desenvolvimento, barramentos de telecomunicações/APIs externas, contingência elétrica de 800VDC e SWOT operacional.
                    </p>
                </div>
                {/* 3-Star Project Status system */}
                <div className="bg-gray-850 p-4 rounded-lg border border-gray-750 flex items-center gap-4">
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Status Prontidão do Projeto</div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-2xl font-bold text-yellow-400 font-mono">2.3</span>
                            <span className="text-sm text-gray-500 font-mono">/ 3.0</span>
                            <div className="flex text-yellow-400 ml-1">
                                <span className="text-lg">⭐</span>
                                <span className="text-lg">⭐</span>
                                <span className="text-lg opacity-40">⭐</span>
                            </div>
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Grau: Intermediário Industrial</div>
                    </div>
                </div>
            </div>

            {/* Main content split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* COLUMN LEFT: API contract, interactive console sandboxes */}
                <div className="lg:col-span-8 space-y-6">
                    {/* API interactive panel */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-cyan-950 text-cyan-400 rounded-lg">
                                    <BoltIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Consumo de APIs Externas (JSON REST / gRPC)</h2>
                                    <p className="text-xs text-gray-400">Autentique e consulte telemetria de poligeração da Mex Energia</p>
                                </div>
                            </div>
                            
                            {/* Selected lang switcher */}
                            <div className="flex rounded-lg bg-gray-900 p-1 border border-gray-750">
                                {(['curl', 'js', 'python'] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setSelectedLanguage(lang)}
                                        className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-all ${
                                            selectedLanguage === lang 
                                            ? 'bg-cyan-500 text-white font-semibold' 
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {lang === 'js' ? 'NodeJS' : lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Console Sandbox */}
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-cyan-400 font-mono font-bold mb-1.5 flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-yellow-500 text-gray-950 rounded text-[9px]">POST</span>
                                    <span>Gerar Bearer JWT: /v1/oauth/token</span>
                                </div>
                                <pre className="bg-gray-900 border border-gray-750 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {codeSnippets[selectedLanguage].auth}
                                </pre>
                            </div>

                            <div>
                                <div className="text-xs text-cyan-400 font-mono font-bold mb-1.5 flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[9px]">GET</span>
                                    <span>Métricas Termoelétricas Ativas: /v1/powerplant/metrics</span>
                                </div>
                                <pre className="bg-gray-900 border border-gray-750 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {codeSnippets[selectedLanguage].metrics}
                                </pre>
                            </div>

                            <div>
                                <div className="text-xs text-cyan-400 font-mono font-bold mb-1.5 flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 bg-pink-600 text-white rounded text-[9px]">POST</span>
                                    <span>Registrar Telemetria de Cargas de TI: /v1/datacenter/racks/telemetry</span>
                                </div>
                                <pre className="bg-gray-900 border border-gray-750 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {codeSnippets[selectedLanguage].postTelemetry}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Integrated physical 800VDC electrical system bypass and Backup HVAC systems */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-yellow-500/10 to-transparent pointer-events-none rounded-full" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-700 pb-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-yellow-950 text-yellow-400 rounded-lg">
                                    <BoltIcon className="text-yellow-400 w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Barramento de Força 800 VDC & HVAC Contingente</h2>
                                    <p className="text-xs text-gray-400">Simulação de bypass do Chiller de Absorção térmico</p>
                                </div>
                            </div>

                            {/* Control button for simulation */}
                            <button
                                onClick={toggleChillerBypass}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all shadow-md flex items-center gap-2 ${
                                    chillerBypassed 
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                            >
                                <CogIcon className="w-4 h-4 animate-spin-slow" />
                                {chillerBypassed ? 'Reativar Chiller Absorção' : 'Simular Bypass do Chiller'}
                            </button>
                        </div>

                        {/* Interactive topology mock representing either Absorção flow or backup HVAC flow */}
                        <div className="bg-gray-900 border border-gray-750 rounded-xl p-5 space-y-4 relative">
                            {/* Live status banner */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold font-mono uppercase tracking-wider text-gray-400">Topologia de Fluido & Carga Elétrica</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`h-2.5 w-2.5 rounded-full ${chillerBypassed ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                                    <span className={`text-xs font-mono font-bold ${chillerBypassed ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {chillerBypassed ? 'MODO: CONTINGÊNCIA ATIVA (800VDC)' : 'MODO: COGERAÇÃO NORMAL'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                {/* Power plant node */}
                                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-center relative">
                                    <div className="text-[10px] text-gray-400 font-mono">GERAÇÃO PRIMÁRIA</div>
                                    <div className="text-sm font-bold text-cyan-400 mt-1">S-CO₂ (SMR)</div>
                                    <div className="text-xs text-gray-300 font-mono mt-1">800 VDC Ativo</div>
                                    <div className="h-2 w-full bg-cyan-950 rounded overflow-hidden mt-2">
                                        <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '100%' }} />
                                    </div>
                                    {/* Arrow linking to next */}
                                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg">➔</div>
                                </div>

                                {/* Active utility node */}
                                <div className={`p-4 rounded-lg text-center transition-all duration-500 border ${
                                    chillerBypassed 
                                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' 
                                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                }`}>
                                    <div className="text-[10px] text-gray-400 font-mono">VETOR DE REFRIGERAÇÃO DIGITAL</div>
                                    {chillerBypassed ? (
                                        <>
                                            <div className="text-sm font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
                                                <SnowflakeIcon className="w-4 h-4 animate-spin-slow" />
                                                <span>HVAC Auxiliar 800 VDC</span>
                                            </div>
                                            <div className="text-xs font-mono text-amber-200 mt-1">Gás Refrigerante Direto</div>
                                            <div className="text-[10px] text-amber-400 mt-1 bg-amber-950 px-2 py-0.5 rounded font-mono">FPU: 12.3 kW consumo</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                                                <SnowflakeIcon className="w-4 h-4" />
                                                <span>Chiller LiBr de Absorção</span>
                                            </div>
                                            <div className="text-xs font-mono text-emerald-200 mt-1">Calor Residual S-CO₂</div>
                                            <div className="text-[10px] text-emerald-400 mt-1 bg-emerald-950 px-2 py-0.5 rounded font-mono">Consumo Elétrico Quase Nulo</div>
                                        </>
                                    )}
                                    {/* Arrow linking to next */}
                                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-600 text-lg">➔</div>
                                </div>

                                {/* Carga Digital Data Center node */}
                                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-center">
                                    <div className="text-[10px] text-gray-400 font-mono">CARGA TÉRMICA ALVO</div>
                                    <div className="text-sm font-bold text-purple-400 mt-1">Data Center Liquid-Cooling</div>
                                    <div className="text-xs mt-1 text-gray-300 font-mono">Racks de Alta Densidade (IA)</div>
                                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mt-2 bg-gray-850 px-2 py-1 rounded">
                                        <span>Temp de Entrada:</span>
                                        <span className={chillerBypassed ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                            {chillerBypassed ? '22.4 °C' : '19.8 °C'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Explanatory Note */}
                            <div className="text-xs text-gray-400 border-t border-gray-750 pt-2 flex items-start gap-2">
                                <InfoIcon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <p>
                                    {chillerBypassed 
                                        ? 'O Chiller de Absorção foi desligado/bypassado. O sistema acionou instantaneamente o HVAC redundante alimentado em 800 VDC. Isso mantém a refrigeração do Data Center, mas gera consumo elétrico colateral de 18 MW na rede da usina.'
                                        : 'Modo ótimo de cogeração ativa. Todo o frio empregado no Data Center provém da conversão do calor secundário emitido pelo ciclo de potência S-CO₂ acoplado ao Chiller de Absorção de Bromo de Lítio (LiBr).'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN RIGHT: SWOT, Project completeness metrics, Prompt engineering sprint */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Project Completeness Graded Checklist */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md">
                        <h3 className="font-bold text-md border-b border-gray-700 pb-2 mb-4 text-gray-200">Requisitos Técnicos NEX</h3>
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-semibold text-gray-300">Integração de Termodinâmica</div>
                                    <div className="text-[10px] text-gray-400">Ciclo S-CO₂ termomecânico</div>
                                </div>
                                <span className="px-2 py-0.5 font-mono text-[10px] bg-emerald-950 text-emerald-400 rounded-md font-bold">3/3 COMPLETO</span>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-semibold text-gray-300">Liquid-Cooling do Data Center</div>
                                    <div className="text-[10px] text-gray-400">Treemap de racks de TI com telemetria</div>
                                </div>
                                <span className="px-2 py-0.5 font-mono text-[10px] bg-emerald-950 text-emerald-400 rounded-md font-bold">2.5/3 PARCIAL</span>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-semibold text-gray-300">Barramento Físico 800 VDC</div>
                                    <div className="text-[10px] text-gray-400">Chavetas automáticas bypass de hardware</div>
                                </div>
                                <span className="px-2 py-0.5 font-mono text-[10px] bg-yellow-950 text-yellow-500 rounded-md font-bold">2/3 PROGRESSO</span>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-semibold text-gray-300">DevOps Integ & Prompts IA</div>
                                    <div className="text-[10px] text-gray-400">Prompts de controle determinístico</div>
                                </div>
                                <span className="px-2 py-0.5 font-mono text-[10px] bg-amber-950 text-amber-500 rounded-md font-bold">1.5/3 EMBRIÃO</span>
                            </div>
                        </div>

                        {/* Gap analysis: what is missing */}
                        <div className="bg-gray-850 p-3 rounded-lg border border-gray-750 mt-4">
                            <div className="text-xs font-bold text-yellow-400 flex items-center gap-1.5 mb-1">
                                <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                                <span>O que falta para Nota Máxima?</span>
                            </div>
                            <ul className="text-[11px] text-gray-300 list-disc ml-4 space-y-1">
                                <li>Firmware de telemetria caótica para o SMR nuclear.</li>
                                <li>Conexão de redundância do Barramento 800VDC com o gateway de telemetria SNMP.</li>
                                <li>Feeds em loop para retroalimentação automática do motor IA em caso de desastre físico.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Timeline prompt engineering sprint to clear 3/3 DevOps */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-4">
                            <div>
                                <h3 className="font-bold text-md text-gray-200">Sprint Engenharia de Prompt DevOps</h3>
                                <p className="text-[11px] text-gray-400">Meta: Alcançar nota 3/3 de auditoria inteligência</p>
                            </div>
                        </div>

                        {/* Progress visualizer */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                                <span>Progresso de DevOps</span>
                                <span>{taskProgressPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${taskProgressPercentage}%` }} />
                            </div>
                        </div>

                        {/* Interactive list */}
                        <div className="space-y-4 font-sans text-xs">
                            {sprintTasks.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => toggleSprintTask(t.id)}
                                    className={`flex gap-3 items-start p-2 rounded-lg cursor-pointer transition-all border ${
                                        t.completed 
                                        ? 'bg-cyan-950/20 border-cyan-800/40 text-gray-300' 
                                        : 'bg-gray-900/50 border-gray-750 hover:bg-gray-800 text-gray-400'
                                    }`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={t.completed} 
                                        onChange={() => {}} // handled by onClick on parent for better layout tap area
                                        className="mt-0.5 rounded border-gray-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900 h-3.5 w-3.5"
                                    />
                                    <div className="space-y-0.5">
                                        <div className={`font-semibold ${t.completed ? 'text-cyan-400 line-through' : 'text-gray-200'}`}>{t.title}</div>
                                        <div className="text-[10px] text-gray-400 leading-relaxed">{t.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SWOT analysis cards */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-md card">
                        <h3 className="font-bold text-md border-b border-gray-700 pb-2 mb-4 text-gray-200">Análise SWOT do Projeto</h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-center text-xs font-sans font-semibold">
                            {/* Fortalezas (Green) */}
                            <div className="p-2 border border-emerald-900/50 bg-emerald-950/20 rounded-lg space-y-1">
                                <span className="text-emerald-400 block font-bold text-[10px] uppercase font-mono">Fortalezas (S)</span>
                                <span className="text-[10.5px] text-gray-300 font-normal block leading-tight">Poligeração ~85% eficiência, PUE &lt; 1.1</span>
                            </div>

                            {/* Fraquezas (Orange) */}
                            <div className="p-2 border border-amber-900/50 bg-amber-950/10 rounded-lg space-y-1">
                                <span className="text-amber-500 block font-bold text-[10px] uppercase font-mono">Fraquezas (W)</span>
                                <span className="text-[10.5px] text-gray-300 font-normal block leading-tight">Elevado CAPEX térmico, sintonia de carga-fonte</span>
                            </div>

                            {/* Oportunidades (Purple) */}
                            <div className="p-2 border border-purple-900/50 bg-purple-950/10 rounded-lg space-y-1 col-span-1">
                                <span className="text-purple-400 block font-bold text-[10px] uppercase font-mono">Oportunidades (O)</span>
                                <span className="text-[10.5px] text-gray-300 font-normal block leading-tight">Demanda AI de densidade &gt;50kW</span>
                            </div>

                            {/* Ameaças (Red/Rose) */}
                            <div className="p-2 border border-rose-900/50 bg-rose-950/20 rounded-lg space-y-1 col-span-1">
                                <span className="text-rose-400 block font-bold text-[10px] uppercase font-mono">Ameaças (T)</span>
                                <span className="text-[10.5px] text-gray-300 font-normal block leading-tight">Quadro tarifário na cogeração de energia</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApiDocumentation;
