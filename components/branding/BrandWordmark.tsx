'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function BrandWordmark({
  brandName,
  logoLightUrl,
  logoDarkUrl,
  height = 22,
  className,
}: {
  brandName: string
  logoLightUrl?: string | null
  logoDarkUrl?: string | null
  height?: number
  className?: string
}) {
  const hasAny = Boolean(logoLightUrl || logoDarkUrl)
  if (!hasAny) {
    return <span className={cn('font-semibold tracking-tight', className)}>{brandName}</span>
  }

  const imgClass = cn('max-w-[180px] object-contain', className)
  return (
    <span className="inline-flex items-center">
      {logoLightUrl && (
        <img
          src={logoLightUrl}
          alt={brandName}
          className={cn(imgClass, 'block dark:hidden')}
          style={{ height }}
        />
      )}
      {logoDarkUrl && (
        <img
          src={logoDarkUrl}
          alt={brandName}
          className={cn(imgClass, 'hidden dark:block')}
          style={{ height }}
        />
      )}
      {!logoLightUrl && logoDarkUrl && (
        <img
          src={logoDarkUrl}
          alt={brandName}
          className={cn(imgClass, 'block dark:hidden')}
          style={{ height }}
        />
      )}
      {!logoDarkUrl && logoLightUrl && (
        <img
          src={logoLightUrl}
          alt={brandName}
          className={cn(imgClass, 'hidden dark:block')}
          style={{ height }}
        />
      )}
    </span>
  )
}

