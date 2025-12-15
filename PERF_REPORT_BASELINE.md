# Performance Report (Baseline)

Generated: 2025-12-15

## Method
- Server: `next dev` at `http://localhost:3005`
- Runner: `node scripts/perf-runner.js` (headless Chromium, fresh browser context)
- Measurement: client-side nav timing from click → `PerfContentMark` (“rendered”), plus `app/app/loading.tsx` (“skeleton”) when present
- Runs: 10 per scenario (after a warm-up pass)
- Raw data: `perf/perf-run-2025-12-15T05-38-07-927Z.json`

## Targets
- Median < 300ms
- P95 < 800ms

## Results (rendered)
| Scenario | Median (ms) | P95 (ms) | PASS? |
| --- | ---: | ---: | --- |
| `/app → /app/sales` (sidebar) | 377 | 1465 | FAIL |
| `/app → /app/ops` (sidebar) | 202 | 898 | FAIL (p95) |
| `/app/settings/org → /app/settings/branding` (settings nav) | 1341 | 2535 | FAIL |
| KPI drilldown: `/app → /app/finance?filter=revenue` | 155 | 664 | PASS |

## Results (skeleton)
| Scenario | Median (ms) | P95 (ms) |
| --- | ---: | ---: |
| `/app → /app/sales` (sidebar) | 368 | 1462 |
| `/app → /app/ops` (sidebar) | 188 | 891 |
| `/app/settings/org → /app/settings/branding` (settings nav) | 1332 | 2514 |
| KPI drilldown: `/app → /app/finance?filter=revenue` | 146 | 655 |

