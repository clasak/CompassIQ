/**
 * Simplified Performance Benchmark
 * 
 * Measures page load times without authentication
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const APP_URL = process.env.APP_URL || 'http://localhost:3005'
const OUTPUT_DIR = path.join(process.cwd(), 'perf')

const PAGES_TO_TEST = [
  { name: 'Login Page', url: '/login' },
  { name: 'Home', url: '/' },
]

interface PageMetrics {
  pageName: string
  url: string
  timestamp: string
  loadTime: number
  domContentLoaded: number
  networkIdle: number
  resourceCount: number
  transferSize: number
  jsHeapSize: number
  errors: string[]
}

async function measurePage(url: string, pageName: string): Promise<PageMetrics> {
  console.log(`\n📊 Measuring: ${pageName} (${url})`)
  
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()
  
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  const startTime = Date.now()
  
  try {
    await page.goto(`${APP_URL}${url}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    const loadTime = Date.now() - startTime
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resources = performance.getEntriesByType('resource')
      const mem = (performance as any).memory
      
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        resourceCount: resources.length,
        transferSize: resources.reduce((sum: number, r: any) => sum + (r.transferSize || 0), 0),
        jsHeapSize: mem ? mem.usedJSHeapSize : 0,
      }
    })
    
    console.log(`  ✓ Load Time: ${loadTime}ms`)
    console.log(`  ✓ DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`)
    console.log(`  ✓ Resources: ${metrics.resourceCount}`)
    console.log(`  ✓ Transfer Size: ${(metrics.transferSize / 1024).toFixed(2)}KB`)
    console.log(`  ✓ JS Heap: ${(metrics.jsHeapSize / 1024 / 1024).toFixed(2)}MB`)
    
    if (errors.length > 0) {
      console.log(`  ⚠ Errors: ${errors.length}`)
      errors.forEach(err => console.log(`    - ${err.substring(0, 100)}`))
    }
    
    await browser.close()
    
    return {
      pageName,
      url,
      timestamp: new Date().toISOString(),
      loadTime,
      domContentLoaded: metrics.domContentLoaded,
      networkIdle: loadTime,
      resourceCount: metrics.resourceCount,
      transferSize: metrics.transferSize,
      jsHeapSize: metrics.jsHeapSize,
      errors,
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error}`)
    await browser.close()
    
    return {
      pageName,
      url,
      timestamp: new Date().toISOString(),
      loadTime: 0,
      domContentLoaded: 0,
      networkIdle: 0,
      resourceCount: 0,
      transferSize: 0,
      jsHeapSize: 0,
      errors: [String(error)],
    }
  }
}

async function main() {
  console.log('🚀 Starting Simple Performance Benchmark\n')
  console.log(`Target: ${APP_URL}`)
  console.log(`Pages to test: ${PAGES_TO_TEST.length}\n`)
  
  const results: PageMetrics[] = []
  
  for (const pageConfig of PAGES_TO_TEST) {
    const metrics = await measurePage(pageConfig.url, pageConfig.name)
    results.push(metrics)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  
  // Save results
  const filename = `simple-perf-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const filepath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify({
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      appUrl: APP_URL,
    },
    pages: results,
  }, null, 2))
  
  console.log('\n' + '='.repeat(60))
  console.log('📈 BENCHMARK SUMMARY')
  console.log('='.repeat(60))
  
  const validResults = results.filter(r => r.loadTime > 0)
  if (validResults.length > 0) {
    const avgLoad = validResults.reduce((sum, r) => sum + r.loadTime, 0) / validResults.length
    const avgDom = validResults.reduce((sum, r) => sum + r.domContentLoaded, 0) / validResults.length
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    
    console.log(`Average Load Time: ${avgLoad.toFixed(2)}ms`)
    console.log(`Average DOM Content Loaded: ${avgDom.toFixed(2)}ms`)
    console.log(`Total Errors: ${totalErrors}`)
  } else {
    console.log('No successful measurements')
  }
  
  console.log('='.repeat(60))
  console.log(`\n✅ Results saved to: ${filepath}`)
}

main().catch(console.error)



