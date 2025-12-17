'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { mark, measure, record } from '@/lib/perf'
import { perfNavSkeleton, perfNavRendered } from '@/lib/perf'

export function PageTiming() {
  const pathname = usePathname()

  useEffect(() => {
    // Mark when page starts rendering
    mark(`nav:start:${pathname}`)
    
    // Mark skeleton (shell visible)
    requestAnimationFrame(() => {
      mark(`nav:skeleton:${pathname}`)
      perfNavSkeleton(pathname)
      measure(`nav:click-to-skeleton:${pathname}`, `nav:start:${pathname}`, `nav:skeleton:${pathname}`)
    })

    // Mark when page is fully rendered
    setTimeout(() => {
      mark(`nav:rendered:${pathname}`)
      perfNavRendered(pathname)
      measure(`nav:click-to-render:${pathname}`, `nav:start:${pathname}`, `nav:rendered:${pathname}`)
    }, 0)
  }, [pathname])

  return null
}




