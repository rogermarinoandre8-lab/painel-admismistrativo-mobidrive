/**
 * MobiDrive Real-Time Communication & Dispatch Engine
 * 
 * Requisitos Implementados:
 * 1. Trava Atômica Anti-Concorrência no Cache (RAM + IndexedDB)
 * 2. Sistema de Mensagens de Resposta Exclusiva ('corrida aceita pelo que pegou')
 * 3. Bloqueio e Alerta de Recusa Imediato ('essa corrida já foi aceita por outro motorista')
 * 4. Comunicação Ativa (Polling de Rede estruturado a cada 3s com limpeza de cache)
 * 
 * Estritamente reativo e limpo, sem simulação ou dados fictícios.
 */

export interface RideRecord {
  id: number | string;
  passengerId: number | string | null;
  passengerName?: string;
  driverId: number | string | null;
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
  status_trava: 'aguardando_motorista' | 'ocupada';
  acceptedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface TrajetoData {
  origemLat: number;
  origemLng: number;
  origemEndereco?: string;
  destinoLat: number;
  destinoLng: number;
  destinoEndereco?: string;
  distanciaMetros: number;
  duracaoSegundos: number;
  valor: number;
}

export interface AceitarCorridaParams {
  rideId: number | string;
  driverId: number | string;
  driverNome: string;
  driverData?: any;
  appsScriptUrl?: string;
  onSuccess?: (resposta: RespostaSucessoCorrida) => void;
  onReject?: (resposta: RespostaRecusaCorrida) => void;
}

export interface RespostaSucessoCorrida {
  mensagem: 'corrida aceita pelo que pegou';
  rideId: number | string;
  driverId: number | string;
  driverNome: string;
  status_trava: 'ocupada';
  trajeto: TrajetoData;
  timestamp: string;
  tempoProcessamentoMs: number;
}

export interface RespostaRecusaCorrida {
  mensagem: 'essa corrida já foi aceita por outro motorista';
  rideId: number | string;
  driverId: number | string;
  driverNome: string;
  motivo: 'bloqueio_trava_atomica';
  status_trava_atual: 'ocupada';
  timestamp: string;
  tempoProcessamentoMs: number;
}

export interface PollingStatus {
  ativo: boolean;
  appsScriptUrl: string;
  ultimaAtualizacao: string | null;
  totalAtivos: number;
  totalEmAndamento: number;
  latenciaMs: number;
  erros: number;
}

export type DispatchEventCallback = (event: {
  tipo: 'aceite_sucesso' | 'bloqueio_recusa' | 'novo_pedido' | 'corrida_finalizada' | 'cache_limpo' | 'polling_sync';
  dados: any;
  timestamp: string;
}) => void;

class DispatchEngine {
  private dbName = 'MobiDriveDispatchDB';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;
  private dbInitPromise: Promise<IDBDatabase> | null = null;

  // Trava Instantânea em Memória RAM (0ms race condition protection)
  private memoryLocks = new Map<number | string, 'aguardando_motorista' | 'ocupada'>();

  // Mutex para enfileiramento estrito por ID de corrida no mesmo milissegundo
  private rideMutexMap = new Map<number | string, Promise<void>>();

  // Polling control
  private pollingTimer: any = null;
  private isPolling = false;
  private listeners: Set<DispatchEventCallback> = new Set();

  private pollingStatus: PollingStatus = {
    ativo: false,
    appsScriptUrl: '',
    ultimaAtualizacao: null,
    totalAtivos: 0,
    totalEmAndamento: 0,
    latenciaMs: 0,
    erros: 0
  };

  constructor() {
    this.initIndexedDB().catch((err) => {
      console.error('Erro ao inicializar IndexedDB:', err);
    });
  }

  /**
   * Inicializa o banco de cache local IndexedDB com as tabelas requeridas
   */
  public async initIndexedDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbInitPromise) return this.dbInitPromise;

    this.dbInitPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB não suportado no ambiente'));
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Tabela local de pedidos pendentes com trava anti-concorrência
        if (!db.objectStoreNames.contains('pedidos_ativos')) {
          const store = db.createObjectStore('pedidos_ativos', { keyPath: 'id' });
          store.createIndex('status_trava', 'status_trava', { unique: false });
        }

        // 2. Tabela local de corridas em andamento
        if (!db.objectStoreNames.contains('corridas_em_andamento')) {
          const store = db.createObjectStore('corridas_em_andamento', { keyPath: 'id' });
          store.createIndex('driverId', 'driverId', { unique: false });
        }

        // 3. Tabela espelhada do Google Sheets: ride_platform_drivers
        if (!db.objectStoreNames.contains('ride_platform_drivers')) {
          db.createObjectStore('ride_platform_drivers', { keyPath: 'id' });
        }

        // 4. Tabela espelhada do Google Sheets: ride_platform_passengers
        if (!db.objectStoreNames.contains('ride_platform_passengers')) {
          db.createObjectStore('ride_platform_passengers', { keyPath: 'id' });
        }

        // 5. Tabela espelhada do Google Sheets: ride_platform_rides (histórico e arquivo geral)
        if (!db.objectStoreNames.contains('ride_platform_rides')) {
          const store = db.createObjectStore('ride_platform_rides', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbInitPromise;
  }

  /**
   * Adiciona um ouvinte reativo de eventos do despacho
   */
  public subscribe(callback: DispatchEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emitEvent(tipo: 'aceite_sucesso' | 'bloqueio_recusa' | 'novo_pedido' | 'corrida_finalizada' | 'cache_limpo' | 'polling_sync', dados: any) {
    const timestamp = new Date().toISOString();
    this.listeners.forEach((cb) => {
      try {
        cb({ tipo, dados, timestamp });
      } catch (err) {
        console.error('Erro em ouvinte de despacho:', err);
      }
    });
  }

  /**
   * Requisito 1, 2 e 3: Trava Atômica Anti-Concorrência no Cache e Sistema de Mensagens Exclusivas
   * 
   * Gerencia o aceite de corridas de forma instantânea na memória RAM do navegador usando IndexedDB.
   * - Verifica status_trava na tabela local pedidos_ativos.
   * - Se aguardando_motorista: muda para ocupada, move para corridas_em_andamento, sincroniza em 2o plano
   *   e responde com 'corrida aceita pelo que pegou' com os dados do trajeto.
   * - Se já ocupada: rejeita no mesmo milissegundo e responde com 'essa corrida já foi aceita por outro motorista'.
   */
  public async aceitarCorrida(params: AceitarCorridaParams): Promise<RespostaSucessoCorrida | RespostaRecusaCorrida> {
    const inicio = performance.now();
    const { rideId, driverId, driverNome, driverData, appsScriptUrl, onSuccess, onReject } = params;

    // 1. Verificação preliminar instantânea em memória RAM (0ms)
    const lockEmRAM = this.memoryLocks.get(rideId);
    if (lockEmRAM === 'ocupada') {
      const tempoProcessamentoMs = Number((performance.now() - inicio).toFixed(2));
      const respostaRecusa: RespostaRecusaCorrida = {
        mensagem: 'essa corrida já foi aceita por outro motorista',
        rideId,
        driverId,
        driverNome,
        motivo: 'bloqueio_trava_atomica',
        status_trava_atual: 'ocupada',
        timestamp: new Date().toISOString(),
        tempoProcessamentoMs
      };

      if (onReject) onReject(respostaRecusa);
      this.emitEvent('bloqueio_recusa', respostaRecusa);
      return respostaRecusa;
    }

    // 2. Trava de execução crítica (Mutex por corrida)
    const previousLock = this.rideMutexMap.get(rideId) || Promise.resolve();
    let releaseMutex: () => void = () => {};
    const currentLock = new Promise<void>((resolve) => {
      releaseMutex = resolve;
    });
    this.rideMutexMap.set(rideId, previousLock.then(() => currentLock));

    await previousLock;

    try {
      // Re-verificação em RAM pós-enfileiramento
      if (this.memoryLocks.get(rideId) === 'ocupada') {
        const tempoProcessamentoMs = Number((performance.now() - inicio).toFixed(2));
        const respostaRecusa: RespostaRecusaCorrida = {
          mensagem: 'essa corrida já foi aceita por outro motorista',
          rideId,
          driverId,
          driverNome,
          motivo: 'bloqueio_trava_atomica',
          status_trava_atual: 'ocupada',
          timestamp: new Date().toISOString(),
          tempoProcessamentoMs
        };

        if (onReject) onReject(respostaRecusa);
        this.emitEvent('bloqueio_recusa', respostaRecusa);
        return respostaRecusa;
      }

      const db = await this.initIndexedDB();

      // Transação atômica no IndexedDB com as tabelas envolvidas
      const transacaoResultado = await new Promise<{
        sucesso: boolean;
        registro?: RideRecord;
        motivo?: string;
      }>((resolve, reject) => {
        const tx = db.transaction(['pedidos_ativos', 'corridas_em_andamento', 'ride_platform_rides'], 'readwrite');
        const pedidosStore = tx.objectStore('pedidos_ativos');
        const andamentoStore = tx.objectStore('corridas_em_andamento');
        const platformRidesStore = tx.objectStore('ride_platform_rides');

        const getReq = pedidosStore.get(rideId);

        getReq.onsuccess = () => {
          const corrida = getReq.result as RideRecord | undefined;

          // Validação obrigatória da propriedade status_trava
          if (!corrida || corrida.status_trava !== 'aguardando_motorista') {
            // Trava atômica bloqueia
            this.memoryLocks.set(rideId, 'ocupada');
            resolve({ sucesso: false, motivo: 'ocupada' });
            return;
          }

          // Motorista foi o primeiro: aplica trava atômica imediatamente
          this.memoryLocks.set(rideId, 'ocupada');

          // Atualiza estado do objeto no cache
          corrida.status_trava = 'ocupada';
          corrida.status = 'em_andamento';
          corrida.driverId = Number(driverId) || driverId;
          corrida.driverName = driverNome;
          corrida.acceptedAt = new Date().toISOString();
          if (driverData) corrida.driverData = driverData;

          // Move registro: remove de pedidos_ativos e insere em corridas_em_andamento
          pedidosStore.delete(rideId);
          andamentoStore.put(corrida);
          platformRidesStore.put(corrida);

          tx.oncomplete = () => {
            resolve({ sucesso: true, registro: corrida });
          };

          tx.onerror = () => {
            // Libera trava em RAM em caso de falha de I/O
            this.memoryLocks.delete(rideId);
            reject(tx.error);
          };
        };

        getReq.onerror = () => {
          reject(getReq.error);
        };
      });

      const tempoProcessamentoMs = Number((performance.now() - inicio).toFixed(2));

      // Requisito 3: Bloqueio e Alerta de Recusa se já ocupada
      if (!transacaoResultado.sucesso || !transacaoResultado.registro) {
        const respostaRecusa: RespostaRecusaCorrida = {
          mensagem: 'essa corrida já foi aceita por outro motorista',
          rideId,
          driverId,
          driverNome,
          motivo: 'bloqueio_trava_atomica',
          status_trava_atual: 'ocupada',
          timestamp: new Date().toISOString(),
          tempoProcessamentoMs
        };

        if (onReject) onReject(respostaRecusa);
        this.emitEvent('bloqueio_recusa', respostaRecusa);
        return respostaRecusa;
      }

      // Requisito 2: Motorista é o primeiro -> Aceite Exclusivo e Trajeto
      const corridaAceita = transacaoResultado.registro;
      const trajeto: TrajetoData = {
        origemLat: Number(corridaAceita.origemLat) || 0,
        origemLng: Number(corridaAceita.origemLng) || 0,
        origemEndereco: corridaAceita.origemEndereco || '',
        destinoLat: Number(corridaAceita.destinoLat) || 0,
        destinoLng: Number(corridaAceita.destinoLng) || 0,
        destinoEndereco: corridaAceita.destinoEndereco || '',
        distanciaMetros: Number(corridaAceita.distanciaMetros) || 0,
        duracaoSegundos: Number(corridaAceita.duracaoSegundos) || 0,
        valor: Number(corridaAceita.valor) || 0
      };

      const respostaSucesso: RespostaSucessoCorrida = {
        mensagem: 'corrida aceita pelo que pegou',
        rideId,
        driverId,
        driverNome,
        status_trava: 'ocupada',
        trajeto,
        timestamp: new Date().toISOString(),
        tempoProcessamentoMs
      };

      // Dispara callback do motorista escolhido
      if (onSuccess) onSuccess(respostaSucesso);
      this.emitEvent('aceite_sucesso', respostaSucesso);

      // Sincronização em segundo plano com Google Sheets (Google Apps Script) e Backend
      this.sincronizarGoogleSheetsBackground(corridaAceita, appsScriptUrl);

      return respostaSucesso;
    } finally {
      releaseMutex();
    }
  }

  /**
   * Sincroniza em segundo plano com as tabelas do Google Sheets via Google Apps Script
   */
  private sincronizarGoogleSheetsBackground(corrida: RideRecord, appsScriptUrl?: string) {
    const payload = {
      action: 'sync_ride_accept',
      tabela: 'ride_platform_rides',
      rideId: corrida.id,
      driverId: corrida.driverId,
      driverNome: corrida.driverName,
      status: 'em_andamento',
      status_trava: 'ocupada',
      acceptedAt: corrida.acceptedAt,
      trajeto: {
        origemLat: corrida.origemLat,
        origemLng: corrida.origemLng,
        origemEndereco: corrida.origemEndereco,
        destinoLat: corrida.destinoLat,
        destinoLng: corrida.destinoLng,
        destinoEndereco: corrida.destinoEndereco,
        distanciaMetros: corrida.distanciaMetros,
        duracaoSegundos: corrida.duracaoSegundos,
        valor: corrida.valor
      }
    };

    // 1. Sincronização direta com servidor local
    fetch('/api/dispatch/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rideId: corrida.id,
        driverId: corrida.driverId,
        driverNome: corrida.driverName
      })
    }).catch((err) => {
      console.warn('Sync com servidor local falhou:', err);
    });

    // 2. Sincronização direta com URL do Google Apps Script
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => {
        console.warn('Sync com Google Apps Script falhou:', err);
      });
    }
  }

  /**
   * Requisito 4: Comunicação Ativa (Polling de Rede)
   * 
   * Função Fetch estruturada para escutar atualizações a cada 3 segundos vindas do Google Apps Script,
   * atualizando as tabelas do IndexedDB apenas com dados novos de corridas reais e limpando o cache
   * local apenas quando as corridas forem arquivadas como Finalizadas ou Canceladas.
   */
  public iniciarPollingRede(
    appsScriptUrl: string,
    intervaloMs = 3000,
    callbacks?: {
      onSync?: (dados: any) => void;
      onError?: (erro: any) => void;
    }
  ): () => void {
    if (this.isPolling) {
      this.pararPollingRede();
    }

    this.isPolling = true;
    this.pollingStatus.ativo = true;
    this.pollingStatus.appsScriptUrl = appsScriptUrl;

    const executarPoll = async () => {
      if (!this.isPolling) return;
      const start = performance.now();

      try {
        // Fetch estruturado: consulta endpoint do Google Apps Script ou proxy de sincronização
        const urlToFetch = appsScriptUrl
          ? `/api/gas/poll?url=${encodeURIComponent(appsScriptUrl)}`
          : '/api/gas/poll';

        const response = await fetch(urlToFetch, {
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Falha HTTP no Polling: status ${response.status}`);
        }

        const data = await response.json();
        const latency = Number((performance.now() - start).toFixed(1));

        // Processa e atualiza tabelas do IndexedDB com dados reais
        await this.atualizarCacheIndexedDB(data);

        this.pollingStatus.ultimaAtualizacao = new Date().toISOString();
        this.pollingStatus.latenciaMs = latency;
        this.pollingStatus.erros = 0;

        if (callbacks?.onSync) {
          callbacks.onSync(data);
        }

        this.emitEvent('polling_sync', {
          fonte: data.fonte,
          latenciaMs: latency,
          timestamp: this.pollingStatus.ultimaAtualizacao
        });
      } catch (err: any) {
        this.pollingStatus.erros += 1;
        if (callbacks?.onError) {
          callbacks.onError(err);
        }
      }
    };

    // Executa imediatamente e agenda loop a cada 3 segundos
    executarPoll();
    this.pollingTimer = setInterval(executarPoll, intervaloMs);

    return () => this.pararPollingRede();
  }

  public pararPollingRede() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isPolling = false;
    this.pollingStatus.ativo = false;
  }

  /**
   * Atualiza as tabelas do IndexedDB de acordo com o estado das corridas reais:
   * - Novas corridas -> pedidos_ativos com status_trava = aguardando_motorista
   * - Corridas em andamento -> corridas_em_andamento com status_trava = ocupada
   * - Corridas Finalizadas ou Canceladas -> LIMPA O CACHE LOCAL (remove de pedidos_ativos e corridas_em_andamento)
   */
  public async atualizarCacheIndexedDB(dados: {
    ride_platform_rides?: any[];
    ride_platform_drivers?: any[];
    ride_platform_passengers?: any[];
  }) {
    const db = await this.initIndexedDB();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
        ['pedidos_ativos', 'corridas_em_andamento', 'ride_platform_rides', 'ride_platform_drivers', 'ride_platform_passengers'],
        'readwrite'
      );

      const pedidosStore = tx.objectStore('pedidos_ativos');
      const andamentoStore = tx.objectStore('corridas_em_andamento');
      const ridesStore = tx.objectStore('ride_platform_rides');
      const driversStore = tx.objectStore('ride_platform_drivers');
      const passengersStore = tx.objectStore('ride_platform_passengers');

      // 1. Atualizar Tabela ride_platform_drivers
      if (Array.isArray(dados.ride_platform_drivers)) {
        for (const driver of dados.ride_platform_drivers) {
          driversStore.put(driver);
        }
      }

      // 2. Atualizar Tabela ride_platform_passengers
      if (Array.isArray(dados.ride_platform_passengers)) {
        for (const passenger of dados.ride_platform_passengers) {
          passengersStore.put(passenger);
        }
      }

      // 3. Atualizar e Limpar Corridas conforme regras do Requisito 4
      if (Array.isArray(dados.ride_platform_rides)) {
        for (const rawRide of dados.ride_platform_rides) {
          const rideId = rawRide.id;
          const status = (rawRide.status || '').toLowerCase();
          const statusTrava = rawRide.status_trava || (status === 'em_andamento' ? 'ocupada' : 'aguardando_motorista');

          // Arquiva sempre na tabela geral de histórico do Sheets
          ridesStore.put({
            ...rawRide,
            status_trava: statusTrava
          });

          // REGRA DE LIMPEZA DO CACHE LOCAL:
          // "limpando o cache local apenas quando as corridas forem arquivadas como Finalizadas ou Canceladas"
          if (status === 'finalizada' || status === 'cancelada') {
            pedidosStore.delete(rideId);
            andamentoStore.delete(rideId);
            this.memoryLocks.delete(rideId);
            continue;
          }

          // REGRA DE CORRIDA EM ANDAMENTO:
          if (status === 'em_andamento' || statusTrava === 'ocupada') {
            pedidosStore.delete(rideId);
            andamentoStore.put({
              ...rawRide,
              status: 'em_andamento',
              status_trava: 'ocupada'
            });
            this.memoryLocks.set(rideId, 'ocupada');
            continue;
          }

          // REGRA DE PEDIDO ATIVO PENDENTE:
          if (status === 'solicitada' || statusTrava === 'aguardando_motorista') {
            // Se já não estiver ocupada em RAM nem em andamento local
            const travaMem = this.memoryLocks.get(rideId);
            if (travaMem !== 'ocupada') {
              pedidosStore.put({
                ...rawRide,
                status: 'solicitada',
                status_trava: 'aguardando_motorista'
              });
              this.memoryLocks.set(rideId, 'aguardando_motorista');
            }
          }
        }
      }

      tx.oncomplete = () => {
        // Atualiza contadores de status
        this.atualizarContadoresStatus().then(() => resolve());
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  }

  /**
   * Adiciona um pedido dinâmico real diretamente ao cache e banco
   */
  public async despacharPedidoReal(pedido: Partial<RideRecord> & { id?: number | string }): Promise<RideRecord> {
    const db = await this.initIndexedDB();
    const id = pedido.id || Date.now();

    const novoPedido: RideRecord = {
      id,
      passengerId: pedido.passengerId ?? null,
      passengerName: pedido.passengerName,
      driverId: pedido.driverId ?? null,
      driverName: pedido.driverName,
      origemLat: Number(pedido.origemLat) || 0,
      origemLng: Number(pedido.origemLng) || 0,
      origemEndereco: pedido.origemEndereco || '',
      destinoLat: Number(pedido.destinoLat) || 0,
      destinoLng: Number(pedido.destinoLng) || 0,
      destinoEndereco: pedido.destinoEndereco || '',
      distanciaMetros: Number(pedido.distanciaMetros) || 0,
      duracaoSegundos: Number(pedido.duracaoSegundos) || 0,
      valor: Number(pedido.valor) || 0,
      status: 'solicitada',
      status_trava: 'aguardando_motorista',
      createdAt: new Date().toISOString(),
      ...pedido
    };

    // Trava em memória RAM
    this.memoryLocks.set(id, 'aguardando_motorista');

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['pedidos_ativos', 'ride_platform_rides'], 'readwrite');
      tx.objectStore('pedidos_ativos').put(novoPedido);
      tx.objectStore('ride_platform_rides').put(novoPedido);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Envia para o backend para sincronia
    fetch('/api/sheets/ride_platform_rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoPedido)
    }).catch((e) => console.warn('Erro ao despachar no backend:', e));

    this.emitEvent('novo_pedido', novoPedido);
    await this.atualizarContadoresStatus();
    return novoPedido;
  }

  /**
   * Finaliza ou cancela uma corrida, arquivando e limpando o cache local
   */
  public async arquivarCorrida(rideId: number | string, statusFinal: 'finalizada' | 'cancelada'): Promise<boolean> {
    const db = await this.initIndexedDB();

    return new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(['pedidos_ativos', 'corridas_em_andamento', 'ride_platform_rides'], 'readwrite');
      const pedidosStore = tx.objectStore('pedidos_ativos');
      const andamentoStore = tx.objectStore('corridas_em_andamento');
      const ridesStore = tx.objectStore('ride_platform_rides');

      // Limpa do cache local
      pedidosStore.delete(rideId);
      andamentoStore.delete(rideId);
      this.memoryLocks.delete(rideId);

      // Atualiza na tabela permanente de arquivo
      const req = ridesStore.get(rideId);
      req.onsuccess = () => {
        if (req.result) {
          const corrida = req.result;
          corrida.status = statusFinal;
          corrida.status_trava = 'ocupada';
          corrida.finalizadoEm = new Date().toISOString();
          ridesStore.put(corrida);
        }
      };

      tx.oncomplete = () => {
        // Atualiza status no servidor
        fetch(`/api/rides/${rideId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusFinal })
        }).catch(() => {});

        this.emitEvent('cache_limpo', { rideId, statusFinal });
        this.atualizarContadoresStatus().then(() => resolve(true));
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Consulta os pedidos ativos aguardando motorista no cache IndexedDB
   */
  public async getPedidosAtivos(): Promise<RideRecord[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pedidos_ativos', 'readonly');
      const store = tx.objectStore('pedidos_ativos');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Consulta as corridas em andamento no cache IndexedDB
   */
  public async getCorridasEmAndamento(): Promise<RideRecord[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('corridas_em_andamento', 'readonly');
      const store = tx.objectStore('corridas_em_andamento');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Consulta todo o histórico de corridas arquivadas
   */
  public async getRidePlatformRides(): Promise<RideRecord[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('ride_platform_rides', 'readonly');
      const store = tx.objectStore('ride_platform_rides');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Consulta motoristas espelhados no IndexedDB
   */
  public async getRidePlatformDrivers(): Promise<any[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('ride_platform_drivers', 'readonly');
      const store = tx.objectStore('ride_platform_drivers');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Consulta passageiros espelhados no IndexedDB
   */
  public async getRidePlatformPassengers(): Promise<any[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('ride_platform_passengers', 'readonly');
      const store = tx.objectStore('ride_platform_passengers');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public getStatusPolling(): PollingStatus {
    return { ...this.pollingStatus };
  }

  private async atualizarContadoresStatus() {
    try {
      const ativos = await this.getPedidosAtivos();
      const emAndamento = await this.getCorridasEmAndamento();
      this.pollingStatus.totalAtivos = ativos.length;
      this.pollingStatus.totalEmAndamento = emAndamento.length;
    } catch {
      // Ignora erro de contagem temporária
    }
  }
}

// Instância singleton exportada para o sistema todo
export const dispatchEngine = new DispatchEngine();
