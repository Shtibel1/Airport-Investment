import { Coordinates } from '../core/scoring/haversine';
import seedAirports from './airports-registry.json';
import { AirportMetadata } from './types';

export { type AirportMetadata };

import { GLOBAL_DESTINATIONS, ICAO_TO_IATA_MAP } from './global-destinations';
export { GLOBAL_DESTINATIONS, ICAO_TO_IATA_MAP };


const initialAirports: AirportMetadata[] = (seedAirports as unknown) as AirportMetadata[];
export let AIRPORT_REGISTRY: AirportMetadata[] = initialAirports;

const IATA_MAP = new Map<string, AirportMetadata>(
  initialAirports.map((a) => [a.iata.toUpperCase(), a])
);
const ICAO_MAP = new Map<string, AirportMetadata>(
  initialAirports.map((a) => [a.icao.toUpperCase(), a])
);

export function updateActiveAirportRegistry(records: AirportMetadata[]): void {
  AIRPORT_REGISTRY = records;
  IATA_MAP.clear();
  ICAO_MAP.clear();
  records.forEach((airport) => {
    IATA_MAP.set(airport.iata.toUpperCase(), airport);
    ICAO_MAP.set(airport.icao.toUpperCase(), airport);
  });
}

export function getActiveAirportRegistry(): AirportMetadata[] {
  return AIRPORT_REGISTRY;
}

export function findAirport(query: string): AirportMetadata | null {
  if (!query) return null;
  const clean = query.trim().toUpperCase();

  if (IATA_MAP.has(clean)) {
    return IATA_MAP.get(clean)!;
  }

  if (ICAO_MAP.has(clean)) {
    return ICAO_MAP.get(clean)!;
  }

  if (clean.length === 3 && ICAO_MAP.has(`K${clean}`)) {
    return ICAO_MAP.get(`K${clean}`)!;
  }

  if (clean.length === 4 && clean.startsWith('K') && IATA_MAP.has(clean.substring(1))) {
    return IATA_MAP.get(clean.substring(1))!;
  }

  const lower = query.trim().toLowerCase();

  for (const airport of AIRPORT_REGISTRY) {
    if (
      airport.city.toLowerCase() === lower ||
      airport.name.toLowerCase() === lower ||
      airport.aliases.some((a) => a.toLowerCase() === lower)
    ) {
      return airport;
    }
  }

  for (const airport of AIRPORT_REGISTRY) {
    if (
      airport.name.toLowerCase().includes(lower) ||
      airport.city.toLowerCase().includes(lower) ||
      airport.aliases.some((a) => lower.includes(a.toLowerCase()) && a.length > 3)
    ) {
      return airport;
    }
  }

  return null;
}

export function getAirportByIata(iata: string): AirportMetadata | null {
  return IATA_MAP.get(iata.trim().toUpperCase()) || null;
}

export function getAirportByIcao(icao: string): AirportMetadata | null {
  return ICAO_MAP.get(icao.trim().toUpperCase()) || null;
}

export function getAirportCoordinates(code: string): Coordinates | null {
  const clean = code.trim().toUpperCase();
  const airport = findAirport(clean);
  if (airport) {
    return { latitude: airport.latitude, longitude: airport.longitude };
  }

  if (GLOBAL_DESTINATIONS[clean]) {
    const d = GLOBAL_DESTINATIONS[clean];
    return { latitude: d.lat, longitude: d.lon };
  }

  if (ICAO_TO_IATA_MAP[clean]) {
    const destIata = ICAO_TO_IATA_MAP[clean];
    const d = GLOBAL_DESTINATIONS[destIata];
    if (d) return { latitude: d.lat, longitude: d.lon };
  }

  return null;
}
