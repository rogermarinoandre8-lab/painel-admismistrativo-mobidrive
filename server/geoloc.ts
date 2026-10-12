export interface LocationRecognitionResult {
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
  fonte: 'Google Maps Geocoding + IP' | 'Google Geocoding (GPS)' | 'IP Geolocation' | 'GPS Fallback';
  precisaoMetros?: number;
}

export interface GeocodeDetailedResult {
  formatted_address: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  cep: string;
}

export async function reverseGeocodeGoogleDetailed(lat: number, lng: number, apiKey: string): Promise<GeocodeDetailedResult> {
  const result: GeocodeDetailedResult = {
    formatted_address: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    cep: ''
  };

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      result.formatted_address = data.results[0].formatted_address;

      for (const comp of data.results[0].address_components || []) {
        const types: string[] = comp.types || [];
        if (types.includes('route')) {
          result.rua = comp.long_name;
        } else if (types.includes('street_number')) {
          result.numero = comp.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood')) {
          result.bairro = comp.long_name;
        } else if (types.includes('administrative_area_level_2')) {
          result.cidade = comp.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          result.estado = comp.short_name || comp.long_name;
        } else if (types.includes('country')) {
          result.pais = comp.long_name;
        } else if (types.includes('postal_code')) {
          result.cep = comp.long_name;
        }
      }
    }
  } catch (err) {
    console.error('Google Geocoding API detailed error:', err);
  }

  return result;
}

export async function reverseGeocodeGoogle(lat: number, lng: number, apiKey: string): Promise<string> {
  const detailed = await reverseGeocodeGoogleDetailed(lat, lng, apiKey);
  return detailed.formatted_address;
}

export async function recognizeIPAndLocation(clientIP?: string, providedLat?: number, providedLng?: number, apiKey?: string): Promise<LocationRecognitionResult> {
  const DEFAULT_KEY = apiKey || process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyC049pM2oi3Hk5vxP-6KxyQLHOSon-wwag';

  // 1. If explicit coordinates are provided (e.g. from device GPS / Central in real time), use them with Google Geocoding
  if (providedLat !== undefined && providedLng !== undefined && (providedLat !== 0 || providedLng !== 0)) {
    const detailed = await reverseGeocodeGoogleDetailed(providedLat, providedLng, DEFAULT_KEY);
    return {
      ip: clientIP || '127.0.0.1',
      lat: Number(providedLat),
      lng: Number(providedLng),
      rua: detailed.rua,
      numero: detailed.numero,
      bairro: detailed.bairro,
      cidade: detailed.cidade,
      estado: detailed.estado,
      pais: detailed.pais || 'Brasil',
      cep: detailed.cep,
      enderecoFormatado: detailed.formatted_address || `${providedLat.toFixed(5)}, ${providedLng.toFixed(5)}`,
      fonte: 'Google Geocoding (GPS)'
    };
  }

  // 2. Resolve client public IP if localhost or private
  let targetIP = clientIP || '';
  if (!targetIP || targetIP === '::1' || targetIP === '127.0.0.1' || targetIP.startsWith('10.') || targetIP.startsWith('192.168.')) {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipJson = await ipRes.json();
      if (ipJson.ip) {
        targetIP = ipJson.ip;
      }
    } catch {
      targetIP = '127.0.0.1';
    }
  }

  // 3. Query IP Geolocation to obtain approximate coordinates
  let lat = -23.5505;
  let lng = -46.6333;
  let cidade = 'São Paulo';
  let estado = 'SP';
  let pais = 'Brasil';
  let provedor = '';

  try {
    if (targetIP && targetIP !== '127.0.0.1') {
      const geoRes = await fetch(`http://ip-api.com/json/${targetIP}?fields=status,country,regionName,city,lat,lon,isp`);
      const geoData = await geoRes.json();
      if (geoData.status === 'success') {
        lat = geoData.lat;
        lng = geoData.lon;
        cidade = geoData.city || cidade;
        estado = geoData.regionName || estado;
        pais = geoData.country || pais;
        provedor = geoData.isp || '';
      }
    }
  } catch (err) {
    console.error('IP Geolocation error:', err);
  }

  // 4. Enrich coordinates with Google Maps Reverse Geocoding API
  const detailedGoogle = await reverseGeocodeGoogleDetailed(lat, lng, DEFAULT_KEY);

  return {
    ip: targetIP || '127.0.0.1',
    lat,
    lng,
    rua: detailedGoogle.rua,
    numero: detailedGoogle.numero,
    bairro: detailedGoogle.bairro,
    cidade: detailedGoogle.cidade || cidade,
    estado: detailedGoogle.estado || estado,
    pais: detailedGoogle.pais || pais,
    cep: detailedGoogle.cep,
    enderecoFormatado: detailedGoogle.formatted_address || `${cidade}, ${estado} - ${pais}`,
    provedorInternet: provedor,
    fonte: 'Google Maps Geocoding + IP'
  };
}
