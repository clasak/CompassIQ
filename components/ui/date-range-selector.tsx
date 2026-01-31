'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCallback } from 'react'
import { type DateRangePreset, type DateRange, parseDateRangeFromParams } from '@/lib/date-range'

function getDateRangeForPreset(preset: DateRangePreset): { start: Date; end: Date } {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  let start: Date

  switch (preset) {
    case 'MTD':
      start = new Date(end.getFullYear(), end.getMonth(), 1)
      break
    case 'QTD':
      const quarter = Math.floor(end.getMonth() / 3)
      start = new Date(end.getFullYear(), quarter * 3, 1)
      break
    case 'YTD':
      start = new Date(end.getFullYear(), 0, 1)
      break
    case 'LAST_7':
      start = new Date(end)
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'LAST_30':
      start = new Date(end)
      start.setDate(start.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      break
    case 'CUSTOM':
      // For custom, we'll need a date picker - for now, default to MTD
      start = new Date(end.getFullYear(), end.getMonth(), 1)
      break
    default:
      start = new Date(end.getFullYear(), end.getMonth(), 1)
  }

  return { start, end }
}

// Re-export types for convenience
export type { DateRangePreset, DateRange }

interface DateRangeSelectorProps {
  value?: DateRangePreset
  onChange?: (range: DateRange) => void
  className?: string
}

export function DateRangeSelector({ value = 'MTD', onChange, className }: DateRangeSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (newPreset: DateRangePreset) => {
      const range = getDateRangeForPreset(newPreset)
      const newRange: DateRange = {
        preset: newPreset,
        startDate: range.start,
        endDate: range.end,
      }

      // Update URL params
      const params = new URLSearchParams(searchParams.toString())
      params.set('dateRange', newPreset)
      params.set('startDate', range.start.toISOString())
      params.set('endDate', range.end.toISOString())
      router.push(`?${params.toString()}`, { scroll: false })

      onChange?.(newRange)
    },
    [searchParams, router, onChange]
  )

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select date range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MTD">Month to Date</SelectItem>
        <SelectItem value="QTD">Quarter to Date</SelectItem>
        <SelectItem value="YTD">Year to Date</SelectItem>
        <SelectItem value="LAST_7">Last 7 Days</SelectItem>
        <SelectItem value="LAST_30">Last 30 Days</SelectItem>
        <SelectItem value="CUSTOM">Custom Range</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Re-export parseDateRangeFromParams for convenience
export { parseDateRangeFromParams }

