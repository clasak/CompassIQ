'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function DefaultWordmark({ className, brandName = 'CompassIQ' }: { className?: string, brandName?: string }) {
  return (
    <span className={cn('inline-flex items-center font-bold text-xl tracking-tight', className)}>
      <span className="text-foreground">Compass</span>
      <span className="text-[#00BFA5]">IQ</span>
    </span>
  )
}

export function BrandWordmark({
  brandName = 'CompassIQ',
  logoLightUrl,
  logoDarkUrl,
  height = 32,
  className,
}: {
  brandName?: string
  logoLightUrl?: string | null
  logoDarkUrl?: string | null
  height?: number
  className?: string
}) {
  const hasAny = Boolean(logoLightUrl || logoDarkUrl)

  if (!hasAny) {
    return <DefaultWordmark className={className} brandName={brandName} />
  }

  const imgClass = cn('max-w-[200px] h-auto object-contain', className)

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
