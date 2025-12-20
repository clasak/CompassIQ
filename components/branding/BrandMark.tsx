'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function DefaultMark({
  className,
  title = 'CompassIQ',
}: {
  className?: string
  title?: string
}) {
  // Use Next.js Image for automatic optimization (WebP, sizing, lazy loading)
  return (
    <Image
      src="/compass-iq-logo.png"
      alt={title}
      width={192} // h-48 = 192px
      height={192}
      className={cn('object-contain', className)}
      priority // Above-the-fold logo in sidebar
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
      <Image
        src={url}
        alt={alt}
        width={size}
        height={size}
        className={cn('shrink-0 object-contain', className)}
        priority // Custom logos also above-the-fold
      />
    )
  }
  return <DefaultMark className={className} title={alt} />
}
