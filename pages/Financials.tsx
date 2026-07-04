import React, { useState, useEffect, useMemo } from 'react';
import { calculateFinancials } from '../lib/simulation';
import DashboardCard from '../components/DashboardCard';
import { ChartBarIcon, BoltIcon, ArrowDownTrayIcon, ChartPieIcon, TrendingUpIcon, ComputerDesktopIcon } from '../components/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import { PlantStatus, FuelMode } from '../types';
import { 
  Wallet, Sun, Zap, CheckCircle2, Coins, History, Send, 
  ArrowUpRight, ArrowDownLeft, Database, RefreshCw, UserCheck, 
  Server, AlertTriangle, Play, HelpCircle, ArrowRight, QrCode, 
  ClipboardList, Lock, ShieldAlert, ExternalLink, X, Landmark, Percent
} from 'lucide-react';

interface FinancialsProps {
  plantStatus: PlantStatus;
  powerOutput: number;
  fuelMode: FuelMode;
  flexMix: { h2: number, biodiesel: number };
  activeRackCount: number;
  t: (key: string) => string;
}

const initialMonthlyRevenueData = [
  { month: 'Jan', revenue: 9.8 }, { month: 'Fev', revenue: 9.5 }, { month: 'Mar', revenue: 10.2 },
  { month: 'Abr', revenue: 10.5 }, { month: 'Mai', revenue: 11.1 }, { month: 'Jun', revenue: 11.0 },
  { month: 'Jul', revenue: 11.5 }, { month: 'Ago', revenue: 11.8 }, { month: 'Set', revenue: 12.0 },
  { month: 'Out', revenue: 12.3 }, { month: 'Nov', revenue: 12.1 }, { month: 'Dez', revenue: 12.5 },
];

// --- Financial Constants ---
const REVENUE_PER_RACK_PER_MONTH = 285000; // BRL, valor para datacenter de alta performance (NVIDIA DGX H100)
const OPEX_PER_RACK_PER_MONTH = 2500;    // Custo operacional por rack (energia, refrigeração parcial, etc.)
const TAX_RATE = 0.25;                    // Imposto de Renda e Contribuição Social (Exemplo: 25%)
const REVENUE_TARGET = 950000000;         // Meta de Receita Mensal
const PROFIT_TARGET = 400000000;          // Meta de Lucro Líquido Mensal

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
};

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-sm text-gray-300">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || p.fill }} className="text-sm">
              {`${p.name}: ${formatter(p.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

interface SolarAsset {
  id: number;
  name: string;
  capacity: number; // kWp
  todayGen: number; // kWh
  todaySold: number; // kWh
  status: 'online' | 'maintenance' | 'offline';
  smartMeterId: string;
  pldPrice: number; // BRL/kWh (PLD)
  owner: string; // Pessoa Física / Jurídica
  tokenizedEnergy: number; // e-kWh
}

interface WalletTransaction {
  id: string;
  timestamp: string;
  type: 'CCEE_SALE' | 'TOKENIZE' | 'PIX_DEPOSIT' | 'PIX_CASHOUT' | 'DREX_SEND' | 'DREX_RECEIVE';
  amount: number;
  asset: string;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
}

const initialSolarAssets: SolarAsset[] = [
  {
    id: 1,
    name: 'UFV Residencial Solar Haus - SP',
    capacity: 12.5,
    todayGen: 42.4,
    todaySold: 18.2,
    status: 'online',
    smartMeterId: 'SM-SP-88214-CCEE',
    pldPrice: 0.68,
    owner: 'João da Silva Sobrinho (CPF: ***.482.908-**)',
    tokenizedEnergy: 1240.0
  },
  {
    id: 2,
    name: 'Minigeração Fazenda Sol do Sul - RS',
    capacity: 45.0,
    todayGen: 156.8,
    todaySold: 78.4,
    status: 'online',
    smartMeterId: 'SM-RS-10294-CCEE',
    pldPrice: 0.72,
    owner: 'Sítio Sol do Vale - LTDA',
    tokenizedEnergy: 2580.5
  },
  {
    id: 3,
    name: 'Placas Solares Cobertura Itaim - SP',
    capacity: 8.0,
    todayGen: 0.0,
    todaySold: 0.0,
    status: 'maintenance',
    smartMeterId: 'SM-SP-44122-CCEE',
    pldPrice: 0.68,
    owner: 'João da Silva Sobrinho (CPF: ***.482.908-**)',
    tokenizedEnergy: 420.0
  }
];

const initialWalletTransactions: WalletTransaction[] = [
  {
    id: 'TX-8029',
    timestamp: '29/06/2026 11:32',
    type: 'CCEE_SALE',
    amount: 53.31,
    asset: 'UFV Residencial Solar Haus - SP',
    status: 'completed',
    hash: '0x3f5c...a891'
  },
  {
    id: 'TX-8028',
    timestamp: '29/06/2026 09:15',
    type: 'TOKENIZE',
    amount: 42.4,
    asset: 'UFV Residencial Solar Haus - SP',
    status: 'completed',
    hash: '0x9a82...d31e'
  },
  {
    id: 'TX-8027',
    timestamp: '28/06/2026 17:45',
    type: 'PIX_CASHOUT',
    amount: 250.00,
    asset: 'DREX Liquidation',
    status: 'completed',
    hash: 'PIX-E8842093847209'
  },
  {
    id: 'TX-8026',
    timestamp: '28/06/2026 14:10',
    type: 'CCEE_SALE',
    amount: 112.89,
    asset: 'Minigeração Fazenda Sol do Sul - RS',
    status: 'completed',
    hash: '0xbb29...f102'
  },
  {
    id: 'TX-8025',
    timestamp: '27/06/2026 10:00',
    type: 'PIX_DEPOSIT',
    amount: 500.00,
    asset: 'DREX Minting (via Pix)',
    status: 'completed',
    hash: 'PIX-E1029481029482'
  }
];

const Financials: React.FC<FinancialsProps> = ({
  plantStatus,
  powerOutput,
  fuelMode,
  flexMix,
  activeRackCount,
  t,
}) => {
    // --- Helper constants derived from props ---
    const isOnline = plantStatus === PlantStatus.Online;
    const baseFuelCost = 150000;
    const baselinePower = 2500;
    const cloudRevenue = activeRackCount * REVENUE_PER_RACK_PER_MONTH;
    const [isVerifyingOracle, setIsVerifyingOracle] = useState(false);

    // --- Wallet & Tokenization States ---
    const [activeView, setActiveView] = useState<'corporate' | 'wallet'>('corporate');
    const [solarAssets, setSolarAssets] = useState<SolarAsset[]>(initialSolarAssets);
    const [transactions, setTransactions] = useState<WalletTransaction[]>(initialWalletTransactions);
    const [drexBalance, setDrexBalance] = useState(12450.00); // 1 DREX = 1 BRL
    const [ekwhBalance, setEkwhBalance] = useState(3820.50);  // energy token balance
    const [pixBalance, setPixBalance] = useState(4120.00);    // liquid standard bank balance

    const handleDrexToPixLiquidation = () => {
      if (drexBalance <= 0) return;
      const transferAmt = Math.min(drexBalance, 1000);
      setDrexBalance(prev => Math.max(0, parseFloat((prev - transferAmt).toFixed(2))));
      setPixBalance(prev => parseFloat((prev + transferAmt).toFixed(2)));
      
      const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
      const newTx: WalletTransaction = {
        id: txId,
        timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
        type: 'PIX_CASHOUT',
        amount: transferAmt,
        asset: 'Liquidação DREX para Pix',
        status: 'completed',
        hash: 'PIX-' + Math.floor(10000000 + Math.random() * 90000000)
      };
      setTransactions(prev => [newTx, ...prev]);
    };
    const [walletAddress, setWalletAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d1476B');
    const [isCCEEConnected, setIsCCEEConnected] = useState(true);
    
    // Simulations and UX triggers
    const [isSellingExcess, setIsSellingExcess] = useState(false);
    const [sellingAssetId, setSellingAssetId] = useState<number | null>(null);
    const [isTokenizing, setIsTokenizing] = useState(false);
    const [tokenizingAssetId, setTokenizingAssetId] = useState<number | null>(null);
    
    // Pix Deposit QR Modal State
    const [showPixQrCode, setShowPixQrCode] = useState(false);
    const [pixAmount, setPixAmount] = useState('100');
    const [pixKey, setPixKey] = useState('sobrinhoSJ@gmail.com');
    const [pixQrValue, setPixQrValue] = useState('');
    const [isGeneratingPix, setIsGeneratingPix] = useState(false);

    // Send / Withdraw Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferType, setTransferType] = useState<'drex' | 'pix'>('drex');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferRecipient, setTransferRecipient] = useState('');
    const [transferStatus, setTransferStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [transferLog, setTransferLog] = useState<string[]>([]);
    
    // Blockchain Block / CCEE Oracle explorer logs
    const [liveBlockLogs, setLiveBlockLogs] = useState<string[]>([
      'Bloco #15948301: Validado por Nó BancoCentral - Hash: 0x98a...23ef',
      'Contrato Inteligente CCEE_Escrow_v1 instanciado no bloco #15948299',
      'Oráculo SmartMeter-CCEE-Bridge atualizado às 11:30 (UTC-3)'
    ]);

    // --- Sandbox Drex & Pix integration states ---
    const [sandboxTab, setSandboxTab] = useState<'privacy' | 'interop' | 'oracle' | 'stress'>('privacy');
    const [isTestingStress, setIsTestingStress] = useState(false);
    const [stressProgress, setStressProgress] = useState(0);
    const [stressLog, setStressLog] = useState<string[]>([]);
    const [stressSuccessCount, setStressSuccessCount] = useState(0);
    const [stressLatency, setStressLatency] = useState(0);
    const [privacyProofStatus, setPrivacyProofStatus] = useState<'unproven' | 'generating' | 'verified'>('unproven');
    const [interopStatus, setInteropStatus] = useState<'idle' | 'swapping' | 'swapped'>('idle');
    const [interopAmount, setInteropAmount] = useState('150');

    const handleGeneratePrivacyProof = () => {
      setPrivacyProofStatus('generating');
      setTimeout(() => {
        setPrivacyProofStatus('verified');
        setLiveBlockLogs(prev => [
          `[ZKP-SIGILO] Prova de Sigilo Bancário (LC 105/2001) gerada e verificada pelo nó supervisor para a conta ${walletAddress.slice(0, 10)}...`,
          ...prev.slice(0, 15)
        ]);
      }, 1500);
    };

    const handleExecuteAtomicSwap = () => {
      const amountVal = parseFloat(interopAmount);
      if (isNaN(amountVal) || amountVal <= 0 || ekwhBalance < amountVal) return;
      
      setInteropStatus('swapping');
      setTimeout(() => {
        const drexReward = amountVal * 0.70;
        setEkwhBalance(prev => Math.max(0, parseFloat((prev - amountVal).toFixed(2))));
        setDrexBalance(prev => prev + drexReward);
        setInteropStatus('swapped');
        
        const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
        const newTx: WalletTransaction = {
          id: txId,
          timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
          type: 'CCEE_SALE',
          amount: drexReward,
          asset: `Swap Atômico DvP: ${amountVal} e-kWh para DREX BRL`,
          status: 'completed',
          hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
        };
        setTransactions(prev => [newTx, ...prev]);
        setLiveBlockLogs(prev => [
          `[DvP-DREX] Liquidado ${amountVal} e-kWh por R$ ${drexReward.toFixed(2)} DREX via Smart Contract de Liquidação Instantânea.`,
          ...prev.slice(0, 15)
        ]);
      }, 1500);
    };

    const handleRunStressTest = () => {
      setIsTestingStress(true);
      setStressProgress(0);
      setStressSuccessCount(0);
      setStressLog([`[INICIANDO] Teste de Carga e Stress: 100 loops concorrentes de liquidação automática...`]);
      
      let currentProgress = 0;
      let successes = 0;
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        if (currentProgress < 100) {
          currentProgress += 5;
          successes += 5;
          setStressProgress(currentProgress);
          setStressSuccessCount(successes);
          
          const stepLogs = [
            `[STRESS] Executando lote #${currentProgress/5}... OK (Sem colisões)`,
            `[SPI-PIX] Reserva de liquidez via SPI efetuada com sucesso para transações #${currentProgress-4} a #${currentProgress}`,
            `[DREX-EVM] Contrato CCEE_Escrow assinado criptograficamente por validadores da rede Bacen para #${currentProgress-4} a #${currentProgress}`,
            `[ZK-PROOF] Verificação de sigilo homologada de acordo com as diretrizes da Fase 1`
          ];
          
          setStressLog(prev => [
            ...prev,
            `Lote #${currentProgress/5}: Processando 5 transações com latência de ${Math.floor(25 + Math.random() * 20)}ms`,
            stepLogs[Math.floor(Math.random() * stepLogs.length)]
          ]);
        } else {
          clearInterval(interval);
          const totalTime = Date.now() - startTime;
          const avgLatency = Math.floor(totalTime / 100);
          setStressLatency(avgLatency);
          setIsTestingStress(false);
          setStressLog(prev => [
            ...prev,
            `[SUCESSO] Loop concluído! 100% de cobertura (100/100 transações liquidadas com sucesso)`,
            `Tempo Médio de Resposta: ${avgLatency}ms. Taxa de Perda de Pacotes: 0.00%`,
            `Resiliência: Integridade transacional DREX & Pix assegurada sob concorrência extrema.`
          ]);
        }
      }, 100);
    };

    // --- Wallet Helper Functions ---
    const handleSellExcess = (assetId: number) => {
      const asset = solarAssets.find(a => a.id === assetId);
      if (!asset || asset.status !== 'online') return;
      
      setSellingAssetId(assetId);
      setIsSellingExcess(true);
      
      const kwhToSell = (Math.random() * 5 + 2).toFixed(1);
      const cost = parseFloat(kwhToSell) * asset.pldPrice;
      
      const steps = [
        `[1/4] Leitura de Smart Meter ${asset.smartMeterId}: excesso de ${kwhToSell} kWh verificado`,
        `[2/4] Registro de certificado de geração limpa assinado por oráculo CCEE`,
        `[3/4] Enviando transação de liquidação instantânea para blockchain DREX`,
        `[4/4] Liquidação de CCEE Efetuada. Recebido R$ ${cost.toFixed(2)} DREX na carteira!`
      ];
      
      let currentStep = 0;
      const runStep = () => {
        if (currentStep < steps.length) {
          setLiveBlockLogs(prev => [steps[currentStep], ...prev.slice(0, 15)]);
          currentStep++;
          setTimeout(runStep, 700);
        } else {
          setDrexBalance(prev => prev + cost);
          setSolarAssets(prev => prev.map(a => {
            if (a.id === assetId) {
              return {
                ...a,
                todaySold: parseFloat((a.todaySold + parseFloat(kwhToSell)).toFixed(1))
              };
            }
            return a;
          }));
          
          const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
          const newTx: WalletTransaction = {
            id: txId,
            timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
            type: 'CCEE_SALE',
            amount: cost,
            asset: asset.name,
            status: 'completed',
            hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
          };
          
          setTransactions(prev => [newTx, ...prev]);
          setIsSellingExcess(false);
          setSellingAssetId(null);
        }
      };
      
      setTimeout(runStep, 100);
    };

    const handleTokenizeEnergy = (assetId: number) => {
      const asset = solarAssets.find(a => a.id === assetId);
      if (!asset || asset.status !== 'online') return;
      
      setTokenizingAssetId(assetId);
      setIsTokenizing(true);
      
      const kwhToTokenize = (Math.random() * 15 + 10).toFixed(1);
      const amountNum = parseFloat(kwhToTokenize);
      
      const steps = [
        `[1/3] Solicitando validação de créditos verdes no ledger da CCEE...`,
        `[2/3] Executando cunhagem de e-kWh Tokens no Smart Contract DREX_EnergyToken...`,
        `[3/3] Tokens e-kWh cunhados com sucesso: ${kwhToTokenize} e-kWh transferidos para carteira!`
      ];
      
      let currentStep = 0;
      const runStep = () => {
        if (currentStep < steps.length) {
          setLiveBlockLogs(prev => [steps[currentStep], ...prev.slice(0, 15)]);
          currentStep++;
          setTimeout(runStep, 800);
        } else {
          setEkwhBalance(prev => prev + amountNum);
          setSolarAssets(prev => prev.map(a => {
            if (a.id === assetId) {
              return {
                ...a,
                tokenizedEnergy: parseFloat((a.tokenizedEnergy + amountNum).toFixed(1))
              };
            }
            return a;
          }));
          
          const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
          const newTx: WalletTransaction = {
            id: txId,
            timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
            type: 'TOKENIZE',
            amount: amountNum,
            asset: asset.name,
            status: 'completed',
            hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
          };
          
          setTransactions(prev => [newTx, ...prev]);
          setIsTokenizing(false);
          setTokenizingAssetId(null);
        }
      };
      
      setTimeout(runStep, 100);
    };

    const handleGeneratePixQr = () => {
      setIsGeneratingPix(true);
      setTimeout(() => {
        const formattedAmount = parseFloat(pixAmount || '100').toFixed(2);
        const payload = `00020101021226830014br.gov.bcb.pix25610023${pixKey}5204000053039865405${formattedAmount}5802BR5925JOAO_DA_SILVA_SOBRINHO6009SAO_PAULO62070503***6304`;
        setPixQrValue(payload);
        setIsGeneratingPix(false);
      }, 600);
    };

    const handleTransferSubmit = () => {
      if (!transferAmount || parseFloat(transferAmount) <= 0) return;
      
      const amountVal = parseFloat(transferAmount);
      setTransferStatus('processing');
      setTransferLog([
        `Iniciando transferência de ${amountVal.toFixed(2)} ${transferType.toUpperCase()}...`,
        transferType === 'drex' 
          ? `Consultando saldo de DREX no endereço do destinatário...`
          : `Consultando chaves de endereçamento Pix via DICT do Banco Central...`
      ]);
      
      let step = 0;
      const steps = [
        transferType === 'drex'
          ? `Autorizando débito em carteira DREX multi-sig...`
          : `Efetuando reserva de liquidez via SPI (Sistema de Pagamentos Instantâneos)...`,
        `Liquidando transação e registrando assinatura criptográfica...`,
        `Transferência concluída com sucesso!`
      ];
      
      const runStep = () => {
        if (step < steps.length) {
          setTransferLog(prev => [...prev, steps[step]]);
          step++;
          setTimeout(runStep, 800);
        } else {
          if (transferType === 'drex') {
            setDrexBalance(prev => Math.max(0, prev - amountVal));
          } else {
            setPixBalance(prev => Math.max(0, prev - amountVal));
          }
          
          const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
          const newTx: WalletTransaction = {
            id: txId,
            timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
            type: transferType === 'drex' ? 'DREX_SEND' : 'PIX_CASHOUT',
            amount: amountVal,
            asset: transferRecipient || 'Destinatário Externo',
            status: 'completed',
            hash: transferType === 'drex' 
              ? '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
              : 'PIX-E' + Math.floor(10000000 + Math.random() * 90000000)
          };
          
          setTransactions(prev => [newTx, ...prev]);
          setTransferStatus('success');
        }
      };
      
      setTimeout(runStep, 800);
    };

    const [carbonPrice, setCarbonPrice] = useState(32.50); // USD per ton
    const [monthlyRevenueHistory, setMonthlyRevenueHistory] = useState(initialMonthlyRevenueData);
    const [roi, setRoi] = useState(28.5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCarbonPrice(prev => Math.max(25, Math.min(45, prev + (Math.random() - 0.5) * 1.5)));
            setRoi(prev => Math.max(20, Math.min(40, prev + (Math.random() - 0.5) * 0.2)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const financialMetrics = useMemo(() => {
        const result = calculateFinancials({
            plantStatus,
            powerOutput,
            fuelMode,
            flexMix,
            carbonPrice,
            activeRackCount,
            revenuePerRack: REVENUE_PER_RACK_PER_MONTH,
            opexPerRack: OPEX_PER_RACK_PER_MONTH,
        });

        // Impostos
        const taxes = result.ebit > 0 ? result.ebit * TAX_RATE : 0;

        // Lucro Líquido (Resultado Líquido)
        const netProfit = result.ebit - taxes;

        // --- Data for Charts ---
        const revenueStreamData = [
            { name: t('financials.energySales'), value: result.energyRevenue, color: '#f59e0b' },
            { name: t('financials.cloudServices'), value: result.cloudRevenue, color: '#8b5cf6' },
            { name: t('financials.carbonCredits'), value: result.carbonRevenue, color: '#10b981' },
        ];
        
        const costData = [
            { name: t('financials.fuelCOGS'), value: result.cogsFuel, color: '#34d399' },
            { name: t('financials.maintenance'), value: result.opexMaintenance, color: '#6ee7b7' },
            { name: t('financials.personnel'), value: result.opexPersonnel, color: '#a7f3d0' },
            { name: t('financials.dataCenter'), value: result.opexDataCenter, color: '#fb923c' },
        ];

        return { 
            ...result,
            netProfit,
            revenueStreamData,
            costData,
            taxes
        };
    }, [plantStatus, powerOutput, fuelMode, flexMix, carbonPrice, activeRackCount, t]);

    const monthlySummaryData = useMemo(() => [
        { month: 'Set/23', revenue: 1180, costs: 760 },
        { month: 'Out/23', revenue: 1230, costs: 800 },
        { month: 'Nov/23', revenue: 1210, costs: 790 },
        { month: 'Dez/23', revenue: 1250, costs: 810 },
        { month: 'Jan/24', revenue: 980, costs: 650 },
        { month: 'Fev/24', revenue: 950, costs: 630 },
        { month: 'Mar/24', revenue: 1020, costs: 680 },
        { month: 'Abr/24', revenue: 1050, costs: 700 },
        { month: 'Mai/24', revenue: 1110, costs: 720 },
        { month: 'Jun/24', revenue: 1100, costs: 710 },
        { month: 'Jul/24', revenue: 1150, costs: 750 },
        // Current month's data is dynamic
        { 
          month: 'Ago/24', 
          revenue: financialMetrics.totalRevenue > 0 ? financialMetrics.totalRevenue / 1000000 : 0, 
          costs: financialMetrics.totalOperatingCosts > 0 ? financialMetrics.totalOperatingCosts / 1000000 : 0
        },
      ].map(d => ({ 
          month: d.month,
          revenue: d.revenue * 1000000, 
          costs: d.costs * 1000000, 
          profit: (d.revenue - d.costs) * 1000000 // This represents EBITDA
      })), [financialMetrics.totalRevenue, financialMetrics.totalOperatingCosts]);
      
    const monthlyNetProfitSummaryData = useMemo(() => {
        const amortization = 12500000;
        const taxRate = TAX_RATE;

        return monthlySummaryData.map(d => {
            const ebitda = d.profit;
            const ebit = ebitda - amortization;
            const taxes = ebit > 0 ? ebit * taxRate : 0;
            const netProfit = ebit - taxes;
            
            const totalCosts = d.costs + amortization + taxes;

            return {
                month: d.month,
                revenue: d.revenue,
                totalCosts: totalCosts,
                netProfit: netProfit
            };
        });
    }, [monthlySummaryData]);

    useEffect(() => {
        if(financialMetrics.totalRevenue > 0) {
            const baseRevenueMillions = financialMetrics.totalRevenue / 1000000;
            setMonthlyRevenueHistory(
                initialMonthlyRevenueData.map(item => ({
                    ...item,
                    revenue: baseRevenueMillions * (0.95 + Math.random() * 0.1)
                }))
            );
        } else {
             setMonthlyRevenueHistory(
                initialMonthlyRevenueData.map(item => ({...item, revenue: 0}))
             );
        }
    }, [financialMetrics.totalRevenue]);

    const handleExportCSV = () => {
        const {
            totalRevenue, grossProfit, ebitda, ebit, taxes, netProfit,
            monthlyAmortization, revenueStreamData, costData
        } = financialMetrics;

        const dataToExport = [
            { group: 'Resultado', metric: 'Receita Total', value: totalRevenue },
            ...revenueStreamData.map(item => ({ group: 'Receita', metric: item.name, value: item.value })),
            { group: 'Resultado', metric: '(-) Custo do Produto Vendido', value: -costData.find(c => c.name.includes('Combustível'))!.value },
            { group: 'Resultado', metric: '= Lucro Bruto', value: grossProfit },
            ...costData.filter(c => !c.name.includes('Combustível')).map(item => ({ group: 'OPEX', metric: `(-) ${item.name}`, value: -item.value })),
            { group: 'Resultado', metric: '= EBITDA', value: ebitda },
            { group: 'Resultado', metric: '(-) Depreciação & Amortização', value: -monthlyAmortization },
            { group: 'Resultado', metric: '= EBIT (Lucro Operacional)', value: ebit },
            { group: 'Resultado', metric: '(-) Impostos', value: -taxes },
            { group: 'Resultado', metric: '= Resultado Líquido', value: netProfit },
        ];

        const csvHeader = '"Grupo","Métrica","Valor (BRL)"\n';
        const csvRows = dataToExport.map(row =>
            `"${row.group}","${row.metric}","${row.value.toFixed(2)}"`
        ).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_financeiro_mauax_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const currentRevenue = financialMetrics.totalRevenue;
    const revenuePercentage = REVENUE_TARGET > 0 ? (currentRevenue / REVENUE_TARGET) * 100 : 0;
    
    const currentProfit = financialMetrics.netProfit;
    const profitPercentage = PROFIT_TARGET > 0 ? (currentProfit / PROFIT_TARGET) * 100 : 0;

    return (
        <div className="space-y-6 mt-6">
            {/* View Toggle Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/60 p-5 rounded-xl border border-gray-800">
                <div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-sans">
                        <Wallet className="w-6 h-6 text-cyan-400" />
                        <span>ONS & ANEEL - Painel Financeiro & Tokenização</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                        Gerencie relatórios de receita corporativa ou acesse a carteira solar descentralizada CCEE / DREX / Pix.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto p-1 bg-gray-950 rounded-lg border border-gray-800">
                    <button
                        onClick={() => setActiveView('corporate')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            activeView === 'corporate' 
                                ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/10' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                        }`}
                    >
                        <Landmark className="w-3.5 h-3.5" />
                        <span>DRE Corporativo</span>
                    </button>
                    <button
                        onClick={() => setActiveView('wallet')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            activeView === 'wallet' 
                                ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/10' 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                        }`}
                    >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Carteira DREX & Pix Solar</span>
                    </button>
                </div>
            </div>

            {activeView === 'corporate' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardCard
                        title={t('financials.incomeStatement')}
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        className="lg:col-span-2"
                        action={
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t('financials.exportCSV')}
                            disabled={plantStatus !== PlantStatus.Online}
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            {t('financials.exportCSV')}
                        </button>
                        }
                    >
                        <div className="space-y-6">
                            {/* Key Financial Indicators Card-style Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono block mb-1">{t('financials.totalRevenue')}</span>
                                    <span className="text-xl font-bold text-amber-500 block">{formatCurrency(financialMetrics.totalRevenue)}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">Real-time dynamic</span>
                                </div>
                                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono block mb-1">{t('financials.grossProfit')}</span>
                                    <span className="text-xl font-bold text-emerald-500 block">{formatCurrency(financialMetrics.grossProfit)}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">Gross Margin: {((financialMetrics.grossProfit / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono block mb-1">{t('financials.profitEBITDA')}</span>
                                    <span className="text-xl font-bold text-cyan-400 block">{formatCurrency(financialMetrics.ebitda)}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">EBITDA Margin: {((financialMetrics.ebitda / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
                                    <span className="text-xs text-gray-400 font-mono block mb-1">{t('financials.netIncome')}</span>
                                    <span className={`text-xl font-bold block ${financialMetrics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(financialMetrics.netProfit)}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">After Taxes & Amortization</span>
                                </div>
                            </div>

                            {/* Detailed IFRS Spreadsheet Matrix */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-700 text-gray-400 bg-gray-800/30">
                                            <th className="py-2.5 px-3 font-semibold">IFRS Account Statement (DRE)</th>
                                            <th className="py-2.5 px-3 text-right font-semibold">Valores do Mês</th>
                                            <th className="py-2.5 px-3 text-right font-semibold">Representação %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800 text-gray-300">
                                        <tr className="bg-gray-900/10 font-medium">
                                            <td className="py-2 px-3 font-semibold text-gray-100 flex items-center gap-1.5">
                                                <TrendingUpIcon className="w-3.5 h-3.5 text-amber-500" />
                                                Faturamento Bruto (A receita total operacional)
                                            </td>
                                            <td className="py-2 px-3 text-right font-semibold text-amber-500">{formatCurrency(financialMetrics.totalRevenue)}</td>
                                            <td className="py-2 px-3 text-right text-gray-400">100.0%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 pl-8 text-gray-400 font-mono">(-) Custo do Combustível Vendido (CPV)</td>
                                            <td className="py-2 px-3 text-right text-red-400">-{formatCurrency(financialMetrics.totalOperatingCosts - (financialMetrics.totalOperatingCosts - (isOnline ? baseFuelCost * (powerOutput / baselinePower) : 0)))}</td>
                                            <td className="py-2 px-3 text-right text-gray-500">
                                                {(( (isOnline ? baseFuelCost * (powerOutput / baselinePower) : 0) / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-800/20 font-bold">
                                            <td className="py-2 px-3 pl-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Lucro Bruto Declarado
                                            </td>
                                            <td className="py-2 px-3 text-right text-emerald-400">{formatCurrency(financialMetrics.grossProfit)}</td>
                                            <td className="py-2 px-3 text-right text-emerald-500/80">{((financialMetrics.grossProfit / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 pl-8 text-gray-400 font-mono">(-) Manutenção de Equipamentos (OPEX)</td>
                                            <td className="py-2 px-3 text-right text-red-400">-{formatCurrency(isOnline ? 550000 : 0)}</td>
                                            <td className="py-2 px-3 text-right text-gray-500">{(((isOnline ? 550000 : 0) / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 pl-8 text-gray-400 font-mono">(-) Pessoal Operacional & Engenharia</td>
                                            <td className="py-2 px-3 text-right text-red-400">-{formatCurrency(isOnline ? 300000 : 0)}</td>
                                            <td className="py-2 px-3 text-right text-gray-500">{(((isOnline ? 300000 : 0) / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 pl-8 text-gray-400 font-mono">(-) OPEX Adicional dos Racks em Nuvem Ativos</td>
                                            <td className="py-2 px-3 text-right text-red-400">-{formatCurrency(isOnline ? activeRackCount * OPEX_PER_RACK_PER_MONTH : 0)}</td>
                                            <td className="py-2 px-3 text-right text-gray-500">
                                                {(((isOnline ? activeRackCount * OPEX_PER_RACK_PER_MONTH : 0) / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-800/30 font-bold">
                                            <td className="py-2 px-3 pl-4 text-cyan-400 font-semibold flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                Lucro Operacional EBITDA (LAJIDA)
                                            </td>
                                            <td className="py-2 px-3 text-right text-cyan-400">{formatCurrency(financialMetrics.ebitda)}</td>
                                            <td className="py-2 px-3 text-right text-cyan-500/80">{((financialMetrics.ebitda / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 pl-8 text-gray-400 font-mono">(-) Depreciação & Amortização Patrimonial</td>
                                            <td className="py-2 px-3 text-right text-red-400">-{formatCurrency(financialMetrics.monthlyAmortization)}</td>
                                            <td className="py-2 px-3 text-right text-gray-500">{((financialMetrics.monthlyAmortization / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr className="bg-gray-800/40">
                                            <td className="py-2 px-3 pl-4 text-gray-200 font-medium font-mono">Resultado Operacional EBIT (LAJIR)</td>
                                            <td className="py-2 px-3 text-right text-gray-200">{formatCurrency(financialMetrics.ebit)}</td>
                                            <td className="py-2 px-3 text-right text-gray-400">{((financialMetrics.ebit / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 pl-8 text-gray-400 font-mono">(-) Provisão de CSLL & IRPJ ({ (TAX_RATE * 100).toFixed(0) }%)</td>
                                            <td className="py-2 px-3 text-right text-red-400">-{formatCurrency(financialMetrics.taxes)}</td>
                                            <td className="py-2 px-3 text-right text-gray-500">{((financialMetrics.taxes / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr className="bg-emerald-500/10 font-extrabold text-sm border-t border-b border-emerald-500">
                                            <td className="py-3 px-3 text-emerald-400 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                RESULTADO LÍQUIDO DO EXERCÍCIO (Lucro Líquido)
                                            </td>
                                            <td className="py-3 px-3 text-right text-emerald-400">{formatCurrency(financialMetrics.netProfit)}</td>
                                            <td className="py-3 px-3 text-right text-emerald-400">{((financialMetrics.netProfit / (financialMetrics.totalRevenue || 1)) * 100).toFixed(1)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title={t('financials.revenueStreamsTitle')} icon={<ChartPieIcon className="w-6 h-6" />}>
                        <div className="h-64 flex flex-col justify-between">
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={financialMetrics.revenueStreamData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {financialMetrics.revenueStreamData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-400">
                                {financialMetrics.revenueStreamData.map((stream, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: stream.color }} />
                                        <span className="truncate max-w-[80px] text-[10px] block font-semibold text-gray-200">{stream.name}</span>
                                        <span className="font-mono text-gray-400">{formatCurrency(stream.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title={t('financials.costStructureTitle')} icon={<ChartPieIcon className="w-6 h-6" />}>
                        <div className="h-64 flex flex-col justify-between">
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={financialMetrics.costData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {financialMetrics.costData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-center text-[9px] text-gray-400">
                                {financialMetrics.costData.map((cost, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: cost.color }} />
                                        <span className="truncate max-w-[65px] text-[9px] block font-semibold text-gray-200">{cost.name}</span>
                                        <span className="font-mono text-gray-400">{formatCurrency(cost.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title={t('financials.monthlySummaryTitle')} icon={<ChartBarIcon className="w-6 h-6" />} className="lg:col-span-2">
                        <div className="h-80 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlySummaryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}/>
                                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
                                    <Area type="monotone" dataKey="revenue" name={t('financials.revenue')} stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="costs" name={t('financials.costs')} stroke="#ef4444" fillOpacity={1} fill="url(#colorCosts)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </DashboardCard>

                    <div className="space-y-6">
                        <DashboardCard title={t('financials.productionTargetsTitle')} icon={<BoltIcon className="w-6 h-6" />}>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                                        <span className="text-gray-300">{t('financials.revenueTarget')}</span>
                                        <span className="text-amber-500">{revenuePercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, revenuePercentage)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                                        <span>{formatCurrency(financialMetrics.totalRevenue)}</span>
                                        <span>Meta: {formatCurrency(REVENUE_TARGET)}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                                        <span className="text-gray-300">{t('financials.netProfitTarget')}</span>
                                        <span className="text-emerald-400">{profitPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, profitPercentage)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                                        <span>{formatCurrency(financialMetrics.netProfit)}</span>
                                        <span>Meta: {formatCurrency(PROFIT_TARGET)}</span>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title={t('financials.roiProjection')} icon={<TrendingUpIcon className="w-6 h-6" />}>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Taxa de Retorno de Investimento (ROI)</span>
                                    <span className="text-lg font-bold text-emerald-400">{roi.toFixed(1)}%</span>
                                </div>
                                <div className="h-1 bg-gray-850 w-full rounded" />
                                <div className="text-[10px] text-gray-400 font-sans leading-relaxed">
                                    O retorno do Capex investido para o comissionamento do site de Mauá (SP) está projetado com base no PLD flutuante e margem IFRS de servidores dedicados de inteligência artificial.
                                </div>
                            </div>
                        </DashboardCard>
                    </div>

                    <DashboardCard title={t('financials.cloudRevenueTitle')} icon={<ComputerDesktopIcon className="w-6 h-6" />}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Server className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-300 font-semibold">{t('financials.activeRacks')}</span>
                                </div>
                                <span className="text-sm font-extrabold text-white">{activeRackCount} Racks</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-gray-300 font-semibold">{t('financials.revenuePerRack')}</span>
                                </div>
                                <span className="text-sm font-extrabold text-white">{formatCurrency(REVENUE_PER_RACK_PER_MONTH)}/mês</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUpIcon className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs text-gray-300 font-semibold">{t('financials.grossRevenue')}</span>
                                </div>
                                <span className="text-sm font-extrabold text-cyan-400">{formatCurrency(cloudRevenue)}</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-gray-300 font-semibold">{t('financials.opexCosts')}</span>
                                </div>
                                <span className="text-sm font-extrabold text-red-400">-{formatCurrency(isOnline ? activeRackCount * OPEX_PER_RACK_PER_MONTH : 0)}</span>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title={t('financials.netProfitSummaryTitle')} icon={<ChartBarIcon className="w-6 h-6" />} className="lg:col-span-3">
                        <div className="h-80 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyNetProfitSummaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(0)}M`} />
                                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}/>
                                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                                    <Bar dataKey="revenue" name={t('financials.revenue')} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="totalCosts" name={t('financials.totalCostsWithTaxes')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="netProfit" name={t('financials.netProfit')} fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </DashboardCard>
                </div>
            ) : (
                /* CARTEIRA DIGITAL DREX & PIX SOLAR GENERATOR VIEW */
                <div className="space-y-6">
                    {/* Grid of Bento-Cards for Wallet Balances */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* DREX Balance Card */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-lg">
                            <div className="absolute top-0 right-0 p-8 opacity-5 bg-gradient-to-br from-cyan-400 to-transparent rounded-full transform translate-x-8 -translate-y-8" />
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        Blockchain DREX
                                    </span>
                                    <Coins className="w-5 h-5 text-cyan-400" />
                                </div>
                                <span className="text-xs text-gray-400 font-sans block">Saldo DREX (Digital Real)</span>
                                <h3 className="text-2xl font-black text-white font-sans mt-1">
                                    R$ {drexBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono mt-2 bg-gray-950/60 p-1 px-1.5 rounded border border-gray-850 select-all">
                                    <Lock className="w-3 h-3 text-gray-500 shrink-0" />
                                    <span className="truncate">{walletAddress}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-5">
                                <button
                                    onClick={() => {
                                        setTransferType('drex');
                                        setTransferAmount('');
                                        setTransferRecipient('');
                                        setTransferStatus('idle');
                                        setTransferLog([]);
                                        setShowTransferModal(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-gray-800 text-gray-200 hover:bg-gray-750 transition-all text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                                >
                                    <Send className="w-3 h-3 text-cyan-400" />
                                    <span>Transferir</span>
                                </button>
                                <button
                                    onClick={handleDrexToPixLiquidation}
                                    className="px-2.5 py-1.5 bg-cyan-500 text-gray-950 hover:bg-cyan-600 transition-all text-xs font-black rounded-lg flex items-center justify-center gap-1 shadow-md shadow-cyan-500/10"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>LiquidPix</span>
                                </button>
                            </div>
                        </div>

                        {/* e-kWh Tokenized Energy Card */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1">
                                        <Sun className="w-3 h-3 text-emerald-400" />
                                        Ativo de Geração (GD)
                                    </span>
                                    <Zap className="w-5 h-5 text-emerald-400 animate-bounce" style={{ animationDuration: '3s' }} />
                                </div>
                                <span className="text-xs text-gray-400 font-sans block">Saldo Tokens e-kWh</span>
                                <h3 className="text-2xl font-black text-white font-sans mt-1">
                                    {ekwhBalance.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs font-semibold text-gray-400 font-mono">e-kWh</span>
                                </h3>
                                <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                                    Representa energia solar gerada e homologada na CCEE para livre negociação no grid livre.
                                </p>
                            </div>
                            <div className="mt-5">
                                <button
                                    onClick={() => {
                                        const totalTokens = ekwhBalance;
                                        if (totalTokens <= 0) return;
                                        const payout = totalTokens * 0.70;
                                        setDrexBalance(prev => prev + payout);
                                        setEkwhBalance(0);
                                        const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
                                        setTransactions(prev => [{
                                            id: txId,
                                            timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
                                            type: 'CCEE_SALE',
                                            amount: payout,
                                            asset: 'Liquidação de Lote de e-kWh Tokens no Grid',
                                            status: 'completed',
                                            hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
                                        }, ...prev]);
                                        setLiveBlockLogs(prev => [`[CONVERT] Liquidado ${totalTokens.toFixed(1)} e-kWh para R$ ${payout.toFixed(2)} DREX via contrato de Balcão`, ...prev.slice(0, 15)]);
                                    }}
                                    disabled={ekwhBalance === 0}
                                    className="w-full px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-gray-950 font-black rounded-lg transition-all text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                                >
                                    <Coins className="w-3.5 h-3.5" />
                                    <span>Vender Tokens no Grid Livre</span>
                                </button>
                            </div>
                        </div>

                        {/* PIX Account Card */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-800/40 flex items-center gap-1">
                                        <QrCode className="w-3 h-3 text-purple-400" />
                                        Banco Central SPI
                                    </span>
                                    <Landmark className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-xs text-gray-400 font-sans block">Saldo Conta Corrente (Pix BRL)</span>
                                <h3 className="text-2xl font-black text-white font-sans mt-1">
                                    R$ {pixBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                                <p className="text-[10px] text-gray-500 mt-2">
                                    Líquido fiat imediato. Saque para qualquer banco brasileiro em segundos de forma auditada.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-5">
                                <button
                                    onClick={() => {
                                        setPixAmount('250');
                                        setPixQrValue('');
                                        setShowPixQrCode(true);
                                    }}
                                    className="px-2 py-1.5 bg-gray-800 text-gray-200 hover:bg-gray-750 transition-all text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                                >
                                    <QrCode className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Receber Pix</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setTransferType('pix');
                                        setTransferAmount('');
                                        setTransferRecipient('');
                                        setTransferStatus('idle');
                                        setTransferLog([]);
                                        setShowTransferModal(true);
                                    }}
                                    className="px-2 py-1.5 bg-purple-500 text-white hover:bg-purple-600 transition-all text-xs font-black rounded-lg flex items-center justify-center gap-1 shadow-md shadow-purple-500/10"
                                >
                                    <Send className="w-3 h-3" />
                                    <span>Enviar Pix</span>
                                </button>
                            </div>
                        </div>

                        {/* CCEE smartcontract connection */}
                        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                        isCCEEConnected 
                                            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' 
                                            : 'text-red-400 bg-red-950/40 border-red-800/40'
                                    }`}>
                                        <Database className="w-3 h-3" />
                                        {isCCEEConnected ? 'CCEE API: Conectada' : 'CCEE API: Offline'}
                                    </span>
                                    <button 
                                        onClick={() => setIsCCEEConnected(!isCCEEConnected)}
                                        title="Alternar Conexão com CCEE"
                                        className="text-gray-500 hover:text-white transition-all focus:outline-none"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <span className="text-xs text-gray-400 font-sans block">Protocolo de Negociação Livre</span>
                                <div className="mt-2 space-y-1 text-[11px] text-gray-300 font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Node:</span>
                                        <span className="text-gray-200">ccee-saopaulo-09</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Meters Sync:</span>
                                        <span className="text-emerald-400 font-semibold">2 Ativos Online</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">PLD Médio:</span>
                                        <span className="text-amber-500 font-bold">R$ 0,70/kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-950/60 p-2 rounded-lg border border-gray-850 text-[10px] text-gray-400 font-sans leading-tight mt-3">
                                <span className="text-amber-500 font-bold">CCEE Inteligência:</span> Agentes PF podem vender energia no Mercado de Grid Livre.
                            </div>
                        </div>

                    </div>

                    {/* DREX & Pix Phase 1 Integration Playground */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg space-y-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-cyan-400" />
                                    <span>Integração API DREX & Pix Real: Resolução dos Desafios (Fase 1)</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Playground interativo de conformidade regulatória para validadores e stakeholders. Homologado pelo Bacen, CCEE, ONS e ANEEL.
                                </p>
                            </div>
                            <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800 gap-1 overflow-x-auto max-w-full">
                                <button
                                    onClick={() => setSandboxTab('privacy')}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all whitespace-nowrap ${
                                        sandboxTab === 'privacy' ? 'bg-cyan-500 text-gray-950' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Sigilo (LC 105)
                                </button>
                                <button
                                    onClick={() => setSandboxTab('interop')}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all whitespace-nowrap ${
                                        sandboxTab === 'interop' ? 'bg-cyan-500 text-gray-950' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Swap DvP e-kWh
                                </button>
                                <button
                                    onClick={() => setSandboxTab('oracle')}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all whitespace-nowrap ${
                                        sandboxTab === 'oracle' ? 'bg-cyan-500 text-gray-950' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Oráculo IoT
                                </button>
                                <button
                                    onClick={() => setSandboxTab('stress')}
                                    className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all whitespace-nowrap ${
                                        sandboxTab === 'stress' ? 'bg-cyan-500 text-gray-950' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Loop & Stress Test
                                </button>
                            </div>
                        </div>

                        {/* TAB 1: PRIVACY & SECRECY */}
                        {sandboxTab === 'privacy' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <Lock className="w-4 h-4 text-cyan-400" />
                                        Desafio 1: Provas de Conhecimento Zero (ZK-Proofs) & LC 105
                                    </h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Para assegurar o **Sigilo Bancário (Lei Complementar nº 105)** na rede pública DREX, os saldos e valores transacionados não podem ficar visíveis a outros nós validadores da rede. 
                                        A plataforma MEX utiliza Provas de Conhecimento Zero (*Zero-Knowledge Proofs - ZKP*) e compromissos homomórficos para atestar a suficiência de fundos sem revelar o saldo real.
                                    </p>
                                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-850 font-mono text-[11px] space-y-1">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Algoritmo ZK:</span>
                                            <span className="text-gray-300">zk-SNARKs (Groth16)</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Curva Elíptica:</span>
                                            <span className="text-gray-300">alt_bn128 (BN254)</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Shielded Address:</span>
                                            <span className="text-cyan-400 truncate max-w-[150px]">{walletAddress}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleGeneratePrivacyProof}
                                        disabled={privacyProofStatus === 'generating'}
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-gray-950 font-black rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/10 focus:outline-none"
                                    >
                                        {privacyProofStatus === 'generating' ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Cunhando Prova Matemática...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span>Gerar Prova de Sigilo ZK-SNARK</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-gray-950 rounded-xl p-4 border border-gray-850 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500 font-mono block font-bold">CRIPTOGRAFIA PILOTO DREX (JSON SCHEMAS)</span>
                                        <div className="bg-black/40 p-3 rounded-lg border border-gray-800 font-mono text-[9px] text-gray-400 space-y-2">
                                            <div>
                                                <span className="text-cyan-400">{"{"}</span>
                                                <div className="pl-4">
                                                    <span className="text-purple-400">"proving_key"</span>: <span className="text-emerald-400">"0x9f3bc2...90ab"</span>,
                                                    <br />
                                                    <span className="text-purple-400">"commitment"</span>: <span className="text-emerald-400">"PedersenHash(SaldoDrex, BlindingFactor)"</span>,
                                                    <br />
                                                    <span className="text-purple-400">"compliance"</span>: <span className="text-amber-400">true</span>,
                                                    <br />
                                                    <span className="text-purple-400">"regulatory_audit_key"</span>: <span className="text-emerald-400">"0x027b...BacenAuditKey"</span>
                                                </div>
                                                <span className="text-cyan-400">{"}"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-800/40 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400">Status de Sigilo Bancário:</span>
                                        {privacyProofStatus === 'unproven' && (
                                            <span className="text-xs font-bold text-amber-500 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-full">
                                                Aguardando Prova
                                            </span>
                                        )}
                                        {privacyProofStatus === 'generating' && (
                                            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-2 py-0.5 rounded-full animate-pulse">
                                                Gerando Prova ZKP...
                                            </span>
                                        )}
                                        {privacyProofStatus === 'verified' && (
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Assinado e Verificado (LC 105 OK)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: INTEROPERABILITY (ATOMIC SWAP DVP) */}
                        {sandboxTab === 'interop' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <Coins className="w-4 h-4 text-cyan-400" />
                                        Desafio 2: Interoperabilidade e Troca Atômica DvP (e-kWh ➔ DREX)
                                    </h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        A fase de liquidação de ativos reais de energia exige que o token digital de energia `e-kWh` seja negociado por dinheiro DREX de forma simultânea e à prova de falhas (Delivery-versus-Payment). 
                                        Se a transação de DREX falhar, o token de energia é retornado. Ambas as pernas são executadas em uma única transação atômica.
                                    </p>
                                    <div className="flex gap-4 items-center bg-gray-950 p-3 rounded-lg border border-gray-850">
                                        <div className="flex-1">
                                            <label className="text-[9px] text-gray-500 uppercase font-mono block mb-1">Qtd para Troca (e-kWh)</label>
                                            <input
                                                type="number"
                                                value={interopAmount}
                                                onChange={(e) => setInteropAmount(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white font-mono font-bold focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] text-gray-500 uppercase font-mono block mb-1">Recebimento Estimado</label>
                                            <div className="text-xs font-mono font-bold text-emerald-400 pt-1.5">
                                                R$ {(parseFloat(interopAmount || '0') * 0.70).toFixed(2)} DREX
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleExecuteAtomicSwap}
                                        disabled={interopStatus === 'swapping' || !interopAmount || parseFloat(interopAmount) <= 0 || ekwhBalance < parseFloat(interopAmount)}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-gray-950 font-black rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 focus:outline-none"
                                    >
                                        {interopStatus === 'swapping' ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Aprovando Escrow de Troca...</span>
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4" />
                                                <span>Executar Troca Atômica DvP</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-gray-950 rounded-xl p-4 border border-gray-850 flex flex-col justify-between font-mono text-[9px]">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500 font-mono block font-bold">DREX HYPERLEDGER BESU RPC - SOLICITAÇÃO SWAP</span>
                                        <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-gray-400 space-y-1 overflow-x-auto">
                                            <div className="text-purple-400">POST /api/v1/drex/swap</div>
                                            <div>Host: node-central.bcb.gov.br</div>
                                            <div>Authorization: Bearer DrexJWT-Secured</div>
                                            <div className="text-gray-500 mt-2">// Request Body</div>
                                            <div>{"{"}</div>
                                            <div className="pl-4">
                                                <span className="text-purple-400">"asset_contract"</span>: <span className="text-emerald-400">"0x3eF581...DrexEnergyToken"</span>,
                                                <br />
                                                <span className="text-purple-400">"asset_amount"</span>: <span className="text-amber-400">{parseFloat(interopAmount || '0').toFixed(2)}</span>,
                                                <br />
                                                <span className="text-purple-400">"escrow_id"</span>: <span className="text-emerald-400">"0x98b88...DvP_Escrow"</span>,
                                                <br />
                                                <span className="text-purple-400">"payment_currency"</span>: <span className="text-emerald-400">"BRL_DREX"</span>,
                                                <br />
                                                <span className="text-purple-400">"recipient"</span>: <span className="text-emerald-400">"0x71C7656EC7ab88b098defB751B7401B5f6d1476B"</span>
                                            </div>
                                            <div>{"}"}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2.5 border-t border-gray-850 flex items-center justify-between text-gray-400 font-sans">
                                        <span>Status do Contrato DvP:</span>
                                        {interopStatus === 'idle' && <span className="text-[10px] font-bold text-gray-400 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-full">Pronto para Enviar</span>}
                                        {interopStatus === 'swapping' && <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-2 py-0.5 rounded-full animate-pulse">Sincronizando Dual Ledger...</span>}
                                        {interopStatus === 'swapped' && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-full">Swap Finalizado em Bloco</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: SECURE ORACLE (CCEE / SMART METERS) */}
                        {sandboxTab === 'oracle' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <Database className="w-4 h-4 text-cyan-400" />
                                        Desafio 3: Integridade de Dados por Oráculo IoT e Assinatura ECDSA
                                    </h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        A geração solar física deve ser homologada para evitar que agentes mintem tokens falsos sem de fato gerar eletricidade. 
                                        A plataforma MEX utiliza medidores inteligentes homologados pela ANEEL e integrados ao barramento CCEE que assinam digitalmente cada leitura na curva secp256k1 antes de despachar o dado à blockchain.
                                    </p>
                                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-850 text-xs font-mono space-y-1.5 text-gray-300">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Oráculo ID:</span>
                                            <span>CCEE-ORACLE-SP-09</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Hash do Bloco Anterior:</span>
                                            <span className="text-emerald-400">0x88f219d...e928</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Chave Pública do Meter:</span>
                                            <span className="text-purple-400 truncate max-w-[120px]">0x4b7e8281...884d</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsVerifyingOracle(true);
                                            setTimeout(() => {
                                                setIsVerifyingOracle(false);
                                                setLiveBlockLogs(prev => [
                                                    `[ORACLE-ECDSA] Leituras do SmartMeter SM-SP-88214 validadas criptograficamente: Assinatura R/S/V aprovada.`,
                                                    ...prev.slice(0, 15)
                                                ]);
                                            }, 1000);
                                        }}
                                        disabled={isVerifyingOracle}
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-gray-950 font-black rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/10 focus:outline-none"
                                    >
                                        {isVerifyingOracle ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Verificando Assinatura Elíptica...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="w-4 h-4" />
                                                <span>Autenticar Assinatura Digital do Smart Meter</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-gray-950 rounded-xl p-4 border border-gray-850 font-mono text-[9px] text-gray-400 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500 font-mono block font-bold">PAYLOAD ASSINADO DO SMART METER (ECDSA CRYPTO)</span>
                                        <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-gray-400 space-y-1 overflow-x-auto">
                                            <div>{"{"}</div>
                                            <div className="pl-4">
                                                <span className="text-purple-400">"meter_id"</span>: <span className="text-emerald-400">"SM-SP-88214-CCEE"</span>,
                                                <br />
                                                <span className="text-purple-400">"kwh_generated"</span>: <span className="text-amber-400">42.40</span>,
                                                <br />
                                                <span className="text-purple-400">"timestamp"</span>: <span className="text-amber-400">{Math.floor(Date.now() / 1000)}</span>,
                                                <br />
                                                <span className="text-purple-400">"signature_v"</span>: <span className="text-amber-400">27</span>,
                                                <br />
                                                <span className="text-purple-400">"signature_r"</span>: <span className="text-emerald-400">"0xe31b64e0df...a829f0"</span>,
                                                <br />
                                                <span className="text-purple-400">"signature_s"</span>: <span className="text-emerald-400">"0x5f98e29a88...c102a9"</span>
                                            </div>
                                            <div>{"}"}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-gray-500 flex justify-between items-center font-sans text-[10px]">
                                        <span>Validação por ECDSA Bridge:</span>
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Assinatura Válida (secp256k1)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: STRESS TESTING & LOOP RUNNER */}
                        {sandboxTab === 'stress' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <Zap className="w-4 h-4 text-cyan-400" />
                                        Desafio 4: Resiliência a Concorrência Extrema (Loop & Stress Testing)
                                    </h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Durante picos de faturamento de geração de múltiplos sites solares, a infraestrutura deve aguentar dezenas de conciliações simultâneas sem perder pacotes ou causar conflitos de concorrência. 
                                        Inicie o teste em loop abaixo para simular **100 transações de faturamento concomitantes** na rede de pagamentos Pix (SPI) e DREX.
                                    </p>
                                    
                                    {/* Progress indicator */}
                                    <div className="space-y-1.5 bg-gray-950 p-3 rounded-lg border border-gray-850">
                                        <div className="flex justify-between text-[11px] font-mono font-bold text-gray-400">
                                            <span>Progresso do Loop:</span>
                                            <span className="text-cyan-400">{stressProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-100"
                                                style={{ width: `${stressProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                            <span>Sucesso: {stressSuccessCount}/100</span>
                                            <span>Latência: {stressLatency > 0 ? `${stressLatency}ms` : 'Verificando...'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRunStressTest}
                                        disabled={isTestingStress}
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-gray-950 font-black rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/10 focus:outline-none"
                                    >
                                        {isTestingStress ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Executando Loop de Carga...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                <span>Iniciar Loop de Stress (100 Liquidações)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-gray-950 rounded-xl p-4 border border-gray-850 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500 font-mono block font-bold">TERMINAL DE TESTE DE CARGA (PATTERN 100% SUCCESS)</span>
                                        <div className="bg-black/40 p-3 rounded-lg border border-gray-800 font-mono text-[9px] text-emerald-400/90 h-44 overflow-y-auto space-y-1">
                                            {stressLog.map((log, index) => (
                                                <div key={index} className="leading-relaxed flex items-start gap-1">
                                                    <span className="text-emerald-600 shrink-0 select-none">&gt;</span>
                                                    <span>{log}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-gray-500 flex justify-between items-center font-sans text-[10px]">
                                        <span>Status de Stress:</span>
                                        {stressProgress === 100 ? (
                                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                100% Cobertura & Stress Aprovado
                                            </span>
                                        ) : isTestingStress ? (
                                            <span className="text-cyan-400 font-bold animate-pulse">
                                                Carga Concorrente Ativa...
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 font-bold">
                                                Pronto
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Solar Assets Management Console Card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-gray-800">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Sun className="w-5 h-5 text-amber-500" />
                                    Suas Instalações de Geração Distribuída (Ativos Solares GD)
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Instalações de microgeração homologadas. Leituras automáticas via smart meters vinculados ao grid livre CCEE.
                                </p>
                            </div>
                            <span className="text-xs font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
                                Capacidade Registrada Total: 65,5 kWp
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-gray-400 bg-gray-950/40 font-mono">
                                        <th className="py-3 px-4">Instalação Solar & Proprietário</th>
                                        <th className="py-3 px-4 text-center">Smart Meter ID</th>
                                        <th className="py-3 px-4 text-center">Capacidade (kWp)</th>
                                        <th className="py-3 px-4 text-center">Preço PLD</th>
                                        <th className="py-3 px-4 text-center">Status Grid</th>
                                        <th className="py-3 px-4 text-right">Geração Hoje (kWh)</th>
                                        <th className="py-3 px-4 text-right">Vendidos Grid</th>
                                        <th className="py-3 px-4 text-right">Tokenizado</th>
                                        <th className="py-3 px-4 text-center">Ação Comercial</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-850 text-gray-300">
                                    {solarAssets.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-gray-850/30 transition-all">
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-gray-100">{asset.name}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">{asset.owner}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono text-[11px] text-gray-400">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Server className="w-3.5 h-3.5 text-gray-500" />
                                                    <span>{asset.smartMeterId}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-gray-200">{asset.capacity.toFixed(1)}</td>
                                            <td className="py-3.5 px-4 text-center font-semibold text-amber-500">R$ {asset.pldPrice.toFixed(2)}/kWh</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    asset.status === 'online' 
                                                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                                                        : asset.status === 'maintenance'
                                                        ? 'bg-amber-950/30 text-amber-400 border-amber-900/40'
                                                        : 'bg-red-950/30 text-red-400 border-red-900/40'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        asset.status === 'online' 
                                                            ? 'bg-emerald-400 animate-pulse' 
                                                            : asset.status === 'maintenance'
                                                            ? 'bg-amber-400'
                                                            : 'bg-red-400'
                                                    }`} />
                                                    {asset.status === 'online' ? 'Online' : asset.status === 'maintenance' ? 'Manutenção' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-gray-200">{asset.todayGen > 0 ? `${asset.todayGen.toFixed(1)} kWh` : '-'}</td>
                                            <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{asset.todaySold > 0 ? `${asset.todaySold.toFixed(1)} kWh` : '-'}</td>
                                            <td className="py-3.5 px-4 text-right font-mono text-cyan-400 font-bold">{asset.tokenizedEnergy.toFixed(1)} e-kWh</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleSellExcess(asset.id)}
                                                        disabled={asset.status !== 'online' || isSellingExcess || !isCCEEConnected}
                                                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-950 text-[10px] font-black rounded transition-all flex items-center gap-1 focus:outline-none"
                                                    >
                                                        {isSellingExcess && sellingAssetId === asset.id ? (
                                                            <>
                                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                                <span>Vendendo...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Zap className="w-3 h-3" />
                                                                <span>Vender Grid</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleTokenizeEnergy(asset.id)}
                                                        disabled={asset.status !== 'online' || isTokenizing || !isCCEEConnected}
                                                        className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-950 text-[10px] font-black rounded transition-all flex items-center gap-1 focus:outline-none"
                                                    >
                                                        {isTokenizing && tokenizingAssetId === asset.id ? (
                                                            <>
                                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                                <span>Cunhando...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Coins className="w-3 h-3" />
                                                                <span>Tokenizar</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Two Column Layout: Ledger History & Real-Time Blockchain Logs */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Transactions Ledger */}
                        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                                    <History className="w-4 h-4 text-cyan-400" />
                                    Histórico de Transações (DREX & Pix Ledger)
                                </h3>
                                <span className="text-[10px] text-gray-500 font-mono">CCEE-DREX Ledger v1.0.3</span>
                            </div>

                            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800/40 hover:border-gray-850 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                tx.type === 'CCEE_SALE' 
                                                    ? 'bg-amber-950/40 text-amber-400' 
                                                    : tx.type === 'TOKENIZE'
                                                    ? 'bg-cyan-950/40 text-cyan-400'
                                                    : tx.type === 'PIX_DEPOSIT' || tx.type === 'DREX_RECEIVE'
                                                    ? 'bg-emerald-950/40 text-emerald-400'
                                                    : 'bg-purple-950/40 text-purple-400'
                                            }`}>
                                                {tx.type === 'CCEE_SALE' && <Zap className="w-4 h-4" />}
                                                {tx.type === 'TOKENIZE' && <Coins className="w-4 h-4" />}
                                                {(tx.type === 'PIX_DEPOSIT' || tx.type === 'DREX_RECEIVE') && <ArrowDownLeft className="w-4 h-4" />}
                                                {(tx.type === 'PIX_CASHOUT' || tx.type === 'DREX_SEND') && <ArrowUpRight className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-extrabold text-gray-200">
                                                        {tx.type === 'CCEE_SALE' && 'Venda de Excedente Solar'}
                                                        {tx.type === 'TOKENIZE' && 'Cunhagem e-kWh Tokens'}
                                                        {tx.type === 'PIX_DEPOSIT' && 'Depósito via Pix'}
                                                        {tx.type === 'PIX_CASHOUT' && 'Resgate Pix / Saque'}
                                                        {tx.type === 'DREX_SEND' && 'Envio de DREX'}
                                                        {tx.type === 'DREX_RECEIVE' && 'Recebimento de DREX'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 font-mono">({tx.id})</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">{tx.asset}</div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-1">{tx.timestamp}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${
                                                tx.type === 'CCEE_SALE' || tx.type === 'TOKENIZE' || tx.type === 'PIX_DEPOSIT' || tx.type === 'DREX_RECEIVE'
                                                    ? 'text-emerald-400' 
                                                    : 'text-purple-400'
                                            }`}>
                                                {tx.type === 'CCEE_SALE' || tx.type === 'TOKENIZE' || tx.type === 'PIX_DEPOSIT' || tx.type === 'DREX_RECEIVE' ? '+' : '-'}
                                                {tx.type === 'TOKENIZE' ? `${tx.amount.toFixed(1)} e-kWh` : `R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            </div>
                                            <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 font-mono mt-1">
                                                <span>Hash: {tx.hash}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Real-time ConsensNode Log Explorer */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                                        <Server className="w-4 h-4 text-emerald-400" />
                                        Consensus Engine & Oracles (DREX Ledger)
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded text-[9px] font-bold font-mono">
                                        Active Node
                                    </span>
                                </div>
                                
                                <p className="text-[10px] text-gray-400 mb-3 leading-tight font-sans">
                                    Histórico de transações autenticadas na blockchain piloto do DREX (Digital Real) pelo oráculo oficial da CCEE.
                                </p>

                                <div className="bg-black/80 rounded-lg p-3 border border-gray-800 font-mono text-[9px] text-emerald-400/90 space-y-1.5 h-64 overflow-y-auto">
                                    {liveBlockLogs.map((log, index) => (
                                        <div key={index} className="leading-normal flex items-start gap-1">
                                            <span className="text-emerald-600 shrink-0 select-none">&gt;&gt;</span>
                                            <span className="break-all">{log}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const randomBlock = Math.floor(15948302 + Math.random() * 50000);
                                    const txHash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
                                    const randomMessages = [
                                        `Consultando contrato inteligente DREX_Consensus...OK`,
                                        `Bloco #${randomBlock} minerado com sucesso! Validadores assinaram. Hash: ${txHash}`,
                                        `Validação de token verde e-kWh: Oráculo CCEE emitiu atestado homologado`,
                                        `SmartMeter autenticado com chave pública d37e89...907e`,
                                        `Sincronismo de canal de ordens de venda da CCEE verificado`
                                    ];
                                    setLiveBlockLogs(prev => [randomMessages[Math.floor(Math.random() * randomMessages.length)], ...prev]);
                                }}
                                className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-750 transition-all text-xs font-bold text-gray-300 rounded-lg flex items-center justify-center gap-2 border border-gray-750 focus:outline-none"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
                                <span>Simular Chamada de Oráculo CCEE</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL 1: Pix QR Code Generator */}
            {showPixQrCode && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 transition-all">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
                        <button 
                            onClick={() => setShowPixQrCode(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all p-1 focus:outline-none"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-5">
                            <div className="w-12 h-12 bg-purple-950/50 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-900/30">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-black text-white">Receber via Pix (Adicionar Saldo)</h3>
                            <p className="text-xs text-gray-400 mt-1">Crie um QR Code dinâmico Pix para carregar ou receber em sua carteira.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-mono font-bold block mb-1">Valor (BRL)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold font-mono">R$</span>
                                    <input
                                        type="number"
                                        value={pixAmount}
                                        onChange={(e) => setPixAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-mono font-bold block mb-1">Chave Pix Proprietária</label>
                                <input
                                    type="text"
                                    value={pixKey}
                                    onChange={(e) => setPixKey(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1.5 px-3 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition-all"
                                />
                            </div>

                            <button
                                onClick={handleGeneratePixQr}
                                className="w-full py-2 bg-purple-500 hover:bg-purple-600 transition-all text-white font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/15 focus:outline-none"
                            >
                                <QrCode className="w-4 h-4" />
                                <span>Gerar QR Code Pix Dinâmico</span>
                            </button>

                            {pixQrValue && (
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-850 mt-4 flex flex-col items-center">
                                    {/* Mock visually striking QR Code block */}
                                    <div className="bg-white p-3 rounded-xl mb-3 relative group">
                                        <div className="w-40 h-40 flex flex-col items-center justify-center border-4 border-gray-950/10 p-1 bg-white relative">
                                            {/* Beautiful stylized QR representation */}
                                            <div className="grid grid-cols-5 gap-1.5 w-full h-full">
                                                <div className="bg-black rounded-sm" /><div className="bg-black rounded-sm" /><div className="bg-gray-200" /><div className="bg-black rounded-sm" /><div className="bg-black rounded-sm" />
                                                <div className="bg-black rounded-sm" /><div className="bg-gray-200" /><div className="bg-black rounded-sm" /><div className="bg-gray-200" /><div className="bg-black rounded-sm" />
                                                <div className="bg-gray-200" /><div className="bg-black rounded-sm" /><div className="bg-black rounded-sm" /><div className="bg-black rounded-sm" /><div className="bg-gray-200" />
                                                <div className="bg-black rounded-sm" /><div className="bg-gray-200" /><div className="bg-black rounded-sm" /><div className="bg-gray-200" /><div className="bg-black rounded-sm" />
                                                <div className="bg-black rounded-sm" /><div className="bg-black rounded-sm" /><div className="bg-gray-200" /><div className="bg-black rounded-sm" /><div className="bg-black rounded-sm" />
                                            </div>
                                            <div className="absolute inset-0 bg-white/5 flex items-center justify-center" />
                                            <div className="absolute w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center border-2 border-white text-[10px] font-black text-white select-none">
                                                PIX
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full">
                                        <span className="text-[10px] text-gray-500 block text-center mb-1 font-mono">Código Copia-e-Cola do Pix</span>
                                        <div className="bg-gray-900 border border-gray-850 p-1.5 rounded-lg text-[9px] font-mono text-gray-400 break-all select-all text-center">
                                            {pixQrValue.slice(0, 35)}...{pixQrValue.slice(-15)}
                                        </div>
                                    </div>

                                    {/* Action to simulate receipt instantly */}
                                    <button
                                        onClick={() => {
                                            const amt = parseFloat(pixAmount || '100');
                                            setPixBalance(prev => prev + amt);
                                            
                                            const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
                                            const newTx: WalletTransaction = {
                                                id: txId,
                                                timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
                                                type: 'PIX_DEPOSIT',
                                                amount: amt,
                                                asset: 'Carga via Pix Dinâmico',
                                                status: 'completed',
                                                hash: 'PIX-E' + Math.floor(10000000 + Math.random() * 90000000)
                                            };
                                            setTransactions(prev => [newTx, ...prev]);
                                            setLiveBlockLogs(prev => [`[PIX] Pagamento Pix Dinâmico de R$ ${amt.toFixed(2)} recebido e liquidado`, ...prev.slice(0, 15)]);
                                            setShowPixQrCode(false);
                                        }}
                                        className="w-full mt-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black rounded-lg text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 focus:outline-none"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Simular Liquidação Imediata</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: Transfer DREX / Pix */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 transition-all">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
                        <button 
                            onClick={() => setShowTransferModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all p-1 focus:outline-none"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-5">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border ${
                                transferType === 'drex' 
                                    ? 'bg-cyan-950/50 text-cyan-400 border-cyan-900/30' 
                                    : 'bg-purple-950/50 text-purple-400 border-purple-900/30'
                            }`}>
                                <Send className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-black text-white">
                                {transferType === 'drex' ? 'Transferência de Digital Real (DREX)' : 'Transferência via Pix (BRL)'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Envie recursos instantaneamente. A transação é gravada e liquidada nos canais autorizados.
                            </p>
                        </div>

                        {transferStatus === 'idle' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-mono font-bold block mb-1">Valor do Lançamento</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold font-mono">
                                            {transferType === 'drex' ? 'DREX' : 'R$'}
                                        </span>
                                        <input
                                            type="number"
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1.5 pl-14 pr-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500 transition-all"
                                        />
                                    </div>
                                    <div className="text-right text-[9px] text-gray-500 mt-1">
                                        Saldo Disponível: {transferType === 'drex' ? `${drexBalance.toFixed(2)} DREX` : `R$ ${pixBalance.toFixed(2)}`}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-mono font-bold block mb-1">
                                        {transferType === 'drex' ? 'Endereço da Carteira DREX Destinatária' : 'Chave Pix (CPF/E-mail/Telefone)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={transferRecipient}
                                        onChange={(e) => setTransferRecipient(e.target.value)}
                                        placeholder={transferType === 'drex' ? '0x...' : 'ex: joao@ccee.com.br'}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-1.5 px-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleTransferSubmit}
                                    disabled={!transferAmount || parseFloat(transferAmount) <= 0 || (transferType === 'drex' ? parseFloat(transferAmount) > drexBalance : parseFloat(transferAmount) > pixBalance)}
                                    className={`w-full py-2 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md ${
                                        transferType === 'drex'
                                            ? 'bg-cyan-500 hover:bg-cyan-600 text-gray-950 shadow-cyan-500/10'
                                            : 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/10'
                                    } disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none`}
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Confirmar Transferência</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-black/60 border border-gray-850 p-4 rounded-xl font-mono text-[10px] text-emerald-400 leading-relaxed h-44 overflow-y-auto">
                                    {transferLog.map((log, i) => (
                                        <div key={i} className="flex gap-1.5 mb-1 items-start">
                                            <span className="text-emerald-600 shrink-0 select-none">&gt;&gt;</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                    {transferStatus === 'processing' && (
                                        <div className="flex items-center gap-1.5 text-gray-400 mt-2">
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                            <span>Aguardando assinaturas da rede blockchain...</span>
                                        </div>
                                    )}
                                </div>

                                {transferStatus === 'success' && (
                                    <div className="text-center">
                                        <div className="text-emerald-400 font-bold text-sm mb-3 flex items-center justify-center gap-1.5">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            <span>Transação Liquidada com Sucesso!</span>
                                        </div>
                                        <button
                                            onClick={() => setShowTransferModal(false)}
                                            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-750 transition-all text-xs font-bold text-gray-300 rounded-lg mx-auto block focus:outline-none"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Financials;
