export interface AirportRawMetrics {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state: string;
  region: string;
  latitude: number;
  longitude: number;
  annualPassengers: number;
  designTerminalCapacity: number;
  flightDelayRatePct: number;
  yoyPassengerGrowthPct: number;
  loadFactorPct: number;
  regionalPopulationGrowthRatio: number;
  gateGrowthRatio: number;
  peakSlotUtilizationPct: number;
  outboundFlightsSampleCount: number;
  isCached: boolean;
  dataSource: string;
  lastUpdated: string;
}

export interface ScoreBreakdown {
  capacityCongestionScore: number;
  demandGrowthScore: number;
  unmetDemandSpillScore: number;
  rawCapacityUtilization: number;
  spillPressureRatio: number;
}

export interface FlightRecord {
  flightNumber?: string;
  callsign?: string;
  originIata: string;
  originIcao: string;
  destIata?: string;
  destIcao?: string;
  distanceMiles?: number;
  estDepartureTime?: number;
  estArrivalTime?: number;
}

export interface LongHaulStats {
  thresholdMiles: number;
  totalOutboundFlights: number;
  longHaulFlightCount: number;
  longHaulPercentage: number;
  sampleFlights: Array<{
    destination: string;
    distanceMiles: number;
    isLongHaul: boolean;
  }>;
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ModernizationScoreResult {
  iataCode: string;
  icaoCode: string;
  airportName: string;
  city: string;
  region: string;
  mpsScore: number;
  breakdown: ScoreBreakdown;
  longHaulStats: LongHaulStats;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  confidenceReasons: string[];
  recommendationRating:
    | 'HIGH_PRIORITY_EXPANSION'
    | 'MODERATE_EXPANSION_CANDIDATE'
    | 'OPTIMIZATION_ONLY'
    | 'ADEQUATE_CAPACITY';
  rawMetrics: AirportRawMetrics;
  assumptions: string[];
  telemetryOrigin: {
    source: string;
    timestamp: string;
    isCacheHit: boolean;
  };
}

export interface RegionalRankingResult {
  region: string;
  airports: ModernizationScoreResult[];
  topCandidate: ModernizationScoreResult;
  averageMps: number;
  analysisSummary: string;
}

export interface AirportComparisonResult {
  airports: ModernizationScoreResult[];
  comparisonHighlights: {
    highestCongestion: string;
    highestGrowth: string;
    highestUnmetDemand: string;
    highestMps: string;
  };
  differentialNotes: string[];
}
