# Aviation Intelligence Engine: Architecture & Telemetry Specification

## 1. Executive Summary & Telemetry Pipeline

The **Airport Investment Intelligence Agent** operates a deterministic, two-tiered data and scoring pipeline designed to evaluate airport modernization priority, runway/terminal bottlenecks, and international route profiles.

```mermaid
graph TD
    UserQuery[User Query / Prompt] --> ChatAPI[/api/chat Route Handler]
    ChatAPI --> GeminiAgent[Gemini 2.5 Flash via @google/genai]
    GeminiAgent --> ToolCall{Agent Tool Invocation}
    
    ToolCall -->|Airport Code / Region| AviationAPI[Aviation API Service]
    
    AviationAPI --> CacheCheck{In-Memory LRU Cache Hit?}
    CacheCheck -->|Yes| CachedReturn[Return Cached Telemetry]
    CacheCheck -->|No| OpenSkyQuery[Live OpenSky Network HTTP Query]
    
    OpenSkyQuery -->|200 OK >=15 flights| LiveParser[Parse Live Departures & Haversine Distances]
    OpenSkyQuery -->|429 / 5xx / Timeout| BaselineFallback[BTS T-100 & Form 5010 Scheduled Network]
    
    LiveParser --> ScoreEngine[Deterministic MPS Mathematical Engine]
    BaselineFallback --> ScoreEngine
    
    ScoreEngine --> UIWidget[Deterministic UI Card / Table / Matrix]
    ScoreEngine --> GeminiSynthesis[Gemini Final Executive Synthesis]
    GeminiSynthesis --> UIStream[AI SDK Data Stream -> React Dashboard with ReactMarkdown]
```

---

## 2. Telemetry Ingestion & Fallback Architecture

### A. Live OpenSky Network Integration
* **Endpoint**: `https://opensky-network.org/api/flights/departure?airport={ICAO}&begin={T-4h}&end={T}`
* **Headers**: `User-Agent: AirportInvestmentIntelligenceAgent/2.0`, `Accept: application/json`
* **Timeout**: 4,000ms abort controller with non-blocking error handling.
* **Server-side Execution**: All outbound API calls are executed strictly on the Next.js server runtime (Node.js environment). Browser DevTools will only show the single reactive stream connection to `/api/chat` for security and API key encapsulation.

### B. Fallback Mechanism (Preventing Cross-Query Contamination)
* **Problem Addressed**: Generic global loops previously caused regional airports to bleed into queries for distant hubs (e.g. Burlington appearing as an Anchorage route, or SFO showing 0% long-haul flights).
* **Current Implementation**:
  1. **Authentic Route Registry**: Every airport in [`src/lib/data/airports-db.ts`](file:///c:/Users/nadavs.CITYSHOB/Desktop/Airport-Investment/src/lib/data/airports-db.ts) defines its authentic, published scheduled routes based on Bureau of Transportation Statistics (BTS) T-100 Segment data.
  2. **Global Coordinates Registry**: Contains exact Great-Circle coordinates for top intercontinental hubs across Europe (`LHR`, `CDG`, `FRA`, `AMS`, `MAD`, `FCO`, `ZRH`), Asia/Pacific (`HND`, `NRT`, `ICN`, `HKG`, `TPE`, `SIN`, `SYD`, `AKL`), Middle East (`DXB`, `DOH`, `TLV`), and the Americas (`MEX`, `GRU`, `EZE`, `YYZ`, `YVR`).
  3. **Guaranteed Flight Consistency**:
     * **Anchorage (`ANC`)**: Reflects major transpacific and polar corridors (`ICN`, `NRT`, `TPE`, `HKG`, `FRA`, `SEA`, `ORD`) with realistic $38\%\text{--}44\%$ long-haul flights ($>3,000$ miles).
     * **Los Angeles (`LAX`)**: Transpacific/transatlantic long-haul ratio of $18\%\text{--}22\%$ (`LHR`, `HND`, `NRT`, `ICN`, `SYD`, `CDG`, `FRA`, `TPE`, `SIN`, `DXB`).
     * **San Francisco (`SFO`)**: Long-haul ratio of $16\%\text{--}20\%$ (`LHR`, `CDG`, `FRA`, `NRT`, `HND`, `ICN`, `TPE`, `HKG`, `SIN`, `SYD`, `AMS`).
     * **Regional Airports (`BDL`, `PVD`, `MHT`, `PWM`, `BTV`, `SNA`)**: 0% long-haul flights ($>3,000$ miles), accurately reflecting domestic feeder status.

---

## 3. Markdown Presentation Layer

* Powered by `react-markdown` and `remark-gfm`.
* Formats executive tables, bold highlights, section dividers, code blocks, and blockquotes with tailored Tailwind typography.
