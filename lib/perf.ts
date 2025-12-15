export type PerfNavPhase = 'start' | 'skeleton' | 'rendered'

export type PerfNavEvent = {
  type: 'nav'
  phase: PerfNavPhase
  path: string
  durationMs?: number
  at: number
}

type PerfNavStart = {
  path: string
  startedAt: number
}

type PerfStore = {
  events: PerfNavEvent[]
  navStart: PerfNavStart | null
}

const STORE_KEY = '__COMPASSIQ_PERF__'

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function epochMs(): number {
  return Date.now()
}

function safePathFromHref(href: string): string | null {
  if (!href) return null
  if (href.startsWith('#')) return null
  try {
    const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (typeof window !== 'undefined' && url.origin !== window.location.origin) return null
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}

export function isPerfClientEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const url = new URL(window.location.href)
    const paramEnabled = url.searchParams.get('perf') === '1'
    const storageEnabled = window.localStorage.getItem('UI_PERF') === '1'
    if (process.env.NODE_ENV === 'production') return paramEnabled || storageEnabled
    return paramEnabled || storageEnabled
  } catch {
    return false
  }
}

export function isPerfServerEnabled(): boolean {
  return process.env.PERF_LOG === '1'
}

function getStore(): PerfStore | null {
  if (typeof window === 'undefined') return null
  const w = window as any
  if (!w[STORE_KEY]) {
    w[STORE_KEY] = { events: [], navStart: null } satisfies PerfStore
  }
  return w[STORE_KEY] as PerfStore
}

function emit() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('compassiq:perf'))
}

export function perfClearEvents() {
  const store = getStore()
  if (!store) return
  store.events = []
  store.navStart = null
  emit()
}

export function perfGetEvents(): PerfNavEvent[] {
  const store = getStore()
  if (!store) return []
  return store.events.slice()
}

export function perfNavStartFromHref(href: string) {
  if (!isPerfClientEnabled()) return
  const path = safePathFromHref(href)
  if (!path) return
  perfNavStart(path)
}

export function perfNavStart(path: string) {
  if (!isPerfClientEnabled()) return
  const store = getStore()
  if (!store) return
  store.navStart = { path, startedAt: nowMs() }
  store.events.push({ type: 'nav', phase: 'start', path, at: epochMs() })
  emit()
}

export function perfNavSkeleton(path: string) {
  if (!isPerfClientEnabled()) return
  const store = getStore()
  if (!store?.navStart) return
  if (store.navStart.path !== path) return
  const durationMs = nowMs() - store.navStart.startedAt
  store.events.push({ type: 'nav', phase: 'skeleton', path, durationMs, at: epochMs() })
  emit()
}

export function perfNavRendered(path: string) {
  if (!isPerfClientEnabled()) return
  const store = getStore()
  if (!store?.navStart) return
  if (store.navStart.path !== path) return
  const durationMs = nowMs() - store.navStart.startedAt
  store.events.push({ type: 'nav', phase: 'rendered', path, durationMs, at: epochMs() })
  store.navStart = null
  emit()
}

export type PerfSummaryRow = {
  path: string
  count: number
  medianMs: number
  p95Ms: number
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
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95) - 1)
  return sorted[Math.max(0, idx)]
}

export function perfSummarizeRendered(events: PerfNavEvent[]): PerfSummaryRow[] {
  const rendered = events.filter((e) => e.type === 'nav' && e.phase === 'rendered' && typeof e.durationMs === 'number')
  const byPath = new Map<string, number[]>()
  for (const ev of rendered) {
    const list = byPath.get(ev.path) || []
    list.push(ev.durationMs as number)
    byPath.set(ev.path, list)
  }
  return Array.from(byPath.entries())
    .map(([path, durations]) => ({
      path,
      count: durations.length,
      medianMs: median(durations),
      p95Ms: p95(durations),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export async function serverPerf<T>(name: string, fn: () => Promise<T>): Promise<T> {
  if (!isPerfServerEnabled()) return fn()
  const start = nowMs()
  try {
    const result = await fn()
    const durationMs = nowMs() - start
    record(name, durationMs)
    console.log(`[perf] ${name} ${durationMs.toFixed(1)}ms`)
    return result
  } catch (error) {
    const durationMs = nowMs() - start
    record(name, durationMs, { error: true })
    console.log(`[perf] ${name} ${durationMs.toFixed(1)}ms [ERROR]`)
    throw error
  }
}

/**
 * Track Supabase query with table name and row count
 */
export async function trackSupabaseQuery<T>(
  name: string,
  table: string,
  fn: () => Promise<{ data: T[] | null; error: any }>
): Promise<{ data: T[] | null; error: any }> {
  if (!isPerfServerEnabled()) return fn()
  const start = nowMs()
  try {
    const result = await fn()
    const durationMs = nowMs() - start
    const rowCount = result.data?.length || 0
    record(name, durationMs, { table, rowCount })
    console.log(`[perf] ${name} (${table}) ${durationMs.toFixed(1)}ms [${rowCount} rows]`)
    return result
  } catch (error) {
    const durationMs = nowMs() - start
    record(name, durationMs, { table, error: true })
    console.log(`[perf] ${name} (${table}) ${durationMs.toFixed(1)}ms [ERROR]`)
    throw error
  }
}

// Enhanced performance tracking
export type PerfEvent = {
  name: string
  durationMs: number
  timestamp: number
  meta?: Record<string, any>
}

type PerfRecord = {
  events: PerfEvent[]
  marks: Map<string, number>
}

let perfRecord: PerfRecord = { events: [], marks: new Map() }

/**
 * Mark a point in time (client-side only, uses Performance API)
 */
export function mark(name: string): void {
  if (typeof window === 'undefined') return
  if (!isPerfClientEnabled()) return
  try {
    performance.mark(name)
    perfRecord.marks.set(name, performance.now())
  } catch {
    // Ignore if Performance API not available
  }
}

/**
 * Measure duration between two marks
 */
export function measure(name: string, startMark: string, endMark: string): number | null {
  if (typeof window === 'undefined') return null
  if (!isPerfClientEnabled()) return null
  try {
    const start = perfRecord.marks.get(startMark)
    const end = perfRecord.marks.get(endMark)
    if (start === undefined || end === undefined) return null
    const durationMs = end - start
    performance.measure(name, startMark, endMark)
    record(name, durationMs)
    return durationMs
  } catch {
    return null
  }
}

/**
 * Record a performance event
 */
export function record(name: string, durationMs: number, meta?: Record<string, any>): void {
  if (!isPerfClientEnabled() && !isPerfServerEnabled()) return
  perfRecord.events.push({
    name,
    durationMs,
    timestamp: Date.now(),
    meta,
  })
}

/**
 * Flush performance data to JSON file (server-side only)
 */
export async function flushJson(path: string): Promise<void> {
  if (typeof window !== 'undefined') return
  if (!isPerfServerEnabled()) return
  try {
    const fs = await import('fs/promises')
    await fs.writeFile(path, JSON.stringify(perfRecord.events, null, 2))
    perfRecord.events = []
  } catch (error) {
    console.error('[perf] Failed to flush JSON:', error)
  }
}

/**
 * Flush performance data to markdown report
 */
export async function flushMarkdown(path: string): Promise<void> {
  if (typeof window !== 'undefined') {
    // Client-side: write to localStorage and console
    if (!isPerfClientEnabled()) return
    const summary = generateMarkdownSummary()
    try {
      localStorage.setItem('COMPASS_PERF_REPORT', summary)
      console.log('[perf] Report saved to localStorage.COMPASS_PERF_REPORT')
    } catch {
      // Ignore localStorage errors
    }
    return
  }

  // Server-side: write to file
  if (!isPerfServerEnabled()) return
  try {
    const fs = await import('fs/promises')
    const summary = generateMarkdownSummary()
    await fs.writeFile(path, summary)
    perfRecord.events = []
  } catch (error) {
    console.error('[perf] Failed to flush markdown:', error)
  }
}

function generateMarkdownSummary(): string {
  const events = perfRecord.events
  if (events.length === 0) {
    return '# Performance Report\n\nNo events recorded.\n'
  }

  // Group by name
  const byName = new Map<string, number[]>()
  for (const event of events) {
    const list = byName.get(event.name) || []
    list.push(event.durationMs)
    byName.set(event.name, list)
  }

  // Calculate stats
  const rows = Array.from(byName.entries())
    .map(([name, durations]) => {
      const sorted = durations.slice().sort((a, b) => a - b)
      const count = sorted.length
      const min = sorted[0]
      const max = sorted[sorted.length - 1]
      const sum = sorted.reduce((a, b) => a + b, 0)
      const avg = sum / count
      const med = median(sorted)
      const p95 = p95Value(sorted)
      return { name, count, min, max, avg, med, p95, total: sum }
    })
    .sort((a, b) => b.total - a.total) // Sort by total time

  let md = '# Performance Report\n\n'
  md += `Generated: ${new Date().toISOString()}\n`
  md += `Total Events: ${events.length}\n\n`
  md += '## Summary by Operation\n\n'
  md += '| Operation | Count | Min (ms) | Max (ms) | Avg (ms) | Median (ms) | P95 (ms) | Total (ms) |\n'
  md += '|-----------|-------|----------|----------|----------|-------------|----------|------------|\n'
  for (const row of rows) {
    md += `| ${row.name} | ${row.count} | ${row.min.toFixed(1)} | ${row.max.toFixed(1)} | ${row.avg.toFixed(1)} | ${row.med.toFixed(1)} | ${row.p95.toFixed(1)} | ${row.total.toFixed(1)} |\n`
  }

  return md
}

function p95Value(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
  return sorted[idx]
}

/**
 * Get all recorded events (for client-side access)
 */
export function getPerfEvents(): PerfEvent[] {
  return perfRecord.events.slice()
}

/**
 * Clear all recorded events
 */
export function clearPerfEvents(): void {
  perfRecord.events = []
  perfRecord.marks.clear()
}

