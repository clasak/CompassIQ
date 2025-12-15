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
      className={cn('h-6 w-6', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(var(--brand-accent-hsl, var(--primary)))" />
          <stop offset="1" stopColor="hsl(var(--brand-primary-hsl, var(--foreground)))" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#brandGradient)" opacity="0.95" />
      <path
        d="M16 30c2.5 2.5 6.5 2.5 9 0l7-7"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 18h8"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  )
}

export function BrandMark({
  url,
  size = 24,
  className,
  alt = 'Brand mark',
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
        className={cn('shrink-0', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return <DefaultMark className={className} title={alt} />
}

