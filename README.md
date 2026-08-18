# Airport Investment Intelligence Agent — Architecture & Design Document

## 1. System Overview & Core Architecture
The system is built as a single, cohesive Full-Stack application using Next.js (App Router), TypeScript, and the Vercel AI SDK, powered by Google Gemini (`gemini-2.5-flash`). It uses a strict separation between stochastic reasoning (LLM) and deterministic evaluation (Pure TypeScript Math).

### Architecture Pipeline
1. **Presentation Layer (Next.js + Tailwind UI):** Chat interface with streaming support. Directly binds to tool execution states: renders animated indicators during tool calls and deterministic widgets (`MPSScoreCard`, `AirportComparisonTable`, `RegionalRankingWidget`) on tool completion.
2. **Orchestrator Layer (Route Handler / Vercel AI SDK):** Manages conversation context, intent extraction, and automated ReAct tool loops (`maxSteps: 5`).
3. **Deterministic Scoring Engine (`src/lib/scoring/engine.ts`):** Pure mathematical functions calculating Modernization Potential Scores ($MPS$), Haversine route distances, and data confidence ratings.
4. **Data & Caching Layer (`src/lib/cache/lru.ts` & `src/lib/data/airports-db.ts`):** In-memory LRU Cache (TTL: 1 hour, capacity: 200) wrapping live aviation endpoints (OpenSky Network) with graceful fallback to FAA baseline registries.

---

## 2. Scoring Methodology (Modernization Potential Score - MPS)
To eliminate LLM hallucinations on financial/capacity decisions, airport modernization opportunities are scored via a deterministic weighted formula ($0–100$):

$$MPS = 0.45 \times \text{CapacityCongestion} + 0.35 \times \text{DemandGrowth} + 0.20 \times \text{UnmetDemandSpill}$$

### Sub-Metric Breakdown
* **Capacity Congestion (45%):** $\min(100, ((\text{AnnualPax} / \text{DesignCapacity}) \times 0.6 + (\text{FlightDelayRate\%} / 100) \times 0.4) \times 100)$. Measures immediate infrastructure strain and operational bottlenecks.
* **Demand Growth (35%):** $\min(100, (\text{YoYGrowth\%} \times 0.5 + \text{LoadFactor\%} \times 0.5))$. Validates sustained regional market demand to justify capital expenditure (ROI).
* **Unmet Demand / Spill (20%):** $\min(100, (\text{RegionalPopGrowth} / \text{GateGrowth}) \times \text{PeakSlotUtil\%})$. Captures constrained airports turning away flights due to gate and slot shortages.

### Long-Haul Distance Classifier
Flight routes are computed using the Great-Circle Haversine distance formula ($r = 3,958.8\text{ miles}$). Flights are dynamically filtered using a configurable threshold (default: $\ge 3,000\text{ miles}$).

---

## 3. Assumptions, Uncertainty & Scoping
Every analysis produced by the agent automatically generates an explicit **Confidence Level & Data Scope** breakdown:
* **High Confidence ($\ge 0.85$):** Full live API flight telemetry with a sample size $\ge 50$ outbound flights and verified capacity baselines.
* **Medium Confidence ($0.60–0.84$):** Retrieved data served from the In-Memory Cache or degraded API payloads with slight interpolation.
* **Low Confidence ($< 0.60$):** Network timeout / rate-limit encountered; fallback to base FAA static metrics.

---

## 4. Key Architectural Tradeoffs
* **Modular Monolith vs. Microservices:** Keeping the scoring engine and live fetchers within Next.js API route workers eliminated HTTP network hops, serialization overhead, and deployment complexity while maintaining pure unit testability.
* **In-Memory LRU Cache vs. External Redis:** Prioritized zero external infrastructure dependencies and ultra-low latency for evaluation, while effectively shielding against public API rate limits (429s).
* **Generative UI (Tool Results) vs. Freeform Markdown:** Rendering deterministic React components directly from structured tool results guarantees visual fidelity, zero UI breakage, and reliable data formatting.

---

## 5. Role of AI vs. Deterministic Code
* **AI (LLM):** Intent classification, parameter extraction (mapping city names to IATA/ICAO codes), coordinating tool execution sequence, narrative contextualization, and conversational follow-ups.
* **Deterministic Code:** API fetching, caching, coordinate math (Haversine), KPI scoring ($MPS$), ranking, filtering, and confidence score calculation.