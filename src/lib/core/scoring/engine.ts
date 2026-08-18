import {
  AirportRawMetrics,
  ConfidenceLevel,
  FlightRecord,
  LongHaulStats,
  ModernizationScoreResult,
  ScoreBreakdown,
} from './types';

// Deterministic MPS Weights
export const WEIGHT_CAPACITY_CONGESTION = 0.45;
export const WEIGHT_DEMAND_GROWTH = 0.35;
export const WEIGHT_UNMET_DEMAND_SPILL = 0.20;

export const DEFAULT_LONG_HAUL_THRESHOLD_MILES = 3000;

export const REGIONAL_MAPPINGS: Record<string, string[]> = {
  'new england': ['BOS', 'BDL', 'PVD', 'MHT', 'PWM', 'BTV'],
  'southern california': ['LAX', 'SNA', 'BUR', 'ONT', 'SAN'],
  'socal': ['LAX', 'SNA', 'BUR', 'ONT', 'SAN'],
  'bay area': ['SFO', 'OAK', 'SJC'],
  'san francisco bay area': ['SFO', 'OAK', 'SJC'],
};

/**
 * Normalizes and bounds a number between min and max
 */
export function clamp(val: number, min: number = 0, max: number = 100): number {
  if (isNaN(val) || !isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

/**
 * Computes Capacity Congestion component (0 - 100)
 */
export function calculateCapacityCongestion(
  annualPassengers: number,
  designTerminalCapacity: number,
  flightDelayRatePct: number
): { score: number; rawCapacityUtilization: number } {
  const safeCapacity = designTerminalCapacity > 0 ? designTerminalCapacity : 1;
  const rawCapacityUtilization = annualPassengers / safeCapacity;
  const delayFactor = (flightDelayRatePct / 100) * 0.4;
  const utilizationFactor = rawCapacityUtilization * 0.6;
  const score = clamp((utilizationFactor + delayFactor) * 100, 0, 100);
  return { score: Math.round(score * 10) / 10, rawCapacityUtilization };
}

/**
 * Computes Demand Growth component (0 - 100)
 */
export function calculateDemandGrowth(
  yoyPassengerGrowthPct: number,
  loadFactorPct: number
): number {
  const score = clamp(yoyPassengerGrowthPct * 0.5 + loadFactorPct * 0.5, 0, 100);
  return Math.round(score * 10) / 10;
}

/**
 * Computes Unmet Demand / Spill component (0 - 100)
 */
export function calculateUnmetDemandSpill(
  regionalPopulationGrowthRatio: number,
  gateGrowthRatio: number,
  peakSlotUtilizationPct: number
): { score: number; spillPressureRatio: number } {
  const safeGateGrowth = gateGrowthRatio > 0 ? gateGrowthRatio : 1;
  const spillPressureRatio = regionalPopulationGrowthRatio / safeGateGrowth;
  const score = clamp(spillPressureRatio * peakSlotUtilizationPct, 0, 100);
  return { score: Math.round(score * 10) / 10, spillPressureRatio };
}

/**
 * Computes Long-Haul Flight Statistics from flight samples
 */
export function calculateLongHaulStats(
  flights: FlightRecord[],
  thresholdMiles: number = DEFAULT_LONG_HAUL_THRESHOLD_MILES
): LongHaulStats {
  if (!flights || flights.length === 0) {
    return {
      thresholdMiles,
      totalOutboundFlights: 0,
      longHaulFlightCount: 0,
      longHaulPercentage: 0,
      sampleFlights: [],
    };
  }

  let longHaulCount = 0;
  const sampleFlights = flights.map((f) => {
    const distance = f.distanceMiles || 0;
    const isLongHaul = distance >= thresholdMiles;
    if (isLongHaul) longHaulCount++;
    return {
      destination: f.destIata || f.destIcao || 'Unknown',
      distanceMiles: Math.round(distance),
      isLongHaul,
    };
  });

  const percentage = Math.round((longHaulCount / flights.length) * 1000) / 10;

  return {
    thresholdMiles,
    totalOutboundFlights: flights.length,
    longHaulFlightCount: longHaulCount,
    longHaulPercentage: percentage,
    sampleFlights: sampleFlights.slice(0, 15),
  };
}

/**
 * Deterministic Confidence Scorer based on telemetry freshness & sample size
 */
export function calculateConfidence(
  metrics: AirportRawMetrics,
  flightsSampleCount: number
): { score: number; level: ConfidenceLevel; reasons: string[] } {
  let score = 0.95;
  const reasons: string[] = [];

  if (flightsSampleCount >= 50) {
    reasons.push(`Robust flight telemetry sample (${flightsSampleCount} outbound flights tracked)`);
  } else if (flightsSampleCount >= 20) {
    score -= 0.20;
    reasons.push(`Moderate flight telemetry sample (${flightsSampleCount} flights tracked)`);
  } else {
    score -= 0.40;
    reasons.push(`Limited flight sample size (${flightsSampleCount} flights, below optimal 50+ threshold)`);
  }

  if (metrics.isCached) {
    score = Math.min(score - 0.15, 0.84);
    reasons.push('Served from In-Memory LRU cache within 1-hour TTL window');
  } else {
    reasons.push('Live real-time telemetry from public aviation endpoints');
  }

  if (metrics.dataSource.toLowerCase().includes('fallback') || metrics.dataSource.toLowerCase().includes('interpolated')) {
    score = Math.min(score, 0.75) - 0.15;
    reasons.push('Fallback baseline capacity registry utilized due to upstream rate limits');
  }

  score = Math.max(0.1, Math.min(1.0, Math.round(score * 100) / 100));

  let level: ConfidenceLevel = 'HIGH';
  if (score < 0.60) {
    level = 'LOW';
  } else if (score < 0.85) {
    level = 'MEDIUM';
  }

  return { score, level, reasons };
}

/**
 * Evaluates Airport Modernization Potential Score (MPS)
 */
export function calculateAirportScore(
  metrics: AirportRawMetrics,
  flights: FlightRecord[] = [],
  longHaulThresholdMiles: number = DEFAULT_LONG_HAUL_THRESHOLD_MILES
): ModernizationScoreResult {
  const congestionResult = calculateCapacityCongestion(
    metrics.annualPassengers,
    metrics.designTerminalCapacity,
    metrics.flightDelayRatePct
  );

  const demandGrowthScore = calculateDemandGrowth(
    metrics.yoyPassengerGrowthPct,
    metrics.loadFactorPct
  );

  const unmetDemandResult = calculateUnmetDemandSpill(
    metrics.regionalPopulationGrowthRatio,
    metrics.gateGrowthRatio,
    metrics.peakSlotUtilizationPct
  );

  const rawMps =
    WEIGHT_CAPACITY_CONGESTION * congestionResult.score +
    WEIGHT_DEMAND_GROWTH * demandGrowthScore +
    WEIGHT_UNMET_DEMAND_SPILL * unmetDemandResult.score;

  const mpsScore = Math.round(clamp(rawMps, 0, 100) * 10) / 10;

  const breakdown: ScoreBreakdown = {
    capacityCongestionScore: congestionResult.score,
    demandGrowthScore,
    unmetDemandSpillScore: unmetDemandResult.score,
    rawCapacityUtilization: Math.round(congestionResult.rawCapacityUtilization * 100) / 100,
    spillPressureRatio: Math.round(unmetDemandResult.spillPressureRatio * 100) / 100,
  };

  const sampleCount = flights.length > 0 ? flights.length : metrics.outboundFlightsSampleCount;
  const longHaulStats = calculateLongHaulStats(flights, longHaulThresholdMiles);
  const confidence = calculateConfidence(metrics, sampleCount);

  let recommendationRating: ModernizationScoreResult['recommendationRating'] = 'ADEQUATE_CAPACITY';
  if (mpsScore >= 80) {
    recommendationRating = 'HIGH_PRIORITY_EXPANSION';
  } else if (mpsScore >= 65) {
    recommendationRating = 'MODERATE_EXPANSION_CANDIDATE';
  } else if (mpsScore >= 45) {
    recommendationRating = 'OPTIMIZATION_ONLY';
  }

  const assumptions = [
    `MPS Weights: Capacity Congestion (45%), Demand Growth (35%), Unmet Demand / Spill (20%)`,
    `Long-haul threshold applied: >= ${longHaulThresholdMiles.toLocaleString()} miles`,
    `Design terminal passenger capacity benchmark: ${(metrics.designTerminalCapacity / 1_000_000).toFixed(1)}M pax/year`,
    `Flight delay rate benchmark: ${metrics.flightDelayRatePct}%`,
    `Peak slot utilization: ${metrics.peakSlotUtilizationPct}%`,
  ];

  return {
    iataCode: metrics.iataCode.toUpperCase(),
    icaoCode: metrics.icaoCode.toUpperCase(),
    airportName: metrics.name,
    city: metrics.city,
    region: metrics.region,
    mpsScore,
    breakdown,
    longHaulStats,
    confidenceScore: confidence.score,
    confidenceLevel: confidence.level,
    confidenceReasons: confidence.reasons,
    recommendationRating,
    rawMetrics: metrics,
    assumptions,
    telemetryOrigin: {
      source: metrics.dataSource,
      timestamp: metrics.lastUpdated,
      isCacheHit: metrics.isCached,
    },
  };
}

/**
 * Resolves region string to list of IATA codes
 */
export function resolveRegionIatas(regionQuery: string): string[] | null {
  const normalized = regionQuery.trim().toLowerCase();
  for (const [region, iatas] of Object.entries(REGIONAL_MAPPINGS)) {
    if (normalized.includes(region) || region.includes(normalized)) {
      return iatas;
    }
  }
  return null;
}

/**
 * Evaluates comparative highlights and differential metrics across scored airports
 */
export function analyzeAirportComparison(airports: ModernizationScoreResult[]): {
  comparisonHighlights: {
    highestCongestion: string;
    highestGrowth: string;
    highestUnmetDemand: string;
    highestMps: string;
  };
  differentialNotes: string[];
} {
  if (!airports || airports.length === 0) {
    throw new Error('At least one airport result is required for comparison analysis.');
  }

  let highestCongestion = airports[0];
  let highestGrowth = airports[0];
  let highestUnmetDemand = airports[0];
  let highestMps = airports[0];

  airports.forEach((r) => {
    if (r.breakdown.capacityCongestionScore > highestCongestion.breakdown.capacityCongestionScore) {
      highestCongestion = r;
    }
    if (r.breakdown.demandGrowthScore > highestGrowth.breakdown.demandGrowthScore) {
      highestGrowth = r;
    }
    if (r.breakdown.unmetDemandSpillScore > highestUnmetDemand.breakdown.unmetDemandSpillScore) {
      highestUnmetDemand = r;
    }
    if (r.mpsScore > highestMps.mpsScore) {
      highestMps = r;
    }
  });

  const differentialNotes: string[] = [];
  if (airports.length >= 2) {
    const diff = Math.abs(airports[0].mpsScore - airports[1].mpsScore).toFixed(1);
    const competitor = airports.find((r) => r.iataCode !== highestMps.iataCode)?.iataCode || 'peers';
    differentialNotes.push(
      `${highestMps.iataCode} holds a +${diff} pt higher Modernization Potential Score (MPS) over ${competitor}.`
    );
  }

  return {
    comparisonHighlights: {
      highestCongestion: `${highestCongestion.iataCode} (${highestCongestion.breakdown.capacityCongestionScore}/100)`,
      highestGrowth: `${highestGrowth.iataCode} (${highestGrowth.breakdown.demandGrowthScore}/100)`,
      highestUnmetDemand: `${highestUnmetDemand.iataCode} (${highestUnmetDemand.breakdown.unmetDemandSpillScore}/100)`,
      highestMps: `${highestMps.iataCode} (MPS: ${highestMps.mpsScore}/100)`,
    },
    differentialNotes,
  };
}
