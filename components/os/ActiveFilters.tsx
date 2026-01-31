import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface ActiveFilterChip {
  key: string
  label: string
  onClear: () => void
}

interface ActiveFiltersProps {
  filters: ActiveFilterChip[]
  onReset?: () => void
}

export function ActiveFilters({ filters, onReset }: ActiveFiltersProps) {
  if (filters.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {filters.map((f) => (
        <Button
          key={f.key}
          variant="secondary"
          size="sm"
          onClick={f.onClear}
          className="h-7 gap-1 rounded-full px-2"
          aria-label={`Clear filter ${f.label}`}
        >
          {f.label}
          <X className="h-3 w-3 opacity-70" aria-hidden="true" />
        </Button>
      ))}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-7">
          Reset
        </Button>
      )}
    </div>
  )
}

