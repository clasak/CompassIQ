'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ActionButton } from '@/components/ui/action-button'
import { toast } from 'sonner'
import { createPreviewWorkspace, PreviewBranding } from '@/lib/actions/preview-actions'
import { extractColorsFromImage, extractColorsFromSvg } from '@/lib/branding/extract-colors'
import { isDemoOrgError } from '@/lib/errors'
import { ChevronRight, ChevronLeft, Upload, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const PAINS_LIBRARY = [
  { id: 'data-silos', label: 'Data Silos', description: 'Information scattered across multiple systems' },
  { id: 'reporting-delays', label: 'Reporting Delays', description: 'Reports take days or weeks to compile' },
  { id: 'lack-visibility', label: 'Lack of Visibility', description: 'No single source of truth for metrics' },
  { id: 'manual-processes', label: 'Manual Processes', description: 'Time-consuming manual data entry and calculations' },
  { id: 'inaccurate-forecasting', label: 'Inaccurate Forecasting', description: 'Forecasts based on stale or incomplete data' },
  { id: 'team-alignment', label: 'Team Alignment Issues', description: 'Departments working with different data sets' },
]

const KPI_SUGGESTIONS: Record<string, string[]> = {
  'data-silos': ['revenue_mtd', 'pipeline_30', 'ar_outstanding'],
  'reporting-delays': ['revenue_mtd', 'pipeline_90', 'on_time_delivery'],
  'lack-visibility': ['revenue_mtd', 'pipeline_30', 'pipeline_60', 'pipeline_90', 'ar_outstanding', 'churn_risk'],
  'manual-processes': ['revenue_mtd', 'pipeline_30', 'on_time_delivery'],
  'inaccurate-forecasting': ['pipeline_30', 'pipeline_60', 'pipeline_90', 'churn_risk'],
  'team-alignment': ['revenue_mtd', 'pipeline_30', 'ar_outstanding', 'on_time_delivery'],
}

const KPI_LABELS: Record<string, string> = {
  revenue_mtd: 'Revenue MTD',
  pipeline_30: 'Pipeline 30 Days',
  pipeline_60: 'Pipeline 60 Days',
  pipeline_90: 'Pipeline 90 Days',
  ar_outstanding: 'AR Outstanding',
  on_time_delivery: 'On-Time Delivery %',
  churn_risk: 'Churn Risk Accounts',
}

export function PreviewWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)

  // Step 1: Company
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')

  // Step 2: Branding
  const [brandName, setBrandName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#0A192F')
  const [accentColor, setAccentColor] = useState('#007BFF')
  const [logoLight, setLogoLight] = useState<File | null>(null)
  const [logoLightUrl, setLogoLightUrl] = useState<string | null>(null)
  const [logoDark, setLogoDark] = useState<File | null>(null)
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null)
  const [mark, setMark] = useState<File | null>(null)
  const [markUrl, setMarkUrl] = useState<string | null>(null)
  const [extractingColors, setExtractingColors] = useState(false)
  const [suggestedColors, setSuggestedColors] = useState<{ primary: string; accent: string } | null>(null)

  // Step 3: Pains
  const [selectedPains, setSelectedPains] = useState<string[]>([])

  // Step 4: KPIs
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([])
  const [kpiValues, setKpiValues] = useState<Record<string, number>>({})

  const totalSteps = 4

  async function handleLogoUpload(
    file: File,
    type: 'logo_light' | 'logo_dark' | 'mark',
    setUrl: (url: string) => void
  ) {
    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('file', file)

      const res = await fetch('/api/branding/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok || !json?.ok) {
        if (json?.error === 'Demo org is read-only') {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(json?.error || 'Upload failed')
        }
        return
      }

      setUrl(json.url)

      // Auto-extract colors from first logo uploaded
      if (type === 'logo_light' && !suggestedColors) {
        await extractColors(file)
      }

      toast.success('Logo uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Upload failed')
    }
  }

  async function extractColors(file: File) {
    setExtractingColors(true)
    try {
      let colors = null

      if (file.type === 'image/svg+xml') {
        const text = await file.text()
        colors = await extractColorsFromSvg(text)
      } else {
        colors = await extractColorsFromImage(file)
      }

      if (colors) {
        setSuggestedColors(colors)
        toast.success('Colors extracted from logo')
      } else {
        toast.info('Could not auto-detect colors; please choose manually')
      }
    } catch (error) {
      console.error('Color extraction error:', error)
      toast.info('Could not auto-detect colors; please choose manually')
    } finally {
      setExtractingColors(false)
    }
  }

  function acceptSuggestedColors() {
    if (suggestedColors) {
      setPrimaryColor(suggestedColors.primary)
      setAccentColor(suggestedColors.accent)
      setSuggestedColors(null)
      toast.success('Colors applied')
    }
  }

  function togglePain(painId: string) {
    setSelectedPains((prev) => {
      const newPains = prev.includes(painId)
        ? prev.filter((id) => id !== painId)
        : [...prev, painId]

      // Auto-suggest KPIs based on selected pains
      const suggestedKPIs = new Set<string>()
      for (const pain of newPains) {
        const kpis = KPI_SUGGESTIONS[pain] || []
        kpis.forEach((kpi) => suggestedKPIs.add(kpi))
      }
      setSelectedKPIs(Array.from(suggestedKPIs))

      return newPains
    })
  }

  function toggleKPI(kpiId: string) {
    setSelectedKPIs((prev) =>
      prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]
    )
  }

  async function handleGenerate() {
    if (!companyName.trim() || !brandName.trim()) {
      toast.error('Company name and brand name are required')
      return
    }

    if (selectedPains.length === 0) {
      toast.error('Please select at least one pain point')
      return
    }

    if (selectedKPIs.length === 0) {
      toast.error('Please select at least one KPI')
      return
    }

    setGenerating(true)

    try {
      // Upload logos if not already uploaded
      let finalLogoLightUrl = logoLightUrl
      let finalLogoDarkUrl = logoDarkUrl
      let finalMarkUrl = markUrl

      if (logoLight && !logoLightUrl) {
        await handleLogoUpload(logoLight, 'logo_light', setLogoLightUrl)
        finalLogoLightUrl = logoLightUrl
      }
      if (logoDark && !logoDarkUrl) {
        await handleLogoUpload(logoDark, 'logo_dark', setLogoDarkUrl)
        finalLogoDarkUrl = logoDarkUrl
      }
      if (mark && !markUrl) {
        await handleLogoUpload(mark, 'mark', setMarkUrl)
        finalMarkUrl = markUrl
      }

      const branding: PreviewBranding = {
        brand_name: brandName,
        primary_color: primaryColor,
        accent_color: accentColor,
        logo_light_url: finalLogoLightUrl || undefined,
        logo_dark_url: finalLogoDarkUrl || undefined,
        mark_url: finalMarkUrl || undefined,
      }

      const metricValues = selectedKPIs.map((kpi) => ({
        key: kpi,
        value: kpiValues[kpi] || getDefaultKPIValue(kpi),
      }))

      const result = await createPreviewWorkspace({
        name: companyName,
        industry: industry || undefined,
        pains: selectedPains,
        kpis: selectedKPIs,
        branding,
        metricValues,
      })

      if (result.error) {
        if (isDemoOrgError({ message: result.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(result.error)
        }
        return
      }

      toast.success('Preview workspace created!')
      if (result.workspaceId) {
        // Redirect to canonical preview enter endpoint
        router.push(`/api/preview/enter?id=${result.workspaceId}`)
      } else {
        router.push('/app')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate preview')
    } finally {
      setGenerating(false)
    }
  }

  function getDefaultKPIValue(kpi: string): number {
    const defaults: Record<string, number> = {
      revenue_mtd: 125000,
      pipeline_30: 50000,
      pipeline_60: 120000,
      pipeline_90: 250000,
      ar_outstanding: 45000,
      on_time_delivery: 0.85,
      churn_risk: 3,
    }
    return defaults[kpi] || 0
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                i + 1 <= step
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-muted'
              }`}
            >
              {i + 1 < step ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  i + 1 < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Company */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic details about the client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Construction"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Construction, Technology, Healthcare..."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!companyName.trim()}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Branding */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Upload logos and set brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder={companyName || 'Brand Name'}
              />
            </div>

            {/* Logo uploads */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Light Logo</Label>
                <Input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoLight(file)
                      handleLogoUpload(file, 'logo_light', setLogoLightUrl)
                    }
                  }}
                />
                {logoLightUrl && (
                  <img src={logoLightUrl} alt="Light logo" className="h-16 object-contain" />
                )}
              </div>
              <div className="space-y-2">
                <Label>Dark Logo</Label>
                <Input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoDark(file)
                      handleLogoUpload(file, 'logo_dark', setLogoDarkUrl)
                    }
                  }}
                />
                {logoDarkUrl && (
                  <img src={logoDarkUrl} alt="Dark logo" className="h-16 object-contain" />
                )}
              </div>
              <div className="space-y-2">
                <Label>Mark/Icon</Label>
                <Input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setMark(file)
                      handleLogoUpload(file, 'mark', setMarkUrl)
                    }
                  }}
                />
                {markUrl && (
                  <img src={markUrl} alt="Mark" className="h-16 object-contain" />
                )}
              </div>
            </div>

            {/* Color extraction suggestion */}
            {suggestedColors && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <Label>Suggested Colors (from logo)</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={acceptSuggestedColors}>
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSuggestedColors(null)}
                    >
                      Override
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: suggestedColors.primary }}
                    />
                    <span className="text-sm">{suggestedColors.primary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: suggestedColors.accent }}
                    />
                    <span className="text-sm">{suggestedColors.accent}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Color pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#0A192F"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#007BFF"
                  />
                </div>
              </div>
            </div>

            {extractingColors && (
              <div className="text-sm text-muted-foreground">Extracting colors from logo...</div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!brandName.trim()}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pains */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Pain Points</CardTitle>
            <CardDescription>Select the challenges the client is facing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PAINS_LIBRARY.map((pain) => (
                <button
                  key={pain.id}
                  type="button"
                  onClick={() => togglePain(pain.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedPains.includes(pain.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{pain.label}</div>
                      <div className="text-sm text-muted-foreground">{pain.description}</div>
                    </div>
                    {selectedPains.includes(pain.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={selectedPains.length === 0}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: KPIs */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>Select KPIs and set baseline values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(KPI_LABELS).map(([kpiId, label]) => (
                <div
                  key={kpiId}
                  className={`p-4 border rounded-lg ${
                    selectedKPIs.includes(kpiId) ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedKPIs.includes(kpiId)}
                        onChange={() => toggleKPI(kpiId)}
                        className="rounded"
                      />
                      <Label className="font-medium">{label}</Label>
                    </div>
                  </div>
                  {selectedKPIs.includes(kpiId) && (
                    <div className="mt-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={getDefaultKPIValue(kpiId).toString()}
                        value={kpiValues[kpiId] || ''}
                        onChange={(e) =>
                          setKpiValues({
                            ...kpiValues,
                            [kpiId]: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <ActionButton
                actionType="admin"
                onClick={handleGenerate}
                disabled={generating || selectedKPIs.length === 0}
              >
                {generating ? 'Generating...' : 'Generate Preview'}
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

