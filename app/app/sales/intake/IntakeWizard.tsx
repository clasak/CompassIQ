'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { IntakePackSchema, type IntakePack } from '@/lib/intake-schema'

interface IntakeWizardProps {
  isDemo: boolean
}

export function IntakeWizard({ isDemo }: IntakeWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'review' | 'importing' | 'complete'>('upload')
  const [intakePack, setIntakePack] = useState<IntakePack | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [mode, setMode] = useState<'preview_only' | 'seed_preview_and_crm'>('preview_only')
  const [importing, setImporting] = useState(false)

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        setJsonText(text)
        validateAndParse(text)
      } catch (error) {
        setValidationError('Failed to read file')
      }
    }
    reader.readAsText(file)
  }

  function handlePaste() {
    if (!jsonText.trim()) {
      setValidationError('Please paste or upload JSON')
      return
    }
    validateAndParse(jsonText)
  }

  function validateAndParse(text: string) {
    try {
      const parsed = JSON.parse(text)
      const result = IntakePackSchema.safeParse(parsed)
      
      if (!result.success) {
        setValidationError(`Validation failed: ${result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
        setIntakePack(null)
        return
      }

      setIntakePack(result.data)
      setValidationError(null)
      setStep('review')
      setMode(result.data.mode || 'preview_only')
    } catch (error: any) {
      setValidationError(`Invalid JSON: ${error.message}`)
      setIntakePack(null)
    }
  }

  async function handleImport() {
    if (!intakePack) return

    if (isDemo) {
      toast.error('Demo org is read-only. Intake import is disabled.')
      return
    }

    setImporting(true)
    setStep('importing')

    try {
      const payload = {
        ...intakePack,
        mode,
      }

      const response = await fetch('/api/intake/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        if (data.error === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
        } else {
          toast.error(data.message || data.error || 'Import failed')
        }
        setStep('review')
        setImporting(false)
        return
      }

      toast.success('Preview workspace created successfully!')
      setStep('complete')
      
      // Build redirect URL with created IDs
      const params = new URLSearchParams()
      if (data.previewWorkspaceId) {
        params.set('previewWorkspaceId', data.previewWorkspaceId)
      }
      if (data.createdIds?.accountIds?.length) {
        params.set('accountIds', data.createdIds.accountIds.join(','))
      }
      if (data.createdIds?.opportunityIds?.length) {
        params.set('opportunityIds', data.createdIds.opportunityIds.join(','))
      }
      if (data.createdIds?.taskIds?.length) {
        params.set('taskIds', data.createdIds.taskIds.join(','))
      }
      if (data.createdIds?.quoteIds?.length) {
        params.set('quoteIds', data.createdIds.quoteIds.join(','))
      }
      
      // Redirect after a brief delay
      setTimeout(() => {
        const redirectUrl = data.redirectTo || '/app'
        const finalUrl = params.toString() ? `${redirectUrl}?${params.toString()}` : redirectUrl
        router.push(finalUrl)
      }, 1500)
    } catch (error: any) {
      toast.error(error?.message || 'Import failed')
      setStep('review')
      setImporting(false)
    }
  }

  if (step === 'complete') {
    // Redirect handled in handleImport
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Import Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Preview workspace created successfully. Redirecting...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'importing') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Importing...</h3>
            <p className="text-muted-foreground">
              Creating preview workspace and setting up data...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'review' && intakePack) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Intake Pack</CardTitle>
            <CardDescription>Verify the data before importing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div><strong>Name:</strong> {intakePack.company.name}</div>
                {intakePack.company.industry && <div><strong>Industry:</strong> {intakePack.company.industry}</div>}
                {intakePack.company.website && <div><strong>Website:</strong> {intakePack.company.website}</div>}
              </div>
            </div>

            {intakePack.branding && (
              <div>
                <h3 className="font-semibold mb-2">Branding</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  {intakePack.branding.name && <div><strong>Name:</strong> {intakePack.branding.name}</div>}
                  {intakePack.branding.primary_color && (
                    <div className="flex items-center gap-2">
                      <strong>Primary:</strong>
                      <div
                        className="h-4 w-8 rounded border"
                        style={{ backgroundColor: intakePack.branding.primary_color }}
                      />
                      <span>{intakePack.branding.primary_color}</span>
                    </div>
                  )}
                  {intakePack.branding.accent_color && (
                    <div className="flex items-center gap-2">
                      <strong>Accent:</strong>
                      <div
                        className="h-4 w-8 rounded border"
                        style={{ backgroundColor: intakePack.branding.accent_color }}
                      />
                      <span>{intakePack.branding.accent_color}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">KPIs ({intakePack.kpis.length})</h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                {intakePack.kpis.map((kpi, i) => (
                  <div key={i}>
                    {kpi.label}: {kpi.baseline_value} {kpi.unit || ''}
                    {kpi.target_value && ` ? ${kpi.target_value}`}
                  </div>
                ))}
              </div>
            </div>

            {intakePack.pains.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Pain Points ({intakePack.pains.length})</h3>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  {intakePack.pains.map((pain, i) => (
                    <li key={i}>{pain}</li>
                  ))}
                </ul>
              </div>
            )}

            {intakePack.optional_entities && (
              <div>
                <h3 className="font-semibold mb-2">Optional Entities</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  {intakePack.optional_entities.accounts && (
                    <div>Accounts: {intakePack.optional_entities.accounts.length}</div>
                  )}
                  {intakePack.optional_entities.opportunities && (
                    <div>Opportunities: {intakePack.optional_entities.opportunities.length}</div>
                  )}
                  {intakePack.optional_entities.tasks && (
                    <div>Tasks: {intakePack.optional_entities.tasks.length}</div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <Label>Import Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preview_only">
                    Preview Only (Safe default - creates preview workspace only)
                  </SelectItem>
                  <SelectItem value="seed_preview_and_crm">
                    Preview + Seed CRM (Creates preview workspace and seeds accounts/opportunities/tasks)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {mode === 'preview_only'
                  ? 'Only creates a preview workspace with KPIs and alerts. No CRM data is created.'
                  : 'Creates preview workspace and also seeds accounts, opportunities, and tasks in your CRM.'}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setStep('upload')} variant="outline">
                Back
              </Button>
              <Button onClick={handleImport} disabled={importing || isDemo}>
                {importing ? 'Importing...' : 'Generate Preview Workspace'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Intake Pack</CardTitle>
        <CardDescription>
          Upload a JSON file or paste the intake pack data below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDemo && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Demo org is read-only. Intake import is disabled.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Upload JSON File</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              disabled={isDemo}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json,application/json'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const text = event.target?.result as string
                      setJsonText(text)
                    }
                    reader.readAsText(file)
                  }
                }
                input.click()
              }}
              disabled={isDemo}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Or Paste JSON</Label>
          <Textarea
            placeholder='Paste your intake pack JSON here...'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="font-mono text-sm min-h-[300px]"
            disabled={isDemo}
          />
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handlePaste} disabled={!jsonText.trim() || isDemo}>
            <FileText className="h-4 w-4 mr-2" />
            Validate & Continue
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Load sample from public data
              fetch('/data/sample-intake-pack.json', { cache: 'no-cache' })
                .then(res => {
                  if (!res.ok) throw new Error('Failed to fetch')
                  return res.json()
                })
                .then(data => {
                  setJsonText(JSON.stringify(data, null, 2))
                  toast.success('Sample loaded')
                })
                .catch(() => {
                  toast.error('Sample file not found. See data/sample-intake-pack.json in the repo.')
                })
            }}
            disabled={isDemo}
          >
            Load Sample
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
