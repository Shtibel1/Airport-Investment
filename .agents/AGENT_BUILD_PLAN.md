# Autonomous Agent Build & Execution Plan

## Goal
Build an end-to-end Airport Modernization Intelligence Agent using Next.js (App Router), Vercel AI SDK, Google Gemini (`gemini-2.5-flash`), and Shadcn UI. Strictly connect to live aviation APIs with an In-Memory cache layer—no mock datasets.

## Task Breakdown for Sub-Agents

### 1. Core Mathematical Engine & Testing
- Implement `src/lib/scoring/engine.ts` following `agent/skills/airport-scoring.md`.
- Implement `src/lib/scoring/engine.test.ts` using Vitest/Jest:
  - Test boundary conditions for the MPS formula ($0 \le MPS \le 100$).
  - Test long-haul flight filtering with default (3,000 miles) and configurable thresholds.
  - Test confidence calculation degradation based on flight sample size and cache status.
  - Verify 100% test pass rate before proceeding to UI.

### 2. Live Data Providers & Cache Layer
- Implement `src/lib/cache/lru.ts` using an In-Memory LRU cache (`max: 200`, `ttl: 1 hour`).
- Implement `src/lib/api/aviation.ts` to fetch live airport flight logs and capacity stats following `agent/skills/data-retrieval.md`.
- Implement Haversine distance calculator for flight route distance determination.

### 3. Agent Tools & Route Orchestration
- Build Next.js Route Handler in `src/app/api/chat/route.ts`.
- Connect Gemini (`gemini-2.5-flash`) via Vercel AI SDK `streamText` (`maxSteps: 5`).
- Register AI Tools:
  - `getAirportMetrics`: Fetches live stats with caching.
  - `calculateInvestmentScore`: Runs deterministic scoring engine on fetched live data.
  - `compareAirports`: Compares multiple airports side-by-side.
  - `getRegionalAirports`: Expands regional definitions and ranks live results.

### 4. Interactive UI & Tool State Rendering
- Build main chat interface with `useChat` in `src/app/page.tsx`.
- Implement tool invocation visual states:
  - Tool state `call`: Render an active spinner/loader ("🔍 Querying live FAA/Aviation endpoints...").
  - Tool state `result`: Render deterministic UI widgets for airport scores and comparison tables.
- Render explicit confidence badges and data assumptions panel.

### 5. Verification & Acceptance Testing
- Run automated test suite: `npm test`.
- Verify runtime agent handling of core queries:
  1. "Which airports in New England are strong candidates for terminal expansion?"
  2. "Compare LA and Santa Ana airport congestion levels."
  3. "What is the percentage of long haul flights out of Anchorage airport?"
  4. "What is the unmet flight demand in SFO airport and why?"