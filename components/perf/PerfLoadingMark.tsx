'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { isPerfClientEnabled, perfNavSkeleton } from '@/lib/perf'

export function PerfLoadingMark() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pathKey = useMemo(() => {
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!isPerfClientEnabled()) return
    perfNavSkeleton(pathKey)
  }, [pathKey])

  return null
}

