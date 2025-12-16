# Performance Report (After)

Generated: 2025-12-15

## Method
- Server: `next build` + `next start` at `http://localhost:3005`
- Runner: `PERF_MODE=warm PERF_WARMUP=0 node scripts/perf-runner.js` (headless Chromium, single authenticated session)
- Measurement: client-side nav timing from click → `PerfContentMark` (“rendered”)
- Runs: 10 per scenario
- Raw data: `perf/perf-run-2025-12-15T07-07-56-388Z.json`

## Targets
- Median < 300ms
- P95 < 800ms

## Results (rendered)
| Scenario | Median (ms) | P95 (ms) | PASS? |
| --- | ---: | ---: | --- |
| `/app → /app/sales` (sidebar) | 24 | 613 | PASS |
| `/app → /app/ops` (sidebar) | 23 | 581 | PASS |
| `/app/settings/org → /app/settings/branding` (settings nav) | 24 | 678 | PASS |
| KPI drilldown: `/app → /app/finance?filter=revenue` | 24 | 105 | PASS |

