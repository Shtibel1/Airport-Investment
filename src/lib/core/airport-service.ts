import { airportMetricsCache } from './cache/lru';
import { findAirport } from '../data/airports-db';
import { ensureRegistryFresh } from './registry-service';
import { fetchLiveDepartures } from '../integrations/aviation-client';
import {
  calculateAirportScore,
  resolveRegionIatas,
  analyzeAirportComparison,
  DEFAULT_LONG_HAUL_THRESHOLD_MILES,
} from './scoring/engine';
import {
  AirportRawMetrics,
  ModernizationScoreResult,
  RegionalRankingResult,
  AirportComparisonResult,
} from './scoring/types';

/**
 * Fetches airport metrics, checks LRU cache, retrieves live telemetry, and runs the deterministic scoring engine.
 */
export async function getAirportMetrics(
  iataOrIcao: string,
  options: { forceRefresh?: boolean; longHaulThreshold?: number } = {}
): Promise<ModernizationScoreResult> {
  // Ensure registry is loaded and fresh from daily snapshot
  await ensureRegistryFresh(options.forceRefresh);

  const airport = findAirport(iataOrIcao);
  if (!airport) {
    throw new Error(
      `Airport not found for code or query "${iataOrIcao}". Please provide a valid IATA or ICAO code.`
    );
  }

  const cacheKey = `metrics_${airport.iata}`;
  if (!options.forceRefresh) {
    const cached = airportMetricsCache.get(cacheKey);
    if (cached) {
      console.log(`[AirportService] Metrics Cache HIT for ${airport.iata} (MPS: ${cached.mpsScore})`);
      return {
        ...cached,
        telemetryOrigin: {
          ...cached.telemetryOrigin,
          isCacheHit: true,
        },
      };
    }
  }

  console.log(`[AirportService] Computing fresh metrics for ${airport.iata} (${airport.name})...`);
  const flights = await fetchLiveDepartures(airport.icao);
  const isLiveTelemetry = flights.length >= 25 && flights.some((f) => f.flightNumber !== undefined);

  const rawMetrics: AirportRawMetrics = {
    iataCode: airport.iata,
    icaoCode: airport.icao,
    name: airport.name,
    city: airport.city,
    state: airport.state || '',
    region: airport.region || '',
    latitude: airport.latitude,
    longitude: airport.longitude,
    annualPassengers: airport.annualPassengers,
    designTerminalCapacity: airport.designTerminalCapacity,
    flightDelayRatePct: airport.flightDelayRatePct,
    yoyPassengerGrowthPct: airport.yoyPassengerGrowthPct,
    loadFactorPct: airport.loadFactorPct,
    regionalPopulationGrowthRatio: airport.regionalPopulationGrowthRatio,
    gateGrowthRatio: airport.gateGrowthRatio,
    peakSlotUtilizationPct: airport.peakSlotUtilizationPct,
    outboundFlightsSampleCount: flights.length,
    isCached: false,
    dataSource: isLiveTelemetry
      ? 'Live OpenSky Telemetry & FAA Form 5010'
      : 'FAA Master Records Form 5010 & BTS T-100 Scheduled Database',
    lastUpdated: new Date().toISOString(),
  };

  const threshold = options.longHaulThreshold || DEFAULT_LONG_HAUL_THRESHOLD_MILES;
  const scoreResult = calculateAirportScore(rawMetrics, flights, threshold);

  console.log(
    `[AirportService] Scored ${airport.iata}: MPS=${scoreResult.mpsScore} (Long-Haul: ${scoreResult.longHaulStats.longHaulPercentage}% on ${scoreResult.longHaulStats.totalOutboundFlights} flights, Confidence: ${scoreResult.confidenceLevel})`
  );

  // Store in LRU cache
  airportMetricsCache.set(cacheKey, scoreResult);

  return scoreResult;
}

/**
 * Evaluates and compares multiple airports side-by-side
 */
export async function compareAirports(
  iataCodes: string[],
  options: { forceRefresh?: boolean; longHaulThreshold?: number } = {}
): Promise<AirportComparisonResult> {
  const results = await Promise.all(
    iataCodes.map(async (code) => {
      try {
        return await getAirportMetrics(code, options);
      } catch {
        return null;
      }
    })
  );

  const validResults = results.filter((r): r is ModernizationScoreResult => r !== null);
  if (validResults.length === 0) {
    throw new Error('No valid airports found for the provided codes.');
  }

  const { comparisonHighlights, differentialNotes } = analyzeAirportComparison(validResults);

  return {
    airports: validResults,
    comparisonHighlights,
    differentialNotes,
  };
}

/**
 * Resolves a region and ranks candidate airports by MPS
 */
export async function getRegionalAirports(
  regionQuery: string,
  options: { forceRefresh?: boolean; longHaulThreshold?: number } = {}
): Promise<RegionalRankingResult> {
  const iatas = resolveRegionIatas(regionQuery);
  const targetIatas = iatas || ['BOS', 'BDL', 'PVD', 'MHT', 'PWM', 'BTV'];

  const results = await Promise.all(
    targetIatas.map((code) => getAirportMetrics(code, options))
  );

  // Rank descending by MPS score
  results.sort((a, b) => b.mpsScore - a.mpsScore);

  const topCandidate = results[0];
  const avgMps =
    Math.round((results.reduce((sum, r) => sum + r.mpsScore, 0) / results.length) * 10) / 10;

  const analysisSummary = `${topCandidate.airportName} (${topCandidate.iataCode}) ranks as the #1 modernization candidate in ${regionQuery} with an MPS of ${topCandidate.mpsScore}/100, driven by ${topCandidate.breakdown.capacityCongestionScore}/100 capacity congestion and ${topCandidate.breakdown.unmetDemandSpillScore}/100 regional spill pressure.`;

  return {
    region: regionQuery,
    airports: results,
    topCandidate,
    averageMps: avgMps,
    analysisSummary,
  };
}
