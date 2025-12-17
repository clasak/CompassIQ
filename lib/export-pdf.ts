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

/**
 * Export to PowerPoint-compatible HTML file
 * Creates an HTML file that can be opened and converted in PowerPoint
 */
export function exportToPowerPoint(
  elementId: string,
  options: ExportOptions = {}
): void {
  const opts = { ...defaultOptions, ...options }
  const element = document.getElementById(elementId)

  if (!element) {
    console.error(`Element with id "${elementId}" not found`)
    return
  }

  const timestamp = opts.includeTimestamp ? new Date().toLocaleString() : ''

  // Create PowerPoint-compatible HTML (MHTML format)
  const htmlContent = `
MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_01"

------=_NextPart_01
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns:p="urn:schemas-microsoft-com:office:powerpoint"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <meta name="ProgId" content="PowerPoint.Slide">
  <meta name="Generator" content="CompassIQ">
  <title>${opts.title}</title>
  <style>
    @page {
      size: 10in 7.5in;
      margin: 0.5in;
    }
    body {
      font-family: Calibri, Arial, sans-serif;
      background: #ffffff;
      color: #333333;
      margin: 0;
      padding: 40px;
    }
    .slide {
      width: 100%;
      min-height: 500px;
      page-break-after: always;
      position: relative;
    }
    .slide-title {
      font-size: 36px;
      font-weight: bold;
      color: #0078D4;
      margin-bottom: 20px;
      border-bottom: 3px solid #00BFA5;
      padding-bottom: 10px;
    }
    .slide-subtitle {
      font-size: 18px;
      color: #666666;
      margin-bottom: 30px;
    }
    .slide-content {
      font-size: 14px;
      line-height: 1.6;
    }
    .slide-footer {
      position: absolute;
      bottom: 20px;
      font-size: 10px;
      color: #999999;
    }
    .kpi-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 20px 0;
    }
    .kpi-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      min-width: 200px;
      flex: 1;
    }
    .kpi-value {
      font-size: 32px;
      font-weight: bold;
      color: #0078D4;
    }
    .kpi-label {
      font-size: 12px;
      color: #666666;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e0e0e0;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="slide">
    <h1 class="slide-title">${opts.title}</h1>
    ${opts.subtitle ? `<p class="slide-subtitle">${opts.subtitle}</p>` : ''}
    <div class="slide-content">
      ${element.innerHTML}
    </div>
    ${timestamp ? `<div class="slide-footer">Generated: ${timestamp} | CompassIQ</div>` : ''}
  </div>
</body>
</html>

------=_NextPart_01--
`

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' })
  const url = URL.createObjectURL(blob)
  const filename = `${(opts.title || 'presentation').toLowerCase().replace(/\s+/g, '-')}.ppt`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export KPI data to formatted PowerPoint slides
 */
export interface KPIData {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function exportKPIsToPowerPoint(
  kpis: KPIData[],
  options: ExportOptions = {}
): void {
  const opts = { ...defaultOptions, title: 'KPI Dashboard', ...options }
  const timestamp = opts.includeTimestamp ? new Date().toLocaleString() : ''

  const kpiCards = kpis
    .map(
      kpi => `
      <div class="kpi-card">
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
        ${kpi.change ? `<div class="kpi-change" style="color: ${kpi.trend === 'up' ? '#00C853' : kpi.trend === 'down' ? '#FF5252' : '#666'}">${kpi.change}</div>` : ''}
      </div>
    `
    )
    .join('')

  const htmlContent = `
MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_01"

------=_NextPart_01
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:p="urn:schemas-microsoft-com:office:powerpoint">
<head>
  <meta charset="utf-8">
  <meta name="ProgId" content="PowerPoint.Slide">
  <title>${opts.title}</title>
  <style>
    body {
      font-family: Calibri, Arial, sans-serif;
      background: #ffffff;
      margin: 0;
      padding: 40px;
    }
    .slide-title {
      font-size: 36px;
      font-weight: bold;
      color: #0078D4;
      margin-bottom: 30px;
      border-bottom: 3px solid #00BFA5;
      padding-bottom: 10px;
    }
    .kpi-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    .kpi-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
      min-width: 180px;
      flex: 1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .kpi-value {
      font-size: 36px;
      font-weight: bold;
      color: #0078D4;
    }
    .kpi-label {
      font-size: 12px;
      color: #666666;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .kpi-change {
      font-size: 14px;
      margin-top: 8px;
    }
    .footer {
      position: fixed;
      bottom: 20px;
      font-size: 10px;
      color: #999;
    }
  </style>
</head>
<body>
  <h1 class="slide-title">${opts.title}</h1>
  <div class="kpi-grid">
    ${kpiCards}
  </div>
  ${timestamp ? `<div class="footer">Generated: ${timestamp} | CompassIQ</div>` : ''}
</body>
</html>

------=_NextPart_01--
`

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' })
  const url = URL.createObjectURL(blob)
  const filename = `${(opts.title || 'kpi-dashboard').toLowerCase().replace(/\s+/g, '-')}.ppt`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
