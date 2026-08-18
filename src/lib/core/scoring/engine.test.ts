import { describe, it, expect } from 'vitest';
import {
  calculateAirportScore,
  calculateCapacityCongestion,
  calculateDemandGrowth,
  calculateUnmetDemandSpill,
  calculateLongHaulStats,
  calculateConfidence,
} from './engine';
import { calculateHaversineDistance } from './haversine';
import { AirportRawMetrics, FlightRecord } from './types';
import { LRUCache } from '../cache/lru';
import { findAirport } from '../../data/airports-db';
import { getAirportMetrics, compareAirports, getRegionalAirports } from '../airport-service';

describe('Haversine Distance Calculator', () => {
  it('calculates accurate distance between Boston (BOS) and London Heathrow (LHR)', () => {
    const dist = calculateHaversineDistance(
      { latitude: 42.3656, longitude: -71.0096 },
      { latitude: 51.47, longitude: -0.4543 }
    );
    expect(dist).toBeGreaterThan(3200);
    expect(dist).toBeLessThan(3350);
  });

  it('calculates distance between LAX and JFK', () => {
    const dist = calculateHaversineDistance(
      { latitude: 33.9416, longitude: -118.4085 },
      { latitude: 40.6413, longitude: -73.7781 }
    );
    expect(dist).toBeGreaterThan(2450);
    expect(dist).toBeLessThan(2500);
  });

  it('returns 0 for identical coordinates', () => {
    const dist = calculateHaversineDistance(
      { latitude: 37.6188, longitude: -122.375 },
      { latitude: 37.6188, longitude: -122.375 }
    );
    expect(dist).toBe(0);
  });
});

describe('Mathematical Scoring Engine (MPS)', () => {
  const mockBaseMetrics: AirportRawMetrics = {
    iataCode: 'BOS',
    icaoCode: 'KBOS',
    name: 'Boston Logan International',
    city: 'Boston',
    state: 'MA',
    region: 'New England',
    latitude: 42.3656,
    longitude: -71.0096,
    annualPassengers: 42_000_000,
    designTerminalCapacity: 38_000_000,
    flightDelayRatePct: 24.5,
    yoyPassengerGrowthPct: 7.2,
    loadFactorPct: 84.0,
    regionalPopulationGrowthRatio: 1.12,
    gateGrowthRatio: 1.01,
    peakSlotUtilizationPct: 92.0,
    outboundFlightsSampleCount: 65,
    isCached: false,
    dataSource: 'Live OpenSky Telemetry',
    lastUpdated: new Date().toISOString(),
  };

  it('bounds Capacity Congestion between 0 and 100', () => {
    const high = calculateCapacityCongestion(100_000_000, 10_000_000, 80);
    expect(high.score).toBe(100);

    const zero = calculateCapacityCongestion(0, 50_000_000, 0);
    expect(zero.score).toBe(0);
  });

  it('bounds Demand Growth between 0 and 100', () => {
    const high = calculateDemandGrowth(150, 95);
    expect(high).toBe(100);

    const zero = calculateDemandGrowth(0, 0);
    expect(zero).toBe(0);
  });

  it('bounds Unmet Demand / Spill between 0 and 100', () => {
    const high = calculateUnmetDemandSpill(2.5, 0.5, 98);
    expect(high.score).toBe(100);

    const zero = calculateUnmetDemandSpill(0, 1.0, 0);
    expect(zero.score).toBe(0);
  });

  it('verifies strict MPS boundary conditions (0 <= MPS <= 100)', () => {
    const normalResult = calculateAirportScore(mockBaseMetrics);
    expect(normalResult.mpsScore).toBeGreaterThanOrEqual(0);
    expect(normalResult.mpsScore).toBeLessThanOrEqual(100);

    const overloadedMetrics: AirportRawMetrics = {
      ...mockBaseMetrics,
      annualPassengers: 90_000_000,
      designTerminalCapacity: 40_000_000,
      flightDelayRatePct: 45,
      yoyPassengerGrowthPct: 20,
      loadFactorPct: 92,
      regionalPopulationGrowthRatio: 1.5,
      gateGrowthRatio: 0.95,
      peakSlotUtilizationPct: 99,
    };
    const overloadedResult = calculateAirportScore(overloadedMetrics);
    expect(overloadedResult.mpsScore).toBeLessThanOrEqual(100);
    expect(overloadedResult.mpsScore).toBeGreaterThan(80);
    expect(overloadedResult.recommendationRating).toBe('HIGH_PRIORITY_EXPANSION');
  });

  it('computes long-haul flight percentage with default and custom thresholds', () => {
    const flights: FlightRecord[] = [
      { originIata: 'ANC', originIcao: 'PANC', destIata: 'SEA', distanceMiles: 1448 },
      { originIata: 'ANC', originIcao: 'PANC', destIata: 'ORD', distanceMiles: 2846 },
      { originIata: 'ANC', originIcao: 'PANC', destIata: 'FRA', distanceMiles: 4680 },
      { originIata: 'ANC', originIcao: 'PANC', destIata: 'ICN', distanceMiles: 3760 },
    ];

    const statsDefault = calculateLongHaulStats(flights);
    expect(statsDefault.thresholdMiles).toBe(3000);
    expect(statsDefault.totalOutboundFlights).toBe(4);
    expect(statsDefault.longHaulFlightCount).toBe(2);
    expect(statsDefault.longHaulPercentage).toBe(50.0);

    const statsCustom = calculateLongHaulStats(flights, 2500);
    expect(statsCustom.thresholdMiles).toBe(2500);
    expect(statsCustom.longHaulFlightCount).toBe(3);
    expect(statsCustom.longHaulPercentage).toBe(75.0);
  });

  it('evaluates confidence level degradation based on sample size and cache', () => {
    const highConf = calculateConfidence(mockBaseMetrics, 65);
    expect(highConf.level).toBe('HIGH');
    expect(highConf.score).toBeGreaterThanOrEqual(0.85);

    const cachedMetrics = { ...mockBaseMetrics, isCached: true };
    const medConf = calculateConfidence(cachedMetrics, 65);
    expect(medConf.level).toBe('MEDIUM');
    expect(medConf.score).toBeLessThanOrEqual(0.84);

    const lowConf = calculateConfidence(mockBaseMetrics, 12);
    expect(lowConf.level).toBe('LOW');
    expect(lowConf.score).toBeLessThan(0.60);
  });
});

describe('In-Memory LRU Cache', () => {
  it('correctly sets, gets, and evicts LRU items on capacity limit', () => {
    const cache = new LRUCache<string>(3, 5000);
    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    cache.set('c', 'gamma');

    expect(cache.get('a')).toBe('alpha');
    expect(cache.get('b')).toBe('beta');

    // Add fourth item, 'c' was accessed least recently
    cache.set('d', 'delta');
    expect(cache.has('c')).toBe(false);
    expect(cache.get('d')).toBe('delta');
    expect(cache.get('a')).toBe('alpha');
  });

  it('expires items past TTL', async () => {
    const cache = new LRUCache<string>(5, 50); // 50ms TTL
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');

    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(cache.get('key')).toBeNull();
  });
});

describe('Airports Database & Bidirectional Code Mapping', () => {
  it('finds airports by IATA code', () => {
    const bos = findAirport('BOS');
    expect(bos).not.toBeNull();
    expect(bos?.icao).toBe('KBOS');
    expect(bos?.city).toBe('Boston');
  });

  it('finds airports by ICAO code', () => {
    const anc = findAirport('PANC');
    expect(anc).not.toBeNull();
    expect(anc?.iata).toBe('ANC');
    expect(anc?.name).toContain('Anchorage');
  });

  it('finds airports by city name / alias', () => {
    const sfo = findAirport('San Francisco');
    expect(sfo).not.toBeNull();
    expect(sfo?.iata).toBe('SFO');

    const sna = findAirport('Santa Ana');
    expect(sna).not.toBeNull();
    expect(sna?.iata).toBe('SNA');
  });
});

describe('Live Aviation API & Orchestration with Fallback Protection', () => {
  it('retrieves airport metrics without crashing and provides valid MPS score', async () => {
    const sfo = await getAirportMetrics('SFO', { forceRefresh: true });
    expect(sfo.iataCode).toBe('SFO');
    expect(sfo.icaoCode).toBe('KSFO');
    expect(sfo.mpsScore).toBeGreaterThan(0);
    expect(sfo.mpsScore).toBeLessThanOrEqual(100);
    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(sfo.confidenceLevel);
    expect(sfo.longHaulStats.longHaulPercentage).toBeGreaterThan(10);
  });

  it('computes accurate long-haul metrics for Anchorage (ANC) with authentic international destinations', async () => {
    const anc = await getAirportMetrics('ANC', { forceRefresh: true });
    expect(anc.iataCode).toBe('ANC');
    expect(anc.longHaulStats.longHaulPercentage).toBeGreaterThanOrEqual(30);
    const sampleDests = anc.longHaulStats.sampleFlights.map((f) => f.destination);
    expect(sampleDests.some((d) => ['ICN', 'NRT', 'TPE', 'HKG', 'FRA', 'PVG'].includes(d))).toBe(true);
    expect(sampleDests.includes('BTV')).toBe(false);
    expect(sampleDests.includes('PVD')).toBe(false);
  });

  it('verifies regional airports (SNA, BDL) have 0% long-haul flights (>3000 mi)', async () => {
    const sna = await getAirportMetrics('SNA', { forceRefresh: true });
    expect(sna.longHaulStats.longHaulPercentage).toBe(0);

    const bdl = await getAirportMetrics('BDL', { forceRefresh: true });
    expect(bdl.longHaulStats.longHaulPercentage).toBe(0);
  });

  it('compares LAX and SNA congestion levels side-by-side', async () => {
    const comparison = await compareAirports(['LAX', 'SNA']);
    expect(comparison.airports.length).toBe(2);
    expect(comparison.comparisonHighlights.highestCongestion).toBeDefined();
    expect(comparison.comparisonHighlights.highestMps).toBeDefined();
  });

  it('fetches and ranks New England regional candidate airports', async () => {
    const result = await getRegionalAirports('New England');
    expect(result.airports.length).toBe(6);
    expect(result.topCandidate).toBeDefined();
    expect(result.topCandidate.mpsScore).toBeGreaterThanOrEqual(result.airports[1].mpsScore);
  });
});
