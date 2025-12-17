'use client'

import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { exportToPDF, exportToCSV, exportToExcel, type ExportOptions } from '@/lib/export-pdf'
import { toast } from 'sonner'

interface ExportMenuProps {
  /** ID of the element to export for PDF */
  elementId?: string
  /** Data array for CSV/Excel export */
  data?: Record<string, unknown>[]
  /** Title for the exported document */
  title?: string
  /** Filename base (without extension) */
  filename?: string
  /** Additional PDF options */
  pdfOptions?: ExportOptions
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Custom class name */
  className?: string
}

export function ExportMenu({
  elementId,
  data,
  title = 'CompassIQ Report',
  filename = 'compassiq-export',
  pdfOptions,
  variant = 'outline',
  size = 'sm',
  className,
}: ExportMenuProps) {
  const handlePDFExport = () => {
    if (!elementId) {
      toast.error('No content to export')
      return
    }
    try {
      exportToPDF(elementId, { title, ...pdfOptions })
      toast.success('PDF export started')
    } catch (error) {
      toast.error('Failed to export PDF')
      console.error(error)
    }
  }

  const handleCSVExport = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }
    try {
      exportToCSV(data, `${filename}.csv`)
      toast.success('CSV downloaded')
    } catch (error) {
      toast.error('Failed to export CSV')
      console.error(error)
    }
  }

  const handleExcelExport = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }
    try {
      exportToExcel(data, `${filename}.xlsx`)
      toast.success('Excel file downloaded')
    } catch (error) {
      toast.error('Failed to export Excel')
      console.error(error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {elementId && (
          <DropdownMenuItem onClick={handlePDFExport} className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        )}
        {data && data.length > 0 && (
          <>
            <DropdownMenuItem onClick={handleCSVExport} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExcelExport} className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
