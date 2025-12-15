'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type AuditClickResult = {
  urlChanged: boolean
  toastShown: boolean
  overlayOpened: boolean
}

type AuditEvent = {
  at: number
  page: string
  tag: string
  text: string
  ariaLabel: string | null
  href: string | null
  disabled: boolean
  disabledReason?: string | null
  hasOnClick: boolean | null
  result?: AuditClickResult
}

type AuditSummary = {
  totalControls: number
  actionableControls: number
  disabledWithReasonControls: number
  suspiciousControls: number
}

function getElementLabel(el: Element): { text: string; ariaLabel: string | null } {
  const ariaLabel = el.getAttribute('aria-label')
  const rawText = (el.textContent || '').replace(/\s+/g, ' ').trim()
  const text = rawText.length > 120 ? `${rawText.slice(0, 117)}...` : rawText
  return { text, ariaLabel }
}

function isProbablyVisible(el: Element): boolean {
  const anyEl = el as any
  if (typeof anyEl.checkVisibility === 'function') {
    return anyEl.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
  }
  const rect = (el as HTMLElement).getBoundingClientRect?.()
  if (!rect) return true
  if (rect.width === 0 || rect.height === 0) return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
  return true
}

function getHref(el: Element): string | null {
  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute('href')
    if (!href) return null
    return href
  }
  return null
}

function isDisabled(el: Element): boolean {
  if (el instanceof HTMLButtonElement) return el.disabled
  const ariaDisabled = el.getAttribute('aria-disabled')
  if (ariaDisabled === 'true') return true
  if (el.hasAttribute('disabled')) return true
  return false
}

function disabledReason(el: Element): string | null {
  return (
    el.getAttribute('data-disabled-reason') ||
    el.getAttribute('title') ||
    el.getAttribute('aria-description') ||
    null
  )
}

function hasKnownOnClick(el: Element): boolean | null {
  const flag = el.getAttribute('data-audit-has-onclick')
  if (flag === 'true') return true
  if (flag === 'false') return false
  return null
}

function isSuspiciousControl(el: Element): boolean {
  if (isDisabled(el)) return false
  if (el instanceof HTMLAnchorElement && getHref(el)) return false
  if (el instanceof HTMLButtonElement) return false
  return true
}

function getOverlayCount(): number {
  return (
    document.querySelectorAll('[role="dialog"]').length +
    document.querySelectorAll('[role="menu"]').length +
    document.querySelectorAll('[role="listbox"]').length +
    document.querySelectorAll('[data-state="open"]').length
  )
}

export function UiClickAudit() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [enabled, setEnabled] = useState(false)
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [summary, setSummary] = useState<AuditSummary>({
    totalControls: 0,
    actionableControls: 0,
    disabledWithReasonControls: 0,
    suspiciousControls: 0,
  })
  const [suspiciousSnapshot, setSuspiciousSnapshot] = useState<AuditEvent[]>([])

  const toastCountRef = useRef(0)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  const pageKey = useMemo(() => {
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    const auditParam = searchParams?.get('audit')
    const paramEnabled = auditParam === '1'
    const storageEnabled =
      typeof window !== 'undefined' && window.localStorage.getItem('UI_AUDIT') === '1'

    const toggled = paramEnabled || storageEnabled
    if (!toggled) {
      setEnabled(false)
      return
    }

    const allowInProd = paramEnabled // explicit opt-in only
    const allowInDev = process.env.NODE_ENV !== 'production'
    setEnabled(allowInDev || allowInProd)
  }, [searchParams])

  useEffect(() => {
    if (!enabled) {
      delete document.documentElement.dataset.uiAudit
      return
    }
    document.documentElement.dataset.uiAudit = '1'
    return () => {
      delete document.documentElement.dataset.uiAudit
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    mutationObserverRef.current?.disconnect()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue
          const hasToast =
            node.hasAttribute('data-sonner-toast') || node.querySelector?.('[data-sonner-toast]')
          if (hasToast) {
            toastCountRef.current += 1
          }
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    mutationObserverRef.current = observer

    return () => observer.disconnect()
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const selector = 'button, a[href], [role="button"]'
    const controls = Array.from(document.querySelectorAll(selector))
      .filter((el) => isProbablyVisible(el))
      .map((el) => {
        const { text, ariaLabel } = getElementLabel(el)
        const disabled = isDisabled(el)
        return {
          at: Date.now(),
          page: pageKey,
          tag: el.tagName.toLowerCase(),
          text,
          ariaLabel,
          href: getHref(el),
          disabled,
          disabledReason: disabled ? disabledReason(el) : null,
          hasOnClick: hasKnownOnClick(el),
        } satisfies AuditEvent
      })

    const totalControls = controls.length
    const actionableControls = controls.filter((c) => !c.disabled && (c.href || c.tag === 'button')).length
    const disabledWithReasonControls = controls.filter((c) => c.disabled && !!c.disabledReason).length

    const suspiciousControls = Array.from(document.querySelectorAll(selector))
      .filter((el) => isProbablyVisible(el))
      .filter((el) => isSuspiciousControl(el)).length

    const nextSummary: AuditSummary = {
      totalControls,
      actionableControls,
      disabledWithReasonControls,
      suspiciousControls,
    }

    setSummary(nextSummary)
    ;(window as any).__UI_AUDIT_SUMMARY__ = nextSummary
    ;(window as any).__UI_AUDIT_PAGE__ = pageKey

    setSuspiciousSnapshot(
      Array.from(document.querySelectorAll(selector))
        .filter((el) => isProbablyVisible(el))
        .filter((el) => isSuspiciousControl(el))
        .slice(0, 30)
        .map((el) => {
          const { text, ariaLabel } = getElementLabel(el)
          return {
            at: Date.now(),
            page: pageKey,
            tag: el.tagName.toLowerCase(),
            text,
            ariaLabel,
            href: getHref(el),
            disabled: isDisabled(el),
            disabledReason: disabledReason(el),
            hasOnClick: hasKnownOnClick(el),
          } satisfies AuditEvent
        })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pageKey])

  useEffect(() => {
    if (!enabled) return

    const clickListener = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const el = target.closest('button, a[href], [role="button"]')
      if (!el) return
      if (!isProbablyVisible(el)) return

      const { text, ariaLabel } = getElementLabel(el)
      const href = getHref(el)
      const disabled = isDisabled(el)
      const hasOnClick = hasKnownOnClick(el)
      const beforeUrl = window.location.href
      const beforeToastCount = toastCountRef.current
      const beforeOverlayCount = getOverlayCount()

      const event: AuditEvent = {
        at: Date.now(),
        page: pageKey,
        tag: el.tagName.toLowerCase(),
        text,
        ariaLabel,
        href,
        disabled,
        hasOnClick,
      }

      setEvents((prev) => {
        const next = [...prev, event].slice(-500)
        ;(window as any).__UI_AUDIT_EVENTS__ = next
        return next
      })

      window.setTimeout(() => {
        const afterUrl = window.location.href
        const afterToastCount = toastCountRef.current
        const afterOverlayCount = getOverlayCount()

        const result: AuditClickResult = {
          urlChanged: afterUrl !== beforeUrl,
          toastShown: afterToastCount > beforeToastCount,
          overlayOpened: afterOverlayCount > beforeOverlayCount,
        }

        setEvents((prev) => {
          const idx = prev.findIndex((ev) => ev === event)
          if (idx === -1) return prev
          const copy = prev.slice()
          copy[idx] = { ...copy[idx], result }
          ;(window as any).__UI_AUDIT_EVENTS__ = copy
          return copy
        })
      }, 650)
    }

    document.addEventListener('click', clickListener, true)
    return () => document.removeEventListener('click', clickListener, true)
  }, [enabled, pageKey])

  if (!enabled) return null

  return (
    <div className="fixed bottom-3 right-3 z-[9999] w-[360px]">
      <Card className="border-primary/30 shadow-lg">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">UI Click Audit</div>
            <div className="text-xs text-muted-foreground">{pageKey}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded border px-2 py-1">
              <span>Total</span>
              <span className="font-mono">{summary.totalControls}</span>
            </div>
            <div className="flex items-center justify-between rounded border px-2 py-1">
              <span>Actionable</span>
              <span className="font-mono">{summary.actionableControls}</span>
            </div>
            <div className="flex items-center justify-between rounded border px-2 py-1">
              <span>Disabled+Reason</span>
              <span className="font-mono">{summary.disabledWithReasonControls}</span>
            </div>
            <div
              className={cn(
                'flex items-center justify-between rounded border px-2 py-1',
                summary.suspiciousControls > 0 && 'border-destructive text-destructive'
              )}
            >
              <span>No-op?</span>
              <span className="font-mono">{summary.suspiciousControls}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const payload = (window as any).__UI_AUDIT_EVENTS__ || events
                console.log(JSON.stringify(payload, null, 2))
              }}
            >
              Log JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEvents([])
                ;(window as any).__UI_AUDIT_EVENTS__ = []
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                window.localStorage.setItem('UI_AUDIT', '0')
                const url = new URL(window.location.href)
                url.searchParams.delete('audit')
                window.location.assign(url.toString())
              }}
              className="ml-auto"
            >
              Disable
            </Button>
          </div>

          {suspiciousSnapshot.length > 0 && (
            <div className="rounded border p-2 bg-muted/40">
              <div className="text-xs font-medium mb-1 text-destructive">Suspicious controls (sample)</div>
              <div className="space-y-1 max-h-28 overflow-auto text-xs">
                {suspiciousSnapshot.map((s, idx) => (
                  <div key={`${s.at}-${idx}`} className="font-mono text-[11px]">
                    {s.tag} {s.text || s.ariaLabel || '(no label)'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
