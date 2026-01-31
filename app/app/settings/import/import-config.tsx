'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { importConfiguration } from '@/lib/actions/config-actions'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ImportConfig() {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
        setError('Please select a JSON file')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  async function handleImport() {
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      const text = await file.text()
      let config: any
      try {
        config = JSON.parse(text)
      } catch (parseError) {
        setError('Invalid JSON file. Please check the file format.')
        setIsImporting(false)
        return
      }

      const result = await importConfiguration(config)
      if (result.success) {
        toast.success('Configuration imported successfully')
        setFile(null)
        // Reset file input
        const input = document.getElementById('config-file') as HTMLInputElement
        if (input) input.value = ''
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setError(result.error || 'Failed to import configuration')
      }
    } catch (error) {
      setError('An unexpected error occurred while importing')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="config-file">Configuration File (JSON)</Label>
        <Input
          id="config-file"
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          disabled={isImporting}
        />
        <p className="text-xs text-muted-foreground">
          Select a JSON configuration file exported from another organization
        </p>
      </div>

      <Button onClick={handleImport} disabled={!file || isImporting} className="gap-2">
        <Upload className="h-4 w-4" />
        {isImporting ? 'Importing...' : 'Import Configuration'}
      </Button>

      <div className="pt-4 border-t">
        <p className="text-sm font-semibold mb-2">Import Notes:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Metric catalog entries will be upserted (updated if key exists, added if new)</li>
          <li>ROI defaults and alert thresholds will be merged with existing settings</li>
          <li>Org-specific fields (like org_id) are automatically set</li>
        </ul>
      </div>
    </div>
  )
}
