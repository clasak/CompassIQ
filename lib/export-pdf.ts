'use client'

/**
 * PDF Export Utility for CompassIQ Dashboards
 * Uses browser print API with custom styling for PDF generation
 */

export interface ExportOptions {
  title?: string
  subtitle?: string
  includeTimestamp?: boolean
  orientation?: 'portrait' | 'landscape'
  paperSize?: 'a4' | 'letter' | 'legal'
}

const defaultOptions: ExportOptions = {
  title: 'CompassIQ Report',
  subtitle: '',
  includeTimestamp: true,
  orientation: 'landscape',
  paperSize: 'a4',
}

/**
 * Export a DOM element to PDF using browser print dialog
 */
export function exportToPDF(
  elementId: string,
  options: ExportOptions = {}
): void {
  const opts = { ...defaultOptions, ...options }
  const element = document.getElementById(elementId)

  if (!element) {
    console.error(`Element with id "${elementId}" not found`)
    return
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export PDF')
    return
  }

  const timestamp = opts.includeTimestamp
    ? new Date().toLocaleString()
    : ''

  // Build the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${opts.title}</title>
      <style>
        @page {
          size: ${opts.paperSize} ${opts.orientation};
          margin: 1cm;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          color: #1a1a1a;
          padding: 20px;
          margin: 0;
        }

        .pdf-header {
          border-bottom: 2px solid #00A4A9;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .pdf-title {
          font-size: 24px;
          font-weight: 700;
          color: #051221;
          margin: 0 0 4px 0;
        }

        .pdf-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .pdf-timestamp {
          font-size: 11px;
          color: #999;
          margin-top: 8px;
        }

        .pdf-content {
          background: white;
        }

        .pdf-content * {
          max-width: 100%;
        }

        /* Ensure charts and cards print nicely */
        .pdf-content [class*="card"],
        .pdf-content [class*="Card"] {
          break-inside: avoid;
          page-break-inside: avoid;
          border: 1px solid #e5e5e5;
          margin-bottom: 16px;
        }

        /* KPI cards grid */
        .pdf-content .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        /* Hide interactive elements */
        button, [role="button"], input, select, textarea {
          display: none !important;
        }

        /* Show static text instead of inputs */
        .pdf-content [data-value]::after {
          content: attr(data-value);
        }

        @media print {
          body {
            padding: 0;
          }

          .pdf-header {
            position: running(header);
          }
        }
      </style>
    </head>
    <body>
      <div class="pdf-header">
        <h1 class="pdf-title">${opts.title}</h1>
        ${opts.subtitle ? `<p class="pdf-subtitle">${opts.subtitle}</p>` : ''}
        ${timestamp ? `<p class="pdf-timestamp">Generated: ${timestamp}</p>` : ''}
      </div>
      <div class="pdf-content">
        ${element.innerHTML}
      </div>
    </body>
    </html>
  `)

  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

/**
 * Export dashboard data to CSV
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string = 'export.csv'
): void {
  if (!data || data.length === 0) {
    console.error('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows: string[] = []

  // Add headers
  csvRows.push(headers.map(h => `"${h}"`).join(','))

  // Add data rows
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h]
      if (val === null || val === undefined) return ''
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
      return String(val)
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export to Excel (XLSX format via CSV with BOM)
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string = 'export.xlsx'
): void {
  if (!data || data.length === 0) {
    console.error('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows: string[] = []

  // Add headers
  csvRows.push(headers.map(h => `"${h}"`).join('\t'))

  // Add data rows (tab-separated for Excel)
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h]
      if (val === null || val === undefined) return ''
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
      return String(val)
    })
    csvRows.push(values.join('\t'))
  }

  // Add BOM for Excel UTF-8 recognition
  const BOM = '\uFEFF'
  const content = BOM + csvRows.join('\n')
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.replace('.xlsx', '.xls')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
