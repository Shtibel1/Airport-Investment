# Airport Investment Intelligence Agent — Architecture & Reference Guide

An enterprise-grade AI copilot and deterministic evaluation platform designed for private equity sponsors, sovereign wealth funds, and infrastructure modernization analysts evaluating commercial airport expansion ROI, terminal capacity bottlenecks, and flight route telemetry.

Powered by **Google Gemini (`@google/genai`)**, **Next.js 15 (App Router)**, **TypeScript (Strict Mode)**, **Tailwind CSS**, and the **Vercel AI SDK DataStream Protocol**.

---

## 1. System Overview & Core Architecture

The platform separates stochastic natural language reasoning (LLM) from deterministic mathematical computation (Pure TypeScript Engine):

```
┌────────────────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (Next.js 15 UI)                       │
│  - Real-time streaming chat feed with voice dictation & speech readback│
│  - Generative UI Widgets: MPSScoreCard, ComparisonTable, Rankings     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP POST (AI SDK DataStream Protocol)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                 AGENT ORCHESTRATOR & STREAM ADAPTER                    │
│  - Thin API controller (`src/app/api/chat/route.ts`)                   │
│  - Multi-turn conversation state & maxSteps = 5 tool loop              │
│  - Protocol encoder (`0:`, `9:`, `a:`, `d:`, `3:`)                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Tool Execution
┌──────────────────────────────────▼─────────────────────────────────────┐
│             DETERMINISTIC MATH & DOMAIN SCORING ENGINE                 │
│  - Modernization Potential Score (MPS 0–100, zero division-by-zero)    │
│  - Great-Circle Haversine calculations (≥3,000 miles long-haul filter) │
│  - Confidence scoring (HIGH ≥0.85, MEDIUM 0.60–0.84, LOW <0.60)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Data Fetch & Revalidation
┌──────────────────────────────────▼─────────────────────────────────────┐
│                DATA, CACHING & ROLLING SNAPSHOT LAYER                  │
│  - In-Memory LRU Cache with TTL (1 hour window)                        │
│  - Live OpenSky Network REST API + BTS T-100 & FAA Form 5010 baselines │
│  - Persistent JSON Snapshot + Cron Revalidation (`/api/cron/sync-...`) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
Airport-Investment/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts              # Agent chat streaming endpoint
│   │   │   └── cron/
│   │   │       └── sync-registry/
│   │   │           └── route.ts          # Daily rolling snapshot revalidation cron
│   │   ├── globals.css                   # Tailwind styles & animations
│   │   ├── layout.tsx                    # Root application layout
│   │   └── page.tsx                      # Main dashboard page
│   ├── components/
│   │   ├── chat-input.tsx                # Input bar with voice dictation support
│   │   ├── chat-message.tsx              # Markdown renderer + Generative UI widgets
│   │   ├── header.tsx                    # Dashboard header with live status badges
│   │   ├── sample-prompts.tsx            # Benchmark scenario starter cards
│   │   └── widgets/
│   │       ├── comparison-table.tsx      # Multi-airport comparative matrix
│   │       ├── confidence-badge.tsx      # Telemetry confidence & provenance badge
│   │       ├── mps-score-card.tsx        # Modernization Potential Score card
│   │       ├── regional-ranking.tsx      # Regional leaderboard ranking widget
│   │       └── tool-spinner.tsx          # Animated tool execution status indicator
│   ├── hooks/
│   │   └── use-voice.ts                  # SpeechRecognition & SpeechSynthesis hook
│   └── lib/
│       ├── agent/
│       │   ├── config.ts                 # Centralized configuration & env variables
│       │   ├── index.ts                  # Agent module exports
│       │   ├── orchestrator.ts           # Core AgentOrchestrator loop
│       │   ├── stream-adapter.ts         # Vercel AI SDK DataStream encoder
│       │   ├── tools/                    # Typed modular tool definitions & Zod schemas
│       │   │   ├── compare-airports.ts
│       │   │   ├── get-airport-metrics.ts
│       │   │   ├── get-regional-airports.ts
│       │   │   └── types.ts
│       │   └── types.ts                  # Agent message & stream event types
│       ├── core/
│       │   ├── airport-service.ts        # Business logic & telemetry coordinator
│       │   ├── cache/
│       │   │   └── lru.ts                # In-memory LRU cache with TTL
│       │   ├── registry-service.ts       # Snapshot validator & disk persistence
│       │   └── scoring/
│       │       ├── engine.ts             # Deterministic MPS mathematical engine
│       │       ├── haversine.ts          # Great-circle distance calculations
│       │       └── types.ts              # Scoring, confidence & breakdown types
│       ├── data/
│       │   ├── airports-db.ts            # Memory registry & bidirectional lookup
│       │   ├── airports-registry.json    # Persistent JSON fallback database
│       │   ├── global-destinations.ts    # Global destination airport coordinates
│       │   └── types.ts                  # Airport metadata schemas
│       └── integrations/
│           └── aviation-client.ts        # OpenSky live caller + BTS T-100 fallback
├── .agents/
│   ├── AGENTS.md                         # Agent rules & system instructions
│   ├── SYSTEM_PROMPT.md                  # Authoritative runtime system prompt
│   └── skills/                           # Domain knowledge base
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Mathematical Scoring Engine (Modernization Potential Score - MPS)

To eliminate LLM hallucinations on capacity and investment decisions, modernization opportunities are computed through a deterministic weighted model bounded strictly between $0$ and $100$:

$$MPS = 0.45 \times \text{CapacityCongestion} + 0.35 \times \text{DemandGrowth} + 0.20 \times \text{UnmetDemandSpill}$$

### Component Formulas

1. **Capacity Congestion (45% Weight):**
   $$\text{CapacityCongestion} = \text{clamp}\left(\left[\left(\frac{\text{AnnualPassengers}}{\max(\text{DesignCapacity}, 1)}\right) \times 0.6 + \left(\frac{\text{DelayRate\%}}{100}\right) \times 0.4\right] \times 100, 0, 100\right)$$
   *Measures terminal infrastructure overload and operational flight delay severity.*

2. **Demand Growth (35% Weight):**
   $$\text{DemandGrowth} = \text{clamp}\left(\text{YoYPassengerGrowth\%} \times 0.5 + \text{LoadFactor\%} \times 0.5, 0, 100\right)$$
   *Validates passenger traffic momentum and aircraft seat utilization.*

3. **Unmet Demand / Spill (20% Weight):**
   $$\text{SpillPressureRatio} = \frac{\text{RegionalPopulationGrowthRatio}}{\max(\text{GateGrowthRatio}, 1)}$$
   $$\text{UnmetDemandSpill} = \text{clamp}\left(\text{SpillPressureRatio} \times \text{PeakSlotUtilization\%}, 0, 100\right)$$
   *Captures unmet regional demand and flights spilled away due to gate constraints.*

### Great-Circle Haversine Distance Formula

Flight route distances are computed across WGS84 coordinates ($r = 3,958.8\text{ statute miles}$):

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

* **Long-Haul Filter:** Defaults to $\ge 3,000\text{ miles}$. Anchorage (ANC) accurately identifies intercontinental routes to Asia/Europe ($\ge 30\%$), while regional candidates (SNA, BDL) return $0\%$.

---

## 4. Confidence & Scoping Standards

Every calculation outputs an explicit confidence rating and data provenance:

| Confidence Level | Numeric Range | Criteria |
| :--- | :--- | :--- |
| **HIGH** | $\ge 0.85$ | Live API telemetry with $\ge 50$ outbound flights tracked and FAA Form 5010 verified capacity baselines. |
| **MEDIUM** | $0.60 - 0.84$ | Served from In-Memory LRU Cache (1h TTL) or sample size $20 - 49$ flights. |
| **LOW** | $< 0.60$ | Upstream API timeout or rate-limit encountered; fallback baseline registry utilized. |

---

## 5. Environment Variables Configuration

Create a `.env.local` file in the project root:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | **Yes** | — | Google Gemini API key (via `@google/genai`). |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Gemini model name used by `AgentOrchestrator`. |
| `OPENSKY_DEPARTURES_API_URL` | No | `https://opensky-network.org/api/flights/departure` | Live OpenSky Network departures endpoint. |

---

## 6. API Endpoints

### `POST /api/chat`
Streaming conversational interface utilizing the Vercel AI SDK DataStream protocol (`0:`, `9:`, `a:`, `d:`, `3:`).

### `GET / POST /api/cron/sync-registry`
Revalidates the active in-memory airport registry snapshot and synchronizes to `src/lib/data/airports-registry.json`.
* Query parameter: `?force=true` to force full revalidation.

---

## 7. Core Benchmark Verification Queries

| Scenario | Sample Prompt | Expected Agent Tool |
| :--- | :--- | :--- |
| **Regional Ranking** | *"Which airports in New England are strong candidates for terminal expansion?"* | `getRegionalAirports(region: "New England")` |
| **Head-to-Head Comparison** | *"Compare LA and Santa Ana airport congestion levels."* | `compareAirports(airportCodes: ["LAX", "SNA"])` |
| **Long-Haul Radar** | *"What is the percentage of long haul flights out of Anchorage airport?"* | `getAirportMetrics(airportCode: "ANC", longHaulThreshold: 3000)` |
| **Bottleneck & Spill** | *"What is the unmet flight demand in SFO airport and why?"* | `getAirportMetrics(airportCode: "SFO")` |

---

## 8. Verification & Test Suite

Run the full TypeScript verification and test suites:

```bash
# Typecheck entire codebase (Strict Mode)
npx tsc --noEmit

# Run all Vitest unit and integration suites
npm run test
```

### Verified Test Suites:
* `src/lib/core/scoring/engine.test.ts` (19 tests) — Mathematical scoring, boundary clamps, zero division, Haversine, confidence degradation.
* `src/lib/agent/tools/tools.test.ts` (7 tests) — Zod schema validation, tool definitions, execution.
* `src/lib/agent/orchestrator.test.ts` (6 tests) — Protocol formatting, multi-turn history, stream adapter.
* `src/lib/data/registry-sync.test.ts` (5 tests) — Persistent snapshot validation, cold-start loading, cron revalidation.
* `src/lib/data/live-proof.test.ts` (5 tests) — End-to-end integration and telemetry proof.