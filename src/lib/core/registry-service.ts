import { promises as fsPromises } from 'fs';
import * as path from 'path';
import {
  updateActiveAirportRegistry,
  getActiveAirportRegistry,
} from '../data/airports-db';
import { AirportMetadata } from '../data/types';

const SNAPSHOT_FILE_PATH = path.resolve(process.cwd(), 'src/lib/data/airports-registry.json');
export const DAILY_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

let lastSyncTimestamp = 0;
let isInitialized = false;

export function isValidAirportMetadata(item: any): item is AirportMetadata {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.iata === 'string' &&
    item.iata.trim().length === 3 &&
    typeof item.icao === 'string' &&
    typeof item.name === 'string' &&
    typeof item.city === 'string' &&
    typeof item.latitude === 'number' &&
    !isNaN(item.latitude) &&
    typeof item.longitude === 'number' &&
    !isNaN(item.longitude) &&
    typeof item.gates === 'number' &&
    typeof item.annualPassengers === 'number' &&
    typeof item.designTerminalCapacity === 'number' &&
    typeof item.flightDelayRatePct === 'number' &&
    typeof item.yoyPassengerGrowthPct === 'number' &&
    typeof item.loadFactorPct === 'number' &&
    typeof item.regionalPopulationGrowthRatio === 'number' &&
    typeof item.gateGrowthRatio === 'number' &&
    typeof item.peakSlotUtilizationPct === 'number' &&
    typeof item.baselineOutboundCount === 'number' &&
    typeof item.baselineLongHaulSharePct === 'number' &&
    Array.isArray(item.authenticDestinations) &&
    Array.isArray(item.aliases)
  );
}

export function validateAirportRegistry(data: any): AirportMetadata[] | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const validRecords = data.filter(isValidAirportMetadata);
  if (validRecords.length === 0) {
    return null;
  }
  return validRecords;
}

export async function loadSnapshotFromDisk(): Promise<AirportMetadata[] | null> {
  try {
    const raw = await fsPromises.readFile(SNAPSHOT_FILE_PATH, 'utf8');
    if (!raw || raw.trim().length === 0) {
      return null;
    }
    const data = JSON.parse(raw);
    const validRecords = validateAirportRegistry(data);
    if (!validRecords) {
      console.warn('[RegistryService] Snapshot failed runtime validation, retaining active memory baseline.');
      return null;
    }
    return validRecords;
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.warn('[RegistryService] Snapshot read/parse error, retaining active memory baseline:', error?.message || error);
    }
  }
  return null;
}

export async function saveSnapshotToDisk(records: AirportMetadata[]): Promise<boolean> {
  try {
    const validRecords = validateAirportRegistry(records);
    if (!validRecords) {
      console.warn('[RegistryService] Attempted to save invalid registry data to disk, aborted.');
      return false;
    }

    const jsonStr = JSON.stringify(validRecords, null, 2);
    await fsPromises.writeFile(SNAPSHOT_FILE_PATH, jsonStr, 'utf8');
    return true;
  } catch (error) {
    console.error('[RegistryService] Could not save snapshot to disk:', (error as Error)?.message || error);
    return false;
  }
}

export async function ensureRegistryFresh(forceRefresh: boolean = false): Promise<AirportMetadata[]> {
  const now = Date.now();

  if (!isInitialized) {
    const diskRecords = await loadSnapshotFromDisk();
    if (diskRecords) {
      updateActiveAirportRegistry(diskRecords);
    }
    isInitialized = true;
    lastSyncTimestamp = now;
    return getActiveAirportRegistry();
  }

  if (!forceRefresh && lastSyncTimestamp > 0 && now - lastSyncTimestamp < DAILY_SYNC_INTERVAL_MS) {
    return getActiveAirportRegistry();
  }

  try {
    const currentRecords = getActiveAirportRegistry();
    const updatedRecords = currentRecords.map((airport) => ({
      ...airport,
      lastUpdated: new Date().toISOString(),
    }));

    updateActiveAirportRegistry(updatedRecords);
    await saveSnapshotToDisk(updatedRecords);

    lastSyncTimestamp = now;
    return updatedRecords;
  } catch (error) {
    console.error('[RegistryService] Error during registry revalidation:', error);
    return getActiveAirportRegistry();
  }
}
