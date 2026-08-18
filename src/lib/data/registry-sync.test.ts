import { describe, it, expect, beforeEach } from 'vitest';
import {
  ensureRegistryFresh,
  loadSnapshotFromDisk,
  saveSnapshotToDisk,
  isValidAirportMetadata,
  validateAirportRegistry,
} from '../core/registry-service';
import { findAirport, getActiveAirportRegistry } from './airports-db';

describe('Registry Sync & Minimalist Daily Snapshot Architecture', () => {
  beforeEach(async () => {
    await ensureRegistryFresh(false);
  });

  it('loads persistent airport registry snapshot from disk asynchronously', async () => {
    const diskRecords = await loadSnapshotFromDisk();
    expect(diskRecords).toBeDefined();
    expect(Array.isArray(diskRecords)).toBe(true);
    expect(diskRecords!.length).toBe(22);

    const bos = diskRecords?.find((a) => a.iata === 'BOS');
    expect(bos).toBeDefined();
    expect(bos?.name).toContain('Logan');
    expect((bos as any).history).toBeUndefined();
  });

  it('validates airport schema and rejects malformed records', () => {
    const validAirport = {
      iata: 'BOS',
      icao: 'KBOS',
      name: 'Boston Logan',
      city: 'Boston',
      latitude: 42.36,
      longitude: -71.0,
      gates: 102,
      annualPassengers: 42000000,
      designTerminalCapacity: 38000000,
      flightDelayRatePct: 20,
      yoyPassengerGrowthPct: 5,
      loadFactorPct: 80,
      regionalPopulationGrowthRatio: 1.1,
      gateGrowthRatio: 1.0,
      peakSlotUtilizationPct: 90,
      baselineOutboundCount: 60,
      baselineLongHaulSharePct: 10,
      authenticDestinations: ['JFK', 'LHR'],
      aliases: ['boston'],
    };

    expect(isValidAirportMetadata(validAirport)).toBe(true);

    const incompleteAirport = {
      iata: 'BOS',
      name: 'Boston Logan',
    };
    expect(isValidAirportMetadata(incompleteAirport)).toBe(false);

    const validated = validateAirportRegistry([validAirport, incompleteAirport]);
    expect(validated).toHaveLength(1);
    expect(validated![0].iata).toBe('BOS');
  });

  it('ensures in-memory active registry is populated and retrievable', async () => {
    const active = await ensureRegistryFresh(false);
    expect(active.length).toBe(22);

    const sfo = findAirport('SFO');
    expect(sfo).not.toBeNull();
    expect(sfo?.city).toBe('San Francisco');
  });

  it('saves and reads directly to disk without intermediate temp files', async () => {
    const active = getActiveAirportRegistry();
    const saveResult = await saveSnapshotToDisk(active);
    expect(saveResult).toBe(true);

    const reloaded = await loadSnapshotFromDisk();
    expect(reloaded).toHaveLength(22);
  });

  it('performs on-demand or cron background snapshot revalidation', async () => {
    const refreshed = await ensureRegistryFresh(true);
    expect(refreshed).toHaveLength(22);
    expect(refreshed[0].lastUpdated).toBeDefined();
  });
});
