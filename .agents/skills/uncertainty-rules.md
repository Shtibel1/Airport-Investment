# Skill: Communicating Scope, Assumptions & Uncertainty

## 1. Deterministic Confidence Scoring
Every retrieval and scoring cycle must output a `confidenceLevel` ('HIGH' | 'MEDIUM' | 'LOW') and a numeric score ($0.0 - 1.0$):
- **HIGH ($\ge 0.85$):** Live API responded with full telemetry (sample size $\ge 50$ outbound flights, complete capacity and delay metrics).
- **MEDIUM ($0.60 - 0.84$):** Retrieved data served from In-Memory Cache, or minor telemetry fields were interpolated from recent 24-hour averages.
- **LOW ($< 0.60$):** High API latency or incomplete payload (e.g., sample size $< 20$ outbound flights).

## 2. Output Formatting Rule
The Agent must append a structured **Data Scope & Confidence** summary to every analysis containing:
- **Confidence Rating:** Explicit badge (`HIGH` / `MEDIUM` / `LOW`) and numeric score.
- **Configured Thresholds:** Long-haul distance cutoff (default: 3,000 miles unless overridden).
- **Telemetry Origin:** Explicit timestamp and source identifier (Live API vs Cache hit).