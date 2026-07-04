import React from 'react';

const DataNuclear: React.FC = () => {
  const pageHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise de Sistema Integrado SMR</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        :root {
            --primary-color: #2c3e50; --secondary-color: #3498db;
            --accent-color: #e74c3c; --bg-color: #ecf0f1; --card-bg: #ffffff;
            --text-color: #34495e; --header-color: #ffffff;
        }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background-color: var(--bg-color ); color: var(--text-color); }
        .container { max-width: 1400px; margin: 20px auto; padding: 20px; }
        header { background: linear-gradient(135deg, var(--primary-color), #34495e); color: var(--header-color); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        header h1 { margin: 0; font-size: 2.5em; }
        header p { margin: 5px 0 0; font-size: 1.2em; opacity: 0.9; }
        .tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 12px 25px; cursor: pointer; border: 2px solid transparent; background-color: var(--card-bg); color: var(--primary-color); border-radius: 50px; font-weight: 600; transition: all 0.3s ease; }
        .tab:hover { background-color: var(--secondary-color); color: white; }
        .tab.active { background-color: var(--primary-color); color: white; border-color: var(--secondary-color); }
        .content { display: none; background-color: var(--card-bg); padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .content.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        h2 { color: var(--primary-color); border-bottom: 3px solid var(--secondary-color); padding-bottom: 10px; margin-bottom: 20px; font-size: 1.8em; }
        .mermaid { text-align: center; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: var(--primary-color); color: var(--header-color); }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .card { background: #fdfdfd; border-left: 5px solid var(--secondary-color); padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .card h4 { margin-top: 0; color: var(--primary-color); font-size: 1.1em; }
        .card .value { font-size: 2.2em; font-weight: 700; color: var(--secondary-color); margin: 8px 0; }
        .card .unit { font-size: 1em; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Arquitetura Híbrida de Poligeração Nuclear</h1>
            <p>Análise Integrada: SMR, Ciclos de Potência e Refrigeração de Data Center</p>
        </header>

        <div class="tabs">
            <button class="tab active" onclick="showTab('diagrama_src')">Diagrama SRC</button>
            <button class="tab" onclick="showTab('diagrama_irc')">Diagrama IRC</button>
            <button class="tab" onclick="showTab('analise')">Análise de Desempenho</button>
            <button class="tab" onclick="showTab('glossario')">Glossário</button>
        </div>

        <div id="diagrama_src" class="content active">
            <h2>Diagrama de Fluxo: Configuração SRC (Ciclo Simples Recuperado)</h2>
            <p>Esta configuração prioriza a simplicidade do design, com um único ciclo de compressão e recuperação, enquanto ainda permite uma recuperação de calor em cascata para o ciclo ORC e o chiller.</p>
            <div class="mermaid">
                graph TD
                    subgraph "Legenda"
                        SMR_L[SMR]
                        SCO2_L[Ciclo S-CO2]
                        ORC_L[Ciclo ORC]
                        CHILLER_L[Chiller]
                        DC_L[Data Center]
                    end

                    style SMR_L fill:#e74c3c,stroke:#c0392b,color:#fff
                    style SCO2_L fill:#f1c40f,stroke:#f39c12,color:#333
                    style ORC_L fill:#3498db,stroke:#2980b9,color:#fff
                    style CHILLER_L fill:#1abc9c,stroke:#16a085,color:#fff
                    style DC_L fill:#9b59b6,stroke:#8e44ad,color:#fff

                    subgraph "Fonte Termica Primaria"
                        SMR[SMR 100 MWt]
                    end
                    style SMR fill:#e74c3c,stroke:#c0392b,color:#fff

                    subgraph "Ciclo de Potencia S-CO2"
                        T_SCO2[Turbina S-CO2]
                        G1[Gerador 1]
                        REC_SCO2[Recuperador]
                        PC[Precooler]
                        C_SCO2[Compressor]
                    end
                    style T_SCO2 fill:#f1c40f,stroke:#f39c12,color:#333
                    style C_SCO2 fill:#f1c40f,stroke:#f39c12,color:#333
                    style REC_SCO2 fill:#f39c12,stroke:#f1c40f,color:#fff
                    style PC fill:#bdc3c7,stroke:#95a5a6,color:#333

                    subgraph "Processamento de Calor"
                        IHX[IHX-ORC]
                    end
                    style IHX fill:#f39c12,stroke:#f1c40f,color:#fff

                    subgraph "Ciclo Secundario - ORC"
                        ORC[Ciclo ORC]
                        G2[Gerador 2]
                    end
                    style ORC fill:#3498db,stroke:#2980b9,color:#fff
                    style G2 fill:#3498db,stroke:#2980b9,color:#fff

                    subgraph "Sistema de Refrigeracao"
                        CHILLER[Chiller de Absorcao]
                        TORRE[Torre de Resfriamento]
                    end
                    style CHILLER fill:#1abc9c,stroke:#16a085,color:#fff
                    style TORRE fill:#bdc3c7,stroke:#95a5a6,color:#333

                    subgraph "Carga Digital"
                        DC[Data Center]
                    end
                    style DC fill:#9b59b6,stroke:#8e44ad,color:#fff

                    subgraph "Balanco Eletrico"
                        REDE[Rede Eletrica]
                    end
                    style REDE fill:#2ecc71,stroke:#27ae60,color:#fff

                    SMR -- "Q_in: 100 MW" --> T_SCO2
                    T_SCO2 -- "W_bruto: 42 MW" --> G1
                    T_SCO2 -- "T: 300C" --> REC_SCO2
                    PC -- "T: 40C" --> C_SCO2
                    C_SCO2 -- "W_cons: 12 MW" --> T_SCO2
                    C_SCO2 -- "T: 70C" --> REC_SCO2
                    REC_SCO2 -- "T: 280C" --> SMR

                    REC_SCO2 -- "Calor a 150C" --> IHX
                    IHX -- "Q_rec: 15 MW" --> ORC
                    ORC -- "W_liq: 9.2 MW" --> G2
                    IHX -- "T: 95C" --> PC

                    PC -- "Calor do S-CO2" --> CHILLER
                    ORC -- "Calor do ORC" --> CHILLER
                    CHILLER -- "Q_frio: 16.5 MW" --> DC
                    CHILLER -- "Rejeicao: 29.3 MW" --> TORRE

                    DC -- "Carga Termica: 16.5 MW" --> CHILLER

                    G1 -- "P_liq: 30 MW" --> REDE
                    G2 -- "P_liq: 9.2 MW" --> REDE
                    REDE -- "Consumo: 18.3 MW" --> DC
            </div>
        </div>

        <div id="diagrama_irc" class="content">
            <h2>Diagrama de Fluxo: Configuração IRC (Resfriamento Intermediário)</h2>
            <p>Esta configuração aumenta a complexidade com um segundo compressor (recompressão) e múltiplos recuperadores (HTR/LTR) para maximizar a eficiência do ciclo S-CO₂, o que, por sua vez, aumenta o potencial total de recuperação de calor.</p>
            <div class="mermaid">
                graph TD
                    subgraph "Legenda"
                        SMR_L[SMR]
                        SCO2_L[Ciclo S-CO2]
                        CHILLER_L[Chiller]
                        DC_L[Data Center]
                    end

                    style SMR_L fill:#e74c3c,stroke:#c0392b,color:#fff
                    style SCO2_L fill:#f1c40f,stroke:#f39c12,color:#333
                    style CHILLER_L fill:#1abc9c,stroke:#16a085,color:#fff
                    style DC_L fill:#9b59b6,stroke:#8e44ad,color:#fff

                    subgraph "Fonte Termica Primaria"
                        SMR[SMR 100 MWt]
                    end
                    style SMR fill:#e74c3c,stroke:#c0392b,color:#fff

                    subgraph "Ciclo S-CO2 IRC"
                        HTR[Recuperador Alta Temp - HTR]
                        T_SCO2[Turbina S-CO2]
                        G1[Gerador]
                        LTR[Recuperador Baixa Temp - LTR]
                        SplitNode[Divisor de Fluxo]
                        PC[Precooler]
                        C_LP[Compressor Baixa Pressao - LPC]
                        IC[Intercooler]
                        C_HP[Compressor Alta Pressao - HPC]
                        C2[Compressor Recompressao - C2]
                        MergeNode[Juncao de Fluxo]
                    end

                    style T_SCO2 fill:#f1c40f,stroke:#f39c12,color:#333
                    style G1 fill:#f1c40f,stroke:#f39c12,color:#333
                    style C_LP fill:#f1c40f,stroke:#f39c12,color:#333
                    style C_HP fill:#f1c40f,stroke:#f39c12,color:#333
                    style C2 fill:#f1c40f,stroke:#f39c12,color:#333
                    style HTR fill:#f39c12,stroke:#f1c40f,color:#fff
                    style LTR fill:#f39c12,stroke:#f1c40f,color:#fff
                    style IC fill:#bdc3c7,stroke:#95a5a6,color:#333
                    style PC fill:#bdc3c7,stroke:#95a5a6,color:#333

                    subgraph "Sistema de Refrigeracao e Carga"
                        CHILLER[Chiller de Absorcao]
                        DC[Data Center]
                    end

                    style CHILLER fill:#1abc9c,stroke:#16a085,color:#fff
                    style DC fill:#9b59b6,stroke:#8e44ad,color:#fff

                    subgraph "Balanco Eletrico"
                        REDE[Rede Eletrica]
                    end

                    style REDE fill:#2ecc71,stroke:#27ae60,color:#fff

                    SMR -- "Calor de Alta Temp (550C)" --> T_SCO2
                    T_SCO2 -- "Trabalho Bruto: 45 MW" --> G1
                    T_SCO2 -- "Exaustao Quente (400C)" --> HTR
                    HTR -- "CO2 Resfriado (250C)" --> LTR
                    LTR -- "CO2 Baixa Temp (120C)" --> SplitNode
                    
                    SplitNode -- "60% do Fluxo" --> PC
                    SplitNode -- "40% do Fluxo (Bypass)" --> C2
                    
                    PC -- "CO2 Resfriado (35C)" --> C_LP
                    C_LP -- "Comprimido LP (65C)" --> IC
                    IC -- "Resfriado Interm. (35C)" --> C_HP
                    C_HP -- "Fluxo de Alta Pressao (75C)" --> LTR
                    
                    LTR -- "Aquecimento LTR (160C)" --> MergeNode
                    C2 -- "Bypass Recomprimido (160C)" --> MergeNode
                    
                    MergeNode -- "Fluxo Unificado (160C)" --> HTR
                    HTR -- "Pre-aquecido (480C)" --> SMR

                    IC -- "Recuperacao de Calor (10 MW)" --> CHILLER
                    PC -- "Recuperacao de Calor (18 MW)" --> CHILLER
                    LTR -- "Calor Adicional (12 MW)" --> CHILLER
                    CHILLER -- "Capacidade Fria (48 MW)" --> DC
                    DC -- "Carga Termica de TI" --> CHILLER

                    G1 -- "Energia Liquida: 30.8 MW" --> REDE
                    REDE -- "Consumo Total: 53.3 MW" --> DC
            </div>
        </div>

        <div id="analise" class="content">
            <h2>Análise de Desempenho Comparativa</h2>
            <div class="grid">
                <div class="card">
                    <h4>Configuração SRC</h4>
                    <div class="value">39.2%</div>
                    <div class="unit">Eficiência Elétrica Líquida</div>
                    <p><strong>Refrigeração:</strong> 41.95 MW  
<strong>Servidores:</strong> ~4,570  
<strong>Complexidade:</strong> Menor</p>
                </div>
                <div class="card">
                    <h4>Configuração IRC</h4>
                    <div class="value">42.8%</div>
                    <div class="unit">Eficiência Elétrica Líquida</div>
                    <p><strong>Refrigeração:</strong> 102 MW  
<strong>Servidores:</strong> ~11,110  
<strong>Complexidade:</strong> Maior</p>
                </div>
            </div>
            <h3>Conclusão da Análise</h3>
            <p>A configuração IRC, embora mais complexa, oferece um ganho significativo tanto em eficiência elétrica (+3.6 pontos percentuais) quanto em capacidade de refrigeração (+143%). A escolha entre os sistemas dependerá de uma análise tecno-econômica, ponderando o custo de capital adicional da configuração IRC contra as receitas aumentadas da venda de eletricidade e da maior capacidade de processamento do data center.</p>
        </div>

        <div id="glossario" class="content">
            <h2>Glossário Técnico</h2>
            <table>
                <thead>
                    <tr><th>Termo</th><th>Função</th><th>Parâmetros Chave</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>SMR</strong></td><td>Fonte térmica primária</td><td>100 MWₜ, 550-650°C</td></tr>
                    <tr><td><strong>Ciclo S-CO₂</strong></td><td>Geração de eletricidade primária</td><td>η ≈ 40-45%, P_max ≈ 28 MPa</td></tr>
                    <tr><td><strong>Ciclo ORC</strong></td><td>Geração elétrica com calor residual</td><td>Fluido: R134a, T_in ≈ 150°C</td></tr>
                    <tr><td><strong>Chiller de Absorção</strong></td><td>Produção de frio com calor residual</td><td>Par: LiBr-H₂O, T_in ≈ 80-120°C, COP ≈ 1.2</td></tr>
                    <tr><td><strong>Data Center</strong></td><td>Carga térmica e de processamento</td><td>NVIDIA HGX, PUE ≈ 1.1-1.15</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
        function showTab(tabId) {
            document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelector(\`[onclick="showTab('\${tabId}')"]\`).classList.add('active');
        }
        document.addEventListener('DOMContentLoaded', () => showTab('diagrama_src'));
    </script>
</body>
</html>
  `;

  return (
    <div className="mt-6">
      <iframe
        srcDoc={pageHtml}
        title="Análise de Sistema Integrado SMR"
        className="w-full h-[85vh] border-0 rounded-lg shadow-lg"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>
  );
};

export default DataNuclear;