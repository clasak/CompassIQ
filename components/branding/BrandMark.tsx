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
      viewBox="40 90 432 432"
      role="img"
      aria-label={title}
      className={cn('h-8 w-8', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ciq-ring" x1="256" y1="90" x2="256" y2="522" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D9FF"/>
          <stop offset="50%" stopColor="#0080FF"/>
          <stop offset="100%" stopColor="#0040C0"/>
        </linearGradient>
        <linearGradient id="ciq-arrow" x1="256" y1="150" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C0FF00"/>
          <stop offset="50%" stopColor="#00E676"/>
          <stop offset="100%" stopColor="#00BFA5"/>
        </linearGradient>
      </defs>
      {/* Circular Ring */}
      <circle cx="256" cy="306" r="180" stroke="url(#ciq-ring)" strokeWidth="45" fill="none"/>
      {/* Compass Needle/Arrow */}
      <path
        d="M 200 430 L 256 350 L 180 306 L 380 200 L 256 350 L 332 306 Z"
        fill="url(#ciq-arrow)"
        opacity="0.95"
      />
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
