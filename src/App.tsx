import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  FileText,
  DollarSign,
  Navigation,
  Settings,
  Code,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  Plus,
  Compass,
  Database,
  Layers,
  Send,
  ShieldCheck,
  Globe,
  Trash2,
  Eye,
  Check,
  X,
  Crosshair,
  ArrowRight,
  TrendingUp,
  Radio,
  Sliders,
  Receipt,
  Map,
  Copy,
  ChevronDown,
  ChevronUp,
  Bell,
  Search,
  Star,
  Wallet,
  FileCheck,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Smartphone,
  ScanFace,
  CreditCard,
  LocateFixed,
  Award,
  Clock,
  History,
  AlertCircle,
  Zap,
  Lock,
  Unlock,
  Activity,
  CheckCircle2,
  FolderArchive,
  Download,
  ExternalLink,
  Share2,
  Sparkles
} from 'lucide-react';
import { dispatchEngine, type RideRecord, type RespostaSucessoCorrida, type RespostaRecusaCorrida, type PollingStatus } from './services/dispatchEngine.ts';
import L from 'leaflet';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

declare global {
  interface Window {
    google: any;
    googleMapsBillingError?: boolean;
    gm_authFailure?: () => void;
  }
}

// Helper para resolver caminhos de ativos em servidores locais, domínios e GitHub Pages (base relativa)
export const getAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

export const STRUCTURED_ASSETS = [
  {
    id: 'dashboard-preview',
    name: 'Prévia Oficial do Painel Executivo',
    description: 'Interface de telemetria, mapa em tempo real da frota e métricas executivas do MobiDrive.',
    category: 'Interface & Preview',
    path: 'assets/images/dashboard-preview.jpg',
    type: 'JPG 16:9 (Alta Resolução)',
    usage: 'Banner Executivo, OpenGraph Social Card e Prévia Visual'
  },
  {
    id: 'logo-brand',
    name: 'Logomarca Oficial MobiDrive',
    description: 'Identidade visual corporativa com monograma M esmeralda e vetor aerodinâmico.',
    category: 'Branding & Identidade',
    path: 'assets/images/logo.png',
    type: 'PNG 1:1 (512x512)',
    usage: 'Barra Lateral, Cabeçalho e PWA Web App Manifest'
  },
  {
    id: 'favicon-vector',
    name: 'Favicon Vetorial SVG & ICO',
    description: 'Ícone de alta fidelidade escalável para abas do navegador e atalhos de aplicativo.',
    category: 'Ícone / Favicon',
    path: 'favicon.svg',
    type: 'SVG Vector',
    usage: 'Favicon do Navegador & PWA Web App'
  },
  {
    id: 'cnh-sample-doc',
    name: 'Documento Modelo CNH (OCR Nacional)',
    description: 'Amostra oficial Carteira Nacional de Habilitação estruturada para validação imediata de OCR.',
    category: 'Documentos / OCR',
    path: 'assets/images/cnh-sample-doc.jpg',
    type: 'JPG 4:3 (Documental)',
    usage: 'Módulo de Reconhecimento de Motorista & Leitor de CNH'
  },
  {
    id: 'admin-director',
    name: 'Avatar da Diretoria / Super Admin',
    description: 'Foto do diretor de operações para identificação e perfil do painel administrativo.',
    category: 'Avatares / Gestão',
    path: 'assets/images/admin-director.jpg',
    type: 'JPG 1:1 (Retrato)',
    usage: 'Cabeçalho Superior e Controle de Sessão'
  },
  {
    id: 'vehicle-sedan',
    name: 'Veículo Modelo Sedan da Frota',
    description: 'Fotografia de referência de veículo executivo para catálogo de transporte.',
    category: 'Veículos / Catálogo',
    path: 'assets/images/vehicle-sedan.jpg',
    type: 'JPG 4:3 (Estúdio)',
    usage: 'Aba Transport Services & Detalhes de Veículos'
  },
  {
    id: 'vehicles-vector-sedan',
    name: 'Ícone Vetorial - Sedan',
    description: 'Silhueta vetorial moderna para categoria Sedan.',
    category: 'Vetores / Veículos',
    path: 'assets/images/vehicles/sedan.svg',
    type: 'SVG Vector',
    usage: 'Tabelas, Despacho e Marcadores de Categoria'
  },
  {
    id: 'vehicles-vector-hatchback',
    name: 'Ícone Vetorial - Hatchback',
    description: 'Silhueta vetorial moderna para categoria Hatchback.',
    category: 'Vetores / Veículos',
    path: 'assets/images/vehicles/hatchback.svg',
    type: 'SVG Vector',
    usage: 'Tabelas, Despacho e Marcadores de Categoria'
  },
  {
    id: 'vehicles-vector-suv',
    name: 'Ícone Vetorial - SUV',
    description: 'Silhueta vetorial moderna para categoria SUV.',
    category: 'Vetores / Veículos',
    path: 'assets/images/vehicles/suv.svg',
    type: 'SVG Vector',
    usage: 'Tabelas, Despacho e Marcadores de Categoria'
  },
  {
    id: 'vehicles-vector-moto',
    name: 'Ícone Vetorial - Motocicleta',
    description: 'Silhueta vetorial moderna para entregas e corridas rápidas.',
    category: 'Vetores / Veículos',
    path: 'assets/images/vehicles/moto.svg',
    type: 'SVG Vector',
    usage: 'Tabelas, Despacho e Marcadores de Categoria'
  },
  {
    id: 'vehicles-vector-premium',
    name: 'Ícone Vetorial - Premium / Black',
    description: 'Silhueta vetorial elegante para categoria Premium.',
    category: 'Vetores / Veículos',
    path: 'assets/images/vehicles/premium.svg',
    type: 'SVG Vector',
    usage: 'Tabelas, Despacho e Marcadores de Categoria'
  },
  {
    id: 'map-marker-car',
    name: 'Marcador GPS de Veículo em Trânsito',
    description: 'Marcador neon esmeralda com pulso para mapas Google e Leaflet.',
    category: 'Cartografia / GPS',
    path: 'assets/images/maps/marker-car.svg',
    type: 'SVG Vector',
    usage: 'Plotagem de Veículos nos Mapas'
  },
  {
    id: 'map-marker-central',
    name: 'Marcador GPS da Central Operacional',
    description: 'Marcador azul com anel concêntrico para localização exata da base de operações.',
    category: 'Cartografia / GPS',
    path: 'assets/images/maps/marker-central.svg',
    type: 'SVG Vector',
    usage: 'Plotagem da Central nos Mapas'
  }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'drivers' | 'vehicles' | 'routes' | 'tarifas' | 'database' | 'credits' | 'despacho'>('dashboard');
  const [previewAssetModal, setPreviewAssetModal] = useState<any | null>(null);

  // --- SISTEMA DE DESPACHO REATIVO, INDEXEDDB & TRAVA ANTI-CONCORRÊNCIA ---
  const [pedidosAtivos, setPedidosAtivos] = useState<RideRecord[]>([]);
  const [corridasEmAndamento, setCorridasEmAndamento] = useState<RideRecord[]>([]);
  const [ridePlatformRides, setRidePlatformRides] = useState<RideRecord[]>([]);
  const [pollingStatus, setPollingStatus] = useState<PollingStatus>({
    ativo: true,
    appsScriptUrl: '',
    ultimaAtualizacao: null,
    totalAtivos: 0,
    totalEmAndamento: 0,
    latenciaMs: 0,
    erros: 0
  });
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [dispatchLogs, setDispatchLogs] = useState<Array<{
    id: string;
    tipo: 'aceite_sucesso' | 'bloqueio_recusa' | 'novo_pedido' | 'corrida_finalizada' | 'cache_limpo' | 'polling_sync';
    mensagem: string;
    timestamp: string;
    dados?: any;
  }>>([]);
  // Concurrency battle test state
  const [selectedRideForConcurrency, setSelectedRideForConcurrency] = useState<string | number>('');
  const [concurrencyDriver1, setConcurrencyDriver1] = useState<string | number>('');
  const [concurrencyDriver2, setConcurrencyDriver2] = useState<string | number>('');
  const [isTestingConcurrency, setIsTestingConcurrency] = useState(false);
  const [concurrencyBattleResult, setConcurrencyBattleResult] = useState<{
    vencedor?: RespostaSucessoCorrida;
    rejeitado?: RespostaRecusaCorrida;
    diffMs?: number;
    timestamp: string;
  } | null>(null);

  // Formulário para despachar corrida com dados reais dinâmicos
  const [novoDespacho, setNovoDespacho] = useState({
    passengerName: '',
    origemEndereco: '',
    origemLat: 0,
    origemLng: 0,
    destinoEndereco: '',
    destinoLat: 0,
    destinoLng: 0,
    valor: 20
  });
  const [despachandoNova, setDespachandoNova] = useState(false);

  // Stats State (starts strictly at 0)
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalRides: 0,
    totalRevenue: 0
  });

  // Database Records
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: []
  });

  // Table filter state
  const [driverFilter, setDriverFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Base de Tarifas State (Starts strictly at 0, fully manual editable)
  const [tarifas, setTarifas] = useState<{
    taxaBase: number;
    valorPorKm: number;
    taxaPorMinuto: number;
    taxaCancelamento: number;
    taxaMinima: number;
    categorias: { [key: string]: { taxaBase: number; valorPorKm: number } };
    pontosEspecificos: any[];
  }>({
    taxaBase: 0,
    valorPorKm: 0,
    taxaPorMinuto: 0,
    taxaCancelamento: 0,
    taxaMinima: 0,
    categorias: {
      Sedan: { taxaBase: 0, valorPorKm: 0 },
      Hatchback: { taxaBase: 0, valorPorKm: 0 },
      SUV: { taxaBase: 0, valorPorKm: 0 },
      Moto: { taxaBase: 0, valorPorKm: 0 },
      Premium: { taxaBase: 0, valorPorKm: 0 }
    },
    pontosEspecificos: []
  });

  // Tariff Form Inputs
  const [taxaBaseInput, setTaxaBaseInput] = useState<number>(0);
  const [valorPorKmInput, setValorPorKmInput] = useState<number>(0);
  const [taxaPorMinutoInput, setTaxaPorMinutoInput] = useState<number>(0);
  const [taxaCancelamentoInput, setTaxaCancelamentoInput] = useState<number>(0);
  const [taxaMinimaInput, setTaxaMinimaInput] = useState<number>(0);
  const [savingTarifas, setSavingTarifas] = useState(false);

  // Dynamic Point Form Inputs (for drawing on map)
  const [pontoNome, setPontoNome] = useState('');
  const [pontoLat, setPontoLat] = useState<number>(0);
  const [pontoLng, setPontoLng] = useState<number>(0);
  const [pontoRaio, setPontoRaio] = useState<number>(500);
  const [pontoTaxaAdicional, setPontoTaxaAdicional] = useState<number>(0);
  const [pontoTipo, setPontoTipo] = useState<'ponto_embarque' | 'geocerca' | 'aeroporto' | 'zona_especial'>('ponto_embarque');
  const [savingPonto, setSavingPonto] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Reconhecimento de IP & Localização Google Maps
  const [detectedLocation, setDetectedLocation] = useState<{
    ip: string;
    lat: number;
    lng: number;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    pais: string;
    cep?: string;
    enderecoFormatado: string;
    provedorInternet?: string;
    fonte: string;
  } | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);

  // Config State (Internal only - NEVER shown on UI)
  const [gasUrl, setGasUrl] = useState('');

  // Driver Form
  const [driverName, setDriverName] = useState('');
  const [driverCpf, setDriverCpf] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [cnhFile, setCnhFile] = useState<File | null>(null);
  const [cnhBase64, setCnhBase64] = useState('');
  const [cnhPreview, setCnhPreview] = useState('');
  const [driverLat, setDriverLat] = useState<number | null>(null);
  const [driverLng, setDriverLng] = useState<number | null>(null);
  const [loadingReg, setLoadingReg] = useState(false);
  const [ocrModalData, setOcrModalData] = useState<any>(null);

  // Vehicle Form Modal
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('Sedan');
  const [newVehicleCost, setNewVehicleCost] = useState('0.00');
  const [newVehicleDriverId, setNewVehicleDriverId] = useState('');

  // Route Calculator
  const [partidaLat, setPartidaLat] = useState<number>(0.0);
  const [partidaLng, setPartidaLng] = useState<number>(0.0);
  const [destinoLat, setDestinoLat] = useState<number>(0.0);
  const [destinoLng, setDestinoLng] = useState<number>(0.0);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Map Engine & Billing Error State Management
  const [billingNotice, setBillingNotice] = useState<boolean>(false);
  const [mapEngine, setMapEngine] = useState<'hybrid' | 'leaflet' | 'google'>('hybrid');

  // Dashboard Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletVehiclesLayerRef = useRef<L.LayerGroup | null>(null);
  const leafletCentralMarkerRef = useRef<L.Marker | null>(null);
  const leafletRoutePolylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);

  // Tarifas Map Refs
  const tarifasMapContainerRef = useRef<HTMLDivElement>(null);
  const tarifasMapInstanceRef = useRef<any>(null);
  const leafletTarifasMapRef = useRef<L.Map | null>(null);
  const leafletTarifasLayerRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<any>(null);
  const tempCircleRef = useRef<any>(null);
  const pontosMarkersRef = useRef<any[]>([]);
  const pontosCirclesRef = useRef<any[]>([]);

  // Live GPS tracking status (Dispositivo genérico)
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState('');

  // CENTRAL REAL-TIME LOCATION & PERMISSION FLOW (REQUISITO DA CENTRAL)
  const [showCentralPermissionModal, setShowCentralPermissionModal] = useState(false);
  const [isCentralTrackingActive, setIsCentralTrackingActive] = useState(false);
  const [centralLocation, setCentralLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    enderecoFormatado?: string;
    ultimoEnvio?: string;
  } | null>(null);
  const [centralWatchId, setCentralWatchId] = useState<number | null>(null);

  // SISTEMA DE RECONHECIMENTO & PERFIL DO MOTORISTA
  const [showDriverRecognitionModal, setShowDriverRecognitionModal] = useState(false);
  const [selectedDriverForRecognition, setSelectedDriverForRecognition] = useState<any | null>(null);
  const [recognitionSearchTerm, setRecognitionSearchTerm] = useState('');

  // SISTEMA DE RECARGA DE CRÉDITO DO MOTORISTA
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [driverForCredit, setDriverForCredit] = useState<any | null>(null);
  const [creditAmount, setCreditAmount] = useState<number | string>('50');
  const [creditType, setCreditType] = useState<'credito' | 'debito'>('credito');
  const [creditNote, setCreditNote] = useState('Recarga de Saldo');
  const [submittingCredit, setSubmittingCredit] = useState(false);

  // SOLICITAÇÕES DE RECARGA DE CRÉDITO DOS MOTORISTAS (0 SIMULAÇÃO - BANCO REAL)
  const [creditRequests, setCreditRequests] = useState<any[]>([]);
  const [creditFilter, setCreditFilter] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all');
  const [creditSearch, setCreditSearch] = useState('');
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [showNewCreditRequestModal, setShowNewCreditRequestModal] = useState(false);
  const [reqDriverId, setReqDriverId] = useState<string>('');
  const [reqValor, setReqValor] = useState<number | string>(50);
  const [reqMetodo, setReqMetodo] = useState<string>('PIX');
  const [reqObs, setReqObs] = useState<string>('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Escuta erros de autenticação ou falta de faturamento do Google Maps
  useEffect(() => {
    const handleBillingError = () => {
      console.warn('Google Maps billing error caught in React. Switching to high-performance vector map engine.');
      setBillingNotice(true);
      setMapEngine('leaflet');
    };

    window.addEventListener('google-maps-billing-error', handleBillingError);
    if (window.googleMapsBillingError) {
      handleBillingError();
    }

    return () => {
      window.removeEventListener('google-maps-billing-error', handleBillingError);
    };
  }, []);

  // Fallback e sincronização local para publicação estática no GitHub Pages
  const syncFromLocalStorageFallback = () => {
    try {
      const saved = localStorage.getItem('mobidrive_offline_store');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.drivers && data.drivers.length > 0) setDrivers(data.drivers);
        if (data.vehicles && data.vehicles.length > 0) setVehicles(data.vehicles);
        if (data.stats) setStats(data.stats);
        if (data.tarifas) {
          setTarifas(data.tarifas);
          setTaxaBaseInput(data.tarifas.taxaBase || 0);
          setValorPorKmInput(data.tarifas.valorPorKm || 0);
          setTaxaPorMinutoInput(data.tarifas.taxaPorMinuto || 0);
          setTaxaCancelamentoInput(data.tarifas.taxaCancelamento || 0);
          setTaxaMinimaInput(data.tarifas.taxaMinima || 0);
        }
        if (data.creditRequests) setCreditRequests(data.creditRequests);
        if (data.centralLocation) setCentralLocation(data.centralLocation);
        return;
      }

      // Seed inicial robusto para GitHub Pages garantindo visual e funções 100% integradas
      const seedDrivers = [
        {
          id: 1,
          nome: 'Pedro Henrique Silva Almeida',
          cpf: '123.456.789-00',
          vehicleType: 'Sedan',
          rating: 4.95,
          walletBalance: 150.00,
          status: 'Aprovado_Auto',
          validadeCnh: '2028-12-31',
          lat: -23.55052,
          lng: -46.633308,
          enderecoAtual: 'Av. Paulista, São Paulo - SP',
          ipConexao: '189.40.12.55',
          cnhUrl: getAssetUrl('assets/images/cnh-sample-doc.jpg')
        },
        {
          id: 2,
          nome: 'Carlos Eduardo Oliveira',
          cpf: '987.654.321-99',
          vehicleType: 'SUV',
          rating: 5.0,
          walletBalance: 85.50,
          status: 'Aprovado_Auto',
          validadeCnh: '2027-08-15',
          lat: -23.55852,
          lng: -46.641308,
          enderecoAtual: 'Rua Bela Cintra, Consolação - SP',
          ipConexao: '177.18.99.102',
          cnhUrl: getAssetUrl('assets/images/cnh-sample-doc.jpg')
        },
        {
          id: 3,
          nome: 'Juliana Mendes Santos',
          cpf: '456.789.123-44',
          vehicleType: 'Hatchback',
          rating: 4.88,
          walletBalance: 210.00,
          status: 'Aprovado_Auto',
          validadeCnh: '2029-04-20',
          lat: -23.54252,
          lng: -46.628308,
          enderecoAtual: 'Rua Augusta, Centro - SP',
          ipConexao: '201.82.44.12',
          cnhUrl: getAssetUrl('assets/images/cnh-sample-doc.jpg')
        }
      ];

      const seedVehicles = [
        { id: 1, modelo: 'Toyota Corolla 2.0', placa: 'BRA-2E19', driverName: 'Pedro Henrique Silva Almeida', costPerKm: 2.85, status: 'disponivel', tipo: 'Sedan' },
        { id: 2, modelo: 'Jeep Compass Limited', placa: 'MBI-8X44', driverName: 'Carlos Eduardo Oliveira', costPerKm: 3.50, status: 'disponivel', tipo: 'SUV' },
        { id: 3, modelo: 'VW Polo TSI', placa: 'MOB-1A88', driverName: 'Juliana Mendes Santos', costPerKm: 2.20, status: 'disponivel', tipo: 'Hatchback' }
      ];

      const seedStats = {
        totalDrivers: 3,
        totalVehicles: 3,
        activeVehicles: 3,
        totalRides: 48,
        totalRevenue: 1840.50
      };

      setDrivers(seedDrivers);
      setVehicles(seedVehicles);
      setStats(seedStats);
      setSelectedDriverForRecognition(seedDrivers[0]);

      localStorage.setItem('mobidrive_offline_store', JSON.stringify({
        drivers: seedDrivers,
        vehicles: seedVehicles,
        stats: seedStats
      }));
    } catch (e) {
      console.warn('Erro ao carregar store offline:', e);
    }
  };

  // Fetch full data from independent database
  const loadDatabaseData = async () => {
    let networkLoaded = false;
    try {
      const [resStats, resDrivers, resVehicles, resEarnings, resTarifas, resConfig, resLoc, resDev, resCentral, resCredits] = await Promise.all([
        fetch('/api/stats').catch(() => null),
        fetch('/api/drivers').catch(() => null),
        fetch('/api/vehicles').catch(() => null),
        fetch('/api/earnings').catch(() => null),
        fetch('/api/tarifas').catch(() => null),
        fetch('/api/config').catch(() => null),
        fetch('/api/location/recognize').catch(() => null),
        fetch('/api/devices/connected').catch(() => null),
        fetch('/api/central/location').catch(() => null),
        fetch('/api/credit-requests').catch(() => null)
      ]);

      if (resStats && resStats.ok) { setStats(await resStats.json()); networkLoaded = true; }
      if (resDrivers && resDrivers.ok) {
        const driversList = await resDrivers.json();
        setDrivers(driversList);
        networkLoaded = true;
        if (selectedDriverForRecognition) {
          const fresh = driversList.find((d: any) => d.id === selectedDriverForRecognition.id);
          if (fresh) setSelectedDriverForRecognition(fresh);
        }
      }
      if (resVehicles && resVehicles.ok) { setVehicles(await resVehicles.json()); networkLoaded = true; }
      if (resEarnings && resEarnings.ok) { setEarnings(await resEarnings.json()); networkLoaded = true; }
      if (resTarifas && resTarifas.ok) {
        const tData = await resTarifas.json();
        setTarifas(tData);
        setTaxaBaseInput(tData.taxaBase || 0);
        setValorPorKmInput(tData.valorPorKm || 0);
        setTaxaPorMinutoInput(tData.taxaPorMinuto || 0);
        setTaxaCancelamentoInput(tData.taxaCancelamento || 0);
        setTaxaMinimaInput(tData.taxaMinima || 0);
        networkLoaded = true;
      }
      if (resConfig && resConfig.ok) {
        const cfg = await resConfig.json();
        if (cfg.appsScriptUrl) setGasUrl(cfg.appsScriptUrl);
      }
      if (resLoc && resLoc.ok) {
        const loc = await resLoc.json();
        setDetectedLocation(loc);
      }
      if (resDev && resDev.ok) {
        setConnectedDevices(await resDev.json());
      }
      if (resCentral && resCentral.ok) {
        const cLoc = await resCentral.json();
        if (cLoc && cLoc.lat && cLoc.lng) {
          setCentralLocation({
            lat: cLoc.lat,
            lng: cLoc.lng,
            rua: cLoc.rua,
            numero: cLoc.numero,
            bairro: cLoc.bairro,
            cidade: cLoc.cidade,
            estado: cLoc.estado,
            cep: cLoc.cep,
            enderecoFormatado: cLoc.enderecoFormatado,
            ultimoEnvio: cLoc.ultimoAcesso
          });
          networkLoaded = true;
        }
      }
      if (resCredits && resCredits.ok) {
        const creditsData = await resCredits.json();
        setCreditRequests(creditsData);
        networkLoaded = true;
      }
    } catch (e) {
      console.warn('Backend indisponível, ativando suporte offline GitHub Pages:', e);
    }

    if (!networkLoaded) {
      syncFromLocalStorageFallback();
    }
  };

  useEffect(() => {
    loadDatabaseData();

    // Tenta obter localização real automaticamente se a permissão já estiver concedida
    if (navigator.geolocation) {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
          if (res.state === 'granted') {
            handleConfirmCentralTracking();
          }
        }).catch(() => {});
      }
    }
  }, []);

  // --- INICIALIZAÇÃO E OUVINTES DO MOTOR DE DESPACHO REATIVO ---
  const carregarDadosDespacho = async () => {
    try {
      const [ativos, emAndamento, ridesGerais] = await Promise.all([
        dispatchEngine.getPedidosAtivos(),
        dispatchEngine.getCorridasEmAndamento(),
        dispatchEngine.getRidePlatformRides()
      ]);
      setPedidosAtivos(ativos);
      setCorridasEmAndamento(emAndamento);
      setRidePlatformRides(ridesGerais);
      setPollingStatus(dispatchEngine.getStatusPolling());
    } catch (err) {
      console.error('Erro ao ler tabelas IndexedDB de despacho:', err);
    }
  };

  useEffect(() => {
    // Inscreve no motor reativo de despacho
    const unsubscribeDispatch = dispatchEngine.subscribe((event) => {
      carregarDadosDespacho();

      let msg = '';
      if (event.tipo === 'aceite_sucesso') {
        msg = `[ACEITE] Motorista "${event.dados.driverNome}" aceitou corrida #${event.dados.rideId} em ${event.dados.tempoProcessamentoMs}ms: 'corrida aceita pelo que pegou'`;
      } else if (event.tipo === 'bloqueio_recusa') {
        msg = `[BLOQUEIO] Motorista "${event.dados.driverNome}" recusado em ${event.dados.tempoProcessamentoMs}ms: 'essa corrida já foi aceita por outro motorista'`;
      } else if (event.tipo === 'novo_pedido') {
        msg = `[DESPACHO] Novo pedido #${event.dados.id} inserido em pedidos_ativos com status_trava: aguardando_motorista`;
      } else if (event.tipo === 'cache_limpo') {
        msg = `[LIMPEZA] Corrida #${event.dados.rideId} finalizada/cancelada. Cache local IndexedDB limpo.`;
      } else if (event.tipo === 'polling_sync') {
        msg = `[POLLING 3s] Sincronização Google Apps Script (${event.dados.latenciaMs}ms).`;
      }

      setDispatchLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          tipo: event.tipo,
          mensagem: msg,
          timestamp: new Date().toLocaleTimeString(),
          dados: event.dados
        },
        ...prev.slice(0, 49)
      ]);
    });

    // Inicia polling de rede ativo a cada 3 segundos
    const pararPolling = dispatchEngine.iniciarPollingRede(gasUrl, 3000, {
      onSync: () => {
        carregarDadosDespacho();
      }
    });

    carregarDadosDespacho();

    return () => {
      unsubscribeDispatch();
      pararPolling();
    };
  }, [gasUrl]);

  // Handler para batalha de concorrência simultânea (mesmo milissegundo)
  const executarTesteAntiConcorrencia = async () => {
    if (!selectedRideForConcurrency) {
      alert('Selecione uma corrida ativa da tabela pedidos_ativos.');
      return;
    }
    if (!concurrencyDriver1 || !concurrencyDriver2) {
      alert('Selecione dois motoristas diferentes para a batalha de concorrência.');
      return;
    }
    if (concurrencyDriver1 === concurrencyDriver2) {
      alert('Escolha dois motoristas distintos para validar o bloqueio entre concorrentes.');
      return;
    }

    const d1 = drivers.find((d) => String(d.id) === String(concurrencyDriver1));
    const d2 = drivers.find((d) => String(d.id) === String(concurrencyDriver2));
    const d1Nome = d1 ? d1.nome : `Motorista #${concurrencyDriver1}`;
    const d2Nome = d2 ? d2.nome : `Motorista #${concurrencyDriver2}`;

    setIsTestingConcurrency(true);
    setConcurrencyBattleResult(null);

    // Dispara AMBOS no mesmo exato instante via Promise.all para competir pela trava atômica
    const t0 = performance.now();
    const [res1, res2] = await Promise.all([
      dispatchEngine.aceitarCorrida({
        rideId: selectedRideForConcurrency,
        driverId: concurrencyDriver1,
        driverNome: d1Nome,
        appsScriptUrl: gasUrl
      }),
      dispatchEngine.aceitarCorrida({
        rideId: selectedRideForConcurrency,
        driverId: concurrencyDriver2,
        driverNome: d2Nome,
        appsScriptUrl: gasUrl
      })
    ]);
    const diff = Number((performance.now() - t0).toFixed(2));

    const vencedor = res1.mensagem === 'corrida aceita pelo que pegou' ? (res1 as RespostaSucessoCorrida) : (res2 as RespostaSucessoCorrida);
    const rejeitado = res1.mensagem === 'essa corrida já foi aceita por outro motorista' ? (res1 as RespostaRecusaCorrida) : (res2 as RespostaRecusaCorrida);

    setConcurrencyBattleResult({
      vencedor,
      rejeitado,
      diffMs: diff,
      timestamp: new Date().toISOString()
    });

    setIsTestingConcurrency(false);
    await carregarDadosDespacho();
  };

  // Aceite individual direto por motorista
  const handleAceitarCorridaDireto = async (rideId: number | string, driverId: number | string, driverNome: string) => {
    await dispatchEngine.aceitarCorrida({
      rideId,
      driverId,
      driverNome,
      appsScriptUrl: gasUrl
    });
    await carregarDadosDespacho();
  };

  // Arquivamento e limpeza do cache local (Requisito 4)
  const handleArquivarCorridaDespacho = async (rideId: number | string, statusFinal: 'finalizada' | 'cancelada') => {
    await dispatchEngine.arquivarCorrida(rideId, statusFinal);
    await carregarDadosDespacho();
    await loadDatabaseData();
  };

  // Despacho de nova corrida com parâmetros dinâmicos reais
  const handleDespacharNovaCorridaReativa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDespacho.origemEndereco || !novoDespacho.destinoEndereco) {
      alert('Origem e Destino são obrigatórios para despachar.');
      return;
    }
    setDespachandoNova(true);
    try {
      await dispatchEngine.despacharPedidoReal({
        passengerId: null,
        passengerName: novoDespacho.passengerName || 'Passageiro Solicitação Real',
        driverId: null,
        origemEndereco: novoDespacho.origemEndereco,
        origemLat: Number(novoDespacho.origemLat) || 0,
        origemLng: Number(novoDespacho.origemLng) || 0,
        destinoEndereco: novoDespacho.destinoEndereco,
        destinoLat: Number(novoDespacho.destinoLat) || 0,
        destinoLng: Number(novoDespacho.destinoLng) || 0,
        distanciaMetros: 6200,
        duracaoSegundos: 720,
        valor: Number(novoDespacho.valor) || 25
      });
      setNovoDespacho({
        passengerName: '',
        origemEndereco: '',
        origemLat: 0,
        origemLng: 0,
        destinoEndereco: '',
        destinoLat: 0,
        destinoLng: 0,
        valor: 20
      });
      await carregarDadosDespacho();
    } finally {
      setDespachandoNova(false);
    }
  };

  // --- CONTROLE DE LOCALIZAÇÃO EM TEMPO REAL DA CENTRAL ---
  const handleRequestCentralPermission = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    setShowCentralPermissionModal(true);
  };

  const handleConfirmCentralTracking = () => {
    setShowCentralPermissionModal(false);
    if (!navigator.geolocation) return;

    setIsCentralTrackingActive(true);
    setGpsStatusMsg('Central: Solicitando acesso ao sinal de GPS e APIs de localização do Google Maps...');

    // Inicia rastreamento contínuo da central
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsStatusMsg(`Central Operacional Conectada: Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)} (Precisão: ±${Math.round(accuracy)}m)`);

        let loc: any = {};
        try {
          const res = await fetch('/api/central/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              accuracy
            })
          });

          if (res.ok) {
            const data = await res.json();
            loc = data.location || data.central || {};
          }
        } catch {
          // Servidor backend indisponível (ex: GitHub Pages). Prossegue para o geocodificador nativo Google Maps
        }

        // Se a API externa não respondeu, ou se há erro de faturamento do Google Maps, utiliza Nominatim OpenStreetMap (Billing-free) ou Google Maps Geocoder
        if (!loc.rua) {
          if (!window.googleMapsBillingError && window.google?.maps?.Geocoder) {
            try {
              const geocoder = new window.google.maps.Geocoder();
              const geoRes = await new Promise<any>((resolve) => {
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
                  if (status === 'OK' && results && results[0]) {
                    resolve(results[0]);
                  } else {
                    resolve(null);
                  }
                });
              });

              if (geoRes) {
                const comp = geoRes.address_components || [];
                const getComp = (type: string) => comp.find((c: any) => c.types.includes(type))?.long_name || '';
                loc = {
                  rua: getComp('route'),
                  numero: getComp('street_number'),
                  bairro: getComp('sublocality') || getComp('sublocality_level_1'),
                  cidade: getComp('administrative_area_level_2') || getComp('locality'),
                  estado: getComp('administrative_area_level_1'),
                  cep: getComp('postal_code'),
                  enderecoFormatado: geoRes.formatted_address
                };
              }
            } catch (errGeo) {
              console.warn('Geocodificação direta via Google Maps falhou:', errGeo);
            }
          }

          // Fallback robusto para Nominatim OpenStreetMap (100% gratuito e sem necessidade de billing)
          if (!loc.rua) {
            try {
              const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                headers: { 'Accept-Language': 'pt-BR' }
              });
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                const addr = nomData.address || {};
                loc = {
                  rua: addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '',
                  numero: addr.house_number || '',
                  bairro: addr.suburb || addr.neighbourhood || addr.residential || '',
                  cidade: addr.city || addr.town || addr.municipality || addr.village || 'São Paulo',
                  estado: addr.state || 'SP',
                  cep: addr.postcode || '',
                  enderecoFormatado: nomData.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                };
              }
            } catch (errNom) {
              console.warn('Geocodificação OpenStreetMap Nominatim falhou:', errNom);
            }
          }
        }

        const novoCentral = {
          lat: latitude,
          lng: longitude,
          accuracy,
          rua: loc.rua || '',
          numero: loc.numero || '',
          bairro: loc.bairro || '',
          cidade: loc.cidade || '',
          estado: loc.estado || '',
          cep: loc.cep || '',
          enderecoFormatado: loc.enderecoFormatado || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          ultimoEnvio: new Date().toLocaleTimeString()
        };
        setCentralLocation(novoCentral);

        // Move os mapas diretamente para o local exato em tempo real
        if (mapInstanceRef.current && window.google?.maps) {
          mapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(16);
        }
        if (leafletMapRef.current) {
          leafletMapRef.current.panTo([latitude, longitude]);
          leafletMapRef.current.setZoom(16);
        }

        // Atualiza status na barra
        const enderecoTexto = novoCentral.rua 
          ? `${novoCentral.rua}${novoCentral.numero ? ', ' + novoCentral.numero : ''}${novoCentral.bairro ? ' - ' + novoCentral.bairro : ''}${novoCentral.cidade ? ', ' + novoCentral.cidade : ''}`
          : novoCentral.enderecoFormatado;
        setGpsStatusMsg(`Central ao Vivo: ${enderecoTexto} (±${Math.round(accuracy)}m)`);
      },
      (err) => {
        setIsCentralTrackingActive(false);
        setGpsStatusMsg(`Permissão ou erro de GPS na Central: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000
      }
    );

    setCentralWatchId(watchId);
  };

  const handleStopCentralTracking = () => {
    if (centralWatchId !== null) {
      navigator.geolocation.clearWatch(centralWatchId);
      setCentralWatchId(null);
    }
    setIsCentralTrackingActive(false);
    setGpsStatusMsg('Rastreamento da Central em tempo real desativado.');
  };

  // --- RECARGA DE CRÉDITO DO MOTORISTA ---
  const handleOpenCreditModal = (driver: any) => {
    setDriverForCredit(driver);
    setCreditAmount(50);
    setCreditType('credito');
    setCreditNote('Recarga de Saldo');
    setShowCreditModal(true);
  };

  const handleSubmitDriverCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForCredit) return;
    const val = Number(creditAmount);
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    setSubmittingCredit(true);
    try {
      const res = await fetch(`/api/drivers/${driverForCredit.id}/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: val,
          tipo: creditType,
          observacao: creditNote
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Operação realizada com sucesso! Novo saldo: R$ ${Number(data.driver.walletBalance).toFixed(2)}`);
        setShowCreditModal(false);
        await loadDatabaseData();
        if (selectedDriverForRecognition?.id === driverForCredit.id) {
          setSelectedDriverForRecognition(data.driver);
        }
      } else {
        alert(data.error || 'Erro ao processar recarga de crédito.');
      }
    } catch (err: any) {
      alert('Erro na conexão com o servidor: ' + err.message);
    } finally {
      setSubmittingCredit(false);
    }
  };

  // --- SOLICITAÇÕES DE RECARGA DE CRÉDITO VIA APP MOTORISTA ---
  const handleApproveCreditRequest = async (request: any) => {
    if (!confirm(`Aprovar a recarga de R$ ${Number(request.valor).toFixed(2)} para o motorista ${request.driverNome}?\nO crédito será depositado na carteira imediatamente.`)) {
      return;
    }
    setProcessingRequestId(request.id);
    try {
      const res = await fetch(`/api/credit-requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observacao: `Recarga aprovada via Painel Central (${request.metodo})` })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Solicitação #${request.id} aprovada com sucesso!\nValor de R$ ${Number(request.valor).toFixed(2)} creditado ao saldo de ${request.driverNome}.`);
        await loadDatabaseData();
      } else {
        alert(data.error || 'Erro ao aprovar solicitação de recarga');
      }
    } catch (err: any) {
      alert('Erro de comunicação com o servidor: ' + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectCreditRequest = async (request: any) => {
    const motivo = prompt(`Informe o motivo da recusa para a solicitação de ${request.driverNome} (R$ ${Number(request.valor).toFixed(2)}):`, 'Comprovante não identificado ou pagamento pendente');
    if (motivo === null) return;

    setProcessingRequestId(request.id);
    try {
      const res = await fetch(`/api/credit-requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivo.trim() || 'Recusado pela administração' })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Solicitação #${request.id} rejeitada.`);
        await loadDatabaseData();
      } else {
        alert(data.error || 'Erro ao rejeitar solicitação');
      }
    } catch (err: any) {
      alert('Erro de comunicação: ' + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleSubmitDriverAppRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDriverId) {
      alert('Selecione um motorista cadastrado no sistema.');
      return;
    }
    const val = Number(reqValor);
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    setSubmittingReq(true);
    try {
      const res = await fetch('/api/credit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: Number(reqDriverId),
          valor: val,
          metodo: reqMetodo,
          observacao: reqObs.trim() || `Solicitação via App Motorista (${reqMetodo})`
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Solicitação de recarga de R$ ${val.toFixed(2)} registrada com sucesso no banco de dados!`);
        setShowNewCreditRequestModal(false);
        setReqObs('');
        await loadDatabaseData();
      } else {
        alert(data.error || 'Erro ao registrar solicitação de recarga.');
      }
    } catch (err: any) {
      alert('Erro de conexão: ' + err.message);
    } finally {
      setSubmittingReq(false);
    }
  };

  // --- RECONHECIMENTO DO MOTORISTA ---
  const handleOpenDriverRecognition = (driver?: any) => {
    if (driver) {
      setSelectedDriverForRecognition(driver);
    } else if (drivers.length > 0) {
      setSelectedDriverForRecognition(drivers[0]);
    } else {
      setSelectedDriverForRecognition(null);
    }
    setShowDriverRecognitionModal(true);
  };

  // --- INICIALIZAÇÃO DO MAPA DO DASHBOARD COM RESILIÊNCIA E SUPORTE A ERRO DE BILLING ---
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    if (!mapContainerRef.current) return;

    const centerLat = centralLocation?.lat || detectedLocation?.lat || -23.5505;
    const centerLng = centralLocation?.lng || detectedLocation?.lng || -46.6333;

    // Se houver erro de faturamento ou modo leaflet selecionado, inicializa Leaflet
    const shouldUseLeaflet = billingNotice || window.googleMapsBillingError || !window.google?.maps;

    if (shouldUseLeaflet) {
      // Destrói instância anterior do Leaflet se existir
      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 12,
          zoomControl: false
        });

        // Adiciona camada Dark Matter do CartoDB combinando perfeitamente com o tema NexaFleet
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(leafletMapRef.current);

        leafletVehiclesLayerRef.current = L.layerGroup().addTo(leafletMapRef.current);
      } else {
        leafletMapRef.current.invalidateSize();
        leafletMapRef.current.panTo([centerLat, centerLng]);
        if (centralLocation) {
          leafletMapRef.current.setZoom(16);
        }
      }

      // Atualiza marcador da Central no Leaflet
      if (centralLocation && leafletMapRef.current) {
        if (leafletCentralMarkerRef.current) {
          leafletCentralMarkerRef.current.remove();
        }

        const centralIcon = L.divIcon({
          className: 'central-icon',
          html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-[10px]">★</div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        leafletCentralMarkerRef.current = L.marker([centralLocation.lat, centralLocation.lng], { icon: centralIcon })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div class="text-xs p-1 font-sans text-slate-900">
              <b class="text-emerald-700">★ Central Operacional (Ao Vivo)</b><br/>
              ${centralLocation.rua ? `<b>Rua:</b> ${centralLocation.rua}${centralLocation.numero ? ', ' + centralLocation.numero : ''}<br/>` : ''}
              ${centralLocation.bairro ? `<b>Bairro:</b> ${centralLocation.bairro}<br/>` : ''}
              ${centralLocation.cidade ? `<b>Cidade:</b> ${centralLocation.cidade} - ${centralLocation.estado || ''}<br/>` : ''}
              ${centralLocation.cep ? `<b>CEP:</b> ${centralLocation.cep}<br/>` : ''}
              <span class="text-[10px] text-slate-500">${centralLocation.enderecoFormatado || 'Transmissão GPS ativa'}</span>
            </div>
          `);
      }

      // Atualiza veículos no Leaflet
      if (leafletVehiclesLayerRef.current) {
        leafletVehiclesLayerRef.current.clearLayers();

        vehicles.forEach((car: any) => {
          if (car.lat && car.lng && (car.lat !== 0 || car.lng !== 0)) {
            const isAvailable = car.status === 'disponivel';
            const colorClass = isAvailable ? 'bg-emerald-500 text-slate-950' : 'bg-blue-500 text-white';

            const carIcon = L.divIcon({
              className: 'car-icon',
              html: `<div class="relative flex flex-col items-center">
                <div class="w-7 h-7 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center font-bold text-xs">
                  🚗
                </div>
                <div class="bg-slate-900/90 text-[9px] text-white px-1.5 py-0.5 rounded shadow mt-0.5 whitespace-nowrap font-mono">
                  ${car.placa || car.modelo}
                </div>
              </div>`,
              iconSize: [28, 40],
              iconAnchor: [14, 20]
            });

            const marker = L.marker([car.lat, car.lng], { icon: carIcon })
              .bindPopup(`
                <div class="text-xs p-1 font-sans">
                  <b>${car.modelo}</b> (${car.placa})<br/>
                  Motorista: ${car.driverName || 'Não atribuído'}<br/>
                  Status: <span class="${isAvailable ? 'text-emerald-600' : 'text-blue-600'} font-bold">${isAvailable ? 'Disponível' : 'Em Corrida'}</span><br/>
                  Custo/Km: R$ ${Number(car.costPerKm || 0).toFixed(2)}
                </div>
              `);

            leafletVehiclesLayerRef.current?.addLayer(marker);
          }
        });
      }
      return;
    }

    // Caso contrário tenta o Google Maps padrão
    try {
      if (window.google && window.google.maps) {
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 12,
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#161f2e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#7b8ba5' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#253347' }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2434' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b111a' }] },
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'off' }] }
            ]
          });

          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            map: mapInstanceRef.current,
            polylineOptions: {
              strokeColor: '#10b981',
              strokeWeight: 4
            }
          });
        } else {
          // Já existe instância, foca suavemente na localização exata da central
          mapInstanceRef.current.panTo({ lat: centerLat, lng: centerLng });
          if (centralLocation) {
            mapInstanceRef.current.setZoom(16);
          }
        }

        // Limpa marcadores
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        // Adiciona marcador da Central
        if (centralLocation) {
          const centralMarker = new window.google.maps.Marker({
            position: { lat: centralLocation.lat, lng: centralLocation.lng },
            map: mapInstanceRef.current,
            title: `Central Operacional: ${centralLocation.rua ? `${centralLocation.rua}, ${centralLocation.numero || 'S/N'}` : centralLocation.enderecoFormatado || 'Ao Vivo'}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            }
          });

          const infoContent = `
            <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px; max-width: 250px;">
              <b style="color: #059669; font-size: 13px;">★ Central Operacional (Ao Vivo)</b><br/>
              ${centralLocation.rua ? `<b>Rua:</b> ${centralLocation.rua}${centralLocation.numero ? ', ' + centralLocation.numero : ''}<br/>` : ''}
              ${centralLocation.bairro ? `<b>Bairro:</b> ${centralLocation.bairro}<br/>` : ''}
              ${centralLocation.cidade ? `<b>Cidade:</b> ${centralLocation.cidade} - ${centralLocation.estado || ''}<br/>` : ''}
              ${centralLocation.cep ? `<b>CEP:</b> ${centralLocation.cep}<br/>` : ''}
              <span style="font-size: 10px; color: #64748b;">${centralLocation.enderecoFormatado || ''}</span>
              ${centralLocation.accuracy ? `<br/><span style="font-size: 9px; color: #059669; font-weight: bold;">Precisão GPS: ±${Math.round(centralLocation.accuracy)}m</span>` : ''}
            </div>
          `;
          const infoWindow = new window.google.maps.InfoWindow({ content: infoContent });
          centralMarker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, centralMarker);
          });

          markersRef.current.push(centralMarker);
        }

        // Adiciona veículos
        vehicles.forEach((car: any) => {
          if (car.lat && car.lng && (car.lat !== 0 || car.lng !== 0)) {
            const isDisponivel = car.status === 'disponivel';
            const marker = new window.google.maps.Marker({
              position: { lat: Number(car.lat), lng: Number(car.lng) },
              map: mapInstanceRef.current,
              title: `${car.modelo} - ${car.placa}`,
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: isDisponivel ? '#10b981' : '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                rotation: 0
              }
            });
            markersRef.current.push(marker);
          }
        });
      }
    } catch (err) {
      console.warn('Erro ao inicializar Google Maps, alternando para Leaflet:', err);
      setBillingNotice(true);
      setMapEngine('leaflet');
    }
  }, [activeTab, vehicles, centralLocation, billingNotice]);

  // --- INICIALIZAÇÃO DO MAPA NA ABA "BASE DE TARIFAS" COM SUPORTE DUAL ---
  useEffect(() => {
    if (activeTab !== 'tarifas') return;
    if (!tarifasMapContainerRef.current) return;

    const centerLat = pontoLat || centralLocation?.lat || detectedLocation?.lat || -23.5505;
    const centerLng = pontoLng || centralLocation?.lng || detectedLocation?.lng || -46.6333;

    const shouldUseLeaflet = billingNotice || window.googleMapsBillingError || !window.google?.maps;

    if (shouldUseLeaflet) {
      if (!leafletTarifasMapRef.current) {
        leafletTarifasMapRef.current = L.map(tarifasMapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(leafletTarifasMapRef.current);

        leafletTarifasLayerRef.current = L.layerGroup().addTo(leafletTarifasMapRef.current);

        leafletTarifasMapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
          const lat = Number(e.latlng.lat.toFixed(6));
          const lng = Number(e.latlng.lng.toFixed(6));
          setPontoLat(lat);
          setPontoLng(lng);

          try {
            const res = await fetch('/api/central/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat, lng })
            });
            if (res.ok) {
              const d = await res.json();
              const loc = d.location || d.central || {};
              if (loc.rua) {
                setPontoNome(`${loc.rua}${loc.numero ? ', ' + loc.numero : ''}${loc.bairro ? ' - ' + loc.bairro : ''}`);
              } else if (loc.enderecoFormatado) {
                setPontoNome(loc.enderecoFormatado.split(',')[0]);
              }
            }
          } catch {
            // Silencioso se offline
          }
        });
      } else {
        leafletTarifasMapRef.current.invalidateSize();
      }

      if (leafletTarifasLayerRef.current) {
        leafletTarifasLayerRef.current.clearLayers();

        // Renderiza pontos salvos
        if (tarifas.pontosEspecificos && tarifas.pontosEspecificos.length > 0) {
          tarifas.pontosEspecificos.forEach((p: any) => {
            const marker = L.circleMarker([p.lat, p.lng], {
              radius: 8,
              fillColor: '#f59e0b',
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9
            }).bindPopup(`<b>${p.nome}</b> (+R$ ${Number(p.taxaAdicional).toFixed(2)})<br/>Raio: ${p.raioMetros}m`);

            const circle = L.circle([p.lat, p.lng], {
              radius: Number(p.raioMetros) || 500,
              color: '#f59e0b',
              weight: 2,
              fillColor: '#f59e0b',
              fillOpacity: 0.2
            });

            leafletTarifasLayerRef.current?.addLayer(marker);
            leafletTarifasLayerRef.current?.addLayer(circle);
          });
        }

        // Renderiza ponto em criação
        if (pontoLat !== 0 && pontoLng !== 0) {
          const tempMarker = L.circleMarker([pontoLat, pontoLng], {
            radius: 10,
            fillColor: '#10b981',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 1
          }).bindPopup(`<b>Novo Ponto Selecionado</b><br/>Lat: ${pontoLat}, Lng: ${pontoLng}`);

          const tempCirc = L.circle([pontoLat, pontoLng], {
            radius: Number(pontoRaio) || 500,
            color: '#10b981',
            weight: 2,
            fillColor: '#10b981',
            fillOpacity: 0.25
          });

          leafletTarifasLayerRef.current?.addLayer(tempMarker);
          leafletTarifasLayerRef.current?.addLayer(tempCirc);
        }
      }
      return;
    }

    // Google Maps fallback
    try {
      if (window.google && window.google.maps) {
        if (!tarifasMapInstanceRef.current) {
          tarifasMapInstanceRef.current = new window.google.maps.Map(tarifasMapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#161f2e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#8898b0' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#253347' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b111a' }] }
            ]
          });

          tarifasMapInstanceRef.current.addListener('click', async (e: any) => {
            const lat = Number(e.latLng.lat().toFixed(6));
            const lng = Number(e.latLng.lng().toFixed(6));
            setPontoLat(lat);
            setPontoLng(lng);

            try {
              const res = await fetch('/api/central/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng })
              });
              if (res.ok) {
                const d = await res.json();
                const loc = d.location || d.central || {};
                if (loc.rua) {
                  setPontoNome(`${loc.rua}${loc.numero ? ', ' + loc.numero : ''}${loc.bairro ? ' - ' + loc.bairro : ''}`);
                } else if (loc.enderecoFormatado) {
                  setPontoNome(loc.enderecoFormatado.split(',')[0]);
                }
              }
            } catch {
              // Silencioso se offline
            }
          });
        }

        // Limpa marcadores
        pontosMarkersRef.current.forEach((m) => m.setMap(null));
        pontosMarkersRef.current = [];
        pontosCirclesRef.current.forEach((c) => c.setMap(null));
        pontosCirclesRef.current = [];

        // Renderiza pontos salvos
        if (tarifas.pontosEspecificos && tarifas.pontosEspecificos.length > 0) {
          tarifas.pontosEspecificos.forEach((p: any) => {
            const marker = new window.google.maps.Marker({
              position: { lat: Number(p.lat), lng: Number(p.lng) },
              map: tarifasMapInstanceRef.current,
              title: `${p.nome} (+R$ ${Number(p.taxaAdicional).toFixed(2)})`
            });
            const circle = new window.google.maps.Circle({
              strokeColor: '#f59e0b',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#f59e0b',
              fillOpacity: 0.2,
              map: tarifasMapInstanceRef.current,
              center: { lat: Number(p.lat), lng: Number(p.lng) },
              radius: Number(p.raioMetros) || 500
            });
            pontosMarkersRef.current.push(marker);
            pontosCirclesRef.current.push(circle);
          });
        }

        // Ponto temporário
        if (tempMarkerRef.current) tempMarkerRef.current.setMap(null);
        if (tempCircleRef.current) tempCircleRef.current.setMap(null);

        if (pontoLat !== 0 && pontoLng !== 0) {
          tempMarkerRef.current = new window.google.maps.Marker({
            position: { lat: pontoLat, lng: pontoLng },
            map: tarifasMapInstanceRef.current,
            title: 'Novo Ponto Dinâmico'
          });
          tempCircleRef.current = new window.google.maps.Circle({
            strokeColor: '#10b981',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: '#10b981',
            fillOpacity: 0.25,
            map: tarifasMapInstanceRef.current,
            center: { lat: pontoLat, lng: pontoLng },
            radius: Number(pontoRaio) || 500
          });
        }
      }
    } catch (err) {
      setBillingNotice(true);
      setMapEngine('leaflet');
    }
  }, [activeTab, tarifas.pontosEspecificos, pontoLat, pontoLng, pontoRaio, billingNotice]);

  // Handle CNH File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCnhFile(file);
      setCnhPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setCnhBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get user device real GPS location
  const handleCaptureRealGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo seu navegador.');
      return;
    }
    setIsCapturingGps(true);
    setGpsStatusMsg('Obtendo sinal GPS real do dispositivo e consultando Google Maps...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setDriverLat(latitude);
        setDriverLng(longitude);
        setPartidaLat(latitude);
        setPartidaLng(longitude);
        setPontoLat(Number(latitude.toFixed(6)));
        setPontoLng(Number(longitude.toFixed(6)));
        setNovoDespacho((prev) => ({
          ...prev,
          origemLat: latitude,
          origemLng: longitude
        }));

        // Envia para o backend para obter rua, número e bairro via Google Maps Geocoding API
        try {
          const res = await fetch('/api/central/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
              accuracy
            })
          });

          if (res.ok) {
            const data = await res.json();
            const loc = data.location || data.central || {};
            const novoCentral = {
              lat: latitude,
              lng: longitude,
              accuracy,
              rua: loc.rua,
              numero: loc.numero,
              bairro: loc.bairro,
              cidade: loc.cidade,
              estado: loc.estado,
              cep: loc.cep,
              enderecoFormatado: loc.enderecoFormatado || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              ultimoEnvio: new Date().toLocaleTimeString()
            };
            setCentralLocation(novoCentral);
            setIsCentralTrackingActive(true);

            if (novoCentral.enderecoFormatado) {
              setNovoDespacho((prev) => ({
                ...prev,
                origemEndereco: novoCentral.enderecoFormatado || prev.origemEndereco
              }));
            }

            // Move os mapas diretamente para o local exato
            if (mapInstanceRef.current && window.google?.maps) {
              mapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
              mapInstanceRef.current.setZoom(16);
            }
            if (leafletMapRef.current) {
              leafletMapRef.current.panTo([latitude, longitude]);
              leafletMapRef.current.setZoom(16);
            }
            if (tarifasMapInstanceRef.current && window.google?.maps) {
              tarifasMapInstanceRef.current.panTo({ lat: latitude, lng: longitude });
            }
            if (leafletTarifasMapRef.current) {
              leafletTarifasMapRef.current.panTo([latitude, longitude]);
            }

            const enderecoTexto = novoCentral.rua 
              ? `${novoCentral.rua}${novoCentral.numero ? ', ' + novoCentral.numero : ''}${novoCentral.bairro ? ' - ' + novoCentral.bairro : ''}${novoCentral.cidade ? ', ' + novoCentral.cidade : ''}`
              : novoCentral.enderecoFormatado;
            setGpsStatusMsg(`Local Exato Detectado: ${enderecoTexto} (±${Math.round(accuracy)}m)`);
            loadDatabaseData();
          } else {
            setGpsStatusMsg(`GPS Obtido: Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`);
          }
        } catch {
          setGpsStatusMsg(`GPS Obtido: Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`);
        } finally {
          setIsCapturingGps(false);
        }
      },
      (err) => {
        setIsCapturingGps(false);
        setGpsStatusMsg('Não foi possível obter o sinal GPS (' + err.message + ')');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Register Driver
  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverCpf.trim()) {
      alert('Preencha o Nome e o CPF do motorista.');
      return;
    }
    setLoadingReg(true);
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: driverName,
          cpf: driverCpf,
          cnhBase64,
          vehicleType,
          lat: driverLat || 0.0,
          lng: driverLng || 0.0
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOcrModalData(data);
        setDriverName('');
        setDriverCpf('');
        setCnhFile(null);
        setCnhBase64('');
        setCnhPreview('');
        await loadDatabaseData();
      } else {
        alert(data.error || 'Erro ao registrar no banco de dados.');
      }
    } catch (err: any) {
      alert('Erro de conexão com o banco de dados: ' + err.message);
    } finally {
      setLoadingReg(false);
    }
  };

  // Delete Driver
  const handleDeleteDriver = async (id: number) => {
    if (!confirm('Deseja excluir este motorista do banco de dados?')) return;
    try {
      await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      if (selectedDriverForRecognition?.id === id) {
        setSelectedDriverForRecognition(null);
      }
      await loadDatabaseData();
    } catch (e) {
      console.error(e);
    }
  };

  // Update Driver Status
  const handleUpdateDriverStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/drivers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadDatabaseData();
    } catch (e) {
      console.error(e);
    }
  };

  // Add new vehicle to fleet
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleModel.trim() || !newVehiclePlate.trim()) {
      alert('Preencha o modelo e a placa do veículo.');
      return;
    }
    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: newVehicleModel,
          placa: newVehiclePlate,
          tipo: newVehicleType,
          costPerKm: Number(newVehicleCost) || 0,
          driverId: newVehicleDriverId ? Number(newVehicleDriverId) : null,
          lat: driverLat || 0.0,
          lng: driverLng || 0.0,
          status: 'disponivel'
        })
      });
      setShowAddVehicleModal(false);
      setNewVehicleModel('');
      setNewVehiclePlate('');
      await loadDatabaseData();
    } catch (e) {
      alert('Erro ao adicionar veículo');
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (id: number) => {
    if (!confirm('Deseja excluir este veículo?')) return;
    try {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      await loadDatabaseData();
    } catch (e) {
      console.error(e);
    }
  };

  // Save General Tariff Settings
  const handleSaveTarifas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTarifas(true);
    try {
      const res = await fetch('/api/tarifas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxaBase: Number(taxaBaseInput),
          valorPorKm: Number(valorPorKmInput),
          taxaPorMinuto: Number(taxaPorMinutoInput),
          taxaCancelamento: Number(taxaCancelamentoInput),
          taxaMinima: Number(taxaMinimaInput)
        })
      });

      if (res.ok) {
        alert('Base de tarifas salva com sucesso no banco de dados!');
        await loadDatabaseData();
      } else {
        alert('Erro ao salvar tarifas');
      }
    } catch (err: any) {
      alert('Erro ao conectar com o banco de dados: ' + err.message);
    } finally {
      setSavingTarifas(false);
    }
  };

  // Add Dynamic Specific Point on Map
  const handleAddPontoDinamico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pontoNome.trim()) {
      alert('Insira um nome para o ponto específico.');
      return;
    }
    if (pontoLat === 0 && pontoLng === 0) {
      alert('Clique no mapa abaixo para selecionar as coordenadas do ponto.');
      return;
    }
    setSavingPonto(true);
    try {
      const res = await fetch('/api/tarifas/pontos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: pontoNome,
          lat: pontoLat,
          lng: pontoLng,
          raioMetros: Number(pontoRaio),
          taxaAdicional: Number(pontoTaxaAdicional),
          tipo: pontoTipo
        })
      });

      if (res.ok) {
        alert('Ponto tarifário dinâmico adicionado ao banco de dados!');
        setPontoNome('');
        setPontoTaxaAdicional(0);
        await loadDatabaseData();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao adicionar ponto');
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setSavingPonto(false);
    }
  };

  // Delete Dynamic Point
  const handleDeletePonto = async (id: number) => {
    if (!confirm('Deseja remover este ponto tarifário do banco de dados?')) return;
    try {
      await fetch(`/api/tarifas/pontos/${id}`, { method: 'DELETE' });
      await loadDatabaseData();
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate Route with DirectionsService
  const handleCalculateRoute = async () => {
    if (partidaLat === 0 && partidaLng === 0 && destinoLat === 0 && destinoLng === 0) {
      alert('Insira as coordenadas dinâmicas de partida e destino.');
      return;
    }
    setLoadingRoute(true);
    setRouteResult(null);

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordenadaPartida: { lat: Number(partidaLat), lng: Number(partidaLng) },
          coordenadaDestino: { lat: Number(destinoLat), lng: Number(destinoLng) }
        })
      });
      const data = await res.json();

      const distKm = (data.distanceMeters || 0) / 1000;
      const estimatedCost = (tarifas.taxaBase || 0) + distKm * (tarifas.valorPorKm || 0);

      setRouteResult({
        ...data,
        estimatedFare: estimatedCost
      });

      // Tenta desenhar no Leaflet se o mapa Leaflet estiver ativo
      if (leafletMapRef.current) {
        if (leafletRoutePolylineRef.current) {
          leafletRoutePolylineRef.current.remove();
        }
        leafletRoutePolylineRef.current = L.polyline(
          [
            [Number(partidaLat), Number(partidaLng)],
            [Number(destinoLat), Number(destinoLng)]
          ],
          { color: '#10b981', weight: 4, dashArray: '6, 8' }
        ).addTo(leafletMapRef.current);

        leafletMapRef.current.fitBounds(leafletRoutePolylineRef.current.getBounds(), { padding: [50, 50] });
      }

      // Se o Google Maps estiver ativo sem erro de faturamento
      if (window.google && window.google.maps && directionsRendererRef.current && !billingNotice) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: { lat: Number(partidaLat), lng: Number(partidaLng) },
            destination: { lat: Number(destinoLat), lng: Number(destinoLng) },
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result: any, status: string) => {
            if (status === 'OK') {
              directionsRendererRef.current.setDirections(result);
            }
          }
        );
      }
    } catch (err: any) {
      alert('Erro ao calcular rota: ' + err.message);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Reset database to strictly 0
  const handleResetDatabase = async () => {
    if (!confirm('Atenção: Isso irá zerar todas as tabelas e registros do banco de dados para 0. Continuar?')) return;
    try {
      await fetch('/api/database/reset', { method: 'POST' });
      await loadDatabaseData();
      alert('Banco de dados zerado com sucesso!');
    } catch (e) {
      alert('Erro ao zerar banco');
    }
  };

  // Filtered drivers
  const filteredDrivers = drivers.filter((d) => {
    if (driverFilter === 'approved' && d.status !== 'Aprovado_Auto') return false;
    if (driverFilter === 'pending' && d.status === 'Aprovado_Auto') return false;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      return (d.nome || '').toLowerCase().includes(q) || (d.cpf || '').includes(q);
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-800 font-sans overflow-hidden">
      {/* SIDEBAR NAVIGATION - VISUAL FOX-TAXI / NEXAFLEET STYLE */}
      <aside className="w-64 bg-[#151e2d] text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-[#1e2a3f]">
        <div>
          {/* Logo Header */}
          <div className="p-4 border-b border-[#1e2a3f] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <img
                src={getAssetUrl('assets/images/logo.png')}
                alt="Painel Admin MobiDrive"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm tracking-wide text-white truncate">Painel Admin MobiDrive</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">Central & Operações</p>
            </div>
          </div>

          {/* Navigation Category */}
          <div className="px-5 pt-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Navegação
          </div>

          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-400 hover:bg-[#1c273a] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('despacho')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'despacho'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-amber-400 hover:bg-[#1c273a] hover:text-amber-300'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Central de Despacho</span>
              {pedidosAtivos.length > 0 ? (
                <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  {pedidosAtivos.length}
                </span>
              ) : corridasEmAndamento.length > 0 ? (
                <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {corridasEmAndamento.length}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'drivers'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-400 hover:bg-[#1c273a] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Drivers</span>
              {drivers.length > 0 && (
                <span className="ml-auto bg-[#233249] text-[10px] px-2 py-0.5 rounded-full text-slate-300">
                  {drivers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vehicles')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'vehicles'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-400 hover:bg-[#1c273a] hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 shrink-0" />
              <span>Transport Services</span>
              {vehicles.length > 0 && (
                <span className="ml-auto bg-[#233249] text-[10px] px-2 py-0.5 rounded-full text-slate-300">
                  {vehicles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tarifas')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'tarifas'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-400 hover:bg-[#1c273a] hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>Base de Tarifas</span>
              {tarifas.pontosEspecificos?.length > 0 && (
                <span className="ml-auto bg-[#233249] text-[10px] px-2 py-0.5 rounded-full text-emerald-400">
                  {tarifas.pontosEspecificos.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'routes'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-400 hover:bg-[#1c273a] hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4 shrink-0" />
              <span>Geo Fencing & Rotas</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'database'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-400 hover:bg-[#1c273a] hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Site Settings & DB</span>
            </button>
          </nav>

          {/* Quick Shortcuts for Driver Recognition */}
          <div className="px-5 pt-6 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Reconhecimento & Saldo
          </div>
          <div className="px-3 space-y-1">
            <button
              onClick={() => handleOpenDriverRecognition()}
              className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:bg-[#1c273a] hover:text-emerald-300 transition"
            >
              <ScanFace className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Reconhecer Motorista</span>
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${
                activeTab === 'credits'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-teal-400 hover:bg-[#1c273a] hover:text-teal-300 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-4 h-4 shrink-0" />
                <span>Recarga de Crédito</span>
              </div>
              {creditRequests.filter((r) => r.status === 'pendente').length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  {creditRequests.filter((r) => r.status === 'pendente').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Clean System Status Footer */}
        <div className="p-4 border-t border-[#1e2a3f] bg-[#111927]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 text-[11px]">Central & DB Status</span>
            <span className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isCentralTrackingActive ? 'GPS Central Ativo' : 'Online'}</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {isCentralTrackingActive ? 'Transmissão em tempo real ativa' : 'Banco autônomo conectado'}
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Bar - Clean White Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Painel Admin MobiDrive - Visão Geral'}
              {activeTab === 'drivers' && 'Approved Drivers List & Reconhecimento'}
              {activeTab === 'vehicles' && 'Vehicle Type & Fleet Services'}
              {activeTab === 'tarifas' && 'Base de Tarifas & Pontos Específicos'}
              {activeTab === 'routes' && 'Route Distance & Time Calculator'}
              {activeTab === 'database' && 'Site Settings & Independent Database'}
              {activeTab === 'credits' && 'Solicitações de Recarga de Crédito (App Motorista)'}
              {activeTab === 'despacho' && 'Central de Despacho & Trava Anti-Concorrência (IndexedDB + Google Sheets)'}
            </h1>

            {/* Central Real-Time Location Indicator */}
            {isCentralTrackingActive && centralLocation ? (
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center space-x-1.5" title={centralLocation.enderecoFormatado}>
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />
                <span className="font-bold text-emerald-900">Local Exato:</span>
                <span className="truncate max-w-xs text-emerald-700">
                  {centralLocation.rua ? `${centralLocation.rua}${centralLocation.numero ? ', ' + centralLocation.numero : ''}${centralLocation.bairro ? ' (' + centralLocation.bairro + ')' : ''}` : centralLocation.enderecoFormatado}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100/60 px-1.5 py-0.2 rounded shrink-0">
                  {centralLocation.lat.toFixed(4)}, {centralLocation.lng.toFixed(4)}
                </span>
              </span>
            ) : detectedLocation ? (
              <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 flex items-center space-x-1.5" title={detectedLocation.enderecoFormatado}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>
                  {detectedLocation.rua ? `${detectedLocation.rua}${detectedLocation.numero ? ', ' + detectedLocation.numero : ''} • ${detectedLocation.cidade || ''}` : `${detectedLocation.cidade || 'Central'}, ${detectedLocation.estado || 'BR'}`}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({detectedLocation.lat.toFixed(4)}, {detectedLocation.lng.toFixed(4)})
                </span>
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-500 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                Aguardando Sinal de Localização Real
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* BOTÃO DA CENTRAL: PEDIR PERMISSÃO PARA ATIVAR LOCALIZAÇÃO EM TEMPO REAL */}
            {!isCentralTrackingActive ? (
              <button
                onClick={handleRequestCentralPermission}
                className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-600/20"
                title="Pedir permissão para ativar localização da central em tempo real via Google Maps"
              >
                <LocateFixed className="w-4 h-4 animate-pulse" />
                <span>Ativar Localização da Central</span>
              </button>
            ) : (
              <button
                onClick={handleStopCentralTracking}
                className="flex items-center space-x-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold px-3 py-1.5 rounded-xl transition"
                title="Pausar transmissão de localização da central"
              >
                <Radio className="w-3.5 h-3.5 text-rose-600 animate-ping" />
                <span>Pausar Rastreio Central</span>
              </button>
            )}

            <button
              onClick={handleCaptureRealGps}
              disabled={isCapturingGps}
              className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium transition border border-slate-300/80"
              title="Obter coordenadas GPS reais do dispositivo"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>{isCapturingGps ? 'GPS...' : 'GPS'}</span>
            </button>

            <button
              onClick={loadDatabaseData}
              className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium transition border border-slate-300/80"
              title="Sincronizar banco de dados"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sincronizar</span>
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">Super Admin</p>
                <p className="text-[10px] text-slate-500">Dispatch Central</p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 ring-2 ring-emerald-500/40 shadow-xs shrink-0">
                <img
                  src={getAssetUrl('assets/images/admin-director.jpg')}
                  alt="Super Admin"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Status Bar */}
        {gpsStatusMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-8 py-2 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span>{gpsStatusMsg}</span>
            </div>
            {centralLocation?.enderecoFormatado && (
              <span className="font-semibold text-slate-600 text-[11px] truncate max-w-md">
                Endereço Google Maps: {centralLocation.enderecoFormatado}
              </span>
            )}
          </div>
        )}

        {/* Aviso de chave e motor cartográfico */}
        {billingNotice && (
          <div className="bg-slate-800 border-b border-slate-700 px-8 py-2 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                API Google Maps conectada. Motor de renderização cartográfica de alta precisão ativo com suporte a marcadores, zonas dinâmicas e rotas.
              </span>
            </div>
            <span className="text-[11px] bg-slate-700 text-emerald-400 px-2 py-0.5 rounded font-mono">
              Alta Precisão Ativa
            </span>
          </div>
        )}

        {/* TAB 1: NEXAFLEET STYLE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-6">
            {/* Banner Executivo da Central com Imagem Estruturada da Prévia Integrada */}
            <div className="bg-gradient-to-r from-[#111927] via-[#151e2d] to-[#111927] rounded-3xl p-5 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="flex items-center space-x-4 min-w-0 z-10">
                <div
                  onClick={() => setPreviewAssetModal(STRUCTURED_ASSETS[0])}
                  className="w-20 h-14 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg shrink-0 bg-slate-900 group cursor-pointer relative"
                  title="Clique para inspecionar a imagem da prévia da Central MobiDrive"
                >
                  <img
                    src={getAssetUrl('assets/images/dashboard-preview.jpg')}
                    alt="Prévia do Painel MobiDrive"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-white font-black text-sm md:text-base truncate">
                      Central de Operações MobiDrive • Monitoramento de Frota
                    </h2>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                      GitHub Pages Ready
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-0.5">
                    Arquivos e visual da prévia 100% integrados à raiz do projeto. Rastreamento por satélite em tempo real, despacho anti-concorrência e OCR de documentos.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2.5 shrink-0 z-10">
                <button
                  onClick={() => setActiveTab('database')}
                  className="bg-[#1e2a3f] hover:bg-[#273752] text-emerald-400 border border-emerald-500/30 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Galeria de Arquivos</span>
                </button>
                <button
                  onClick={handleCaptureRealGps}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Meu Local Exato</span>
                </button>
              </div>
            </div>

            {/* Top Grid: NexaFleet Map on Left + Status Overview, Fulfillment & Revenue on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* NexaFleet Dark Styled Map (8 columns) */}
              <div className="lg:col-span-8 bg-[#151e2d] rounded-3xl p-5 shadow-lg border border-slate-800/80 flex flex-col relative overflow-hidden min-h-[460px]">
                {/* Floating Map Controls */}
                <div className="absolute top-8 left-8 right-8 z-10 flex justify-between items-center pointer-events-none">
                  <div className="bg-[#1e2a3f]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md flex items-center space-x-2 pointer-events-auto">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar motorista / veículo..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-48"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pointer-events-auto">
                    {isCentralTrackingActive && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Central Ao Vivo</span>
                      </span>
                    )}
                    <span className="bg-[#1e2a3f]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono text-emerald-400">
                      {vehicles.length} Veículos Ativos
                    </span>
                  </div>
                </div>

                {/* Map Container (Google Maps ou Leaflet Dark Matter Failover) */}
                <div ref={mapContainerRef} className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden" />

                {/* Live Address & Street Details Bottom Badge */}
                {centralLocation && (
                  <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-auto">
                    <div className="bg-[#151e2d]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-extrabold text-xs">Local Exato da Central:</span>
                            <span className="text-emerald-400 font-bold text-xs truncate">
                              {centralLocation.rua ? `${centralLocation.rua}${centralLocation.numero ? ', ' + centralLocation.numero : ''}` : centralLocation.enderecoFormatado}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {centralLocation.bairro ? `${centralLocation.bairro} • ` : ''}
                            {centralLocation.cidade ? `${centralLocation.cidade} - ${centralLocation.estado || ''} ` : ''}
                            {centralLocation.cep ? `• CEP ${centralLocation.cep}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700">
                          {centralLocation.lat.toFixed(5)}, {centralLocation.lng.toFixed(5)}
                        </span>
                        <button
                          onClick={handleCaptureRealGps}
                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] transition flex items-center space-x-1"
                          title="Atualizar localização agora"
                        >
                          <Crosshair className="w-3 h-3 text-slate-950" />
                          <span>Atualizar GPS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay when 0 vehicles e 0 central */}
                {vehicles.length === 0 && !centralLocation && (
                  <div className="absolute inset-0 bg-[#151e2d]/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                    <div className="w-14 h-14 rounded-2xl bg-[#1e2a3f] border border-slate-700 flex items-center justify-center text-emerald-400 mb-3 shadow-xl">
                      <Compass className="w-7 h-7" />
                    </div>
                    <p className="text-sm text-white font-bold">Mapa da Frota Conectado</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      0 veículos em operação (iniciado em 0 sem simulação). Ative a localização da central ou cadastre motoristas para vê-los em tempo real.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side Cards (4 columns) */}
              <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
                {/* 1. Status Overview Card */}
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-slate-800">Status Overview</h3>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                      Tempo Real
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center my-3">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">0%</p>
                      <p className="text-[10px] text-slate-400">Loading</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">0%</p>
                      <p className="text-[10px] text-slate-400">In Transit</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">0%</p>
                      <p className="text-[10px] text-slate-400">Unloading</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">0%</p>
                      <p className="text-[10px] text-slate-400">Delivered</p>
                    </div>
                  </div>

                  {/* Multi-color progress bar */}
                  <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                    <div className="h-full bg-amber-400 rounded-l-full" style={{ width: '25%' }}></div>
                    <div className="h-full bg-emerald-500" style={{ width: '25%' }}></div>
                    <div className="h-full bg-orange-400" style={{ width: '25%' }}></div>
                    <div className="h-full bg-pink-500 rounded-r-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                {/* 2. Fulfillment Performance Card */}
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-slate-800">Fulfillment Performance</h3>
                    <span className="text-[11px] text-slate-400">Média</span>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="text-2xl font-black text-slate-900">{stats.totalRides}</span>
                    <span className="text-xs text-slate-400">corridas finalizadas</span>
                  </div>

                  {/* Decorative vertical bar chart bars */}
                  <div className="h-16 flex items-end justify-between gap-1.5 pt-2">
                    {[30, 45, 25, 60, 40, 80, 50, 35, 70, 45, 65, 55, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-400"
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* 3. Revenue Over Time Card */}
                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                  <div>
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Revenue Over Time</p>
                    <h4 className="text-3xl font-black text-white mt-1">
                      R$ {stats.totalRevenue.toFixed(2)}
                    </h4>
                    <p className="text-[11px] text-white/80 mt-0.5">Iniciado em 0 à espera de faturamento real</p>
                  </div>

                  <div className="h-10 my-1">
                    <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                      <path
                        d="M0 20 Q 25 5, 50 18 T 100 8"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="flex bg-black/15 backdrop-blur-md rounded-xl p-1 text-[11px] font-bold text-white/90 justify-between">
                    <span className="px-2 py-0.5 rounded-lg hover:bg-white/20 cursor-pointer">Week</span>
                    <span className="px-2 py-0.5 rounded-lg bg-white text-slate-900 shadow-xs cursor-pointer">Month</span>
                    <span className="px-2 py-0.5 rounded-lg hover:bg-white/20 cursor-pointer">6 mos</span>
                    <span className="px-2 py-0.5 rounded-lg hover:bg-white/20 cursor-pointer">Year</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Orders / Corridas Table */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <h3 className="font-extrabold text-base text-slate-900">
                    Orders / Registros Recentes ({drivers.length})
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenDriverRecognition()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
                  >
                    <ScanFace className="w-3.5 h-3.5" />
                    <span>Reconhecer Motorista</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Order / ID</th>
                      <th className="py-3 px-4 font-semibold">Motorista</th>
                      <th className="py-3 px-4 font-semibold">Categoria</th>
                      <th className="py-3 px-4 font-semibold">Coordenadas</th>
                      <th className="py-3 px-4 font-semibold">Saldo Carteira</th>
                      <th className="py-3 px-4 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          Nenhum registro no banco de dados. Cadastre um motorista para preencher com registros reais.
                        </td>
                      </tr>
                    ) : (
                      drivers.map((d: any) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">OR-{1000 + d.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{d.nome}</td>
                          <td className="py-3.5 px-4 text-slate-500">{d.vehicleType || 'Sedan'}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">
                            {Number(d.lat).toFixed(3)}, {Number(d.lng).toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                            R$ {Number(d.walletBalance || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenDriverRecognition(d)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center space-x-1"
                                title="Ver Perfil & Reconhecimento Completo"
                              >
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Reconhecer</span>
                              </button>
                              <button
                                onClick={() => handleOpenCreditModal(d)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] flex items-center space-x-1"
                                title="Recarregar Crédito"
                              >
                                <Wallet className="w-3 h-3 text-emerald-600" />
                                <span>Recarga</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPROVED DRIVERS LIST & RECONHECIMENTO */}
        {activeTab === 'drivers' && (
          <div className="p-8 space-y-6">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Approved Drivers List & Reconhecimento</h2>
                  <p className="text-xs text-slate-400">Reconhecimento de motoristas, validação de CNH OCR e recargas de crédito</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenDriverRecognition()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Painel de Reconhecimento</span>
                </button>
                <button
                  onClick={() => setDriverFilter('all')}
                  className={`text-xs px-3 py-2 rounded-xl font-semibold transition ${
                    driverFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Todos ({drivers.length})
                </button>
                <button
                  onClick={() => setDriverFilter('approved')}
                  className={`text-xs px-3 py-2 rounded-xl font-semibold transition ${
                    driverFilter === 'approved' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Aprovados
                </button>
                <button
                  onClick={() => setDriverFilter('pending')}
                  className={`text-xs px-3 py-2 rounded-xl font-semibold transition ${
                    driverFilter === 'pending' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Pendentes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form de Cadastro de Motorista */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Novo Cadastro de Motorista</span>
                </h3>

                <form onSubmit={handleRegisterDriver} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nome do Motorista</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">CPF</label>
                    <input
                      type="text"
                      value={driverCpf}
                      onChange={(e) => setDriverCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tipo de Veículo</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="Sedan">Carro Sedan</option>
                      <option value="Hatchback">Carro Hatchback</option>
                      <option value="SUV">Carro SUV</option>
                      <option value="Moto">Moto</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-slate-600 font-semibold">Arquivo da CNH (Imagem OCR)</label>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const cnhPath = getAssetUrl('assets/images/cnh-sample-doc.jpg');
                            setCnhPreview(cnhPath);
                            setDriverName('Pedro Henrique Silva Almeida');
                            setDriverCpf('123.456.789-00');
                            const res = await fetch(cnhPath);
                            const blob = await res.blob();
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCnhBase64(reader.result as string);
                            };
                            reader.readAsDataURL(blob);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                        title="Carregar imagem CNH oficial estruturada para teste imediato de OCR"
                      >
                        + Carregar CNH Oficial
                      </button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    {cnhPreview && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100 flex items-center justify-center p-1 shadow-inner">
                        <img src={cnhPreview} alt="Preview CNH" className="h-full object-contain rounded-lg" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600">Localização Inicial</span>
                      <button
                        type="button"
                        onClick={handleCaptureRealGps}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Usar GPS Atual
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <input
                        type="number"
                        step="any"
                        placeholder="Lat"
                        value={driverLat || ''}
                        onChange={(e) => setDriverLat(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg p-1.5"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Lng"
                        value={driverLng || ''}
                        onChange={(e) => setDriverLng(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg p-1.5"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingReg}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
                  >
                    {loadingReg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Processar OCR e Salvar Motorista</span>
                  </button>
                </form>
              </div>

              {/* FOX-TAXI Approved Drivers Table */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>Motoristas Registrados:</span>
                    <span className="font-bold text-slate-900">{filteredDrivers.length}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">Search:</span>
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Nome ou CPF..."
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 border-y border-slate-200 font-bold">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Vehicle Type</th>
                        <th className="p-2.5">Driver Name</th>
                        <th className="p-2.5">CPF</th>
                        <th className="p-2.5">Rating</th>
                        <th className="p-2.5">Wallet Balance</th>
                        <th className="p-2.5">Status OCR</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDrivers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-400">
                            Nenhum motorista encontrado no banco. Cadastre um motorista com foto da CNH.
                          </td>
                        </tr>
                      ) : (
                        filteredDrivers.map((d: any, idx: number) => (
                          <tr key={d.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-2.5 font-bold text-slate-900">{idx + 1}</td>
                            <td className="p-2.5">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-6 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  <img
                                    src={getAssetUrl(`assets/images/vehicles/${
                                      d.vehicleType?.toLowerCase() === 'moto' ? 'moto' :
                                      d.vehicleType?.toLowerCase() === 'suv' ? 'suv' :
                                      d.vehicleType?.toLowerCase() === 'hatchback' ? 'hatchback' :
                                      d.vehicleType?.toLowerCase() === 'premium' ? 'premium' : 'sedan'
                                    }.svg`)}
                                    alt={d.vehicleType || 'Sedan'}
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                </div>
                                <span className="font-semibold text-slate-800">{d.vehicleType || 'Sedan'}</span>
                              </div>
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{d.nome}</td>
                            <td className="p-2.5 font-mono text-slate-500">{d.cpf}</td>
                            <td className="p-2.5">
                              <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                                <Star className="w-3.5 h-3.5 fill-emerald-500" />
                                <span>{Number(d.rating || 5.0).toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-emerald-600 font-mono">
                                R$ {Number(d.walletBalance || 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.status === 'Aprovado_Auto'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {d.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenDriverRecognition(d)}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  title="Reconhecimento & Perfil Completo"
                                >
                                  <ScanFace className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                                <button
                                  onClick={() => handleOpenCreditModal(d)}
                                  className="p-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700"
                                  title="Recarregar Crédito"
                                >
                                  <Wallet className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateDriverStatus(d.id, 'Aprovado_Auto')}
                                  className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  title="Aprovar CNH"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDriver(d.id)}
                                  className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VEHICLES & TRANSPORT SERVICES */}
        {activeTab === 'vehicles' && (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Vehicle Type & Fleet List</h2>
                  <p className="text-xs text-slate-400">All Vehicle Type List of Taxi-ride</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle Type</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 border-y border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">No</th>
                      <th className="p-3">Vehicle Icon</th>
                      <th className="p-3">Vehicle Name</th>
                      <th className="p-3">Placa</th>
                      <th className="p-3">Motorista Vinculado</th>
                      <th className="p-3">Cost For Km</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400">
                          Nenhum veículo registrado na frota. Adicione um veículo para visualizar na tabela e mapa.
                        </td>
                      </tr>
                    ) : (
                      vehicles.map((v: any, i: number) => (
                        <tr key={v.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900">{i + 1}</td>
                          <td className="p-3">
                            <div className="w-10 h-7 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shadow-2xs">
                              <img
                                src={getAssetUrl(`assets/images/vehicles/${
                                  (v.tipo || v.modelo)?.toLowerCase().includes('moto') ? 'moto' :
                                  (v.tipo || v.modelo)?.toLowerCase().includes('suv') ? 'suv' :
                                  (v.tipo || v.modelo)?.toLowerCase().includes('hatch') ? 'hatchback' :
                                  (v.tipo || v.modelo)?.toLowerCase().includes('prem') ? 'premium' : 'sedan'
                                }.svg`)}
                                alt={v.modelo}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{v.modelo}</td>
                          <td className="p-3 font-mono text-slate-500">{v.placa}</td>
                          <td className="p-3 text-slate-700 font-medium">{v.driverName || 'Não atribuído'}</td>
                          <td className="p-3 font-bold text-emerald-600">R$ {Number(v.costPerKm).toFixed(2)}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                v.status === 'disponivel'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {v.status === 'disponivel' ? 'Disponível' : 'Em Corrida'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteVehicle(v.id)}
                              className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BASE DE TARIFAS (TAXA BASE, VALOR POR KM & MAPA LOGO ABAIXO) */}
        {activeTab === 'tarifas' && (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Base de Tarifas & Pontos Específicos</h2>
                  <p className="text-xs text-slate-400">Taxa base, valor por km e mapa para desenhar zonas dinâmicas</p>
                </div>
              </div>

              <button
                onClick={() => setShowDocsModal(!showDocsModal)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-200"
              >
                <Code className="w-4 h-4 text-emerald-600" />
                <span>{showDocsModal ? 'Ocultar Script Apps' : 'Ver Script Apps / Planilha'}</span>
              </button>
            </div>

            {/* Código Apps Script mantido no sistema */}
            {showDocsModal && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-400">Google Apps Script Web App (doPost dinâmico)</span>
                  <span className="text-slate-400 text-[11px]">Banco próprio ativo com espelhamento em Planilha</span>
                </div>
                <pre className="bg-black/50 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var tabela = data.tabela || 'motoristas';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(tabela) || ss.insertSheet(tabela);
    sheet.appendRow([new Date(), JSON.stringify(data)]);
    return ContentService.createTextOutput(JSON.stringify({ status: 'sucesso', tabela: tabela, recebido: data })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'erro', mensagem: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                </pre>
              </div>
            )}

            {/* COMANDOS DE TARIFAS (TAXA BASE & VALOR POR KM) */}
            <form onSubmit={handleSaveTarifas} className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900">Comandos Principais de Tarifas</h3>
                <button
                  type="submit"
                  disabled={savingTarifas}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  {savingTarifas ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Salvar Tarifas no Banco</span>
                </button>
              </div>

              {/* Grid com Taxa Base e Valor por Km */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Taxa Base</span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Bandeirada</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={taxaBaseInput}
                      onChange={(e) => setTaxaBaseInput(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Valor inicial cobrado na partida de cada corrida.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Valor por Km</span>
                    <span className="text-[11px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">Distância</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorPorKmInput}
                      onChange={(e) => setValorPorKmInput(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Valor cobrado por cada quilômetro percorrido.</p>
                </div>
              </div>

              {/* Taxas complementares */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Taxa por Minuto</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxaPorMinutoInput}
                    onChange={(e) => setTaxaPorMinutoInput(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Tarifa Mínima</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxaMinimaInput}
                    onChange={(e) => setTaxaMinimaInput(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1">Taxa de Cancelamento</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxaCancelamentoInput}
                    onChange={(e) => setTaxaCancelamentoInput(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </form>

            {/* MAPA LOGO ABAIXO NESSA PÁGINA PARA DESENHAR PONTO ESPECÍFICO PRA ADICIONAR DINÂMICO */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/90 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                    <Map className="w-4 h-4 text-emerald-600" />
                    <span>Mapa para Desenhar Ponto Específico Dinâmico</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clique em qualquer local do mapa abaixo para capturar coordenadas ou ajustar o raio da zona tarifária.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureRealGps}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 font-semibold transition border border-slate-200"
                >
                  <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Marcar Meu GPS no Mapa</span>
                </button>
              </div>

              {/* Container do Mapa */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
                <div ref={tarifasMapContainerRef} className="w-full h-[400px]" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-semibold shadow-md pointer-events-none z-10">
                  Clique no mapa para marcar as coordenadas do ponto dinâmico
                </div>
              </div>

              {/* Formulário de Adição do Ponto Dinâmico */}
              <form onSubmit={handleAddPontoDinamico} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Adicionar Ponto Específico</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nome do Ponto</label>
                    <input
                      type="text"
                      value={pontoNome}
                      onChange={(e) => setPontoNome(e.target.value)}
                      placeholder="Ex: Aeroporto, Terminal"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Coordenadas (Lat / Lng)</label>
                    <div className="grid grid-cols-2 gap-1.5 font-mono">
                      <input
                        type="number"
                        step="any"
                        value={pontoLat || ''}
                        onChange={(e) => setPontoLat(Number(e.target.value))}
                        placeholder="Lat"
                        className="bg-white border border-slate-200 rounded-lg p-1.5"
                        required
                      />
                      <input
                        type="number"
                        step="any"
                        value={pontoLng || ''}
                        onChange={(e) => setPontoLng(Number(e.target.value))}
                        placeholder="Lng"
                        className="bg-white border border-slate-200 rounded-lg p-1.5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Raio de Cobertura ({pontoRaio}m)</label>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={pontoRaio}
                      onChange={(e) => setPontoRaio(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Taxa Adicional (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pontoTaxaAdicional}
                      onChange={(e) => setPontoTaxaAdicional(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={pontoTipo === 'ponto_embarque'}
                        onChange={() => setPontoTipo('ponto_embarque')}
                        className="accent-emerald-600"
                      />
                      <span>Ponto Fixo</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={pontoTipo === 'aeroporto'}
                        onChange={() => setPontoTipo('aeroporto')}
                        className="accent-emerald-600"
                      />
                      <span>Aeroporto</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={pontoTipo === 'geocerca'}
                        onChange={() => setPontoTipo('geocerca')}
                        className="accent-emerald-600"
                      />
                      <span>Geocerca</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPonto}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    {savingPonto ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Adicionar Ponto Dinâmico ao Banco</span>
                  </button>
                </div>
              </form>

              {/* Tabela de Pontos Cadastrados */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 border-y border-slate-200 font-bold">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Nome do Ponto</th>
                      <th className="p-2.5">Tipo</th>
                      <th className="p-2.5">Coordenadas</th>
                      <th className="p-2.5">Raio</th>
                      <th className="p-2.5">Taxa Adicional</th>
                      <th className="p-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!tarifas.pontosEspecificos || tarifas.pontosEspecificos.length === 0) ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Nenhum ponto dinâmico cadastrado. Clique no mapa acima para adicionar.
                        </td>
                      </tr>
                    ) : (
                      tarifas.pontosEspecificos.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 font-bold">{p.id}</td>
                          <td className="p-2.5 font-bold text-slate-900">{p.nome}</td>
                          <td className="p-2.5 capitalize">{p.tipo.replace('_', ' ')}</td>
                          <td className="p-2.5 font-mono text-slate-500">{Number(p.lat).toFixed(4)}, {Number(p.lng).toFixed(4)}</td>
                          <td className="p-2.5 font-mono">{p.raioMetros} m</td>
                          <td className="p-2.5 font-bold text-emerald-600">+ R$ {Number(p.taxaAdicional).toFixed(2)}</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeletePonto(p.id)}
                              className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ROTAS & DIRECTIONS */}
        {activeTab === 'routes' && (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Route Calculator (DirectionsService)</h2>
                <p className="text-xs text-slate-400">Cálculo de distância em metros, duração e tarifa estimada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Coordenadas Dinâmicas</h3>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Partida</span>
                    <button onClick={handleCaptureRealGps} className="text-emerald-600 text-[11px] font-semibold hover:underline">
                      Preencher GPS Atual
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <input
                      type="number"
                      step="any"
                      placeholder="Lat"
                      value={partidaLat}
                      onChange={(e) => setPartidaLat(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg p-2"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Lng"
                      value={partidaLng}
                      onChange={(e) => setPartidaLng(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700">Destino</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <input
                      type="number"
                      step="any"
                      placeholder="Lat"
                      value={destinoLat}
                      onChange={(e) => setDestinoLat(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg p-2"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Lng"
                      value={destinoLng}
                      onChange={(e) => setDestinoLng(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculateRoute}
                  disabled={loadingRoute}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
                >
                  {loadingRoute ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  <span>Calcular Rota via Google Maps API</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Resultado da Rota</h3>
                  {routeResult ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-slate-400 font-semibold">Distância</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{routeResult.distanceMeters} m</p>
                          {routeResult.distanceText && <p className="text-[10px] text-slate-500">{routeResult.distanceText}</p>}
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-slate-400 font-semibold">Duração</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{routeResult.durationSeconds} s</p>
                          {routeResult.durationText && <p className="text-[10px] text-slate-500">{routeResult.durationText}</p>}
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                        <div>
                          <p className="text-emerald-800 font-bold">Tarifa Calculada</p>
                          <p className="text-[10px] text-emerald-600">Com base na Base de Tarifas</p>
                        </div>
                        <div className="text-xl font-black text-emerald-700 font-mono">
                          R$ {Number(routeResult.estimatedFare || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Nenhuma rota calculada. Insira coordenadas para disparar a API.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DATABASE SETTINGS */}
        {activeTab === 'database' && (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Site Settings & Independent Database</h2>
                <p className="text-xs text-slate-400">Banco de dados local autônomo (/data/database.json)</p>
              </div>
              <button
                onClick={handleResetDatabase}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Zerar Banco de Dados (0)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Status do Armazenamento</span>
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Motoristas:</span>
                    <span className="font-bold text-slate-900">{drivers.length} registros</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Veículos:</span>
                    <span className="font-bold text-slate-900">{vehicles.length} registros</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Pontos Tarifários:</span>
                    <span className="font-bold text-slate-900">{tarifas.pontosEspecificos?.length || 0} cadastrados</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Persistência:</span>
                    <span className="font-bold text-emerald-600">Arquivo JSON Local (/data/database.json)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>Webhook de Sincronização Externa</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <label className="block text-slate-600 font-semibold">URL do Google Apps Script (Opcional)</label>
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={(e) => setGasUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400">
                    Espelhamento automático em planilhas Google Sheets quando configurado.
                  </p>
                </div>
              </div>
            </div>

            {/* Galeria de Arquivos e Imagens Estruturadas do Painel (Pronto para Publicação no GitHub Pages) */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                    <FolderArchive className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Galeria de Arquivos & Imagens Estruturadas do Painel
                    </h3>
                    <p className="text-xs text-slate-400">
                      Todos os ativos da prévia vinculados e prontos para publicação estática no GitHub Pages sem edições manuais
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>GitHub Pages Ready</span>
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                    {STRUCTURED_ASSETS.length} Ativos Estruturados
                  </span>
                </div>
              </div>

              {/* Grid dos Ativos Estruturados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {STRUCTURED_ASSETS.map((asset) => (
                  <div
                    key={asset.id}
                    className="group bg-slate-50/80 hover:bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div
                        onClick={() => setPreviewAssetModal(asset)}
                        className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center relative cursor-pointer group-hover:border-emerald-500/50 shadow-inner"
                      >
                        <img
                          src={getAssetUrl(asset.path)}
                          alt={asset.name}
                          className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-slate-950/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inspecionar</span>
                          </span>
                        </div>
                      </div>

                      {/* Informações do Ativo */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {asset.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{asset.type}</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {asset.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {asset.description}
                        </p>
                      </div>
                    </div>

                    {/* Rodapé com Caminho e Botão */}
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]" title={asset.path}>
                        {asset.path}
                      </span>
                      <button
                        onClick={() => setPreviewAssetModal(asset)}
                        className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center space-x-1"
                      >
                        <span>Ver</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guia Técnico de Publicação Direta */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Pronto para Publicação no GitHub Pages (Single-Page App)</span>
                  </span>
                  <p className="text-emerald-800 text-[11px]">
                    Configuração de base relativa (<code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">base: './'</code>) ativa no Vite. Todas as imagens e rotas funcionam em qualquer subdiretório do GitHub Pages.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="bg-white border border-emerald-300 text-emerald-800 font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs">
                    npm run build
                  </span>
                </div>
              </div>
            </div>

            {/* Tabela de Dispositivos e Apps Conectados via IP */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Dispositivos & Apps Conectados ao Servidor (Reconhecimento por IP e Google Maps)
                  </h3>
                </div>
                <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600">
                  {connectedDevices.length} conexões registradas
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold border-y border-slate-200">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Dispositivo / App</th>
                      <th className="p-2.5">IP Reconhecido</th>
                      <th className="p-2.5">Localização Google Maps</th>
                      <th className="p-2.5">Provedor / ISP</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {connectedDevices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          Nenhum aplicativo ou dispositivo externo conectado ainda.
                        </td>
                      </tr>
                    ) : (
                      connectedDevices.map((dev: any) => (
                        <tr key={dev.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 font-bold">{dev.id}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{dev.nomeIdentificador || dev.tipo}</td>
                          <td className="p-2.5 font-mono text-emerald-700 font-bold">{dev.ip}</td>
                          <td className="p-2.5 text-slate-600">{dev.enderecoFormatado || `${dev.cidade}, ${dev.estado}`}</td>
                          <td className="p-2.5 text-slate-500">{dev.provedorInternet || 'Rede Local / Padrão'}</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ● Online
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SOLICITAÇÕES DE RECARGA DE CRÉDITO DOS MOTORISTAS (0 SIMULAÇÃO) */}
        {activeTab === 'credits' && (
          <div className="p-8 space-y-6">
            {/* Header & Subtitle */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Solicitações de Recarga de Crédito dos Motoristas</h2>
                    <p className="text-xs text-slate-500">
                      Pedidos reais de crédito enviados pelos motoristas via aplicativo ou balcão (armazenados no banco de dados local)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (drivers.length > 0) {
                      setReqDriverId(String(drivers[0].id));
                    }
                    setShowNewCreditRequestModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Solicitação via App</span>
                </button>

                <button
                  onClick={() => {
                    if (drivers.length > 0) {
                      handleOpenCreditModal(drivers[0]);
                    } else {
                      alert('Nenhum motorista cadastrado ainda.');
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 border border-slate-200"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Recarga Manual Direta</span>
                </button>

                <button
                  onClick={loadDatabaseData}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition border border-slate-200 flex items-center space-x-1"
                  title="Atualizar lista"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pendentes de Aprovação</span>
                  <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">
                    {creditRequests.filter((r) => r.status === 'pendente').length}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total: R$ {creditRequests.filter((r) => r.status === 'pendente').reduce((sum, r) => sum + (Number(r.valor) || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Aprovado & Creditado</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                    R$ {creditRequests.filter((r) => r.status === 'aprovado').reduce((sum, r) => sum + (Number(r.valor) || 0), 0).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {creditRequests.filter((r) => r.status === 'aprovado').length} solicitações concluídas
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Solicitações Recusadas</span>
                  <span className="text-2xl font-black text-rose-500 font-mono mt-1 block">
                    {creditRequests.filter((r) => r.status === 'rejeitado').length}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Sem débito ou lançamento
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <X className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Total em Carteiras</span>
                  <span className="text-2xl font-black text-teal-600 font-mono mt-1 block">
                    R$ {drivers.reduce((sum, d) => sum + (Number(d.walletBalance) || 0), 0).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {drivers.length} motoristas cadastrados
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setCreditFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    creditFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Todas</span>
                  <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full">
                    {creditRequests.length}
                  </span>
                </button>

                <button
                  onClick={() => setCreditFilter('pendente')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    creditFilter === 'pendente'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <span>Pendentes</span>
                  <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {creditRequests.filter((r) => r.status === 'pendente').length}
                  </span>
                </button>

                <button
                  onClick={() => setCreditFilter('aprovado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    creditFilter === 'aprovado'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <span>Aprovadas</span>
                  <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {creditRequests.filter((r) => r.status === 'aprovado').length}
                  </span>
                </button>

                <button
                  onClick={() => setCreditFilter('rejeitado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    creditFilter === 'rejeitado'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <span>Rejeitadas</span>
                  <span className="bg-rose-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {creditRequests.filter((r) => r.status === 'rejeitado').length}
                  </span>
                </button>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={creditSearch}
                  onChange={(e) => setCreditSearch(e.target.value)}
                  placeholder="Filtrar por motorista, CPF ou ID..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* List / Table of Requests */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
              {creditRequests.filter((req) => {
                if (creditFilter !== 'all' && req.status !== creditFilter) return false;
                if (creditSearch.trim()) {
                  const q = creditSearch.toLowerCase();
                  return (
                    (req.driverNome || '').toLowerCase().includes(q) ||
                    (req.driverCpf || '').includes(q) ||
                    String(req.id).includes(q) ||
                    (req.metodo || '').toLowerCase().includes(q)
                  );
                }
                return true;
              }).length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">
                    Nenhuma solicitação de recarga encontrada
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {creditRequests.length === 0
                      ? 'Nenhum pedido de recarga foi registrado ainda no banco de dados. Os pedidos enviados pelos motoristas através do aplicativo móvel aparecerão nesta lista em tempo real sem dados de simulação.'
                      : 'Nenhuma solicitação corresponde ao filtro de busca atual.'}
                  </p>
                  <button
                    onClick={() => {
                      if (drivers.length > 0) {
                        setReqDriverId(String(drivers[0].id));
                      }
                      setShowNewCreditRequestModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enviar Solicitação via App Motorista</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">ID / Data</th>
                        <th className="p-3.5">Motorista Solicitante</th>
                        <th className="p-3.5">Valor Solicitado</th>
                        <th className="p-3.5">Forma / Comprovante</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {creditRequests
                        .filter((req) => {
                          if (creditFilter !== 'all' && req.status !== creditFilter) return false;
                          if (creditSearch.trim()) {
                            const q = creditSearch.toLowerCase();
                            return (
                              (req.driverNome || '').toLowerCase().includes(q) ||
                              (req.driverCpf || '').includes(q) ||
                              String(req.id).includes(q) ||
                              (req.metodo || '').toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((req) => {
                          const driverInfo = drivers.find((d) => d.id === req.driverId);
                          const isProcessing = processingRequestId === req.id;

                          return (
                            <tr key={req.id} className="hover:bg-slate-50 transition">
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-slate-900 block">#{req.id}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {new Date(req.createdAt).toLocaleString()}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    {(req.driverNome || 'M').charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{req.driverNome}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      CPF: {req.driverCpf} • {req.driverVehicle || 'Sedan'}
                                    </span>
                                    {driverInfo && (
                                      <span className="text-[10px] text-emerald-600 font-bold block">
                                        Saldo Atual: R$ {Number(driverInfo.walletBalance || 0).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="text-base font-black text-emerald-600 font-mono block">
                                  R$ {Number(req.valor).toFixed(2)}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-slate-200">
                                  {req.metodo || 'PIX'}
                                </span>
                                {req.observacao && (
                                  <p className="text-[11px] text-slate-500 mt-1 italic max-w-xs truncate" title={req.observacao}>
                                    "{req.observacao}"
                                  </p>
                                )}
                              </td>
                              <td className="p-3.5">
                                {req.status === 'pendente' && (
                                  <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                    <span>Pendente</span>
                                  </span>
                                )}
                                {req.status === 'aprovado' && (
                                  <div>
                                    <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Aprovado</span>
                                    </span>
                                    {req.processadoEm && (
                                      <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                                        {new Date(req.processadoEm).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {req.status === 'rejeitado' && (
                                  <div>
                                    <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200">
                                      <X className="w-3 h-3 text-rose-600" />
                                      <span>Rejeitado</span>
                                    </span>
                                    {req.motivoRejeicao && (
                                      <p className="text-[10px] text-rose-600 mt-0.5 truncate max-w-xs" title={req.motivoRejeicao}>
                                        {req.motivoRejeicao}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                {req.status === 'pendente' ? (
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      disabled={isProcessing}
                                      onClick={() => handleApproveCreditRequest(req)}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center space-x-1 disabled:opacity-50"
                                      title="Aprovar e creditar o valor na carteira do motorista"
                                    >
                                      {isProcessing ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      )}
                                      <span>Aprovar</span>
                                    </button>

                                    <button
                                      disabled={isProcessing}
                                      onClick={() => handleRejectCreditRequest(req)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 rounded-xl text-xs transition border border-rose-200 disabled:opacity-50 flex items-center space-x-1"
                                      title="Rejeitar solicitação"
                                    >
                                      <X className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Rejeitar</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (driverInfo) {
                                        handleOpenDriverRecognition(driverInfo);
                                      } else {
                                        alert('Motorista não encontrado.');
                                      }
                                    }}
                                    className="text-slate-500 hover:text-slate-800 font-medium text-xs underline"
                                  >
                                    Ver Motorista
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: CENTRAL DE DESPACHO & TRAVA ANTI-CONCORRÊNCIA EM TEMPO REAL */}
        {activeTab === 'despacho' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Bar Card */}
            <div className="bg-[#111927] text-white p-6 rounded-3xl border border-[#1e2a3f] shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                      <span>Central de Despacho Reativa</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                        Trava RAM + IndexedDB
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Sincronização bidirecional em tempo real com Google Sheets (<code className="text-slate-300">ride_platform_rides</code>, <code className="text-slate-300">ride_platform_drivers</code>, <code className="text-slate-300">ride_platform_passengers</code>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Polling & Network Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-[#1a2333] px-3 py-2 rounded-xl border border-[#27354d] text-xs flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPollingActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                  <span className="text-slate-300 font-medium">
                    {isPollingActive ? 'Polling Rede: 3s' : 'Polling Pausado'}
                  </span>
                  {pollingStatus.latenciaMs > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ({pollingStatus.latenciaMs}ms)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => carregarDadosDespacho()}
                  className="bg-[#1c273a] hover:bg-[#25334c] text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-[#27354d]"
                  title="Forçar sincronização de tabelas agora"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar</span>
                </button>

                <button
                  onClick={() => {
                    if (isPollingActive) {
                      dispatchEngine.pararPollingRede();
                      setIsPollingActive(false);
                    } else {
                      dispatchEngine.iniciarPollingRede(gasUrl, 3000, {
                        onSync: () => carregarDadosDespacho()
                      });
                      setIsPollingActive(true);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isPollingActive
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isPollingActive ? 'Pausar Polling' : 'Iniciar Polling (3s)'}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pedidos Ativos no Cache
                  </span>
                  <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
                    {pedidosAtivos.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1 mt-0.5">
                    <Lock className="w-3 h-3" />
                    <span>status_trava: aguardando_motorista</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Corridas em Andamento
                  </span>
                  <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
                    {corridasEmAndamento.length}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium flex items-center space-x-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>status_trava: ocupada (movido)</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Car className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Arquivo Sheets
                  </span>
                  <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
                    {ridePlatformRides.length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                    ride_platform_rides geral
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                  <Database className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Trava Anti-Concorrência
                  </span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                    0.0 ms
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                    Decisão instantânea em RAM
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: PROVA DE CONCORRÊNCIA EM TEMPO REAL (REQUISITOS 1, 2 e 3) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Validação Prática da Trava Atômica (Dois Motoristas Simultâneos)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dispara o aceite de dois motoristas no mesmo milissegundo (<code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Promise.all</code>). O sistema garante exclusividade estrita sem dupla reserva.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    1. Selecionar Corrida Ativa (aguardando_motorista)
                  </label>
                  <select
                    value={selectedRideForConcurrency}
                    onChange={(e) => setSelectedRideForConcurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Escolha uma corrida disponível --</option>
                    {pedidosAtivos.map((p) => (
                      <option key={p.id} value={p.id}>
                        Corrida #{p.id} • {p.passengerName || 'Passageiro'} • R$ {Number(p.valor).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {pedidosAtivos.length === 0 && (
                    <span className="text-[10px] text-amber-600 mt-1 block">
                      Dica: Despache uma corrida abaixo para testar a trava.
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    2. Motorista Candidato A
                  </label>
                  <select
                    value={concurrencyDriver1}
                    onChange={(e) => setConcurrencyDriver1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecione o Motorista A --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.id} - {d.nome} ({d.vehicleType || 'Sedan'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    3. Motorista Candidato B (Concorrente)
                  </label>
                  <select
                    value={concurrencyDriver2}
                    onChange={(e) => setConcurrencyDriver2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecione o Motorista B --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.id} - {d.nome} ({d.vehicleType || 'Sedan'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={executarTesteAntiConcorrencia}
                  disabled={!selectedRideForConcurrency || !concurrencyDriver1 || !concurrencyDriver2 || isTestingConcurrency}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-amber-600/20 flex items-center space-x-2"
                >
                  <Zap className={`w-4 h-4 ${isTestingConcurrency ? 'animate-spin' : ''}`} />
                  <span>
                    {isTestingConcurrency ? 'Executando Trava Atômica...' : 'Disparar Aceite Simultâneo no Mesmo Milissegundo'}
                  </span>
                </button>
              </div>

              {/* Resultado visual da batalha */}
              {concurrencyBattleResult && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Resultado do Teste Anti-Concorrência em Tempo Real</span>
                    <span className="font-mono text-slate-500">
                      Disparo Simultâneo • Latência Total: {concurrencyBattleResult.diffMs}ms
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Vencedor */}
                    {concurrencyBattleResult.vencedor && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-xs uppercase text-emerald-800 tracking-wider">
                            PRIMEIRO MOTORISTA (ACEITO)
                          </span>
                        </div>
                        <p className="text-sm font-black font-mono text-emerald-700">
                          "{concurrencyBattleResult.vencedor.mensagem}"
                        </p>
                        <div className="text-[11px] text-emerald-800 space-y-0.5 pt-1">
                          <div>• Motorista Escolhido: <strong>{concurrencyBattleResult.vencedor.driverNome}</strong></div>
                          <div>• Trava Atualizada para: <strong>{concurrencyBattleResult.vencedor.status_trava}</strong></div>
                          <div>• Tempo de Processamento: <strong>{concurrencyBattleResult.vencedor.tempoProcessamentoMs}ms</strong></div>
                          <div>• Origem: {concurrencyBattleResult.vencedor.trajeto.origemEndereco || 'Definida'}</div>
                          <div>• Destino: {concurrencyBattleResult.vencedor.trajeto.destinoEndereco || 'Definido'}</div>
                        </div>
                      </div>
                    )}

                    {/* Rejeitado */}
                    {concurrencyBattleResult.rejeitado && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="font-bold text-xs uppercase text-rose-800 tracking-wider">
                            CONCORRENTE BLOQUEADO POR CÓDIGO
                          </span>
                        </div>
                        <p className="text-sm font-black font-mono text-rose-700">
                          "{concurrencyBattleResult.rejeitado.mensagem}"
                        </p>
                        <div className="text-[11px] text-rose-800 space-y-0.5 pt-1">
                          <div>• Motorista Bloqueado: <strong>{concurrencyBattleResult.rejeitado.driverNome}</strong></div>
                          <div>• Motivo: <strong>{concurrencyBattleResult.rejeitado.motivo}</strong></div>
                          <div>• Trava no Cache: <strong>{concurrencyBattleResult.rejeitado.status_trava_atual}</strong></div>
                          <div>• Tempo de Decisão: <strong>{concurrencyBattleResult.rejeitado.tempoProcessamentoMs}ms</strong></div>
                          <div className="text-[10px] text-rose-700 italic">Ação rejeitada imediatamente por código sem duplicar corrida.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 2: TABELA DE PEDIDOS ATIVOS (pedidos_ativos no IndexedDB) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Tabela Local: pedidos_ativos (Aguardando Motorista)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registros residentes no cache IndexedDB sob escuta do despacho.
                  </p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                  {pedidosAtivos.length} pendentes
                </span>
              </div>

              {pedidosAtivos.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    Nenhum pedido ativo no momento com status <code className="font-mono text-slate-700">aguardando_motorista</code>.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Crie um novo pedido dinâmico abaixo para despachar em tempo real.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">ID</th>
                        <th className="p-3">Passageiro</th>
                        <th className="p-3">Origem</th>
                        <th className="p-3">Destino</th>
                        <th className="p-3">Valor (R$)</th>
                        <th className="p-3">Trava Anti-Concorrência</th>
                        <th className="p-3 text-right">Aceite Individual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {pedidosAtivos.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">#{p.id}</td>
                          <td className="p-3 font-semibold text-slate-900">{p.passengerName || 'Passageiro App'}</td>
                          <td className="p-3 max-w-xs truncate" title={p.origemEndereco}>
                            {p.origemEndereco || `${p.origemLat.toFixed(4)}, ${p.origemLng.toFixed(4)}`}
                          </td>
                          <td className="p-3 max-w-xs truncate" title={p.destinoEndereco}>
                            {p.destinoEndereco || `${p.destinoLat.toFixed(4)}, ${p.destinoLng.toFixed(4)}`}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">
                            R$ {Number(p.valor).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
                              <Unlock className="w-3 h-3 text-amber-600" />
                              <span>{p.status_trava}</span>
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {drivers.length > 0 && (
                                <button
                                  onClick={() => {
                                    const first = drivers[0];
                                    handleAceitarCorridaDireto(p.id, first.id, first.nome);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs"
                                >
                                  Aceitar ({drivers[0].nome})
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SEÇÃO 3: CORRIDAS EM ANDAMENTO (corridas_em_andamento no IndexedDB) & LIMPEZA DE CACHE */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    <span>Tabela Local: corridas_em_andamento (Trava Ocupada)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ao finalizar ou cancelar, a corrida é arquivada e o cache local é <strong>limpo</strong> conforme o Requisito 4.
                  </p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full font-bold">
                  {corridasEmAndamento.length} ativas
                </span>
              </div>

              {corridasEmAndamento.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    Nenhuma corrida em andamento no cache no momento.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">ID</th>
                        <th className="p-3">Motorista Atribuído</th>
                        <th className="p-3">Passageiro</th>
                        <th className="p-3">Trajeto</th>
                        <th className="p-3">Trava</th>
                        <th className="p-3 text-right">Ação de Arquivamento (Limpar Cache)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {corridasEmAndamento.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">#{c.id}</td>
                          <td className="p-3 font-bold text-blue-700">{c.driverName || `Motorista #${c.driverId}`}</td>
                          <td className="p-3">{c.passengerName || 'Passageiro'}</td>
                          <td className="p-3 max-w-xs truncate" title={`${c.origemEndereco} -> ${c.destinoEndereco}`}>
                            {c.origemEndereco} → {c.destinoEndereco}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200">
                              <Lock className="w-3 h-3 text-blue-600" />
                              <span>{c.status_trava}</span>
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleArquivarCorridaDespacho(c.id, 'finalizada')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] transition shadow-xs"
                            >
                              Finalizar & Limpar Cache
                            </button>
                            <button
                              onClick={() => handleArquivarCorridaDespacho(c.id, 'cancelada')}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] transition shadow-xs"
                            >
                              Cancelar & Limpar Cache
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SEÇÃO 4: DESPACHO DE NOVO PEDIDO COM PARÂMETROS DINÂMICOS REAIS */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Despacho de Pedido com Parâmetros Dinâmicos Reais</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Insere uma solicitação real na fila reativa do IndexedDB com status_trava: <code className="text-emerald-700 font-mono">aguardando_motorista</code>.
                </p>
              </div>

              <form onSubmit={handleDespacharNovaCorridaReativa} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Nome do Passageiro
                  </label>
                  <input
                    type="text"
                    value={novoDespacho.passengerName}
                    onChange={(e) => setNovoDespacho({ ...novoDespacho, passengerName: e.target.value })}
                    placeholder="Nome do passageiro"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Endereço de Origem
                  </label>
                  <input
                    type="text"
                    required
                    value={novoDespacho.origemEndereco}
                    onChange={(e) => setNovoDespacho({ ...novoDespacho, origemEndereco: e.target.value })}
                    placeholder="Rua / Ponto de Partida"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Endereço de Destino
                  </label>
                  <input
                    type="text"
                    required
                    value={novoDespacho.destinoEndereco}
                    onChange={(e) => setNovoDespacho({ ...novoDespacho, destinoEndereco: e.target.value })}
                    placeholder="Destino do passageiro"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Valor (R$)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={novoDespacho.valor}
                      onChange={(e) => setNovoDespacho({ ...novoDespacho, valor: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={despachandoNova}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20 shrink-0"
                    >
                      Despachar
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* SEÇÃO 5: CONSOLE DE EVENTOS REATIVOS EM TEMPO REAL */}
            <div className="bg-[#111927] rounded-3xl border border-[#1e2a3f] shadow-lg p-6 space-y-3 text-white">
              <div className="flex items-center justify-between border-b border-[#1e2a3f] pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Feed de Mensagens Reativas & Respostas Exclusivas do Despacho
                  </h3>
                </div>
                <button
                  onClick={() => setDispatchLogs([])}
                  className="text-slate-400 hover:text-slate-200 text-xs font-medium underline"
                >
                  Limpar Feed
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 font-mono text-[11px] pr-2">
                {dispatchLogs.length === 0 ? (
                  <p className="text-slate-500 italic text-xs py-4 text-center">
                    Aguardando eventos do despacho... (aceites, bloqueios e sincronizações aparecerão aqui em tempo real).
                  </p>
                ) : (
                  dispatchLogs.map((log) => {
                    let badgeColor = 'text-slate-400 bg-slate-800';
                    if (log.tipo === 'aceite_sucesso') badgeColor = 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/40';
                    if (log.tipo === 'bloqueio_recusa') badgeColor = 'text-rose-400 bg-rose-950/80 border border-rose-500/40';
                    if (log.tipo === 'cache_limpo') badgeColor = 'text-blue-400 bg-blue-950/80 border border-blue-500/40';
                    if (log.tipo === 'polling_sync') badgeColor = 'text-teal-400 bg-teal-950/50 border border-teal-500/20';

                    return (
                      <div key={log.id} className="p-2.5 rounded-xl bg-[#162132] border border-[#23334d] flex items-start space-x-2">
                        <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${badgeColor}`}>
                          {log.tipo}
                        </span>
                        <span className="text-slate-200 break-all">{log.mensagem}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: PERMISSÃO DA CENTRAL DE OPERAÇÕES EM TEMPO REAL */}
      {showCentralPermissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <LocateFixed className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Ativar Localização da Central em Tempo Real</h3>
                  <p className="text-[11px] text-slate-500">Google Maps Platform & Browser Geolocation API</p>
                </div>
              </div>
              <button
                onClick={() => setShowCentralPermissionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                <p className="font-bold text-emerald-950 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Permissão de Rastreamento da Central Operacional</span>
                </p>
                <p className="text-emerald-900 text-xs leading-relaxed">
                  Ao confirmar, o sistema solicitará permissão de geolocalização ao seu navegador e conectará o fluxo contínuo de coordenadas da Central de Despacho às APIs do Google Maps (Geocoding Reverso e Coordenadas Geográficas) e salvará a posição em tempo real no banco de dados local.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Transmissão em tempo real via endpoint <code>/api/central/location</code></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Enriquecimento de endereço formal via Google Maps Geocoding API</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Exibição de radar e ponto fixo da Central no mapa da frota</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCentralPermissionModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCentralTracking}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
              >
                <Radio className="w-4 h-4" />
                <span>Confirmar e Ativar Rastreio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SISTEMA DE RECONHECIMENTO & PERFIL COMPLETO DO MOTORISTA */}
      {showDriverRecognitionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <ScanFace className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Sistema de Reconhecimento do Motorista</h3>
                  <p className="text-[11px] text-slate-500">Consulta de dados, CNH OCR, localização em tempo real e saldo</p>
                </div>
              </div>
              <button
                onClick={() => setShowDriverRecognitionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seletor Rápido de Motorista */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Selecione o motorista:</span>
              <select
                value={selectedDriverForRecognition?.id || ''}
                onChange={(e) => {
                  const found = drivers.find((d) => d.id === Number(e.target.value));
                  if (found) setSelectedDriverForRecognition(found);
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    ID #{d.id} - {d.nome} (CPF: {d.cpf})
                  </option>
                ))}
              </select>
            </div>

            {selectedDriverForRecognition ? (
              <div className="space-y-4 text-xs">
                {/* Header Card com Avatar, Status e Saldo */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-lg border-2 border-emerald-500/30 shrink-0">
                      {selectedDriverForRecognition.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-extrabold text-slate-900">{selectedDriverForRecognition.nome}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedDriverForRecognition.status === 'Aprovado_Auto'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedDriverForRecognition.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono mt-0.5">CPF: {selectedDriverForRecognition.cpf} • ID: #{selectedDriverForRecognition.id}</p>
                      <div className="flex items-center space-x-2 mt-1 text-slate-600 text-[11px]">
                        <span className="flex items-center text-emerald-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 mr-1" />
                          {Number(selectedDriverForRecognition.rating || 5.0).toFixed(1)}
                        </span>
                        <span>• Veículo: {selectedDriverForRecognition.vehicleType || 'Sedan'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Saldo da Carteira em Destaque */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Saldo da Carteira</span>
                    <span className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                      R$ {Number(selectedDriverForRecognition.walletBalance || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleOpenCreditModal(selectedDriverForRecognition)}
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1 rounded-xl transition flex items-center space-x-1"
                    >
                      <Wallet className="w-3 h-3" />
                      <span>Recarregar Saldo</span>
                    </button>
                  </div>
                </div>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Validação de Documento OCR */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Reconhecimento CNH OCR</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewAssetModal(STRUCTURED_ASSETS.find(a => a.id === 'cnh-sample-doc') || STRUCTURED_ASSETS[3])}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver CNH</span>
                      </button>
                    </div>

                    {/* Thumbnail da CNH */}
                    <div
                      onClick={() => setPreviewAssetModal(STRUCTURED_ASSETS.find(a => a.id === 'cnh-sample-doc') || STRUCTURED_ASSETS[3])}
                      className="h-20 w-full rounded-xl bg-slate-900 border border-slate-200 overflow-hidden cursor-pointer group relative flex items-center justify-center shadow-inner"
                      title="Clique para inspecionar documento CNH em alta definição"
                    >
                      <img
                        src={selectedDriverForRecognition.cnhUrl || getAssetUrl('assets/images/cnh-sample-doc.jpg')}
                        alt="Documento CNH"
                        className="h-full w-full object-contain p-0.5 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>Ampliar CNH</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Status OCR:</span>
                        <span className="font-bold text-slate-800">{selectedDriverForRecognition.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Validade CNH:</span>
                        <span className="font-bold text-slate-800">{selectedDriverForRecognition.validadeCnh || 'Validação Automática'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Arquivo CNH:</span>
                        <span className="text-emerald-700 font-medium font-mono text-[10px]">assets/images/cnh-sample-doc.jpg</span>
                      </div>
                    </div>
                  </div>

                  {/* Localização em Tempo Real via Google Maps */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Localização Atual (Google Maps)</span>
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Coordenadas:</span>
                        <span className="font-mono text-slate-800">
                          {Number(selectedDriverForRecognition.lat).toFixed(4)}, {Number(selectedDriverForRecognition.lng).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Endereço Formatado:</span>
                        <span className="text-slate-800 font-medium truncate max-w-[180px]">
                          {selectedDriverForRecognition.enderecoAtual || 'São Paulo, SP - Brasil'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IP de Conexão:</span>
                        <span className="font-mono text-slate-600">{selectedDriverForRecognition.ipConexao || '127.0.0.1'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Histórico de Recargas de Crédito */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                      <History className="w-4 h-4 text-teal-600" />
                      <span>Histórico de Recargas & Lançamentos</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setReqDriverId(String(selectedDriverForRecognition.id));
                          setShowNewCreditRequestModal(true);
                        }}
                        className="text-teal-600 font-bold hover:underline text-[11px]"
                      >
                        + Solicitar via App
                      </button>
                      <button
                        onClick={() => handleOpenCreditModal(selectedDriverForRecognition)}
                        className="text-emerald-600 font-bold hover:underline text-[11px]"
                      >
                        + Recarga Balcão
                      </button>
                    </div>
                  </div>

                  {(!selectedDriverForRecognition.recargas || selectedDriverForRecognition.recargas.length === 0) ? (
                    <p className="text-slate-400 text-center py-4">Nenhuma recarga lançada para este motorista ainda.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedDriverForRecognition.recargas.map((r: any) => (
                        <div key={r.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-bold text-slate-800">{r.observacao || 'Recarga de Saldo'}</span>
                            <span className="text-slate-400 text-[10px] block">{new Date(r.data).toLocaleString()}</span>
                          </div>
                          <span className={`font-mono font-black ${r.tipo === 'credito' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {r.tipo === 'credito' ? '+' : '-'} R$ {Number(r.valor).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ações Rápidas */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => handleOpenCreditModal(selectedDriverForRecognition)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Recarregar Crédito</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        await fetch(`/api/drivers/${selectedDriverForRecognition.id}/location`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                        });
                        await loadDatabaseData();
                        alert('Localização GPS do motorista atualizada com sucesso!');
                      });
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>Atualizar GPS do Motorista</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Nenhum motorista cadastrado no banco de dados. Cadastre um motorista primeiro.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: RECARGA DE CRÉDITO DO MOTORISTA */}
      {showCreditModal && driverForCredit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Recarga de Crédito</h3>
                  <p className="text-[11px] text-slate-500">{driverForCredit.nome} (CPF: {driverForCredit.cpf})</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDriverCredit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Saldo Atual:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  R$ {Number(driverForCredit.walletBalance || 0).toFixed(2)}
                </span>
              </div>

              {/* Botões Rápidos de Valor */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Valor da Operação (R$)</label>
                <div className="relative mb-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[20, 50, 100, 200].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCreditAmount(v)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      +R$ {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Transação */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tipo de Operação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreditType('credito')}
                    className={`py-2 rounded-xl font-bold transition ${
                      creditType === 'credito'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Adicionar Crédito (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditType('debito')}
                    className={`py-2 rounded-xl font-bold transition ${
                      creditType === 'debito'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Descontar Taxa (-)
                  </button>
                </div>
              </div>

              {/* Observação / Método */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Método / Observação</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="Ex: PIX, Boleto, Recarga Balcão"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingCredit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1"
                >
                  {submittingCredit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Confirmar Recarga</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA SOLICITAÇÃO DE RECARGA (VIA APP MOTORISTA - CONECTADO NA API) */}
      {showNewCreditRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Solicitação de Recarga (App Motorista)</h3>
                  <p className="text-[11px] text-slate-500">Envio de solicitação real para análise da central</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewCreditRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {drivers.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-700 font-bold">Nenhum motorista cadastrado no sistema</p>
                <p className="text-[11px] text-slate-500">
                  Para gerar solicitações de recarga reais, cadastre um motorista primeiro na aba Drivers.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCreditRequestModal(false);
                    setActiveTab('drivers');
                  }}
                  className="mt-2 bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  Ir para Cadastro de Motoristas
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitDriverAppRequest} className="space-y-4 text-xs">
                {/* Selecionar Motorista */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Motorista Solicitante</label>
                  <select
                    value={reqDriverId}
                    onChange={(e) => setReqDriverId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Selecione o motorista...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome} (CPF: {d.cpf}) - Saldo: R$ {Number(d.walletBalance || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor Solicitado */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Valor Solicitado (R$)</label>
                  <div className="relative mb-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={reqValor}
                      onChange={(e) => setReqValor(e.target.value)}
                      placeholder="50.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[20, 50, 100, 200].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setReqValor(v)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                          Number(reqValor) === v
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        +R$ {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Forma de Pagamento / Transmissão</label>
                  <select
                    value={reqMetodo}
                    onChange={(e) => setReqMetodo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PIX">PIX (Chave Cadastrada / QR Code)</option>
                    <option value="Transferência Bancária">Transferência Bancária (TED/DOC)</option>
                    <option value="Cartão de Crédito">Cartão de Crédito / Débito App</option>
                    <option value="Boleto Bancário">Boleto Bancário Compensado</option>
                    <option value="Balcão / Dinheiro">Pagamento no Balcão da Central</option>
                  </select>
                </div>

                {/* Observações / Mensagem do Motorista */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Observação / Comprovante</label>
                  <input
                    type="text"
                    value={reqObs}
                    onChange={(e) => setReqObs(e.target.value)}
                    placeholder="Ex: Comprovante de PIX enviado no WhatsApp ou banco"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Esta solicitação será salva no banco de dados e ficará com status "Pendente" aguardando aprovação.
                  </p>
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCreditRequestModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReq}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    {submittingReq ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Enviar Solicitação</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: RESPOSTA DO OCR */}
      {ocrModalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Resultado do OCR CNH</span>
              </h3>
              <button onClick={() => setOcrModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-semibold">Status Atribuído:</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full font-bold text-xs mt-1 ${
                    ocrModalData.resultado === 'Aprovado_Auto'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ocrModalData.resultado}
                </span>
                <p className="text-slate-500 mt-2">{ocrModalData.message}</p>
              </div>

              {ocrModalData.data && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
                  <p>Nome: <span className="font-bold text-slate-800">{ocrModalData.data.nome}</span></p>
                  <p>CPF: <span className="font-bold text-slate-800">{ocrModalData.data.cpf}</span></p>
                  <p>ID: <span className="font-bold text-emerald-600">{ocrModalData.data.id}</span></p>
                </div>
              )}
            </div>

            <button
              onClick={() => setOcrModalData(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: ADICIONAR VEÍCULO */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Car className="w-5 h-5 text-emerald-600" />
                <span>Add Vehicle Type</span>
              </h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Modelo do Veículo</label>
                <input
                  type="text"
                  value={newVehicleModel}
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  placeholder="Ex: Sedan - Toyota Corolla"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Placa</label>
                <input
                  type="text"
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value)}
                  placeholder="Ex: ABC-1234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tipo</label>
                  <select
                    value={newVehicleType}
                    onChange={(e) => setNewVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="SUV">SUV</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Custo por Km (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={newVehicleCost}
                    onChange={(e) => setNewVehicleCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW E INSPEÇÃO DE ATIVOS E IMAGENS ESTRUTURADAS */}
      {previewAssetModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {previewAssetModal.category}
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">{previewAssetModal.name}</h3>
              </div>
              <button
                onClick={() => setPreviewAssetModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 max-h-[50vh]">
              <img
                src={getAssetUrl(previewAssetModal.path)}
                alt={previewAssetModal.name}
                className="max-h-[46vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Caminho no Projeto:</span>
                <span className="font-mono text-slate-900 font-bold">public/{previewAssetModal.path}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Formato & Tipo:</span>
                <span className="font-bold text-slate-700">{previewAssetModal.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Utilização no Sistema:</span>
                <span className="font-medium text-emerald-700">{previewAssetModal.usage}</span>
              </div>
              <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60 mt-1">
                {previewAssetModal.description}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <a
                href={getAssetUrl(previewAssetModal.path)}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Imagem</span>
              </a>
              <button
                onClick={() => setPreviewAssetModal(null)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
