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
      viewBox="0 0 512 512"
      role="img"
      aria-label={title}
      className={cn('h-8 w-8', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="circleGradient" x1="256" y1="56" x2="256" y2="456" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D9FF"/>
          <stop offset="50%" stopColor="#0080FF"/>
          <stop offset="100%" stopColor="#0040C0"/>
        </linearGradient>
        <linearGradient id="arrowGradient" x1="256" y1="100" x2="380" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C0FF00"/>
          <stop offset="50%" stopColor="#00E676"/>
          <stop offset="100%" stopColor="#00BFA5"/>
        </linearGradient>
      </defs>

      {/* Circular Ring */}
      <circle cx="256" cy="256" r="180" stroke="url(#circleGradient)" strokeWidth="40" fill="none"/>

      {/* Compass Needle/Arrow pointing up-right */}
      <path
        d="M 256 256 L 180 332 L 256 120 L 332 332 Z"
        fill="url(#arrowGradient)"
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
