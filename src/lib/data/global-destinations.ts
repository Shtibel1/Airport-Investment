/**
 * GLOBAL_DESTINATIONS represents a hardcoded fallback database of key international airports.
 * 
 * Update Frequency / Mechanism:
 * - **Static Resource**: This data is entirely static and is NOT updated dynamically or by any automated sync process (unlike the primary registry in `airports-registry.json`).
 * - **Manual Updates Only**: If coordinates, names, or codes for these global destinations change, or if new global destinations need to be added, a developer must manually update this file.
 * - **Purpose**: Used for distance calculations (using Haversine formula) when retrieving route telemetry where the destination airport is outside our primary regional investment registry.
 */
export const GLOBAL_DESTINATIONS: Record<string, { name: string; city: string; lat: number; lon: number; country: string }> = {
  // Europe
  LHR: { name: 'London Heathrow Airport', city: 'London', lat: 51.4700, lon: -0.4543, country: 'UK' },
  LGW: { name: 'London Gatwick Airport', city: 'London', lat: 51.1537, lon: -0.1821, country: 'UK' },
  CDG: { name: 'Charles de Gaulle Airport', city: 'Paris', lat: 49.0097, lon: 2.5479, country: 'France' },
  FRA: { name: 'Frankfurt Airport', city: 'Frankfurt', lat: 50.0379, lon: 8.5622, country: 'Germany' },
  MUC: { name: 'Munich Airport', city: 'Munich', lat: 48.3537, lon: 11.7860, country: 'Germany' },
  AMS: { name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', lat: 52.3105, lon: 4.7683, country: 'Netherlands' },
  MAD: { name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', lat: 40.4839, lon: -3.5680, country: 'Spain' },
  BCN: { name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona', lat: 41.2974, lon: 2.0833, country: 'Spain' },
  FCO: { name: 'Rome Leonardo da Vinci Fiumicino Airport', city: 'Rome', lat: 41.8003, lon: 12.2389, country: 'Italy' },
  ZRH: { name: 'Zurich Airport', city: 'Zurich', lat: 47.4582, lon: 8.5555, country: 'Switzerland' },
  DUB: { name: 'Dublin Airport', city: 'Dublin', lat: 53.4264, lon: -6.2499, country: 'Ireland' },
  KEF: { name: 'Keflavík International Airport', city: 'Reykjavik', lat: 63.9850, lon: -22.6056, country: 'Iceland' },

  // Asia / Pacific
  HND: { name: 'Tokyo Haneda Airport', city: 'Tokyo', lat: 35.5494, lon: 139.7798, country: 'Japan' },
  NRT: { name: 'Tokyo Narita Airport', city: 'Tokyo', lat: 35.7720, lon: 140.3929, country: 'Japan' },
  KIX: { name: 'Kansai International Airport', city: 'Osaka', lat: 34.4320, lon: 135.2304, country: 'Japan' },
  ICN: { name: 'Incheon International Airport', city: 'Seoul', lat: 37.4602, lon: 126.4407, country: 'South Korea' },
  PVG: { name: 'Shanghai Pudong International Airport', city: 'Shanghai', lat: 31.1443, lon: 121.8083, country: 'China' },
  PEK: { name: 'Beijing Capital International Airport', city: 'Beijing', lat: 40.0799, lon: 116.6031, country: 'China' },
  HKG: { name: 'Hong Kong International Airport', city: 'Hong Kong', lat: 22.3080, lon: 113.9185, country: 'Hong Kong' },
  TPE: { name: 'Taiwan Taoyuan International Airport', city: 'Taipei', lat: 25.0797, lon: 121.2342, country: 'Taiwan' },
  SIN: { name: 'Singapore Changi Airport', city: 'Singapore', lat: 1.3644, lon: 103.9915, country: 'Singapore' },
  SYD: { name: 'Sydney Kingsford Smith Airport', city: 'Sydney', lat: -33.9399, lon: 151.1753, country: 'Australia' },
  MEL: { name: 'Melbourne Airport', city: 'Melbourne', lat: -37.6690, lon: 144.8410, country: 'Australia' },
  AKL: { name: 'Auckland Airport', city: 'Auckland', lat: -37.0082, lon: 174.7850, country: 'New Zealand' },

  // Middle East
  DXB: { name: 'Dubai International Airport', city: 'Dubai', lat: 25.2532, lon: 55.3657, country: 'UAE' },
  DOH: { name: 'Hamad International Airport', city: 'Doha', lat: 25.2731, lon: 51.6081, country: 'Qatar' },
  TLV: { name: 'Ben Gurion Airport', city: 'Tel Aviv', lat: 32.0055, lon: 34.8854, country: 'Israel' },

  // Americas
  YYZ: { name: 'Toronto Pearson International Airport', city: 'Toronto', lat: 43.6777, lon: -79.6248, country: 'Canada' },
  YVR: { name: 'Vancouver International Airport', city: 'Vancouver', lat: 49.1967, lon: -123.1815, country: 'Canada' },
  MEX: { name: 'Mexico City International Airport', city: 'Mexico City', lat: 19.4361, lon: -99.0719, country: 'Mexico' },
  CUN: { name: 'Cancún International Airport', city: 'Cancún', lat: 21.0365, lon: -86.8771, country: 'Mexico' },
  GRU: { name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', lat: -23.4356, lon: -46.4731, country: 'Brazil' },
  EZE: { name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', lat: -34.8222, lon: -58.5358, country: 'Argentina' },
  BOG: { name: 'El Dorado International Airport', city: 'Bogotá', lat: 4.7016, lon: -74.1469, country: 'Colombia' },
  SCL: { name: 'Arturo Merino Benítez International Airport', city: 'Santiago', lat: -33.3930, lon: -70.7858, country: 'Chile' },
};

export const ICAO_TO_IATA_MAP: Record<string, string> = {
  EGLL: 'LHR', EGKK: 'LGW', LFPG: 'CDG', EDDF: 'FRA', EDDM: 'MUC', EHAM: 'AMS',
  LEMD: 'MAD', LEBL: 'BCN', LIRF: 'FCO', LSZH: 'ZRH', EIDW: 'DUB', BIKF: 'KEF',
  RJTT: 'HND', RJAA: 'NRT', RJBB: 'KIX', RKSI: 'ICN', ZSPD: 'PVG', ZBAA: 'PEK',
  VHHH: 'HKG', RCTP: 'TPE', WSSS: 'SIN', YSSY: 'SYD', YMML: 'MEL', NZAA: 'AKL',
  OMDB: 'DXB', OTHH: 'DOH', LLBG: 'TLV', CYYZ: 'YYZ', CYVR: 'YVR', MMMX: 'MEX',
  MMUN: 'CUN', SBGR: 'GRU', SAEZ: 'EZE', SKBO: 'BOG', SCEL: 'SCL',
};

