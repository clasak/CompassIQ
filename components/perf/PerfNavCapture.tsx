'use client'

import { useEffect } from 'react'
import { isPerfClientEnabled, perfNavStartFromHref } from '@/lib/perf'

function shouldIgnoreClick(e: MouseEvent): boolean {
  if (e.defaultPrevented) return true
  if (e.button !== 0) return true
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return true
  return false
}

export function PerfNavCapture() {
  useEffect(() => {
    if (!isPerfClientEnabled()) return

    const onClick = (e: MouseEvent) => {
      if (shouldIgnoreClick(e)) return
      const target = e.target as Element | null
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return
      perfNavStartFromHref(href)
    }

    document.addEventListener('click', onClick, true)
    ;(window as any).__COMPASSIQ_PERF_NAV_CAPTURE_READY__ = true
    return () => {
      document.removeEventListener('click', onClick, true)
      delete (window as any).__COMPASSIQ_PERF_NAV_CAPTURE_READY__
    }
  }, [])

  return null
}
