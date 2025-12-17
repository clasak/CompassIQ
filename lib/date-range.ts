import type { ReadonlyURLSearchParams } from 'next/navigation'

export type DateRangePreset = 'MTD' | 'QTD' | 'YTD' | 'LAST_7' | 'LAST_30' | 'CUSTOM'

export interface DateRange {
  preset: DateRangePreset
  startDate?: Date
  endDate?: Date
}

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

/**
 * Parse date range from URL search params
 * Can be used in both server and client components
 */
export function parseDateRangeFromParams(searchParams: URLSearchParams | ReadonlyURLSearchParams | { [key: string]: string | string[] | undefined }): DateRange {
  // Handle both URLSearchParams and plain object
  let preset: DateRangePreset = 'MTD'
  let startDateParam: string | null = null
  let endDateParam: string | null = null

  if (searchParams instanceof URLSearchParams || (searchParams && 'get' in searchParams && typeof (searchParams as any).get === 'function')) {
    // It's a URLSearchParams or ReadonlyURLSearchParams
    const params = searchParams as URLSearchParams | ReadonlyURLSearchParams
    preset = (params.get('dateRange') as DateRangePreset) || 'MTD'
    startDateParam = params.get('startDate')
    endDateParam = params.get('endDate')
  } else {
    // It's a plain object (from Next.js searchParams)
    const params = searchParams as { [key: string]: string | string[] | undefined }
    preset = (params.dateRange as DateRangePreset) || 'MTD'
    startDateParam = params.startDate ? String(params.startDate) : null
    endDateParam = params.endDate ? String(params.endDate) : null
  }

  if (startDateParam && endDateParam) {
    return {
      preset,
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam),
    }
  }

  const range = getDateRangeForPreset(preset)
  return {
    preset,
    startDate: range.start,
    endDate: range.end,
  }
}



