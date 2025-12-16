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
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn('h-8 w-8', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ciq-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
      {/* Solid gradient background circle */}
      <circle cx="24" cy="24" r="22" fill="url(#ciq-bg)"/>
      {/* Compass needle - North (solid white) */}
      <path d="M24 8 L28.5 22 L24 26 L19.5 22 Z" fill="white"/>
      {/* Compass needle - South (semi-transparent) */}
      <path d="M24 40 L28.5 26 L24 22 L19.5 26 Z" fill="white" fillOpacity="0.4"/>
      {/* Center point */}
      <circle cx="24" cy="24" r="2.5" fill="white"/>
    </svg>
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
