# Application Evaluation & Audit Plan

Please evaluate the application at `[URL]` against the original assignment requirements (an AI agent for airport investment analysis with deterministic scoring, clear explanations, and multi-turn conversational support). Perform the following tests and provide a detailed findings report focusing on identified issues:

---

### 1. Basic Sanity & UI Availability
* Open the application and ensure the chat interface loads properly.
* Verify that any interactive cards, example query buttons, or navigation tabs function as expected.

### 2. Assignment Example Scenarios
Execute the four core benchmark queries:
* **New England:** Terminal expansion candidates.
* **LAX vs. SNA:** Head-to-head airport comparison.
* **Anchorage (ANC):** Long-haul flight percentage.
* **SFO:** Unmet demand and capacity bottleneck analysis.

> **Verification Check:** For each response, ensure numerical figures are logical, internally consistent, and align with baseline aviation domain knowledge (e.g., percentages, capacity ratios, and route distances).

### 3. Long-Haul % Verification at Major Hubs
* Explicitly query airports known for extensive intercontinental traffic (e.g., **SFO, LAX, JFK, ORD**).
* Confirm the metric does not return `0%` or anomalous figures caused by narrow live sample windows or execution timing.
* Verify whether a graceful fallback to historical or static baseline data is triggered when live telemetry sample sizes are insufficient.

### 4. Cross-Query Data Contamination
* Run 2–3 consecutive queries across distinct airports.
* Confirm that sample destinations, routes, and operational metrics strictly belong to the queried airport and do not leak from previous conversation turns (e.g., preventing New England regional airports like `BOS`, `BDL`, or `PVD` from appearing under an Anchorage evaluation).

### 5. Real API Integration & Fallback Resilience
* Verify directly within backend source code (beyond browser network inspection) that real external calls to public aviation APIs (e.g., OpenSky, FAA, BTS) execute independently per airport.
* Confirm proper error handling and rate-limit mitigation, ensuring fallback data is clearly labeled and confidence scores are adjusted accordingly (`MEDIUM`/`LOW`).

### 6. Markdown & UI Rendering
* Ensure LLM responses render cleanly with standard Markdown formatting (headers, bold emphasis, structured tables, and dividers).
* Verify that raw syntax artifacts (e.g., `###`, `**`, `|`, `---`) are not exposed as unparsed text to the user.

### 7. Multi-Turn Context & Follow-Up Handling
* Issue a follow-up query referencing a previous output, including a prompt challenging a specific data point.
* Ensure the system maintains full conversational context, responds adaptively, and avoids resetting state.

### 8. Transparency, Assumptions & Deterministic Separation
* Verify that every response explicitly details:
  * Primary data sources.
  * Confidence level (`HIGH` / `MEDIUM` / `LOW`).
  * Core assumptions (e.g., long-haul distance thresholds, weighting factors).
* Ensure the deterministic scoring engine (formulas and numerical score breakdowns) remains clearly delineated from generative AI explanations.

### 9. Technical Model Labeling
* Verify that the AI provider and model name displayed in the UI interface accurately match the actual runtime model configured on the server.

### 10. Deliverables & Architecture Documentation
* Audit the architecture documentation and source repository to confirm explicit coverage of:
  * The deterministic scoring methodology.
  * Key architectural trade-offs.
  * The exact boundaries separating AI orchestration from deterministic computations.



  