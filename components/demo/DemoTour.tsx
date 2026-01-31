'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/use-role'
import { useBranding } from '@/components/branding/BrandProvider'
import { BrandMark } from '@/components/branding/BrandMark'

export type DemoTourStep = {
  id: string
  title: string
  talkTrack: string
  valueToClient: string
  proof: string
  path: string
  selector: string
  fallbackSelector?: string
}

const STORAGE_ACTIVE = 'DEMO_TOUR_ACTIVE'
const STORAGE_STEP = 'DEMO_TOUR_STEP'

export const DEMO_TOUR_STEPS: DemoTourStep[] = [
  {
    id: 'command-center',
    title: 'Command Center: KPI Overview',
    talkTrack:
      'Start here: this is the Command Center—one page that answers “how are we doing?” across revenue, pipeline, delivery, AR, and churn risk.',
    valueToClient:
      'Exec-ready visibility in seconds; fewer spreadsheets, faster decisions, shared source of truth.',
    proof: 'KPIs are live and drill into the underlying records with one click.',
    path: '/app',
    selector: '[data-kpi-card-container]',
    fallbackSelector: 'h1',
  },
  {
    id: 'sales',
    title: 'Sales: Pipeline Funnel + Drilldown',
    talkTrack:
      'This is the Revenue Engine: pipeline staged as a funnel, plus a drilldown list you can filter and export.',
    valueToClient:
      'Cleaner forecasting and rep accountability: see what’s closing, what’s stuck, and what to do next.',
    proof: 'The pipeline drilldown is a real table you can search and export.',
    path: '/app/sales?filter=pipeline',
    selector: '[data-demo-tour="sales-pipeline-table"]',
    fallbackSelector: '[data-demo-tour="sales-funnel"]',
  },
  {
    id: 'ops',
    title: 'Ops: Work Orders + SLA/Delivery',
    talkTrack:
      'Ops Control Tower: work orders by status, SLA exceptions, and delivery performance.',
    valueToClient:
      'Fewer surprises: surface blockers early, protect delivery dates, and reduce escalations.',
    proof: 'Delivery view filters the table and exports the exact visible values.',
    path: '/app/ops?filter=delivery',
    selector: '[data-demo-tour="ops-work-orders"]',
    fallbackSelector: 'h1',
  },
  {
    id: 'finance',
    title: 'Finance: AR & Invoices + Export',
    talkTrack:
      'Finance: see invoices, AR outstanding, and quickly export the current view for sharing or follow-up.',
    valueToClient:
      'Cash acceleration: spot overdue risk, prioritize collections, and reduce days sales outstanding.',
    proof: 'AR drilldown filters to outstanding balances; Export CSV downloads the current table view.',
    path: '/app/finance?filter=ar',
    selector: '[data-demo-tour="finance-invoices"]',
    fallbackSelector: 'h1',
  },
  {
    id: 'success',
    title: 'Success: Churn Risk + Tickets',
    talkTrack:
      'Customer Success: health scoring, renewals due, and open tickets—so you can intervene before churn happens.',
    valueToClient:
      'Retention protection: identify at-risk accounts early and route work to the right owners.',
    proof: 'Churn filter focuses the account list to the highest-risk renewals.',
    path: '/app/success?filter=churn',
    selector: '[data-demo-tour="success-tickets"]',
    fallbackSelector: '[data-demo-tour="success-accounts"]',
  },
  {
    id: 'data-quality',
    title: 'Data Quality: Completeness & Freshness',
    talkTrack:
      'Data Quality: you can’t run the business on bad data—this page shows completeness and freshness issues in one place.',
    valueToClient:
      'Higher trust in KPIs: fewer “why doesn’t this match?” debates, faster adoption.',
    proof: 'Tables export and can be searched; issues are explainable, not black-box scores.',
    path: '/app/data/quality',
    selector: '[data-demo-tour="data-quality-kpis"]',
    fallbackSelector: 'h1',
  },
  {
    id: 'actions',
    title: 'Actions: Task Center',
    talkTrack:
      'Action Center: turn insights into assignments—tasks are the operational “closing the loop” layer.',
    valueToClient:
      'Execution: clear ownership and follow-through; fewer dropped balls between teams.',
    proof: 'Overdue tasks are surfaced at the top; tables export for quick sharing.',
    path: '/app/actions',
    selector: '[data-demo-tour="actions-tasks"]',
    fallbackSelector: 'h1',
  },
  {
    id: 'settings',
    title: 'Settings: Client Setup (Read-only in Demo)',
    talkTrack:
      'Settings and onboarding: in production this is where you create orgs, invite users, and configure integrations. Demo org is intentionally read-only.',
    valueToClient:
      'Repeatable rollout: a clean setup path for each client instance with consistent baseline metrics.',
    proof: 'The wizard guides the setup flow; write actions are blocked with clear messaging in demo org.',
    path: '/app/settings/setup',
    selector: '[data-demo-tour="settings-setup"]',
    fallbackSelector: 'h1',
  },
]

function waitForSelector(selector: string, timeoutMs: number) {
  const start = Date.now()
  return new Promise<Element>((resolve, reject) => {
    const tick = () => {
      const el = document.querySelector(selector)
      if (el) return resolve(el)
      if (Date.now() - start > timeoutMs) return reject(new Error('not found'))
      window.setTimeout(tick, 80)
    }
    tick()
  })
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function DemoTour() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAdmin, loading } = useRole()
  const { branding } = useBranding()

  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [status, setStatus] = useState<'idle' | 'navigating' | 'ready' | 'missing'>('idle')
  const [missingMessage, setMissingMessage] = useState<string | null>(null)

  const highlightRef = useRef<HTMLDivElement | null>(null)

  const canRun = useMemo(() => {
    const isDev = process.env.NODE_ENV !== 'production'
    return isDev || isAdmin
  }, [isAdmin])

  const current = DEMO_TOUR_STEPS[clamp(stepIndex, 0, DEMO_TOUR_STEPS.length - 1)]
  const pageKey = useMemo(() => {
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (loading) return
    try {
      const storedActive = window.localStorage.getItem(STORAGE_ACTIVE) === '1'
      const storedStep = Number(window.localStorage.getItem(STORAGE_STEP) || '0')
      setActive(storedActive && canRun)
      setStepIndex(Number.isFinite(storedStep) ? clamp(storedStep, 0, DEMO_TOUR_STEPS.length - 1) : 0)
    } catch {
      // ignore
    }
  }, [loading, canRun])

  useEffect(() => {
    const open = () => {
      if (!canRun) {
        toast.error('Demo tour is restricted to OWNER/ADMIN')
        return
      }
      setActive(true)
      try {
        window.localStorage.setItem(STORAGE_ACTIVE, '1')
      } catch {
        // ignore
      }
    }
    window.addEventListener('demo-tour-open', open as any)
    return () => window.removeEventListener('demo-tour-open', open as any)
  }, [canRun])

  useEffect(() => {
    if (!active) return
    try {
      window.localStorage.setItem(STORAGE_STEP, String(stepIndex))
    } catch {
      // ignore
    }
  }, [active, stepIndex])

  useEffect(() => {
    if (!active) return
    if (!current) return

    const navigateToStepPath = () => {
      if (pageKey !== current.path) {
        setStatus('navigating')
        setMissingMessage(null)
        router.push(current.path)
      }
    }

    navigateToStepPath()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, current?.path])

  useEffect(() => {
    if (!active) return
    if (!current) return

    const selector = current.selector
    const fallback = current.fallbackSelector

    let canceled = false
    setMissingMessage(null)
    setStatus('navigating')

    const run = async () => {
      try {
        const el = await waitForSelector(selector, 6000)
        if (canceled) return
        setStatus('ready')
        positionOverlay(el)
      } catch {
        if (canceled) return
        if (fallback) {
          try {
            const el = await waitForSelector(fallback, 2500)
            if (canceled) return
            setStatus('missing')
            setMissingMessage(`Could not find selector: ${selector}. Showing fallback.`)
            positionOverlay(el)
            return
          } catch {
            // ignore
          }
        }
        setStatus('missing')
        setMissingMessage(`Could not find selector: ${selector}.`)
      }
    }

    const positionOverlay = (el: Element) => {
      const rect = (el as HTMLElement).getBoundingClientRect()
      const pad = 8
      const top = Math.max(0, rect.top - pad)
      const left = Math.max(0, rect.left - pad)
      const width = rect.width + pad * 2
      const height = rect.height + pad * 2

      const overlay = highlightRef.current
      if (!overlay) return
      overlay.style.top = `${top}px`
      overlay.style.left = `${left}px`
      overlay.style.width = `${width}px`
      overlay.style.height = `${height}px`

      // Scroll into view if needed
      if (rect.top < 80 || rect.bottom > window.innerHeight - 200) {
        ;(el as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }

    window.setTimeout(run, 150)
    window.addEventListener('resize', run)
    return () => {
      canceled = true
      window.removeEventListener('resize', run)
    }
  }, [active, current, pageKey])

  if (!active) return null
  if (!canRun) return null

  const stepCount = DEMO_TOUR_STEPS.length
  const isFirst = stepIndex <= 0
  const isLast = stepIndex >= stepCount - 1

  const overlayClick = () => {
    toast.info('Demo Tour is active — use Next/Back to continue')
  }

  const exit = () => {
    setActive(false)
    try {
      window.localStorage.setItem(STORAGE_ACTIVE, '0')
    } catch {
      // ignore
    }
  }

  const copyTalkTrack = async () => {
    try {
      await navigator.clipboard.writeText(current.talkTrack)
      toast.success('Talk track copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="fixed inset-0 z-[10000]" data-demo-tour-overlay>
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/55" onClick={overlayClick} />

      {/* Spotlight frame */}
      <div
        ref={highlightRef}
        className="absolute rounded-lg border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none"
      />

      {/* Tooltip card */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[min(720px,calc(100%-24px))]">
        <Card className="border-primary/30 shadow-lg" data-demo-tour-overlay-card>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <BrandMark url={branding.mark_url} size={18} alt={branding.brand_name} />
                  <div className="text-xs text-muted-foreground truncate">{branding.brand_name} Demo Tour</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Step {stepIndex + 1} of {stepCount}
                </div>
                <div className="font-semibold truncate">{current.title}</div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyTalkTrack}>
                  Copy Talk Track
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={exit}>
                  Exit
                </Button>
              </div>
            </div>

            {missingMessage && (
              <div className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {missingMessage}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">Talk Track</div>
                <div className="text-sm">{current.talkTrack}</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">Value To Client</div>
                <div className="text-sm">{current.valueToClient}</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">Proof</div>
                <div className="text-sm">{current.proof}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStepIndex((i) => clamp(i - 1, 0, stepCount - 1))}
                disabled={isFirst}
                title={isFirst ? 'First step' : undefined}
                data-disabled-reason={isFirst ? 'First step' : undefined}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setStepIndex((i) => clamp(i + 1, 0, stepCount - 1))}
                disabled={isLast}
                title={isLast ? 'Last step' : undefined}
                data-disabled-reason={isLast ? 'Last step' : undefined}
              >
                Next
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <select
                  className={cn(
                    'h-9 rounded-md border bg-background px-3 text-sm',
                    status === 'navigating' && 'opacity-70'
                  )}
                  value={stepIndex}
                  onChange={(e) => setStepIndex(clamp(Number(e.target.value), 0, stepCount - 1))}
                >
                  {DEMO_TOUR_STEPS.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      {idx + 1}. {s.title}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      window.localStorage.removeItem(STORAGE_STEP)
                      window.localStorage.removeItem(STORAGE_ACTIVE)
                      window.localStorage.removeItem('presentation-mode')
                    } catch {
                      // ignore
                    }
                    toast.success('Demo Tour state cleared')
                  }}
                >
                  Clear State
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
