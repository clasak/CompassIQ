'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { isPerfClientEnabled, perfNavRendered } from '@/lib/perf'

export function PerfContentMark() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pathKey = useMemo(() => {
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!isPerfClientEnabled()) return
    // Wait until after paint.
    let raf2 = 0
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => perfNavRendered(pathKey))
    })
    return () => {
      window.cancelAnimationFrame(raf1)
      if (raf2) window.cancelAnimationFrame(raf2)
    }
  }, [pathKey])

  return null
}
