'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useState, memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { downloadCSV } from '@/lib/csv'
import { Download, Search } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  exportFilename?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  loading?: boolean
}

export const DataTable = memo(function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  exportFilename = 'export.csv',
  emptyStateTitle,
  emptyStateDescription,
  emptyStateAction,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  const escapeCsvValue = useCallback((value: unknown) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }, [])

  const handleExport = useCallback(() => {
    const exportColumns = table
      .getAllLeafColumns()
      .filter((col) => col.id !== 'actions')

    const headerRow = exportColumns
      .map((col) => (typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id))
      .map(escapeCsvValue)
      .join(',')

    const dataRows = table.getFilteredRowModel().rows.map((row) => {
      return exportColumns
        .map((col) => escapeCsvValue(row.getValue(col.id)))
        .join(',')
    })

    const csv = [headerRow, ...dataRows].join('\n')
    downloadCSV(csv, exportFilename)
  }, [table, exportFilename, escapeCsvValue])

  const hasData = data.length > 0
  const hasFilteredData = table.getFilteredRowModel().rows.length > 0
  const showEmptyState = !loading && !hasData && !emptyStateTitle && !emptyStateDescription
  const showCustomEmptyState = !loading && !hasData && (emptyStateTitle || emptyStateDescription)

  return (
    <div className="space-y-4">
      {(searchKey || exportFilename) && (
        <div className="flex items-center justify-between gap-4">
          {searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {exportFilename && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!hasData}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ) : showCustomEmptyState ? (
        <EmptyState
          title={emptyStateTitle || 'No data'}
          description={emptyStateDescription || 'Get started by creating your first record.'}
          action={emptyStateAction}
        />
      ) : hasFilteredData ? (
        <>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="table-standard">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-table-sm">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-table">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                of {table.getFilteredRowModel().rows.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                  title={!table.getCanPreviousPage() ? 'No previous page' : undefined}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                  title={!table.getCanNextPage() ? 'No next page' : undefined}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          {globalFilter ? 'No results match your search.' : 'No data available.'}
        </div>
      )}
    </div>
  )
}) as <TData, TValue>(props: DataTableProps<TData, TValue>) => JSX.Element
