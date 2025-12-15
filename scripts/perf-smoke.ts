#!/usr/bin/env tsx
/**
 * Performance smoke test - lightweight route timing without Playwright
 */

import http from 'http'

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:3005'
const ROUTES = [
  '/app',
  '/app/sales',
  '/app/ops',
  '/app/finance',
  '/app/settings/branding',
]

interface RouteResult {
  route: string
  statusCode: number
  durationMs: number
  error?: string
}

async function measureRoute(route: string): Promise<RouteResult> {
  const start = Date.now()
  return new Promise((resolve) => {
    const url = `${BASE_URL}${route}`
    const req = http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        const durationMs = Date.now() - start
        resolve({
          route,
          statusCode: res.statusCode || 0,
          durationMs,
        })
      })
    })

    req.on('error', (error) => {
      const durationMs = Date.now() - start
      resolve({
        route,
        statusCode: 0,
        durationMs,
        error: error.message,
      })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      const durationMs = Date.now() - start
      resolve({
        route,
        statusCode: 0,
        durationMs,
        error: 'Timeout',
      })
    })
  })
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
  return sorted[mid]
}

function p95(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
  return sorted[idx]
}

async function runSmokeTest() {
  console.log(`\n🚀 Performance Smoke Test`)
  console.log(`Base URL: ${BASE_URL}\n`)

  const results: RouteResult[] = []

  for (const route of ROUTES) {
    console.log(`Testing ${route}...`)
    const result = await measureRoute(route)
    results.push(result)
    if (result.error) {
      console.log(`  ❌ ${result.statusCode} ${result.durationMs}ms - ${result.error}`)
    } else if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log(`  ✅ ${result.statusCode} ${result.durationMs}ms`)
    } else {
      console.log(`  ⚠️  ${result.statusCode} ${result.durationMs}ms`)
    }
  }

  // Summary
  const successful = results.filter((r) => r.statusCode >= 200 && r.statusCode < 300 && !r.error)
  const durations = successful.map((r) => r.durationMs)

  console.log(`\n📊 Summary`)
  console.log(`Successful: ${successful.length}/${ROUTES.length}`)
  if (durations.length > 0) {
    const med = median(durations)
    const p95Val = p95(durations)
    console.log(`Median: ${med.toFixed(1)}ms`)
    console.log(`P95: ${p95Val.toFixed(1)}ms`)

    // PASS/FAIL
    const medPass = med < 300
    const p95Pass = p95Val < 800
    console.log(`\n🎯 Results:`)
    console.log(`  Median < 300ms: ${medPass ? '✅ PASS' : '❌ FAIL'} (${med.toFixed(1)}ms)`)
    console.log(`  P95 < 800ms: ${p95Pass ? '✅ PASS' : '❌ FAIL'} (${p95Val.toFixed(1)}ms)`)
    console.log(`\nOverall: ${medPass && p95Pass ? '✅ PASS' : '❌ FAIL'}`)
  } else {
    console.log(`\n❌ No successful requests`)
  }

  process.exit(successful.length === ROUTES.length ? 0 : 1)
}

runSmokeTest().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})

