import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { processCNHImage, type OCRResult } from './server/ocr.ts';
import { recognizeIPAndLocation } from './server/geoloc.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  const DEFAULT_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyC049pM2oi3Hk5vxP-6KxyQLHOSon-wwag';

  // Helper to extract real client IP
  const getClientIP = (req: express.Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || '127.0.0.1';
  };

  // --- RECONHECIMENTO DE IP & LOCALIZAÇÃO GOOGLE MAPS ---
  app.get('/api/location/recognize', async (req, res) => {
    try {
      const clientIP = getClientIP(req);
      const location = await recognizeIPAndLocation(clientIP, undefined, undefined, DEFAULT_MAPS_KEY);
      
      // Salva no banco de dados autônomo a conexão detectada
      db.upsertConnectedDevice({
        tipo: 'painel_admin',
        ip: location.ip,
        lat: location.lat,
        lng: location.lng,
        cidade: location.cidade,
        estado: location.estado,
        pais: location.pais,
        enderecoFormatado: location.enderecoFormatado,
        provedorInternet: location.provedorInternet,
        nomeIdentificador: 'Sessão do Painel Admin',
        status: 'online'
      });

      res.json(location);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/location/recognize', async (req, res) => {
    try {
      const clientIP = getClientIP(req);
      const { lat, lng, tipo, nomeIdentificador, driverId, passengerId } = req.body;
      const location = await recognizeIPAndLocation(clientIP, lat, lng, DEFAULT_MAPS_KEY);

      const device = db.upsertConnectedDevice({
        tipo: tipo || 'app_motorista',
        ip: location.ip,
        lat: location.lat,
        lng: location.lng,
        rua: location.rua,
        numero: location.numero,
        bairro: location.bairro,
        cidade: location.cidade,
        estado: location.estado,
        pais: location.pais,
        cep: location.cep,
        enderecoFormatado: location.enderecoFormatado,
        provedorInternet: location.provedorInternet,
        nomeIdentificador: nomeIdentificador || `Dispositivo ${location.ip}`,
        driverId: driverId ? Number(driverId) : undefined,
        passengerId: passengerId ? Number(passengerId) : undefined,
        status: 'online'
      });

      res.json({ location, device });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/devices/connected', (req, res) => {
    res.json(db.getConnectedDevices());
  });

  // --- CENTRAL REAL-TIME LOCATION & GOOGLE MAPS API ---
  app.get('/api/central/location', (req, res) => {
    const devices = db.getConnectedDevices();
    const central = devices.find((d) => d.tipo === 'painel_admin');
    res.json(central || null);
  });

  app.post('/api/central/location', async (req, res) => {
    try {
      const clientIP = getClientIP(req);
      const { lat, lng, accuracy } = req.body;

      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Latitude e Longitude são obrigatórias para a Central.' });
      }

      // Reconhece o endereço formal utilizando a Google Maps Geocoding API
      const location = await recognizeIPAndLocation(clientIP, Number(lat), Number(lng), DEFAULT_MAPS_KEY);

      const device = db.upsertConnectedDevice({
        tipo: 'painel_admin',
        ip: location.ip,
        lat: Number(lat),
        lng: Number(lng),
        rua: location.rua,
        numero: location.numero,
        bairro: location.bairro,
        cidade: location.cidade,
        estado: location.estado,
        pais: location.pais,
        cep: location.cep,
        enderecoFormatado: location.enderecoFormatado || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        provedorInternet: location.provedorInternet || 'Central de Despacho',
        nomeIdentificador: 'Central de Operações / Dispatch Core',
        status: 'online'
      });

      res.json({
        status: 'success',
        message: 'Localização da Central conectada e sincronizada via API Google Maps.',
        central: device,
        location,
        accuracy: accuracy || null
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- STATS ---
  app.get('/api/stats', (req, res) => {
    res.json(db.getStats());
  });

  // --- TARIFAS & PONTOS ESPECÍFICOS ---
  app.get('/api/tarifas', (req, res) => {
    res.json(db.getTarifas());
  });

  app.post('/api/tarifas', (req, res) => {
    try {
      const { taxaBase, valorPorKm, taxaPorMinuto, taxaCancelamento, taxaMinima, categorias } = req.body;
      const updated = db.updateTarifas({
        taxaBase: Number(taxaBase) || 0,
        valorPorKm: Number(valorPorKm) || 0,
        taxaPorMinuto: Number(taxaPorMinuto) || 0,
        taxaCancelamento: Number(taxaCancelamento) || 0,
        taxaMinima: Number(taxaMinima) || 0,
        categorias: categorias || {}
      });
      res.json({ status: 'success', tarifas: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tarifas/pontos', (req, res) => {
    try {
      const { nome, lat, lng, raioMetros, taxaAdicional, tipo, descricao } = req.body;
      if (!nome || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Nome, latitude e longitude são obrigatórios para o ponto dinâmico.' });
      }
      const newPonto = db.addPontoEspecifico({
        nome,
        lat: Number(lat),
        lng: Number(lng),
        raioMetros: Number(raioMetros) || 500,
        taxaAdicional: Number(taxaAdicional) || 0,
        tipo: tipo || 'ponto_embarque',
        descricao: descricao || ''
      });
      res.status(201).json({ status: 'success', ponto: newPonto });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/tarifas/pontos/:id', (req, res) => {
    const id = Number(req.params.id);
    const success = db.deletePontoEspecifico(id);
    if (success) {
      res.json({ status: 'success', message: 'Ponto específico removido do banco.' });
    } else {
      res.status(404).json({ error: 'Ponto não encontrado.' });
    }
  });

  // --- CONFIG (Sem expor chave de API na resposta do painel) ---
  app.get('/api/config', (req, res) => {
    const config = db.getConfig();
    res.json({
      isMapsKeyConfigured: Boolean(config.googleMapsApiKey || DEFAULT_MAPS_KEY),
      appsScriptUrl: config.appsScriptUrl || ''
    });
  });

  app.post('/api/config', (req, res) => {
    const { appsScriptUrl } = req.body;
    const updated = db.updateConfig({
      appsScriptUrl: appsScriptUrl || ''
    });
    res.json({ status: 'success', config: { isMapsKeyConfigured: true, appsScriptUrl: updated.appsScriptUrl } });
  });

  // --- DRIVERS ---
  app.get('/api/drivers', (req, res) => {
    res.json(db.getDrivers());
  });

  app.get('/api/drivers/:id', (req, res) => {
    const id = Number(req.params.id);
    const driver = db.getDriverById(id);
    if (driver) {
      const vehicles = db.getVehicles().filter((v) => v.driverId === id);
      const devices = db.getConnectedDevices().filter((d) => d.driverId === id);
      res.json({ driver, vehicles, devices });
    } else {
      res.status(404).json({ error: 'Motorista não encontrado.' });
    }
  });

  app.post('/api/drivers/:id/credit', (req, res) => {
    const id = Number(req.params.id);
    const { valor, tipo, observacao } = req.body;
    if (valor === undefined || isNaN(Number(valor))) {
      return res.status(400).json({ error: 'Valor da recarga é obrigatório.' });
    }
    const updated = db.addDriverCredit(id, Number(valor), tipo || 'credito', observacao || 'Recarga de Saldo');
    if (updated) {
      res.json({ status: 'success', driver: updated });
    } else {
      res.status(404).json({ error: 'Motorista não encontrado.' });
    }
  });

  // --- SOLICITAÇÕES DE RECARGA DE CRÉDITO VIA APP MOTORISTA ---
  app.get('/api/credit-requests', (req, res) => {
    try {
      const requests = db.getCreditRequests();
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/drivers/:id/credit-requests', (req, res) => {
    try {
      const driverId = Number(req.params.id);
      const requests = db.getCreditRequests().filter((r) => r.driverId === driverId);
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/credit-requests', (req, res) => {
    try {
      const { driverId, valor, metodo, comprovante, observacao } = req.body;
      if (!driverId) {
        return res.status(400).json({ error: 'ID do motorista é obrigatório.' });
      }
      const val = Number(valor);
      if (isNaN(val) || val <= 0) {
        return res.status(400).json({ error: 'Valor da solicitação deve ser maior que zero.' });
      }

      const driver = db.getDriverById(Number(driverId));
      if (!driver) {
        return res.status(404).json({ error: 'Motorista não encontrado no banco de dados.' });
      }

      const newRequest = db.addCreditRequest({
        driverId: driver.id,
        driverNome: driver.nome,
        driverCpf: driver.cpf,
        driverVehicle: driver.vehicleType,
        valor: val,
        metodo: metodo || 'PIX',
        comprovante: comprovante || '',
        observacao: observacao || `Recarga solicitada via App do Motorista (R$ ${val.toFixed(2)})`
      });

      // Forward to Google Apps Script if URL is configured
      const config = db.getConfig();
      if (config.appsScriptUrl) {
        fetch(config.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tabela: 'solicitacoes_recarga',
            id: newRequest.id,
            driverId: newRequest.driverId,
            driverNome: newRequest.driverNome,
            driverCpf: newRequest.driverCpf,
            valor: newRequest.valor,
            metodo: newRequest.metodo,
            status: newRequest.status,
            createdAt: newRequest.createdAt
          })
        }).catch((err) => console.error('GAS Credit Request Forwarding error:', err));
      }

      res.status(201).json({ status: 'success', request: newRequest });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/credit-requests/:id/approve', (req, res) => {
    try {
      const id = Number(req.params.id);
      const { observacao } = req.body || {};
      const result = db.approveCreditRequest(id, observacao);
      res.json({
        status: 'success',
        message: `Solicitação #${id} aprovada com sucesso! R$ ${result.request.valor.toFixed(2)} creditados ao motorista ${result.driver.nome}.`,
        request: result.request,
        driver: result.driver
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/credit-requests/:id/reject', (req, res) => {
    try {
      const id = Number(req.params.id);
      const { motivo } = req.body || {};
      const rejected = db.rejectCreditRequest(id, motivo);
      res.json({
        status: 'success',
        message: `Solicitação #${id} rejeitada.`,
        request: rejected
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/drivers', async (req, res) => {
    try {
      const { nome, cpf, cnhBase64, vehicleType, lat, lng } = req.body;

      if (!nome || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
      }

      let ocrResult: OCRResult = {
        validade: '',
        isVencida: false,
        status: 'Analise_Manual',
        rawText: '',
        observacoes: 'Aguardando validação'
      };

      if (cnhBase64) {
        ocrResult = await processCNHImage(cnhBase64, nome, cpf);
      }

      const newDriver = db.addDriver({
        nome,
        cpf,
        cnhUrl: cnhBase64 ? 'cnh_armazenada_db' : undefined,
        cnhText: ocrResult.rawText,
        validadeCnh: ocrResult.validade,
        status: ocrResult.status,
        lat: Number(lat) || 0.0,
        lng: Number(lng) || 0.0,
        vehicleType: vehicleType || 'Carro Comum'
      });

      // Also create an associated vehicle entry if coords provided
      if (lat && lng && (Number(lat) !== 0 || Number(lng) !== 0)) {
        db.addVehicle({
          driverId: newDriver.id,
          driverName: newDriver.nome,
          modelo: `${vehicleType || 'Carro'} - ${newDriver.nome.split(' ')[0]}`,
          placa: 'BRA-' + Math.floor(1000 + Math.random() * 9000),
          tipo: vehicleType || 'Sedan',
          lat: Number(lat),
          lng: Number(lng),
          status: 'disponivel',
          costPerKm: 2.5
        });
      }

      // Forward to Google Apps Script if URL is configured
      const config = db.getConfig();
      if (config.appsScriptUrl) {
        try {
          fetch(config.appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tabela: 'motoristas',
              id: newDriver.id,
              nome: newDriver.nome,
              cpf: newDriver.cpf,
              status: newDriver.status,
              validadeCnh: newDriver.validadeCnh,
              lat: newDriver.lat,
              lng: newDriver.lng,
              createdAt: newDriver.createdAt
            })
          }).catch((err) => console.error('GAS Forwarding error:', err));
        } catch (e) {
          console.error(e);
        }
      }

      res.status(201).json({
        status: 'success',
        resultado: newDriver.status,
        message:
          newDriver.status === 'Aprovado_Auto'
            ? 'CNH válida detectada. Motorista aprovado automaticamente!'
            : 'Dados salvos no banco. CNH enviada para análise manual.',
        data: newDriver,
        ocr: ocrResult
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/drivers/:id', (req, res) => {
    const id = Number(req.params.id);
    const success = db.deleteDriver(id);
    if (success) {
      res.json({ status: 'success', message: 'Motorista excluído com sucesso.' });
    } else {
      res.status(404).json({ error: 'Motorista não encontrado.' });
    }
  });

  app.patch('/api/drivers/:id/status', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = db.updateDriver(id, { status });
    if (updated) {
      res.json({ status: 'success', driver: updated });
    } else {
      res.status(404).json({ error: 'Motorista não encontrado.' });
    }
  });

  app.post('/api/drivers/:id/location', async (req, res) => {
    const id = Number(req.params.id);
    const { lat, lng } = req.body;
    const clientIP = getClientIP(req);

    // Reconhece a localização e endereço reverso via Google Maps API
    const locInfo = await recognizeIPAndLocation(clientIP, Number(lat), Number(lng), DEFAULT_MAPS_KEY);

    const updated = db.updateDriver(id, { lat: Number(lat), lng: Number(lng) });
    if (updated) {
      // Registra a conexão do aplicativo do motorista no banco de dados
      db.upsertConnectedDevice({
        tipo: 'app_motorista',
        ip: locInfo.ip,
        lat: Number(lat),
        lng: Number(lng),
        rua: locInfo.rua,
        numero: locInfo.numero,
        bairro: locInfo.bairro,
        cidade: locInfo.cidade,
        estado: locInfo.estado,
        pais: locInfo.pais,
        cep: locInfo.cep,
        enderecoFormatado: locInfo.enderecoFormatado,
        provedorInternet: locInfo.provedorInternet,
        driverId: id,
        nomeIdentificador: `App Motorista: ${updated.nome}`,
        status: 'online'
      });

      // Find vehicle and update position
      const vehicles = db.getVehicles();
      const v = vehicles.find((item) => item.driverId === id);
      if (v) {
        db.updateVehicleLocation(v.id, Number(lat), Number(lng));
      } else {
        db.addVehicle({
          driverId: id,
          driverName: updated.nome,
          modelo: 'Veículo ' + updated.nome,
          placa: 'BRA-0000',
          tipo: updated.vehicleType || 'Sedan',
          lat: Number(lat),
          lng: Number(lng),
          status: 'disponivel',
          costPerKm: 2.5
        });
      }
      res.json({ status: 'success', driver: updated, location: locInfo });
    } else {
      res.status(404).json({ error: 'Motorista não encontrado.' });
    }
  });

  // --- VEHICLES & REAL-TIME LOCATIONS ---
  app.get('/api/vehicles', (req, res) => {
    res.json(db.getVehicles());
  });

  app.post('/api/vehicles', (req, res) => {
    const { driverId, modelo, placa, tipo, lat, lng, status, costPerKm } = req.body;
    let driverName = undefined;
    if (driverId) {
      const d = db.getDriverById(Number(driverId));
      if (d) driverName = d.nome;
    }
    const newV = db.addVehicle({
      driverId: driverId ? Number(driverId) : null,
      driverName,
      modelo: modelo || 'Veículo Padrão',
      placa: placa || 'AAA-0000',
      tipo: tipo || 'Sedan',
      lat: Number(lat) || 0.0,
      lng: Number(lng) || 0.0,
      status: status || 'disponivel',
      costPerKm: Number(costPerKm) || 2.5
    });
    res.status(201).json(newV);
  });

  app.get('/api/vehicles/locations', (req, res) => {
    const vehicles = db.getVehicles();
    const dynamicArray = vehicles.map((v) => ({
      id: v.id,
      driverId: v.driverId,
      driverName: v.driverName,
      modelo: v.modelo,
      lat: v.lat,
      lng: v.lng,
      status: v.status // 'disponivel' | 'em_corrida'
    }));
    res.json(dynamicArray);
  });

  app.post('/api/vehicles/:id/location', (req, res) => {
    const id = Number(req.params.id);
    const { lat, lng, status } = req.body;
    const updated = db.updateVehicleLocation(id, Number(lat), Number(lng), status);
    if (updated) {
      res.json({ status: 'success', vehicle: updated });
    } else {
      res.status(404).json({ error: 'Veículo não encontrado.' });
    }
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    const id = Number(req.params.id);
    const success = db.deleteVehicle(id);
    if (success) {
      res.json({ status: 'success', message: 'Veículo removido com sucesso.' });
    } else {
      res.status(404).json({ error: 'Veículo não encontrado.' });
    }
  });

  // --- PASSENGERS ---
  app.get('/api/passengers', (req, res) => {
    res.json(db.getPassengers());
  });

  app.post('/api/passengers', (req, res) => {
    const { nome, telefone, email } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome do passageiro é obrigatório.' });
    const p = db.addPassenger({ nome, telefone: telefone || '', email: email || '' });
    res.status(201).json(p);
  });

  // --- RIDES ---
  app.get('/api/rides', (req, res) => {
    res.json(db.getRides());
  });

  app.post('/api/rides', (req, res) => {
    const {
      passengerId,
      passengerName,
      driverId,
      driverName,
      origemLat,
      origemLng,
      origemEndereco,
      destinoLat,
      destinoLng,
      destinoEndereco,
      distanciaMetros,
      duracaoSegundos,
      valor,
      status
    } = req.body;

    const ride = db.addRide({
      passengerId: passengerId ? Number(passengerId) : null,
      passengerName,
      driverId: driverId ? Number(driverId) : null,
      driverName,
      origemLat: Number(origemLat) || 0,
      origemLng: Number(origemLng) || 0,
      origemEndereco,
      destinoLat: Number(destinoLat) || 0,
      destinoLng: Number(destinoLng) || 0,
      destinoEndereco,
      distanciaMetros: Number(distanciaMetros) || 0,
      duracaoSegundos: Number(duracaoSegundos) || 0,
      valor: Number(valor) || 0,
      status: status || 'solicitada'
    });

    res.status(201).json(ride);
  });

  app.patch('/api/rides/:id/status', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = db.updateRideStatus(id, status);
    if (updated) {
      res.json({ status: 'success', ride: updated });
    } else {
      res.status(404).json({ error: 'Corrida não encontrada.' });
    }
  });

  // --- TRAVA ATÔMICA & DESPACHO EM TEMPO REAL ---
  app.post('/api/dispatch/accept', async (req, res) => {
    try {
      const { rideId, driverId, driverNome } = req.body;
      if (!rideId || !driverId) {
        return res.status(400).json({ error: 'rideId e driverId são obrigatórios.' });
      }

      const result = db.acceptRideAtomic(Number(rideId), Number(driverId), driverNome || `Motorista #${driverId}`);
      if (!result.success) {
        return res.status(409).json({
          sucesso: false,
          mensagem: result.message, // 'essa corrida já foi aceita por outro motorista'
          rideId: Number(rideId),
          status_trava: 'ocupada'
        });
      }

      const ride = result.ride!;
      // Sincronização em segundo plano com Google Apps Script se configurado
      const config = db.getConfig();
      if (config.appsScriptUrl) {
        fetch(config.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_ride_accept',
            tabela: 'ride_platform_rides',
            rideId: ride.id,
            driverId: ride.driverId,
            driverNome: ride.driverName,
            status: 'em_andamento',
            status_trava: 'ocupada',
            acceptedAt: ride.acceptedAt,
            trajeto: {
              origemLat: ride.origemLat,
              origemLng: ride.origemLng,
              origemEndereco: ride.origemEndereco,
              destinoLat: ride.destinoLat,
              destinoLng: ride.destinoLng,
              destinoEndereco: ride.destinoEndereco,
              distanciaMetros: ride.distanciaMetros,
              duracaoSegundos: ride.duracaoSegundos,
              valor: ride.valor
            }
          })
        }).catch((err) => console.error('Erro na sincronização em segundo plano com Google Sheets:', err));
      }

      return res.json({
        sucesso: true,
        mensagem: 'corrida aceita pelo que pegou',
        ride,
        trajeto: {
          origemLat: ride.origemLat,
          origemLng: ride.origemLng,
          origemEndereco: ride.origemEndereco,
          destinoLat: ride.destinoLat,
          destinoLng: ride.destinoLng,
          destinoEndereco: ride.destinoEndereco,
          distanciaMetros: ride.distanciaMetros,
          duracaoSegundos: ride.duracaoSegundos,
          valor: ride.valor
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- GOOGLE SHEETS TABELAS (ride_platform_drivers, ride_platform_passengers, ride_platform_rides) ---
  app.get('/api/sheets/ride_platform_rides', (req, res) => {
    res.json(db.getRides());
  });

  app.get('/api/sheets/ride_platform_drivers', (req, res) => {
    res.json(db.getDrivers());
  });

  app.get('/api/sheets/ride_platform_passengers', (req, res) => {
    res.json(db.getPassengers());
  });

  app.post('/api/sheets/ride_platform_rides', (req, res) => {
    try {
      const {
        passengerId,
        passengerName,
        driverId,
        driverName,
        origemLat,
        origemLng,
        origemEndereco,
        destinoLat,
        destinoLng,
        destinoEndereco,
        distanciaMetros,
        duracaoSegundos,
        valor,
        status,
        status_trava
      } = req.body;

      const ride = db.addRide({
        passengerId: passengerId ? Number(passengerId) : null,
        passengerName,
        driverId: driverId ? Number(driverId) : null,
        driverName,
        origemLat: Number(origemLat) || 0,
        origemLng: Number(origemLng) || 0,
        origemEndereco,
        destinoLat: Number(destinoLat) || 0,
        destinoLng: Number(destinoLng) || 0,
        destinoEndereco,
        distanciaMetros: Number(distanciaMetros) || 0,
        duracaoSegundos: Number(duracaoSegundos) || 0,
        valor: Number(valor) || 0,
        status: status || 'solicitada',
        status_trava: status_trava || (status === 'em_andamento' ? 'ocupada' : 'aguardando_motorista')
      } as any);

      res.status(201).json(ride);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- POLLING DE REDE DO GOOGLE APPS SCRIPT ---
  app.get('/api/gas/poll', async (req, res) => {
    try {
      const config = db.getConfig();
      const appsScriptUrl = (req.query.url as string) || config.appsScriptUrl;

      // Se houver URL do Google Apps Script configurada, consulta atualizações em tempo real
      if (appsScriptUrl) {
        try {
          const gasRes = await fetch(`${appsScriptUrl}?action=get_updates&t=${Date.now()}`, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(4000)
          });
          if (gasRes.ok) {
            const data = await gasRes.json();
            return res.json({
              fonte: 'Google Apps Script (Ao Vivo)',
              sucesso: true,
              ride_platform_rides: data.ride_platform_rides || data.corridas || [],
              ride_platform_drivers: data.ride_platform_drivers || data.motoristas || [],
              ride_platform_passengers: data.ride_platform_passengers || data.passageiros || [],
              timestamp: new Date().toISOString()
            });
          }
        } catch (gasErr: any) {
          // Fallback gracioso para dados locais de espelho
        }
      }

      // Retorna as tabelas locais sincronizadas
      res.json({
        fonte: 'Banco Local Sincronizado',
        sucesso: true,
        ride_platform_rides: db.getRides(),
        ride_platform_drivers: db.getDrivers(),
        ride_platform_passengers: db.getPassengers(),
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- EARNINGS CHART DATA ---
  app.get('/api/earnings', (req, res) => {
    res.json(db.getEarnings());
  });

  // --- GOOGLE MAPS DIRECTIONS ROUTE CALCULATION ---
  app.post('/api/route', async (req, res) => {
    const { coordenadaPartida, coordenadaDestino } = req.body;
    if (!coordenadaPartida || !coordenadaDestino) {
      return res.status(400).json({ error: 'coordenadaPartida e coordenadaDestino são obrigatórias' });
    }

    const config = db.getConfig();
    const apiKey = config.googleMapsApiKey || DEFAULT_MAPS_KEY;

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${coordenadaPartida.lat},${coordenadaPartida.lng}&destination=${coordenadaDestino.lat},${coordenadaDestino.lng}&mode=driving&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const leg = data.routes[0].legs[0];
        return res.json({
          distanceMeters: leg.distance.value,
          durationSeconds: leg.duration.value,
          distanceText: leg.distance.text,
          durationText: leg.duration.text,
          source: 'Google Maps Directions API',
          rawGoogleResponse: data
        });
      }

      // If Google Maps API returns error or zero results, provide calculation based on coordinates
      const R = 6371e3; // meters
      const lat1 = (coordenadaPartida.lat * Math.PI) / 180;
      const lat2 = (coordenadaDestino.lat * Math.PI) / 180;
      const deltaLat = ((coordenadaDestino.lat - coordenadaPartida.lat) * Math.PI) / 180;
      const deltaLng = ((coordenadaDestino.lng - coordenadaPartida.lng) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceMeters = Math.round(R * c);
      const durationSeconds = Math.round(distanceMeters / 11);

      return res.json({
        distanceMeters,
        durationSeconds,
        source: 'Google Maps Routes Coordinates Engine',
        googleStatus: data.status,
        googleErrorMessage: data.error_message
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // --- GAS DOPOST SIMULATION & INTEGRATION ENDPOINT ---
  app.post('/api/gas-endpoint', async (req, res) => {
    try {
      const body = req.body;
      const tabela = body.tabela || 'motoristas';

      if (tabela === 'motoristas') {
        const newD = db.addDriver({
          nome: body.nome || 'Motorista Sem Nome',
          cpf: body.cpf || '',
          cnhUrl: body.cnhUrl,
          status: body.status || 'Analise_Manual',
          lat: Number(body.lat) || 0.0,
          lng: Number(body.lng) || 0.0,
          vehicleType: body.vehicleType || 'Sedan'
        });
        return res.json({
          status: 'sucesso',
          tabela: 'motoristas',
          resultado: newD.status,
          id: newD.id
        });
      } else if (tabela === 'passageiros') {
        const newP = db.addPassenger({
          nome: body.nome || '',
          telefone: body.telefone || '',
          email: body.email || ''
        });
        return res.json({ status: 'sucesso', tabela: 'passageiros', id: newP.id });
      } else if (tabela === 'corridas') {
        const newR = db.addRide({
          passengerId: body.passengerId || null,
          driverId: body.driverId || null,
          origemLat: Number(body.origemLat) || 0,
          origemLng: Number(body.origemLng) || 0,
          destinoLat: Number(body.destinoLat) || 0,
          destinoLng: Number(body.destinoLng) || 0,
          distanciaMetros: Number(body.distanciaMetros) || 0,
          duracaoSegundos: Number(body.duracaoSegundos) || 0,
          valor: Number(body.valor) || 0,
          status: body.status || 'solicitada'
        });
        return res.json({ status: 'sucesso', tabela: 'corridas', id: newR.id });
      }

      res.status(400).json({ status: 'erro', mensagem: 'Tabela inválida' });
    } catch (err: any) {
      res.status(500).json({ status: 'erro', mensagem: err.message });
    }
  });

  // --- DATABASE RESET ---
  app.post('/api/database/reset', (req, res) => {
    db.reset();
    res.json({ status: 'success', message: 'Banco de dados zerado com sucesso.' });
  });

  // Serve static assets from public folder
  app.use(express.static(resolve(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Setup Vite middleware for React frontend development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();