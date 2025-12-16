# Performance Report (Baseline)

Generated: 2025-12-15

## Method
- Runner: `node scripts/perf-runner.js` (headless Chromium, authenticated session)
- Runs: 10 per scenario
- Measurement: client-side nav timing from click → `PerfContentMark` (“rendered”)
- Raw data: `perf/perf-run-2025-12-15T05-47-23-968Z.json`

## Targets
- Median < 300ms
- P95 < 800ms

## Results (rendered)
| Scenario | Median (ms) | P95 (ms) | PASS? |
| --- | ---: | ---: | --- |
| `/app → /app/sales` (sidebar) | 111 | 248 | PASS |
| `/app → /app/ops` (sidebar) | 114 | 131 | PASS |
| `/app/settings/org → /app/settings/branding` (settings nav) | 1570 | 1973 | FAIL |
| KPI drilldown: `/app → /app/finance?filter=revenue` | 121 | 979 | FAIL |

## Notes
- The baseline failures correlated with repeated request-time Supabase auth/org lookups and non-parallel data fetches, which blocked route transitions instead of rendering a shell/skeleton immediately.
