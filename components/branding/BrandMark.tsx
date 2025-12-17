'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function DefaultMark({
  className,
  title = 'CompassIQ',
}: {
  className?: string
  title?: string
}) {
  // Use PNG logo by default for exact brand match - EXTRA LARGE size
  return (
    <img
      src="/compass-iq-logo.png"
      alt={title}
      className={cn('h-48 w-48 object-contain', className)}
    />
  )
}

export function BrandMark({
  url,
  size = 32,
  className,
  alt = 'CompassIQ',
}: {
  url?: string | null
  size?: number
  className?: string
  alt?: string
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        width={size}
        height={size}
        className={cn('shrink-0 object-contain', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return <DefaultMark className={className} title={alt} />
}
