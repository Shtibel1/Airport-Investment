# Skill: Airport Modernization Potential Scoring (MPS)

## 1. Metric Formula
The overall score (0-100) evaluates how urgently and profitably an airport can be expanded.

MPS = (w1 * CapacityCongestion) + (w2 * DemandGrowth) + (w3 * UnmetDemandSpill)
Weights: w1 = 0.45, w2 = 0.35, w3 = 0.20

### Components:
- **Capacity Congestion (0-100):**
  Min(100, ((AnnualPassengers / DesignTerminalCapacity) * 0.6 + (FlightDelayRatePct / 100) * 0.4) * 100)
- **Demand Growth (0-100):**
  Min(100, (YoYPassengerGrowthPct * 0.5 + LoadFactorPct * 0.5))
- **Unmet Demand / Spill (0-100):**
  Min(100, (RegionalPopulationGrowthRatio / GateGrowthRatio) * PeakSlotUtilizationPct)

## 2. Flight Distance Classification
- **Long-Haul Threshold:** Configurable parameter with a default of **3,000 miles**.
- Calculation: `(Flights with distance >= threshold / Total outbound flights) * 100`.

## 3. Regional Mappings
When a region is referenced without specific codes:
- **New England:** `['BOS', 'BDL', 'PVD', 'MHT', 'PWM', 'BTV']`
- **Southern California:** `['LAX', 'SNA', 'BUR', 'ONT', 'SAN']`
- **Bay Area:** `['SFO', 'OAK', 'SJC']`