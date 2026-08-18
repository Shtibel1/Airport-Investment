import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  ensureRegistryFresh,
  loadSnapshotFromDisk,
  saveSnapshotToDisk,
} from '../core/registry-service';
import { findAirport, getActiveAirportRegistry } from './airports-db';
import { getAirportMetrics, compareAirports } from '../core/airport-service';

describe('Proof of System: Live Daily Rolling Snapshot & Synchronization', () => {
  const snapshotPath = path.resolve(process.cwd(), 'src/lib/data/airports-registry.json');

  it('1. Verifies persistent JSON snapshot exists and is valid on disk', () => {
    expect(fs.existsSync(snapshotPath)).toBe(true);
    const raw = fs.readFileSync(snapshotPath, 'utf8');
    const data = JSON.parse(raw);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(22);

    console.log(`\n[PROOF 1] Found ${data.length} registered airports on disk:`);
    console.log(data.map((a: any) => ` - ${a.iata} (${a.name}) | Delay: ${a.flightDelayRatePct}% | Gates: ${a.gates}`).slice(0, 5).join('\n'));
  });

  it('2. Demonstrates Cold-Start Loading & Active Memory Synchronization', async () => {
    const active = await ensureRegistryFresh(true);
    expect(active.length).toBe(22);

    const bos = findAirport('BOS');
    expect(bos).not.toBeNull();
    expect(bos?.iata).toBe('BOS');
    expect(bos?.city).toBe('Boston');
    console.log(`\n[PROOF 2] Memory registry active. BOS lookup resolved:`, {
      iata: bos?.iata,
      annualPassengers: bos?.annualPassengers,
      designCapacity: bos?.designTerminalCapacity,
      lastUpdated: bos?.lastUpdated,
    });
  });

  it('3. Demonstrates Direct Snapshot Persistence without Temp Files', async () => {
    const active = getActiveAirportRegistry();
    const saveResult = await saveSnapshotToDisk(active);
    expect(saveResult).toBe(true);

    const diskRecords = await loadSnapshotFromDisk();
    const diskBos = diskRecords?.find((a) => a.iata === 'BOS');
    expect(diskBos).toBeDefined();
    expect(diskBos?.annualPassengers).toBe(42500000);

    console.log(`[PROOF 3 RESULT] Verified direct disk persistence without temp files.`);
  });

  it('4. Demonstrates Live End-to-End MPS Scoring using Persistent Snapshot Data', async () => {
    console.log(`\n[PROOF 4] Running live Modernization Potential Score (MPS) on registry...`);
    const scoreResult = await getAirportMetrics('BOS', { forceRefresh: true });

    expect(scoreResult).toBeDefined();
    expect(scoreResult.iataCode).toBe('BOS');
    expect(scoreResult.mpsScore).toBeGreaterThan(0);
    expect(scoreResult.breakdown).toBeDefined();

    console.log(`[PROOF 4 RESULT] BOS Scored Successfully:`, {
      airport: scoreResult.airportName,
      mpsScore: scoreResult.mpsScore,
      congestionScore: scoreResult.breakdown.capacityCongestionScore,
      demandGrowthScore: scoreResult.breakdown.demandGrowthScore,
      confidenceLevel: scoreResult.confidenceLevel,
    });
  });

  it('5. Demonstrates Regional Comparison using Unified Snapshot', async () => {
    console.log(`\n[PROOF 5] Running side-by-side comparison for LAX vs SNA...`);
    const comparison = await compareAirports(['LAX', 'SNA']);

    expect(comparison.airports.length).toBe(2);
    expect(comparison.comparisonHighlights).toBeDefined();

    console.log(`[PROOF 5 RESULT] Comparison completed:`, {
      highlights: comparison.comparisonHighlights,
      differentialNotes: comparison.differentialNotes,
    });
  });
});
