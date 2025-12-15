/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const { chromium } = require('@playwright/test')

function median(values) {
  if (!values.length) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
  return sorted[mid]
}

function percentile(values, p) {
  if (!values.length) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1))
  return sorted[idx]
}

async function getPerfEvents(page) {
  return page.evaluate(() => {
    const store = window.__COMPASSIQ_PERF__
    return store?.events || []
  })
}

async function clearPerfEvents(page) {
  await page.evaluate(() => {
    const store = window.__COMPASSIQ_PERF__
    if (!store) return
    store.events = []
    store.navStart = null
  })
}

async function waitForRenderedEvent(page, destPath, startEpoch, timeoutMs = 30000) {
  await page.waitForFunction(
    ({ destPath, startEpoch }) => {
      const events = window.__COMPASSIQ_PERF__?.events || []
      return events.some(
        (e) =>
          e &&
          e.type === 'nav' &&
          e.phase === 'rendered' &&
          e.path === destPath &&
          typeof e.at === 'number' &&
          e.at >= startEpoch
      )
    },
    { destPath, startEpoch },
    { timeout: timeoutMs }
  )
}

async function getLastNavTimings(page, destPath) {
  const events = await getPerfEvents(page)
  const rendered = [...events]
    .reverse()
    .find((e) => e.type === 'nav' && e.phase === 'rendered' && e.path === destPath)
  const skeleton = [...events]
    .reverse()
    .find((e) => e.type === 'nav' && e.phase === 'skeleton' && e.path === destPath)

  return {
    renderedMs: typeof rendered?.durationMs === 'number' ? rendered.durationMs : null,
    skeletonMs: typeof skeleton?.durationMs === 'number' ? skeleton.durationMs : null,
  }
}

async function runNavScenario(page, scenario) {
  const rendered = []
  const skeleton = []

  for (let i = 0; i < scenario.runs; i += 1) {
    await page.goto(scenario.fromPath, { waitUntil: 'domcontentloaded' })
    if (scenario.fromReadySelector) {
      await page.waitForSelector(scenario.fromReadySelector, { timeout: 30000 })
    }
    await page.waitForFunction(() => window.__COMPASSIQ_PERF_NAV_CAPTURE_READY__ === true, {
      timeout: 30000,
    })

    await clearPerfEvents(page)
    await page.waitForSelector(scenario.clickSelector, { timeout: 30000 })

    const startEpoch = Date.now()
    await page.click(scenario.clickSelector)

    await page.waitForURL(
      (url) => url.pathname + url.search === scenario.destPath,
      { timeout: 30000 }
    )

    if (scenario.destReadySelector) {
      await page.waitForSelector(scenario.destReadySelector, { timeout: 30000 })
    }

    await waitForRenderedEvent(page, scenario.destPath, startEpoch)
    const timings = await getLastNavTimings(page, scenario.destPath)

    if (typeof timings.renderedMs === 'number') rendered.push(timings.renderedMs)
    if (typeof timings.skeletonMs === 'number') skeleton.push(timings.skeletonMs)
  }

  return {
    name: scenario.name,
    fromPath: scenario.fromPath,
    destPath: scenario.destPath,
    runs: scenario.runs,
    rendered,
    skeleton,
    summary: {
      rendered: {
        medianMs: median(rendered),
        p95Ms: percentile(rendered, 0.95),
      },
      skeleton: {
        medianMs: median(skeleton),
        p95Ms: percentile(skeleton, 0.95),
      },
    },
  }
}

async function tryLoginOnce(page, { email, password }) {
  await page.goto('/login', { waitUntil: 'load' })
  // Give React hydration a moment to avoid pre-hydration input races.
  await page.waitForTimeout(300)

  await page.waitForSelector('#email', { timeout: 30000 })
  await page.fill('#email', email)
  await page.fill('#password', password)

  await page.click('button[type="submit"]')

  const outcome = await Promise.race([
    page.waitForURL((url) => url.pathname.startsWith('/app'), { timeout: 20000 }).then(() => 'ok'),
    page.waitForSelector('text=Sign-in failed', { timeout: 20000 }).then(() => 'fail'),
  ])

  if (outcome === 'fail') {
    const detail = await page
      .locator('text=Sign-in failed')
      .locator('xpath=..')
      .locator('p')
      .nth(1)
      .textContent()
    throw new Error(`Login failed: ${detail || 'Unknown error'}`)
  }

  // Best-effort: wait for shell.
  await page.waitForTimeout(800)
}

async function login(page, { email, passwordCandidates }) {
  for (const password of passwordCandidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await tryLoginOnce(page, { email, password })
      await page.waitForFunction(() => window.__COMPASSIQ_PERF_NAV_CAPTURE_READY__ === true, {
        timeout: 30000,
      })
      // Let server actions triggered on initial /app mount settle before we start heavy navigation.
      try {
        await page.waitForSelector('text=Command Center', { timeout: 15000 })
      } catch {
        // ignore
      }
      await page.waitForTimeout(1800)
      return
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(String(err?.message || err))
    }
  }
  throw new Error('Login failed: all password candidates rejected')
}

async function warmUp(page, routes) {
  for (const r of routes) {
    await page.goto(r, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)
  }
}

async function main() {
  const baseURL = process.env.PERF_BASE_URL || 'http://localhost:3005'
  const runs = Number.parseInt(process.env.PERF_RUNS || '10', 10)

  const email =
    process.env.PERF_TEST_EMAIL ||
    process.env.PLAYWRIGHT_TEST_EMAIL ||
    'demo.admin@example.com'

  const passwordCandidates = [
    process.env.PERF_TEST_PASSWORD,
    process.env.PLAYWRIGHT_TEST_PASSWORD,
    'demo-admin-123',
    'DemoAdmin!3005',
  ].filter(Boolean)

  const outDir = path.join(process.cwd(), 'perf')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath =
    process.env.PERF_OUT ||
    path.join(outDir, `perf-run-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 720 },
  })

  // "Hard refresh" equivalent: fresh context with cache disabled.
  await context.setOffline(false)
  await context.addInitScript(() => {
    window.localStorage.setItem('UI_PERF', '1')
    window.localStorage.setItem('UI_AUDIT', '0')
  })

  const page = await context.newPage()

  await login(page, { email, passwordCandidates })

  // Warm routes to avoid first-hit compilation skewing medians.
  await warmUp(page, ['/app', '/app/sales', '/app/ops', '/app/settings/org', '/app/settings/branding'])

  const scenarios = [
    {
      name: '/app → /app/sales (sidebar)',
      fromPath: '/app',
      fromReadySelector: 'text=Command Center',
      clickSelector: 'a[href="/app/sales"]',
      destPath: '/app/sales',
      destReadySelector: 'text=Revenue Engine',
      runs,
    },
    {
      name: '/app → /app/ops (sidebar)',
      fromPath: '/app',
      fromReadySelector: 'text=Command Center',
      clickSelector: 'a[href="/app/ops"]',
      destPath: '/app/ops',
      destReadySelector: 'text=Ops Control Tower',
      runs,
    },
    {
      name: '/app/settings/org → /app/settings/branding (settings nav)',
      fromPath: '/app/settings/org',
      fromReadySelector: 'text=Settings',
      clickSelector: 'a[href="/app/settings/branding"]',
      destPath: '/app/settings/branding',
      destReadySelector: 'text=Branding',
      runs,
    },
    {
      name: 'KPI drilldown: Revenue MTD card',
      fromPath: '/app',
      fromReadySelector: 'text=Command Center',
      clickSelector: 'a[href="/app/finance?filter=revenue"]',
      destPath: '/app/finance?filter=revenue',
      destReadySelector: 'text=Finance',
      runs,
    },
  ]

  const results = {
    meta: {
      baseURL,
      runs,
      at: new Date().toISOString(),
      node: process.version,
    },
    scenarios: [],
  }

  for (const scenario of scenarios) {
    // eslint-disable-next-line no-await-in-loop
    const r = await runNavScenario(page, scenario)
    results.scenarios.push(r)
  }

  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8')

  const lines = []
  lines.push(`Wrote ${outPath}`)
  for (const s of results.scenarios) {
    lines.push(
      `${s.name}: rendered median ${s.summary.rendered.medianMs.toFixed(0)}ms, p95 ${s.summary.rendered.p95Ms.toFixed(
        0
      )}ms`
    )
  }
  console.log(lines.join('\n'))

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
