# Skill: Real-Time Aviation Data Retrieval & Cache Layer

## 1. Objectives & Policy
- **Zero Mock Policy:** All airport and flight statistics must be retrieved from live public APIs.
- **Cache-First Strategy:** Check the In-Memory LRU Cache before making outbound network requests to avoid rate limits and minimize latency.

## 2. Target Public APIs
1. **Flight Distance, Routes & Delay Rates:**
   - Provider: Public Aviation APIs (e.g., OpenSky Network REST API, AviationStack, or FAA Open Data / FlightAware Firehose).
   - Endpoints:
     - Outbound flight logs per airport (origin IATA).
     - Flight distance calculations (Great-circle distance derived from origin/destination coordinates if route distance is not directly provided).
2. **Terminal Capacity & Passenger Volume:**
   - Provider: BTS (Bureau of Transportation Statistics) Open Data APIs / FAA Airport Master Records (Form 5010 public endpoints).
   - Metrics: Annual passenger enplanements, terminal gate counts, peak hour slot utilization.

## 3. Query Logic & Coordinate Math
- If an API returns origin and destination coordinates (lat/long) instead of route distance in miles, apply the Haversine formula:
  $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  *(where $r = 3958.8$ miles).*

## 4. Regional Lookups
When a query asks for an aggregate region (e.g., "New England"), the retrieval worker must:
1. Map the region name to active commercial IATA codes (`['BOS', 'BDL', 'PVD', 'MHT', 'PWM', 'BTV']`).
2. Dispatch parallel live fetches for each IATA code through the caching layer.
3. Consolidate and return the structured array for downstream deterministic scoring.