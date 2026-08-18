export interface AirportMetadata {
  iata: string;
  icao: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  gates: number;
  annualPassengers: number;
  designTerminalCapacity: number;
  flightDelayRatePct: number;
  yoyPassengerGrowthPct: number;
  loadFactorPct: number;
  regionalPopulationGrowthRatio: number;
  gateGrowthRatio: number;
  peakSlotUtilizationPct: number;
  baselineOutboundCount: number;
  baselineLongHaulSharePct: number;
  authenticDestinations: string[];
  aliases: string[];
  lastUpdated?: string;
}
