#!/usr/bin/env tsx
/**
 * Performance measurement in production mode
 * Measures route transitions and returns median/p95
 */

import http from 'http'

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:3005'
const ITERATIONS = 5 // Run each route multiple times for median/p95

const ROUTES = [
  { name: 'Command Center', path: '/app' },
  { name: 'Accounts', path: '/app/crm/accounts' },
  { name: 'Opportunities', path: '/app/crm/opportunities' },
  { name: 'Branding Settings', path: '/app/settings/branding' },
  { name: 'Intake Import', path: '/app/sales/intake' },
]

interface RouteResult {
  route: string
  name: string
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
          name: route,
          statusCode: res.statusCode || 0,
          durationMs,
        })
      })
    })

    req.on('error', (error) => {
      const durationMs = Date.now() - start
      resolve({
        route,
        name: route,
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
        name: route,
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

async function main() {
  console.log(`\n🚀 Performance Measurement`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Iterations per route: ${ITERATIONS}\n`)

  const allResults: { [route: string]: RouteResult[] } = {}

  for (const routeInfo of ROUTES) {
    console.log(`Measuring ${routeInfo.name} (${routeInfo.path})...`)
    const results: RouteResult[] = []
    
    for (let i = 0; i < ITERATIONS; i++) {
      const result = await measureRoute(routeInfo.path)
      results.push(result)
      if (i < ITERATIONS - 1) {
        await new Promise(resolve => setTimeout(resolve, 100)) // Small delay between requests
      }
    }

    allResults[routeInfo.path] = results
    const successful = results.filter(r => r.statusCode >= 200 && r.statusCode < 400 && !r.error)
    const durations = successful.map(r => r.durationMs)
    
    if (durations.length > 0) {
      const med = median(durations)
      const p95Val = p95(durations)
      console.log(`  Median: ${med.toFixed(1)}ms, P95: ${p95Val.toFixed(1)}ms (${successful.length}/${ITERATIONS} successful)`)
    } else {
      console.log(`  ❌ All requests failed`)
    }
  }

  // Aggregate stats
  const allDurations: number[] = []
  for (const routeResults of Object.values(allResults)) {
    const successful = routeResults.filter(r => r.statusCode >= 200 && r.statusCode < 400 && !r.error)
    allDurations.push(...successful.map(r => r.durationMs))
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Aggregate Performance')
  console.log(`${'='.repeat(60)}`)
  
  if (allDurations.length > 0) {
    const med = median(allDurations)
    const p95Val = p95(allDurations)
    console.log(`Median: ${med.toFixed(1)}ms`)
    console.log(`P95: ${p95Val.toFixed(1)}ms`)
    console.log(`Targets: Median < 300ms, P95 < 800ms`)
    
    const medPass = med < 300
    const p95Pass = p95Val < 800
    
    console.log(`\nResults:`)
    console.log(`  Median: ${medPass ? '✅ PASS' : '❌ FAIL'} (${med.toFixed(1)}ms)`)
    console.log(`  P95: ${p95Pass ? '✅ PASS' : '❌ FAIL'} (${p95Val.toFixed(1)}ms)`)
    
    return {
      median: med,
      p95: p95Val,
      medianPass: medPass,
      p95Pass: p95Pass,
      results: allResults,
    }
  } else {
    console.log(`❌ No successful requests`)
    return null
  }
}

if (require.main === module) {
  main()
    .then((result) => {
      if (!result || (!result.medianPass || !result.p95Pass)) {
        process.exit(1)
      }
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error:', error)
      process.exit(1)
    })
}

export { main as measurePerformance }


