import fs from 'fs';
import path from 'path';

export interface Driver {
  id: number;
  nome: string;
  cpf: string;
  cnhUrl?: string;
  cnhText?: string;
  validadeCnh?: string;
  status: 'Aprovado_Auto' | 'Analise_Manual' | 'Reprovado';
  lat: number;
  lng: number;
  enderecoAtual?: string;
  ipConexao?: string;
  walletBalance: number;
  rating: number;
  vehicleType: string;
  recargas?: { id: number; data: string; valor: number; tipo: 'credito' | 'debito'; observacao?: string }[];
  createdAt: string;
}

export interface Vehicle {
  id: number;
  driverId: number | null;
  driverName?: string;
  modelo: string;
  placa: string;
  tipo: string;
  lat: number;
  lng: number;
  status: 'disponivel' | 'em_corrida' | 'inativo';
  costPerKm: number;
  updatedAt: string;
}

export interface Passenger {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  createdAt: string;
}

export interface Ride {
  id: number;
  passengerId: number | null;
  passengerName?: string;
  driverId: number | null;
  driverName?: string;
  origemLat: number;
  origemLng: number;
  origemEndereco?: string;
  destinoLat: number;
  destinoLng: number;
  destinoEndereco?: string;
  distanciaMetros: number;
  duracaoSegundos: number;
  valor: number;
  status: 'solicitada' | 'em_andamento' | 'finalizada' | 'cancelada';
  status_trava?: 'aguardando_motorista' | 'ocupada';
  acceptedAt?: string;
  createdAt: string;
}

export interface PontoTarifario {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  raioMetros: number;
  taxaAdicional: number;
  tipo: 'ponto_embarque' | 'geocerca' | 'aeroporto' | 'zona_especial';
  descricao?: string;
  createdAt: string;
}

export interface TarifaConfig {
  taxaBase: number;
  valorPorKm: number;
  taxaPorMinuto: number;
  taxaCancelamento: number;
  taxaMinima: number;
  categorias: {
    [key: string]: { taxaBase: number; valorPorKm: number };
  };
  pontosEspecificos: PontoTarifario[];
}

export interface DispositivoConectado {
  id: number;
  tipo: 'app_motorista' | 'app_passageiro' | 'painel_admin';
  ip: string;
  lat: number;
  lng: number;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  cep?: string;
  enderecoFormatado?: string;
  provedorInternet?: string;
  driverId?: number;
  passengerId?: number;
  nomeIdentificador?: string;
  ultimoAcesso: string;
  status: 'online' | 'offline';
}

export interface CreditRequest {
  id: number;
  driverId: number;
  driverNome: string;
  driverCpf: string;
  driverTelefone?: string;
  driverVehicle?: string;
  valor: number;
  metodo: string;
  comprovante?: string;
  observacao?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  createdAt: string;
  processadoEm?: string;
  motivoRejeicao?: string;
}

export interface DatabaseSchema {
  motoristas: Driver[];
  veiculos: Vehicle[];
  passageiros: Passenger[];
  corridas: Ride[];
  solicitacoesRecarga: CreditRequest[];
  faturamento: { data: string; valor: number; corridaId?: number }[];
  tarifas: TarifaConfig;
  dispositivosConectados: DispositivoConectado[];
  config: {
    googleMapsApiKey: string;
    appsScriptUrl: string;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const DEFAULT_STATE: DatabaseSchema = {
  motoristas: [],
  veiculos: [],
  passageiros: [],
  corridas: [],
  solicitacoesRecarga: [],
  faturamento: [],
  dispositivosConectados: [],
  tarifas: {
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
  },
  config: {
    googleMapsApiKey: 'AIzaSyC049pM2oi3Hk5vxP-6KxyQLHOSon-wwag',
    appsScriptUrl: ''
  }
};

export class Database {
  private static instance: Database;
  private memoryData: DatabaseSchema;

  private constructor() {
    this.memoryData = this.load();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        solicitacoesRecarga: parsed.solicitacoesRecarga || [],
        tarifas: {
          ...DEFAULT_STATE.tarifas,
          ...(parsed.tarifas || {}),
          categorias: {
            ...DEFAULT_STATE.tarifas.categorias,
            ...((parsed.tarifas && parsed.tarifas.categorias) || {})
          },
          pontosEspecificos: (parsed.tarifas && parsed.tarifas.pontosEspecificos) || []
        },
        config: { ...DEFAULT_STATE.config, ...(parsed.config || {}) }
      };
    } catch (e) {
      console.error('Error loading database file, initializing empty state:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  // --- DRIVERS ---
  public getDrivers(): Driver[] {
    return this.memoryData.motoristas;
  }

  public getDriverById(id: number): Driver | undefined {
    return this.memoryData.motoristas.find((d) => d.id === id);
  }

  public addDriver(data: Omit<Driver, 'id' | 'createdAt' | 'walletBalance' | 'rating'>): Driver {
    const nextId = this.memoryData.motoristas.reduce((max, d) => Math.max(max, d.id), 0) + 1;
    const newDriver: Driver = {
      ...data,
      id: nextId,
      walletBalance: 0,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    this.memoryData.motoristas.push(newDriver);
    this.persist();
    return newDriver;
  }

  public updateDriver(id: number, data: Partial<Driver>): Driver | null {
    const idx = this.memoryData.motoristas.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.memoryData.motoristas[idx] = { ...this.memoryData.motoristas[idx], ...data };
    this.persist();
    return this.memoryData.motoristas[idx];
  }

  public deleteDriver(id: number): boolean {
    const lenBefore = this.memoryData.motoristas.length;
    this.memoryData.motoristas = this.memoryData.motoristas.filter((d) => d.id !== id);
    this.persist();
    return this.memoryData.motoristas.length < lenBefore;
  }

  public addDriverCredit(id: number, valor: number, tipo: 'credito' | 'debito' = 'credito', observacao: string = 'Recarga de Saldo'): Driver | null {
    const idx = this.memoryData.motoristas.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    const driver = this.memoryData.motoristas[idx];
    
    const amount = Number(valor) || 0;
    if (tipo === 'credito') {
      driver.walletBalance = (Number(driver.walletBalance) || 0) + amount;
    } else {
      driver.walletBalance = Math.max(0, (Number(driver.walletBalance) || 0) - amount);
    }

    if (!driver.recargas) {
      driver.recargas = [];
    }
    const recargaId = driver.recargas.length + 1;
    driver.recargas.unshift({
      id: recargaId,
      data: new Date().toISOString(),
      valor: amount,
      tipo,
      observacao
    });

    this.persist();
    return driver;
  }

  // --- SOLICITAÇÕES DE RECARGA DE CRÉDITO VIA APP MOTORISTA ---
  public getCreditRequests(): CreditRequest[] {
    return this.memoryData.solicitacoesRecarga || [];
  }

  public getCreditRequestById(id: number): CreditRequest | undefined {
    return (this.memoryData.solicitacoesRecarga || []).find((r) => r.id === id);
  }

  public addCreditRequest(data: {
    driverId: number;
    driverNome: string;
    driverCpf: string;
    driverTelefone?: string;
    driverVehicle?: string;
    valor: number;
    metodo?: string;
    comprovante?: string;
    observacao?: string;
  }): CreditRequest {
    if (!this.memoryData.solicitacoesRecarga) {
      this.memoryData.solicitacoesRecarga = [];
    }
    const nextId = this.memoryData.solicitacoesRecarga.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const newRequest: CreditRequest = {
      id: nextId,
      driverId: data.driverId,
      driverNome: data.driverNome,
      driverCpf: data.driverCpf,
      driverTelefone: data.driverTelefone,
      driverVehicle: data.driverVehicle,
      valor: Number(data.valor) || 0,
      metodo: data.metodo || 'PIX',
      comprovante: data.comprovante,
      observacao: data.observacao || 'Solicitação de recarga via aplicativo',
      status: 'pendente',
      createdAt: new Date().toISOString()
    };
    this.memoryData.solicitacoesRecarga.unshift(newRequest);
    this.persist();
    return newRequest;
  }

  public approveCreditRequest(id: number, observacao?: string): { request: CreditRequest; driver: Driver } {
    if (!this.memoryData.solicitacoesRecarga) {
      throw new Error('Lista de solicitações não inicializada.');
    }
    const idx = this.memoryData.solicitacoesRecarga.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error('Solicitação de recarga não encontrada.');
    }

    const req = this.memoryData.solicitacoesRecarga[idx];
    if (req.status !== 'pendente') {
      throw new Error(`Esta solicitação já foi processada anteriormente (${req.status}).`);
    }

    const note = observacao || `Recarga aprovada via App Motorista (${req.metodo})`;
    const updatedDriver = this.addDriverCredit(req.driverId, req.valor, 'credito', note);
    if (!updatedDriver) {
      throw new Error(`Motorista ID ${req.driverId} não foi localizado.`);
    }

    req.status = 'aprovado';
    req.processadoEm = new Date().toISOString();
    this.memoryData.solicitacoesRecarga[idx] = req;
    this.persist();

    return { request: req, driver: updatedDriver };
  }

  public rejectCreditRequest(id: number, motivo?: string): CreditRequest {
    if (!this.memoryData.solicitacoesRecarga) {
      throw new Error('Lista de solicitações não inicializada.');
    }
    const idx = this.memoryData.solicitacoesRecarga.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error('Solicitação de recarga não encontrada.');
    }

    const req = this.memoryData.solicitacoesRecarga[idx];
    req.status = 'rejeitado';
    req.motivoRejeicao = motivo || 'Solicitação recusada pela administração';
    req.processadoEm = new Date().toISOString();
    this.memoryData.solicitacoesRecarga[idx] = req;
    this.persist();

    return req;
  }

  // --- VEHICLES ---
  public getVehicles(): Vehicle[] {
    return this.memoryData.veiculos;
  }

  public addVehicle(data: Omit<Vehicle, 'id' | 'updatedAt'>): Vehicle {
    const nextId = this.memoryData.veiculos.reduce((max, v) => Math.max(max, v.id), 0) + 1;
    const newVehicle: Vehicle = {
      ...data,
      id: nextId,
      updatedAt: new Date().toISOString()
    };
    this.memoryData.veiculos.push(newVehicle);
    this.persist();
    return newVehicle;
  }

  public updateVehicleLocation(id: number, lat: number, lng: number, status?: Vehicle['status']): Vehicle | null {
    const idx = this.memoryData.veiculos.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.memoryData.veiculos[idx].lat = lat;
    this.memoryData.veiculos[idx].lng = lng;
    if (status) {
      this.memoryData.veiculos[idx].status = status;
    }
    this.memoryData.veiculos[idx].updatedAt = new Date().toISOString();
    this.persist();
    return this.memoryData.veiculos[idx];
  }

  public deleteVehicle(id: number): boolean {
    const lenBefore = this.memoryData.veiculos.length;
    this.memoryData.veiculos = this.memoryData.veiculos.filter((v) => v.id !== id);
    this.persist();
    return this.memoryData.veiculos.length < lenBefore;
  }

  // --- PASSENGERS ---
  public getPassengers(): Passenger[] {
    return this.memoryData.passageiros;
  }

  public addPassenger(data: Omit<Passenger, 'id' | 'createdAt'>): Passenger {
    const nextId = this.memoryData.passageiros.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const newPassenger: Passenger = {
      ...data,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    this.memoryData.passageiros.push(newPassenger);
    this.persist();
    return newPassenger;
  }

  // --- RIDES ---
  public getRides(): Ride[] {
    return this.memoryData.corridas;
  }

  public addRide(data: Omit<Ride, 'id' | 'createdAt'>): Ride {
    const nextId = this.memoryData.corridas.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const newRide: Ride = {
      ...data,
      id: nextId,
      status_trava: (data as any).status_trava || (data.status === 'em_andamento' ? 'ocupada' : 'aguardando_motorista'),
      createdAt: new Date().toISOString()
    };
    this.memoryData.corridas.push(newRide);

    if (newRide.status === 'finalizada' && newRide.valor > 0) {
      const today = new Date().toISOString().split('T')[0];
      this.addEarning(today, newRide.valor, newRide.id);
    }

    this.persist();
    return newRide;
  }

  public acceptRideAtomic(id: number, driverId: number, driverName: string): { success: boolean; message: string; ride?: Ride } {
    const idx = this.memoryData.corridas.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, message: 'Corrida não encontrada.' };
    }
    const ride = this.memoryData.corridas[idx];
    // Trava de anti-concorrência
    if (ride.status_trava === 'ocupada' || (ride.driverId && ride.driverId !== driverId)) {
      return { success: false, message: 'essa corrida já foi aceita por outro motorista' };
    }

    // Se estiver livre (aguardando_motorista), ocupa atômico
    ride.status_trava = 'ocupada';
    ride.status = 'em_andamento';
    ride.driverId = driverId;
    ride.driverName = driverName;
    ride.acceptedAt = new Date().toISOString();
    this.persist();

    return {
      success: true,
      message: 'corrida aceita pelo que pegou',
      ride
    };
  }

  public updateRideStatus(id: number, status: Ride['status']): Ride | null {
    const idx = this.memoryData.corridas.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.memoryData.corridas[idx].status = status;
    if (status === 'em_andamento') {
      this.memoryData.corridas[idx].status_trava = 'ocupada';
    } else if (status === 'solicitada') {
      this.memoryData.corridas[idx].status_trava = 'aguardando_motorista';
    }
    if (status === 'finalizada' && this.memoryData.corridas[idx].valor > 0) {
      const today = new Date().toISOString().split('T')[0];
      this.addEarning(today, this.memoryData.corridas[idx].valor, id);
    }
    this.persist();
    return this.memoryData.corridas[idx];
  }

  // --- EARNINGS ---
  public getEarnings(): { labels: string[]; values: number[] } {
    // Group earnings by date
    const map = new Map<string, number>();
    for (const item of this.memoryData.faturamento) {
      const cur = map.get(item.data) || 0;
      map.set(item.data, cur + item.valor);
    }
    const labels = Array.from(map.keys()).sort();
    const values = labels.map((l) => map.get(l) || 0);
    return { labels, values };
  }

  public addEarning(data: string, valor: number, corridaId?: number) {
    this.memoryData.faturamento.push({ data, valor, corridaId });
    this.persist();
  }

  // --- TARIFAS & PONTOS ESPECÍFICOS ---
  public getTarifas(): TarifaConfig {
    return this.memoryData.tarifas;
  }

  public updateTarifas(data: Partial<TarifaConfig>): TarifaConfig {
    this.memoryData.tarifas = {
      ...this.memoryData.tarifas,
      ...data,
      categorias: {
        ...this.memoryData.tarifas.categorias,
        ...(data.categorias || {})
      }
    };
    this.persist();
    return this.memoryData.tarifas;
  }

  public addPontoEspecifico(data: Omit<PontoTarifario, 'id' | 'createdAt'>): PontoTarifario {
    const nextId = this.memoryData.tarifas.pontosEspecificos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const newPonto: PontoTarifario = {
      ...data,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    this.memoryData.tarifas.pontosEspecificos.push(newPonto);
    this.persist();
    return newPonto;
  }

  public deletePontoEspecifico(id: number): boolean {
    const lenBefore = this.memoryData.tarifas.pontosEspecificos.length;
    this.memoryData.tarifas.pontosEspecificos = this.memoryData.tarifas.pontosEspecificos.filter((p) => p.id !== id);
    this.persist();
    return this.memoryData.tarifas.pontosEspecificos.length < lenBefore;
  }

  // --- DISPOSITIVOS & CONEXÕES IP ---
  public getConnectedDevices(): DispositivoConectado[] {
    return this.memoryData.dispositivosConectados || [];
  }

  public upsertConnectedDevice(data: Omit<DispositivoConectado, 'id' | 'ultimoAcesso'>): DispositivoConectado {
    if (!this.memoryData.dispositivosConectados) {
      this.memoryData.dispositivosConectados = [];
    }
    const existingIndex = this.memoryData.dispositivosConectados.findIndex(
      (d) => d.ip === data.ip && d.tipo === data.tipo
    );

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.memoryData.dispositivosConectados[existingIndex] = {
        ...this.memoryData.dispositivosConectados[existingIndex],
        ...data,
        ultimoAcesso: now,
        status: 'online'
      };
      this.persist();
      return this.memoryData.dispositivosConectados[existingIndex];
    } else {
      const nextId = this.memoryData.dispositivosConectados.reduce((max, d) => Math.max(max, d.id), 0) + 1;
      const newDevice: DispositivoConectado = {
        ...data,
        id: nextId,
        ultimoAcesso: now,
        status: 'online'
      };
      this.memoryData.dispositivosConectados.push(newDevice);
      this.persist();
      return newDevice;
    }
  }

  // --- CONFIG ---
  public getConfig() {
    return this.memoryData.config;
  }

  public updateConfig(config: Partial<DatabaseSchema['config']>) {
    this.memoryData.config = { ...this.memoryData.config, ...config };
    this.persist();
    return this.memoryData.config;
  }

  // --- STATS ---
  public getStats() {
    const totalDrivers = this.memoryData.motoristas.length;
    const totalVehicles = this.memoryData.veiculos.length;
    const activeVehicles = this.memoryData.veiculos.filter((v) => v.status === 'disponivel' || v.status === 'em_corrida').length;
    const totalRides = this.memoryData.corridas.length;
    const totalRevenue = this.memoryData.faturamento.reduce((sum, item) => sum + item.valor, 0);

    return {
      totalDrivers,
      totalVehicles,
      activeVehicles,
      totalRides,
      totalRevenue
    };
  }

  // --- DANGEROUS RESET ---
  public reset() {
    this.memoryData = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.persist();
  }
}

export const db = Database.getInstance();
