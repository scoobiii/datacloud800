# Sprints de Engenharia de Prompt & DevOps Sênior

Este documento descreve os Sprints de Engenharia de Prompt Sênior e as diretrizes DevOps para o ecossistema descentralizado de energia da **MAUAX / MEX BioDataCloud**, integrado ao barramento **CCEE, ONS, ANEEL e a rede DREX (Real Digital)** do Banco Central do Brasil (BCB).

---

## 🛠️ Visão Geral do Ciclo de DevOps Sênior
Nosso fluxo DevOps é focado em resiliência máxima, segurança criptográfica e conformidade de sigilo regulatório. Ele utiliza inteligência artificial baseada em LLMs para automação profunda e validação contínua (IaC, CI/CD, Stress Testing e Compliance).

```
   [Engenharia de Prompt] -> [IaC (Terraform) / Smart Contracts] -> [CI/CD & Lint]
             ^                                                            |
             |------------------ [Stress & Cryptographic Logs] <----------v
```

---

## 📅 Sprints de Engenharia de Prompt (Ciclos de 1 a 4)

### Sprint 1: Concepção, Orquestração de Prompt e IaC
* **Foco**: Definir o "Metaprompt" estrutural para gerar a arquitetura Cloud Run do projeto, assegurando isolamento de redes (VPC) e canais privados para os Oráculos CCEE.
* **Técnica de Prompting**: *System Prompts* estritos com definição de papéis (Role-Playing), Few-Shot Examples e Chain-of-Thought (CoT).
* **Entregáveis**:
  - Script Terraform gerado via prompt seguro de IA para provisionamento de instâncias e redes privadas.
  - Configuração do segredo `GEMINI_API_KEY` via Google Secret Manager integrada de forma "lazy" para evitar crash em inicialização do container.

### Sprint 2: Implementação Criptográfica & Contratos Inteligentes DREX
* **Foco**: Criação dos prompts geradores para contratos Hyperledger Besu em Solidity.
* **Desafio de Prompting**: Prevenir reentrância, assegurar conformidade com a Fase 1 do DREX (privacidade através de Pedersen Commitments / Zether) e modelagem ERC-1155 para os ativos e-kWh de energia solar.
* **Entregáveis**:
  - Contratos Solidity auditados por simuladores de lint baseados em prompts de segurança cibernética.
  - Oráculo assinado criptograficamente sincronizando leituras de medidores inteligentes (Smart Meters).

### Sprint 3: Testes de Stress, Cobertura 100% e Simulação em Loop
* **Foco**: Automação de testes em loop com relatórios em tempo real.
* **Técnica de Prompting**: Geração automática de scripts de teste de carga em K6 e testes unitários com Jest/Vitest.
* **Entregáveis**:
  - Motor de simulação de concorrência com 100+ transações concorrentes na blockchain Drex.
  - Loop determinístico que valida a latência e a prova de conhecimento zero (ZKP) até obter sucesso absoluto (zero erros).

### Sprint 4: CI/CD, Monitoramento & Governança de Prompt
* **Foco**: Criação de pipelines GitHub Actions e monitoramento integrado via Datadog/Cloud Logging.
* **Técnica de Prompting**: Prompts de revisão de Pull Requests automáticos para segurança e consumo de gás.
* **Entregáveis**:
  - Workflow de CI completo com verificação de types, lint de build e simulação de stress antes do deployment em produção.

---

## 🤖 Padrões de Prompting Sênior Usados no Projeto

### 1. Prompt de IA para Geração de Infraestrutura (IaC - Terraform)
```text
Papel: Engenheiro DevOps Sênior e Especialista em Segurança GCP.
Ação: Escreva um manifesto Terraform completo e pronto para produção para implantar uma aplicação Full-Stack React + Node.js no Cloud Run.
Restrições:
1. O Cloud Run deve se comunicar de forma privada com o Firestore e o segredo GEMINI_API_KEY do Secret Manager.
2. Defina os limites de CPU como 1vCPU e Memória como 512Mi com escalonamento de 0 a 5 instâncias (Scale-to-Zero ativo para economia).
3. Escreva a configuração completa sem mock, usando variáveis de entrada limpas.
Saída esperada: Apenas código Terraform válido estruturado, sem explicações adicionais redundantes.
```

### 2. Prompt de IA para Validação de Contrato Inteligente DREX (Solidity Audit)
```text
Papel: Auditor Líder de Smart Contracts e Especialista em Criptografia EVM.
Contexto: Estamos implantando o contrato 'CCEE_Drex_Bridge.sol' que liquida tokens e-kWh usando CBDC DREX.
Tarefa: Realize uma análise de segurança estática no seguinte código Solidity para identificar:
1. Vulnerabilidades de reentrância.
2. Riscos de estouro de inteiros (Overflow/Underflow).
3. Vazamento de informações privadas violando a Lei Complementar 105 (Sigilo Bancário).
Requisito de Saída: Forneça um relatório estruturado classificando os riscos em Crítico, Alto, Médio e Baixo, com recomendações de correção imediata em código.
```

### 3. Prompt de Teste de Stress Resiliente (Loop de Validação)
```text
Papel: Engenheiro de SQA (Software Quality Assurance) e Especialista em Engenharia de Concorrência.
Tarefa: Escreva um script em TypeScript para executar um loop de simulação de carga de 100 requisições simultâneas contra o endpoint de liquidação instantânea DREX/Pix.
Requisitos:
1. Monitore a taxa de sucesso (deve ser 100%).
2. Meça a latência de geração de hash criptográfico de bloco.
3. Se qualquer requisição falhar ou exceder 200ms de tempo de resposta, capture o stack trace exato para correção imediata do pipeline.
```

---

## 📂 Integração do Fluxo Git & Devops no Repositório

O fluxo de ramificação adota o modelo **GitFlow Estrito**, garantindo que nenhuma alteração chegue à branch principal (`main`) sem verificação automatizada de conformidade legal e criptográfica:

1. **`feature/drex-fase1`**: Desenvolvimento da carteira e liquidação DvP.
2. **`sprint/prompt-engineering`**: Otimização e controle de versão das templates de prompts do sistema.
3. **`release/v1.0.0`**: Homologação com dados pré-hidratados reais do SIN (Sistema Interligado Nacional) para verificação regulatória ONS/ANEEL.

Este pipeline garante alta governança tecnológica, permitindo auditoria ponta-a-ponta por reguladores governamentais e investidores institucionais.
