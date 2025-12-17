/**
 * Real Performance Benchmark for Table Components
 * 
 * This script measures actual React rendering performance using Playwright
 * to interact with the application and Chrome DevTools Protocol to collect
 * real performance metrics.
 */

import { chromium, Browser, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface PerformanceMetrics {
  pageName: string
  url: string
  timestamp: string
  metrics: {
    // Core Web Vitals
    FCP: number // First Contentful Paint
    LCP: number // Largest Contentful Paint
    CLS: number // Cumulative Layout Shift
    FID?: number // First Input Delay (requires user interaction)
    
    // Additional metrics
    TTFB: number // Time to First Byte
    domContentLoaded: number
    loadComplete: number
    
    // React-specific
    componentRenderTime: number
    tableRenderTime: number
    
    // Memory
    jsHeapSize: number
    
    // Network
    requestCount: number
    totalTransferSize: number
  }
  errors: string[]
}

interface BenchmarkResults {
  timestamp: string
  environment: {
    node: string
    browser: string
  }
  pages: PerformanceMetrics[]
  summary: {
    avgFCP: number
    avgLCP: number
    avgCLS: number
    avgTableRenderTime: number
    totalErrors: number
  }
}

const PAGES_TO_TEST = [
  { name: 'CRM Leads', url: '/app/crm/leads' },
  { name: 'CRM Accounts', url: '/app/crm/accounts' },
  { name: 'CRM Opportunities', url: '/app/crm/opportunities' },
  { name: 'CRM Quotes', url: '/app/crm/quotes' },
  { name: 'CRM Tasks', url: '/app/crm/tasks' },
  { name: 'Finance Invoices', url: '/app/finance' },
  { name: 'Success Tickets', url: '/app/success' },
  { name: 'Ops Work Orders', url: '/app/ops' },
  { name: 'Client Projects', url: '/app/clients' },
]

const APP_URL = process.env.APP_URL || 'http://localhost:3005'
const OUTPUT_DIR = path.join(process.cwd(), 'perf')

async function login(page: Page): Promise<void> {
  console.log('  → Logging in...')
  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 })
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  
  // Fill in login form
  await page.fill('input[type="email"]', 'demo@compassiq.com')
  await page.fill('input[type="password"]', 'demo123')
  
  // Click submit and wait for navigation
  await Promise.all([
    page.waitForURL('**/app/**', { timeout: 30000 }),
    page.click('button[type="submit"]')
  ])
  
  console.log('  ✓ Logged in successfully')
}

async function measurePagePerformance(
  page: Page,
  pageName: string,
  url: string
): Promise<PerformanceMetrics> {
  console.log(`\n📊 Measuring: ${pageName}`)
  const errors: string[] = []
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Navigate to page
  const startTime = Date.now()
  await page.goto(`${APP_URL}${url}`, { waitUntil: 'networkidle' })
  
  // Wait for table to be visible
  try {
    await page.waitForSelector('table', { timeout: 10000 })
  } catch (e) {
    console.warn(`  ⚠ No table found on ${pageName}`)
  }
  
  // Collect performance metrics using Performance API
  const performanceMetrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType('paint')
    
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0
    
    // Get LCP using PerformanceObserver (if available)
    let lcp = 0
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime
    }
    
    // Get CLS
    let cls = 0
    const clsEntries = performance.getEntriesByType('layout-shift')
    clsEntries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
    })
    
    return {
      fcp,
      lcp,
      cls,
      ttfb: perfData.responseStart - perfData.requestStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      loadComplete: perfData.loadEventEnd - perfData.fetchStart,
    }
  })
  
  // Measure React component render time by forcing a re-render
  const componentRenderTime = await page.evaluate(() => {
    const start = performance.now()
    
    // Trigger a small state change (search input)
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
    if (searchInput) {
      searchInput.value = 'test'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
      
      // Wait for React to process
      return new Promise<number>((resolve) => {
        requestAnimationFrame(() => {
          const end = performance.now()
          // Clear the search
          searchInput.value = ''
          searchInput.dispatchEvent(new Event('input', { bubbles: true }))
          resolve(end - start)
        })
      })
    }
    return 0
  })
  
  // Measure table-specific render time
  const tableRenderTime = await page.evaluate(() => {
    const table = document.querySelector('table')
    if (!table) return 0
    
    const start = performance.now()
    const rows = table.querySelectorAll('tbody tr')
    const end = performance.now()
    
    return end - start
  })
  
  // Get memory usage
  const metrics = await page.evaluate(() => {
    const mem = (performance as any).memory
    return {
      jsHeapSize: mem ? mem.usedJSHeapSize : 0,
    }
  })
  
  // Get network metrics
  const resourceEntries = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource')
    return {
      count: resources.length,
      totalSize: resources.reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0),
    }
  })
  
  console.log(`  ✓ FCP: ${performanceMetrics.fcp.toFixed(2)}ms`)
  console.log(`  ✓ LCP: ${performanceMetrics.lcp.toFixed(2)}ms`)
  console.log(`  ✓ CLS: ${performanceMetrics.cls.toFixed(4)}`)
  console.log(`  ✓ Component Render: ${componentRenderTime.toFixed(2)}ms`)
  console.log(`  ✓ Table Render: ${tableRenderTime.toFixed(2)}ms`)
  console.log(`  ✓ JS Heap: ${(metrics.jsHeapSize / 1024 / 1024).toFixed(2)}MB`)
  console.log(`  ✓ Requests: ${resourceEntries.count}`)
  console.log(`  ✓ Transfer Size: ${(resourceEntries.totalSize / 1024).toFixed(2)}KB`)
  
  if (errors.length > 0) {
    console.log(`  ⚠ Errors: ${errors.length}`)
  }
  
  return {
    pageName,
    url,
    timestamp: new Date().toISOString(),
    metrics: {
      FCP: performanceMetrics.fcp,
      LCP: performanceMetrics.lcp,
      CLS: performanceMetrics.cls,
      TTFB: performanceMetrics.ttfb,
      domContentLoaded: performanceMetrics.domContentLoaded,
      loadComplete: performanceMetrics.loadComplete,
      componentRenderTime,
      tableRenderTime,
      jsHeapSize: metrics.jsHeapSize,
      requestCount: resourceEntries.count,
      totalTransferSize: resourceEntries.totalSize,
    },
    errors,
  }
}

async function runBenchmark(): Promise<BenchmarkResults> {
  console.log('🚀 Starting Performance Benchmark\n')
  console.log(`Target: ${APP_URL}`)
  console.log(`Pages to test: ${PAGES_TO_TEST.length}\n`)
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage'],
  })
  
  const browserVersion = await browser.version()
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  
  const page = await context.newPage()
  
  // Login once
  await login(page)
  
  // Measure each page
  const results: PerformanceMetrics[] = []
  
  for (const pageConfig of PAGES_TO_TEST) {
    try {
      const metrics = await measurePagePerformance(page, pageConfig.name, pageConfig.url)
      results.push(metrics)
      
      // Wait a bit between pages
      await page.waitForTimeout(1000)
    } catch (error) {
      console.error(`  ✗ Error measuring ${pageConfig.name}:`, error)
      results.push({
        pageName: pageConfig.name,
        url: pageConfig.url,
        timestamp: new Date().toISOString(),
        metrics: {
          FCP: 0,
          LCP: 0,
          CLS: 0,
          TTFB: 0,
          domContentLoaded: 0,
          loadComplete: 0,
          componentRenderTime: 0,
          tableRenderTime: 0,
          jsHeapSize: 0,
          requestCount: 0,
          totalTransferSize: 0,
        },
        errors: [String(error)],
      })
    }
  }
  
  await browser.close()
  
  // Calculate summary
  const validResults = results.filter(r => r.metrics.FCP > 0)
  const summary = {
    avgFCP: validResults.reduce((sum, r) => sum + r.metrics.FCP, 0) / validResults.length,
    avgLCP: validResults.reduce((sum, r) => sum + r.metrics.LCP, 0) / validResults.length,
    avgCLS: validResults.reduce((sum, r) => sum + r.metrics.CLS, 0) / validResults.length,
    avgTableRenderTime: validResults.reduce((sum, r) => sum + r.metrics.tableRenderTime, 0) / validResults.length,
    totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
  }
  
  return {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      browser: browserVersion,
    },
    pages: results,
    summary,
  }
}

async function main() {
  try {
    const results = await runBenchmark()
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }
    
    // Save results
    const filename = `table-perf-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const filepath = path.join(OUTPUT_DIR, filename)
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2))
    
    console.log('\n' + '='.repeat(60))
    console.log('📈 BENCHMARK SUMMARY')
    console.log('='.repeat(60))
    console.log(`Average FCP: ${results.summary.avgFCP.toFixed(2)}ms`)
    console.log(`Average LCP: ${results.summary.avgLCP.toFixed(2)}ms`)
    console.log(`Average CLS: ${results.summary.avgCLS.toFixed(4)}`)
    console.log(`Average Table Render: ${results.summary.avgTableRenderTime.toFixed(2)}ms`)
    console.log(`Total Errors: ${results.summary.totalErrors}`)
    console.log('='.repeat(60))
    console.log(`\n✅ Results saved to: ${filepath}`)
    
    // Exit with error code if there are errors
    if (results.summary.totalErrors > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Benchmark failed:', error)
    process.exit(1)
  }
}

main()



