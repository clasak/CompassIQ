'use client'

import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

/**
 * Lightweight SVG sparkline component
 * Shows last 8-12 data points as a simple line chart
 */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'currentColor',
  className,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length === 0) return ''

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Avoid division by zero

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }, [data, width, height])

  if (data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity={0.3}
        />
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


