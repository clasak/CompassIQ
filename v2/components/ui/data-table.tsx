'use client'

import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-text-tertiary text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={cn(
                  'text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                )}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b border-border-subtle transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-overlay'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key as string}
                  className={cn(
                    'py-3 px-4 text-sm',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Pre-styled cell components
export function StatusBadge({
  status,
  variant = 'default',
}: {
  status: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
}) {
  const variants = {
    success: 'bg-revenue-muted text-revenue border-revenue/30',
    warning: 'bg-warning-muted text-warning border-warning/30',
    danger: 'bg-danger-muted text-danger border-danger/30',
    info: 'bg-pipeline-muted text-pipeline border-pipeline/30',
    default: 'bg-surface-subtle text-text-secondary border-border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant]
      )}
    >
      {status}
    </span>
  )
}

export function CurrencyCell({ value }: { value: number }) {
  return (
    <span className="font-mono text-text-primary tabular-nums">
      {formatCurrency(value)}
    </span>
  )
}

export function DateCell({ value }: { value: string | Date }) {
  return (
    <span className="text-text-secondary">{formatDate(value)}</span>
  )
}

export function LinkCell({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-pipeline hover:text-pipeline/80 transition-colors font-medium"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}
