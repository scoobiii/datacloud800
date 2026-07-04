import React from 'react';

const MexEcoBr: React.FC = () => {

  const pageHtml = `




<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MEX Energia | Projeto Mauá - Um Porto Seguro na Tempestade Global</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto', 'Segoe UI', sans-serif;
            background-color: #f0f0f0;
            color: #333;
            overflow: hidden;
        }

        .presentation-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .slide {
            display: none;
            width: 90%;
            max-width: 1200px;
            height: 85vh;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 50px 70px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.5s ease-in-out;
            overflow-y: auto;
            border-top: 8px solid #D04A02; /* MEX Orange Accent */
        }

        .slide.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .mex-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .mex-logo {
            font-size: 2.5rem;
            font-weight: 700;
            color: #000000;
        }

        .mex-logo span {
            color: #D04A02; /* MEX Orange */
        }

        .slide-title {
            font-size: 1.2rem;
            color: #555;
            font-weight: 400;
        }

        .slide h1 {
            font-size: 2.8rem;
            color: #2d2d2d;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .slide h2 {
            font-size: 1.8rem;
            color: #D04A02;
            margin-bottom: 25px;
            font-weight: 500;
            border-left: 4px solid #D04A02;
            padding-left: 15px;
        }

        .slide p {
            font-size: 1.1rem;
            line-height: 1.7;
            color: #4f4f4f;
            margin-bottom: 20px;
            max-width: 900px;
        }

        .slide ul {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #4f4f4f;
            margin-left: 25px;
            margin-bottom: 20px;
        }

        .slide li {
            margin-bottom: 12px;
            list-style-type: none;
            position: relative;
        }

        .slide li::before {
            content: '■';
            color: #D04A02;
            font-size: 0.8rem;
            position: absolute;
            left: -25px;
            top: 6px;
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }

        .info-card {
            background-color: #f9f9f9;
            padding: 25px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            transition: box-shadow 0.3s ease, transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        
        .info-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .info-card h4 {
            color: #D04A02;
            font-size: 1.2rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .info-card p {
            font-size: 0.95rem;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.5;
            flex-grow: 1;
        }

        .link {
            display: block;
            background-color: #D04A02;
            color: white;
            padding: 12px 25px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            margin-top: auto;
            transition: background-color 0.3s ease;
            text-align: center;
            cursor: pointer;
        }

        .link:hover {
            background-color: #2d2d2d;
        }

        .status-box {
            border: 1px solid #e0e0e0;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .status-box.alert {
            border-left: 4px solid #c0392b; /* Red for alert */
        }
        
        .status-box.opportunity {
            border-left: 4px solid #27ae60; /* Green for opportunity */
        }

        .status-box strong {
            color: #2d2d2d;
            font-weight: 700;
        }

        .navigation {
            position: fixed;
            bottom: 30px;
            right: 5%;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }

        .nav-btn {
            background-color: #2d2d2d;
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5rem;
            font-weight: bold;
            transition: background-color 0.3s ease, transform 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .nav-btn:hover {
            background-color: #D04A02;
            transform: scale(1.1);
        }

        .nav-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            transform: none;
        }

        .slide-counter {
            position: fixed;
            bottom: 45px;
            left: 5%;
            font-size: 1rem;
            color: #888;
        }

        /* SWOT Specific Styles */
        .swot-section {
            margin-bottom: 30px;
        }
        .swot-section h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            font-weight: 600;
        }
        .swot-item {
            margin-bottom: 10px;
        }
        .swot-item strong {
            color: #2d2d2d;
            font-weight: 700;
        }
        .swot-item span.score {
            font-weight: 700;
            margin-left: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            color: white;
        }
        .swot-item span.score.gov { background-color: #27ae60; } /* Green for Government */
        .swot-item span.score.user { background-color: #3498db; } /* Blue for Users */
        .swot-item span.score.biz { background-color: #D04A02; } /* Orange for Business */

        /* Risk Analysis Specific Styles */
        .risk-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .risk-table th, .risk-table td {
            border: 1px solid #e0e0e0;
            padding: 12px;
            text-align: left;
            font-size: 0.95rem;
        }
        .risk-table th {
            background-color: #f0f0f0;
            font-weight: 600;
            color: #555;
        }
        .risk-table td strong {
            color: #D04A02;
        }
        .risk-level {
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            display: inline-block;
        }
        .risk-level.low { background-color: #27ae60; } /* Green */
        .risk-level.medium { background-color: #f39c12; } /* Orange */
        .risk-level.high { background-color: #c0392b; } /* Red */

        @media (max-width: 768px) {
            .slide { padding: 30px; height: 90vh; }
            .mex-header { flex-direction: column; align-items: flex-start; }
            .slide h1 { font-size: 2rem; }
            .slide h2 { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="slide-counter">
            <span id="current-slide">1</span> de <span id="total-slides">9</span>
        </div>

        <!-- Slide 1: Capa -->
        <div class="slide active">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Estratégia e Transformação</div>
            </div>
            <h1>Projeto Mauá: Resiliência Climática e Futuro Digital</h1>
            <h2>Uma Nova Economia para uma Nova Era</h2>
            <p>Uma proposta estratégica para transformar Mauá em um polo de resiliência para a economia digital global, combinando infraestrutura energética sustentável, inovação social e um marco de governança de ponta.</p>
            
            <div class="content-grid">
                <div class="info-card">
                    <h4>Cliente</h4>
                    <p>Prefeitura e Cidade de Mauá</p>
                </div>
                <div class="info-card">
                    <h4>Parceiro Estratégico</h4>
                    <p>MEX Energia</p>
                      <p>MEX Inteligencia</p>
                    </h4>
                    <p>Oliveira & Oliveira Consultoria Empresarial</p>
                </div>
                <div class="info-card">
                    <h4>Visão de Presente</h4>
                    <p>Mauá como um porto seguro para a economia digital global.</p>
                </div>
            </div>
        </div>

        <!-- Slide 2: A Tese de Investimento -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Tese de Investimento Estratégico</div>
            </div>
            <h1>Mauá: Um Porto Seguro na Tempestade Global</h1>
            <h2>Por que o Capital Inteligente Está Olhando para o Sul</h2>
            <p>Em um mundo de instabilidade geopolítica, climática e energética, a busca por portos seguros não é mais uma opção, mas uma necessidade. O Brasil, ao recuperar seu grau de investimento, emerge como a principal âncora de estabilidade. Mauá é a materialização dessa tese.</p>
            
            <div class="status-box alert">
                <strong>A DOR GLOBAL:</strong> Cadeias de energia rompidas, data centers vulneráveis no Hemisfério Norte e alianças geopolíticas frágeis. O capital global busca desesperadamente por resiliência.
            </div>
            <div class="status-box opportunity">
                <strong>A OPORTUNIDADE NO BRASIL:</strong> Com grau de investimento recuperado e estabilidade energética, o Brasil se torna um destino obrigatório para investimento direto e produtivo.
            </div>
        </div>

        <!-- Slide 3: A Consequência Lógica: Redirecionamento de Capital -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Fluxo de Capital Estratégico</div>
            </div>
            <h1>US$ 20 Bilhões (1%) para Mauá</h1>
            <h2>Um Mandato de Investimento em Segurança Nacional</h2>
            <p>Com a atração de US$ 2 trilhões em investimentos para o Brasil, a recuperação do grau de investimento se torna um mandato. Instituições como o BNDES são compelidas a direcionar uma fração desse capital (1% ou US$ 20 bilhões) para projetos que garantam a segurança e autonomia do país. O Projeto Mauá torna-se, assim, um investimento compulsório em infraestrutura crítica.</p>
            <ul>
                <li><strong>Segurança Energética:</strong> Autonomia com fontes renováveis e resilientes.</li>
                <li><strong>Segurança Digital:</strong> Data centers de ponta (Mauá Tower) para proteger a economia digital.</li>
                <li><strong>Segurança Social:</strong> Projetos como a Secretaria de Energia Social que geram estabilidade interna.</li>
                <li><strong>Segurança Jurídica:</strong> Um arcabouço legislativo moderno que atrai e protege o investimento.</li>
            </ul>
            <a href="https://scoobiii.github.io/mex-dashboard/" class="link">Análise: MEX Inteligência</a>
        </div>

        <!-- Slide 4: Os Pilares da Resiliência -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Infraestrutura Crítica e Governança</div>
            </div>
            <h1>Os Pilares do Porto Seguro</h1>
            <h2>Entregáveis que Garantem a Execução e a Estabilidade</h2>
            <p>Nosso plano de ação é um ecossistema de projetos e documentos interconectados, desenhados para construir uma fortaleza de resiliência econômica, energética e social.</p>
            
            <div class="content-grid">
                <div class="info-card">
                    <h4>Termo de Abertura (TAP)</h4>
                    <p>O documento formal que autoriza o início do projeto, delineando seus objetivos, escopo e stakeholders principais.</p>
                    <a href="https://github.com/scoobiii/mex-maua-2333/blob/main/docs/tap.pdf" class="link">Acessar TAP</a>
                </div>
                <div class="info-card">
                    <h4>Contrato de Parceria</h4>
                    <p>A minuta do acordo jurídico que estabelece as bases da colaboração público-privada, definindo papéis e responsabilidades.</p>
                    <a href="https://github.com/scoobiii/mex-maua-2333/blob/main/docs/contrato_parceria.pdf" class="link">Ver Minuta</a>
                </div>
                <div class="info-card">
                    <h4>Cronograma do Projeto</h4>
                    <p>O planejamento detalhado das fases, marcos e entregas do projeto, garantindo a gestão do tempo e dos recursos.</p>
                    <a href="https://github.com/scoobiii/mex-maua-2333/blob/main/docs/cronograma.pdf" class="link">Ver Cronograma</a>
                </div>
                <div class="info-card">
                    <h4>Mapa Energético</h4>
                    <p>Diagnóstico completo da infraestrutura atual e planejamento do retrofit de térmicas.</p>
                    <a href="https://cyszcbxi.manus.space/" class="link">Acessar Mapa</a>
                </div>
                <div class="info-card">
                    <h4>Biopolo Mauá - Workshop I</h4>
                    <p>Conversão de UTEs para combustíveis renováveis, com logística de dutos integrada.</p>
                    <a href="https://yemdxbhh.manus.space/" class="link">Acessar Dashboard</a>
                </div>
                <div class="info-card">
                    <h4>Estudo Biopolo</h4>
                    <p>Análise de viabilidade para um polo industrial verde, em convergência com o polo petroquímico Mauá.</p>
                    <a href="https://claude.ai/public/artifacts/46550b7f-9d83-4166-88d8-ec26f1f28281" class="link">Estudo I</a>
                <a href="https://xevivudr.manussite.space/" class="link">Estudo II</a>
                <a href="https://ai.studio/apps/drive/1n-QNRgdCKiL7SzHOAVGLLFkRC4F2fAUJ" class="link">Estudo III </a>
                </div>
                
                <div class="info-card">
                    <h4>Mauá Tower</h4>
                    <p>O ícone da nova economia: um complexo multiuso com Data Cloud NVidia AI Server liquid cooling, imune a choques climáticos.</p>
                    <p>Shanguay Tower, inspirou Residencial Marielle, Carmem Silva, Preta Ferreira, que inspirou o Muá Tower, que rendeu nota 4.18 no Amcham Eco/Estadão 2017.</p>
                    <a href="https://grabcad.com/library/vertical-solar-marielle-tower-cultural-center-residencial-carmen-silva-hotel-preta-ferreira-1" class="link">Ver Conceito</a>
                </div>
                <div class="info-card">
                    <h4>Mauá 100% Solar</h4>
                    <p>Autonomia energética total e um mercado de energia descentralizado e democrático, reduzindo custos e dependências externas.</p>
                    <a href="https://github.com/scoobiii/ThermoFlex-Dashboard" class="link">MEX DAO</a>
                                        
                </div>
                <div class="info-card">
                    <h4>Inteligência Legislativa</h4>
                    <p>Criação de Secretarias de Projetos Estratégicos e Energia Social, e a legislação para a DAO, construindo um ambiente de negócios seguro e ágil.</p>
                    <a href="https://github.com/scoobiii/mex-maua-2333/blob/main/docs/Governança Solar _Projetos de Lei - Energia Solar e Mercado Livre  __Versão___ 1.0.1 .PDF" class="link">Ver Minuta da Lei</a>
                </div>
            </div>
        </div>

        <!-- Slide 5: A Alma do Projeto: Energia Social -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Impacto Humano</div>
            </div>
            <h1>A Alma do Projeto: Secretaria de Energia Social</h1>
            <h2>Estabilidade Social como Vantagem Competitiva</h2>
            <p>Um país só é verdadeiramente estável se cuidar de sua população. A Secretaria de Energia Social não é assistencialismo; é um investimento estratégico em capital humano, co-criado por quem entende a urgência da reconstrução.</p>
            
            <div class="content-grid">
                <div class="info-card">
                    <h4>A Força da Superação</h4>
                    <p>Co-criada por <strong>João dos Santos Batista</strong>, um sobrevivente do Complexo Boracéia que transforma sua experiência em força para reconstruir vidas.</p>
                </div>
                <div class="info-card">
                    <h4>A Visão de Futuro</h4>
                    <p>Idealizada em Mauá por <strong>Edivaldo Beringela</strong>, Secretário de Projetos, com a meta de colocar Mauá no top 10 do IDSC (Índice de Desafios da Sustentabilidade).</p>
                </div>
            </div>
        </div>

        <!-- Slide 6: Análise SWOT -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Análise Estratégica</div>
            </div>
            <h1>Análise SWOT: Data Centers e o Futuro de Mauá</h1>
            <h2>Avaliando o Impacto para Governo, Usuários e Negócios (Notas de 1 a 3)</h2>
            
            <div class="swot-section">
                <h3>Forças (Strengths)</h3>
                <div class="swot-item">
                    <strong>Proatividade Legislativa (PL Data Center):</strong> Demonstra visão de futuro e ambiente favorável.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 2</span> <span class="score biz">Neg: 3</span>
                </div>
                <div class="swot-item">
                    <strong>Localização Estratégica (Mauá/Brasil):</strong> Resiliência climática e energética superior.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 2</span> <span class="score biz">Neg: 3</span>
                </div>
                <div class="swot-item">
                    <strong>Ecossistema Integrado (Pilares do Projeto Mauá):</strong> Coesão e sinergias entre os projetos.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 3</span> <span class="score biz">Neg: 3</span>
                </div>
            </div>

            <div class="swot-section">
                <h3>Fraquezas (Weaknesses)</h3>
                <div class="swot-item">
                    <strong>Burocracia e Morosidade na Aprovação do PL:</strong> Pode atrasar a implementação.
                    <span class="score gov">Gov: 2</span> <span class="score user">Usu: 1</span> <span class="score biz">Neg: 3</span>
                </div>
                <div class="swot-item">
                    <strong>Capacidade de Execução da Prefeitura:</strong> Complexidade do projeto exige alta gestão.
                    <span class="score gov">Gov: 2</span> <span class="score user">Usu: 1</span> <span class="score biz">Neg: 2</span>
                </div>
                <div class="swot-item">
                    <strong>Financiamento Inicial:</strong> Captação inicial pode ser um desafio.
                    <span class="score gov">Gov: 2</span> <span class="score user">Usu: 1</span> <span class="score biz">Neg: 2</span>
                </div>
            </div>

            <div class="swot-section">
                <h3>Oportunidades (Opportunities)</h3>
                <div class="swot-item">
                    <strong>Demanda Global por Data Centers Resilientes:</strong> Crise climática no Norte cria urgência.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 3</span> <span class="score biz">Neg: 3</span>
                </div>
                <div class="swot-item">
                    <strong>Recuperação do Grau de Investimento do Brasil:</strong> Facilita acesso a capital.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 2</span> <span class="score biz">Neg: 3</span>
                </div>
                <div class="swot-item">
                    <strong>Inovação em Energia Renovável e Cooling:</strong> Posiciona Mauá na vanguarda.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 2</span> <span class="score biz">Neg: 3</span>
                </div>
            </div>

            <div class="swot-section">
                <h3>Ameaças (Threats)</h3>
                <div class="swot-item">
                    <strong>Instabilidade Política/Econômica Nacional:</strong> Risco de descontinuidade.
                    <span class="score gov">Gov: 3</span> <span class="score user">Usu: 3</span> <span class="score biz">Neg: 3</span>
                </div>
                <div class="swot-item">
                    <strong>Concorrência de Outras Regiões/Países:</strong> Pode diluir o diferencial.
                    <span class="score gov">Gov: 2</span> <span class="score user">Usu: 1</span> <span class="score biz">Neg: 2</span>
                </div>
                <div class="swot-item">
                    <strong>Desastres Naturais Locais:</strong> Custos inesperados e atrasos.
                    <span class="score gov">Gov: 2</span> <span class="score user">Usu: 2</span> <span class="score biz">Neg: 1</span>
                </div>
            </div>
        </div>

        <!-- Slide 7: O Jogo Geopolítico da Energia -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Análise de Cenários Globais</div>
            </div>
            <h1>O Grande Jogo: Energia, Clima e Soft Power</h1>
            <h2>Como a FIFA Explica o Mundo (e a Oportunidade de Mauá)</h2>
            <p>As escolhas das sedes da Copa do Mundo são um barômetro geopolítico. Elas revelam as verdadeiras prioridades globais: controle de rotas de energia, projeção de poder e a busca desesperada por estabilidade. A falha de modelos antigos (Rússia, Qatar) abre espaço para novas soluções.</p>
            
            <div class="content-grid">
                <div class="info-card">
                    <h4>A Falácia do GNL</h4>
                    <p>A Europa trocou a dependência do gás russo pelo GNL do Qatar, apenas para ver a região explodir em conflitos, provando que não há solução fácil no Hemisfério Norte.</p>
                </div>
                <div class="info-card">
                    <h4>A Ascensão do Sul Global</h4>
                    <p>A Copa de 2030 em 3 continentes e a futura "Copa Climática" (Brasil + Escandinávia) indicam que o futuro é multipolar e baseado em resiliência, não em poderio militar.</p>
                </div>
            </div>
            <a href="https://claude.ai/public/artifacts/a0e64ecc-4ca1-479b-b6d2-bc5dbdfff258" class="link">Ler Análise Geopolítica Completa</a>
        </div>
        
        
        <!-- Slide 7: Análise de Risco -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Gestão de Riscos</div>
            </div>
            <h1>Análise de Risco do Projeto Mauá</h1>
            <h2>Identificação e Classificação dos Principais Riscos</h2>
            <p>Uma gestão proativa de riscos é essencial para o sucesso do Projeto Mauá. Abaixo, os principais riscos identificados, sua probabilidade (P), impacto (I) e nível de risco.</p>
            
            <table class="risk-table">
                <thead>
                    <tr>
                        <th>Risco</th>
                        <th>P</th>
                        <th>I</th>
                        <th>Nível</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Instabilidade Política/Econômica Nacional</strong> (Projeto Geral)</td>
                        <td>M</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Burocracia e Morosidade Governamental</strong> (Projeto Geral)</td>
                        <td>A</td>
                        <td>M</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Não Aprovação/Descaracterização do PL Data Center</strong> (Inteligência Legislativa)</td>
                        <td>A</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Não Assinatura/Atraso na Formalização de Contratos</strong> (TAP, Contrato, Cronograma)</td>
                        <td>M</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Complexidade Tecnológica e de Engenharia</strong> (Mauá Tower)</td>
                        <td>M</td>
                        <td>M</td>
                        <td><span class="risk-level medium">Médio</span></td>
                    </tr>
                    <tr>
                        <td><strong>Custo Elevado de Construção e Manutenção</strong> (Mauá Tower)</td>
                        <td>M</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Aprovação Regulatória da DAO</strong> (Mauá 100% Solar & DAO)</td>
                        <td>A</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Dados Incompletos/Imprecisos</strong> (Mapa Energético, Retrofit, Biopolo)</td>
                        <td>M</td>
                        <td>M</td>
                        <td><span class="risk-level medium">Médio</span></td>
                    </tr>
                    <tr>
                        <td><strong>Falta de Recursos/Engajamento</strong> (Secretaria de Energia Social)</td>
                        <td>M</td>
                        <td>M</td>
                        <td><span class="risk-level medium">Médio</span></td>
                    </tr>
                    <!-- Novos Riscos: Biopolo -->
                    <tr>
                        <td><strong>Volatilidade Preço Matéria-Prima (Biomassa)</strong> (Biopolo)</td>
                        <td>M</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Barreiras Técnicas/Custo de Substituição</strong> (Biopolo)</td>
                        <td>M</td>
                        <td>M</td>
                        <td><span class="risk-level medium">Médio</span></td>
                    </tr>
                    <!-- Novos Riscos: Etanol Duto -->
                    <tr>
                        <td><strong>Aprovação Regulatória/Licenciamento</strong> (Etanol Duto)</td>
                        <td>A</td>
                        <td>A</td>
                        <td><span class="risk-level high">Alto</span></td>
                    </tr>
                    <tr>
                        <td><strong>Desapropriação/Conflitos Fundiários</strong> (Etanol Duto)</td>
                        <td>M</td>
                        <td>M</td>
                        <td><span class="risk-level medium">Médio</span></td>
                    </tr>
                    <tr>
                        <td><strong>Segurança Operacional/Vazamentos</strong> (Etanol Duto)</td>
                        <td>B</td>
                        <td>A</td>
                        <td><span class="risk-level medium">Médio</span></td>
                    </tr>
                </tbody>
            </table>
            <p style="margin-top: 20px; font-size: 0.9rem; color: #666;">P: Probabilidade (B=Baixa, M=Média, A=Alta) | I: Impacto (B=Baixo, M=Médio, A=Alto)</p>
        </div>

                   

        <!-- Slide 8: Próximos Passos e Chamado à Ação -->
        <div class="slide">
            <div class="mex-header">
                <div class="mex-logo">mex.eco.br<span>.</span></div>
                <div class="slide-title">Próximos Passos e Ação Imediata</div>
            </div>
            <h1>Da Estratégia à Execução</h1>
            <h2>Refinamento e Resposta Emergencial</h2>
            <p>Apresentamos um projeto robusto, com todos os entregáveis e minutas (legislativa, contratual, TAP, cronograma) prontos para serem refinados em conjunto com a equipe da Prefeitura. Estamos prontos para avançar.</p>
            
            <div class="status-box opportunity">
                <strong>Ação Imediata: Resposta para o Jardim Zaíra</strong>
                <p style="margin-top:10px;">Aguardamos os dados da malha elétrica de Mauá (oferta/demanda e consumo dos equipamentos públicos) para, até nosso próximo encontro, apresentar uma solução assertiva e emergencial para a crise energética no Jardim Zaíra. Nosso compromisso é transformar planejamento em ação rápida e visível.</p>
            </div>

            <div class="info-card" style="margin-top: 30px;">
                <h4>Contato para Envio de Dados e Agendamentos</h4>
                <p><strong>José S. Sobrinho</strong><br>CEO, MEX Energia</p>
                <p style="margin-top: 10px;"><strong>Edivaldo Beringela</strong><br>Diretor Jurídico, Oliveira & Oliveira</p>
            </div>
                  <div class="info-card">
                    <h4>PitchDeck & Wite PaperMapa</h4>
                    <p>Diagnóstico completo da infraestrutura atual e planejamento do retrofit de térmicas.</p>
                    <a href="https://scoobiii.github.io/mauax-witepaper/" class="link">Acessar Mapa</a>
                </div>
               

            
        </div>

    </div>

    <div class="navigation">
        <button class="nav-btn" id="prev-btn">&#8249;</button>
        <button class="nav-btn" id="next-btn">&#8250;</button>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // --- Link Interception Logic ---
        const internalAppLinks = {
            'https://cyszcbxi.manus.space/': 'Infrastructure',
            'https://xevivudr.manussite.space/': 'Infrastructure',
            'https://yemdxbhh.manus.space/': 'Power Plant'
        };

        const embeddableDomains = ['manus.space', 'scoobiii.github.io'];

        document.querySelectorAll('a.link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const href = link.getAttribute('href');
                if (!href) return;

                if (internalAppLinks[href]) {
                    window.parent.postMessage({ type: 'navigate', page: internalAppLinks[href] }, '*');
                } else {
                    try {
                        const url = new URL(href);
                        if (embeddableDomains.some(domain => url.hostname.endsWith(domain))) {
                            window.parent.postMessage({ type: 'viewExternal', url: href }, '*');
                        } else {
                            window.parent.postMessage({ type: 'openExternal', url: href }, '*');
                        }
                    } catch (e) {
                        console.error("Invalid URL, opening externally as fallback:", href, e);
                        window.parent.postMessage({ type: 'openExternal', url: href }, '*');
                    }
                }
            });
        });

        // --- Presentation Logic ---
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const slideCounterSpan = document.getElementById('current-slide');
        const slideTotalSpan = document.getElementById('total-slides');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (slideTotalSpan) {
            slideTotalSpan.textContent = totalSlides;
        }

        const showSlide = (n) => {
            if (slides.length === 0) return;
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
            
            if (slideCounterSpan) {
                slideCounterSpan.textContent = currentSlide + 1;
            }
            
            if(prevBtn) prevBtn.disabled = currentSlide === 0;
            if(nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
        };

        const nextSlide = () => {
            if (currentSlide < totalSlides - 1) {
                showSlide(currentSlide + 1);
            }
        };

        const previousSlide = () => {
            if (currentSlide > 0) {
                showSlide(currentSlide + 1);
            }
        };

        if (prevBtn) prevBtn.onclick = previousSlide;
        if (nextBtn) nextBtn.onclick = nextSlide;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousSlide();
            }
        });

        showSlide(0);
    });
    </script>
</body>
</html>



`;

  return (
    <div className="mt-6">
      <iframe
        srcDoc={pageHtml}
        title="Projeto Mauá"
        className="w-full h-[85vh] border-0 rounded-lg shadow-lg"
        sandbox="allow-scripts allow-same-origin" // Allow scripts and links to run inside the iframe
      ></iframe>
    </div>
  );
};

export default MexEcoBr;