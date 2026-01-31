'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { exportConfiguration } from '@/lib/actions/config-actions'

export function ExportConfig() {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const result = await exportConfiguration()
      if (result.success && result.config) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compassiq-config-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Configuration exported successfully')
      } else {
        toast.error(result.error || 'Failed to export configuration')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          The exported configuration includes:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>All metric catalog entries (keys, names, formulas, sources, cadence)</li>
          <li>ROI defaults (if configured)</li>
          <li>Alert thresholds (if configured)</li>
        </ul>
      </div>
      <Button onClick={handleExport} disabled={isExporting} className="gap-2">
        <Download className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export Configuration'}
      </Button>
    </div>
  )
}
