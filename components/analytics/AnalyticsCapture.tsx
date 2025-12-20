'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation'

type AnalyticsEvent = {
  event_name: string
  occurred_at?: string
  page?: string | null
  href?: string | null
  element_tag?: string | null
  element_text?: string | null
  props?: Record<string, any>
}

function isEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS === '1'
}

function pageKey(pathname: string | null, searchParams: ReadonlyURLSearchParams | URLSearchParams | null): string | null {
  if (!pathname) return null
  const q = searchParams?.toString()
  return q ? `${pathname}?${q}` : pathname
}

function textOf(el: Element): string | null {
  const aria = el.getAttribute('aria-label')
  if (aria && aria.trim()) return aria.trim().slice(0, 200)
  const txt = (el.textContent || '').replace(/\s+/g, ' ').trim()
  if (!txt) return null
  return txt.length > 200 ? txt.slice(0, 200) : txt
}

function isDisabled(el: Element): boolean {
  if (el instanceof HTMLButtonElement) return !!el.disabled
  const ariaDisabled = el.getAttribute('aria-disabled')
  if (ariaDisabled === 'true') return true
  if (el.hasAttribute('disabled')) return true
  return false
}

function hrefOf(el: Element): string | null {
  if (!(el instanceof HTMLAnchorElement)) return null
  const href = el.getAttribute('href')
  if (!href) return null
  return href.length > 800 ? href.slice(0, 800) : href
}

export function AnalyticsCapture() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = useMemo(() => pageKey(pathname, searchParams), [pathname, searchParams])

  const queueRef = useRef<AnalyticsEvent[]>([])
  const flushingRef = useRef(false)

  const flush = useCallback(async (sync?: boolean) => {
    if (!isEnabled()) return
    if (flushingRef.current) return
    if (queueRef.current.length === 0) return

    flushingRef.current = true
    const batch = queueRef.current.splice(0, 100)

    try {
      const body = JSON.stringify({ events: batch })
      // On page unload, try keepalive to avoid being cancelled.
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        ...(sync ? { keepalive: true } : {}),
      })
    } catch {
      // best-effort: drop events if we can't deliver
    } finally {
      flushingRef.current = false
    }
  }, [])

  const enqueue = useCallback(
    (ev: AnalyticsEvent) => {
      queueRef.current.push(ev)
      if (queueRef.current.length >= 25) {
        void flush()
      }
    },
    [flush]
  )

  // Page views
  useEffect(() => {
    if (!isEnabled()) return
    if (!page) return
    enqueue({
      event_name: 'ui.page_view',
      occurred_at: new Date().toISOString(),
      page,
      props: {},
    })
  }, [enqueue, page])

  // Click capture
  useEffect(() => {
    if (!isEnabled()) return

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return
      const el = target.closest('button, a[href]') as Element | null
      if (!el) return

      enqueue({
        event_name: 'ui.click',
        occurred_at: new Date().toISOString(),
        page: pageKey(window.location.pathname, new URLSearchParams(window.location.search)),
        href: hrefOf(el),
        element_tag: el.tagName.toLowerCase(),
        element_text: textOf(el),
        props: {
          disabled: isDisabled(el),
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          button: e.button,
        },
      })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [enqueue])

  // Periodic flush + unload flush
  useEffect(() => {
    if (!isEnabled()) return

    const interval = window.setInterval(() => {
      void flush()
    }, 5000)

    const onUnload = () => {
      void flush(true)
    }

    window.addEventListener('pagehide', onUnload)
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('pagehide', onUnload)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [flush])

  return null
}



