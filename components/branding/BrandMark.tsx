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
        {/* Ring gradient - cyan to blue */}
        <linearGradient id="ciq-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D9FF"/>
          <stop offset="50%" stopColor="#0080FF"/>
          <stop offset="100%" stopColor="#0040C0"/>
        </linearGradient>
        {/* Arrow gradient - lime to teal */}
        <linearGradient id="ciq-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00BFA5"/>
          <stop offset="40%" stopColor="#00E676"/>
          <stop offset="100%" stopColor="#C0FF00"/>
        </linearGradient>
        {/* Arrow shadow gradient */}
        <linearGradient id="ciq-arrow-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#008B6A"/>
          <stop offset="100%" stopColor="#006B5A"/>
        </linearGradient>
      </defs>

      {/* Ring with gap - back portion (behind arrow) */}
      <path
        d="M 140 380 A 160 160 0 1 1 372 140"
        stroke="url(#ciq-ring)"
        strokeWidth="44"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arrow shadow (darker, offset) */}
      <path
        d="M 115 410 L 240 285 L 175 335 L 175 335 L 240 285 L 310 330 L 115 410 Z"
        fill="url(#ciq-arrow-shadow)"
        opacity="0.6"
      />

      {/* Main arrow pointing up-right */}
      <path
        d="M 100 400 L 380 120 L 300 200 L 330 310 L 230 280 L 160 350 Z"
        fill="url(#ciq-arrow)"
      />

      {/* Ring front portion (in front of arrow) */}
      <path
        d="M 372 140 A 160 160 0 0 1 310 340"
        stroke="url(#ciq-ring)"
        strokeWidth="44"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
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
