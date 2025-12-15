'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, Palette, RefreshCw, Check } from 'lucide-react'
import { hexToHSL, hslToString } from '@/lib/utils'

interface Branding {
  id?: string
  logo_light_url: string | null
  logo_dark_url: string | null
  logo_mark_url: string | null
  primary_color: string | null
  accent_color: string | null
  company_name: string | null
}

export default function BrandingPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [branding, setBranding] = useState<Branding>({
    logo_light_url: null,
    logo_dark_url: null,
    logo_mark_url: null,
    primary_color: '#1e40af',
    accent_color: '#f59e0b',
    company_name: null,
  })
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadBranding() {
      const { orgId } = await fetch('/api/org/current').then((r) => r.json())
      if (!orgId) {
        setIsLoading(false)
        return
      }
      setOrgId(orgId)

      const { data } = await supabase
        .from('org_branding')
        .select('*')
        .eq('org_id', orgId)
        .single()

      if (data) {
        setBranding(data)
      }
      setIsLoading(false)
    }
    loadBranding()
  }, [])

  const extractColorsFromImage = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        if (!imageData) {
          resolve([])
          return
        }

        // Simple color extraction - find most common colors
        const colorCounts: Record<string, number> = {}
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 16) * 16
          const g = Math.round(data[i + 1] / 16) * 16
          const b = Math.round(data[i + 2] / 16) * 16
          const a = data[i + 3]

          if (a < 128) continue // Skip transparent pixels

          // Skip very light or very dark colors
          const brightness = (r + g + b) / 3
          if (brightness < 30 || brightness > 225) continue

          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
          colorCounts[hex] = (colorCounts[hex] || 0) + 1
        }

        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([color]) => color)

        resolve(sortedColors)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark' | 'mark') => {
    const file = e.target.files?.[0]
    if (!file || !orgId) return

    // Extract colors from the logo
    const colors = await extractColorsFromImage(file)
    if (colors.length > 0) {
      setExtractedColors(colors)
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const filePath = `${orgId}/logo-${type}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error('Failed to upload logo')
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)

    const key = `logo_${type}_url` as keyof Branding
    setBranding((prev) => ({ ...prev, [key]: publicUrl }))
    toast.success('Logo uploaded successfully')
  }

  const handleSave = async () => {
    if (!orgId) return
    setIsSaving(true)

    const { error } = await (supabase
      .from('org_branding') as any)
      .upsert({
        org_id: orgId,
        ...branding,
      }, { onConflict: 'org_id' })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Branding saved successfully')
    }
    setIsSaving(false)
  }

  const applyExtractedColor = (color: string, type: 'primary' | 'accent') => {
    setBranding((prev) => ({
      ...prev,
      [`${type}_color`]: color,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Branding</h1>
        <p className="text-muted-foreground">
          Customize the appearance of your dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Name</CardTitle>
          <CardDescription>Displayed in the sidebar and login page</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={branding.company_name || ''}
            onChange={(e) => setBranding((prev) => ({ ...prev, company_name: e.target.value }))}
            placeholder="Your Company Name"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logos</CardTitle>
          <CardDescription>Upload your company logos for light and dark themes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Logo (Light Background)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {branding.logo_light_url ? (
                  <img
                    src={branding.logo_light_url}
                    alt="Logo Light"
                    className="max-h-16 mx-auto mb-2"
                  />
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, 'light')}
                  id="logo-light"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-light')?.click()}
                >
                  Upload
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo (Dark Background)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center bg-gray-900">
                {branding.logo_dark_url ? (
                  <img
                    src={branding.logo_dark_url}
                    alt="Logo Dark"
                    className="max-h-16 mx-auto mb-2"
                  />
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, 'dark')}
                  id="logo-dark"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-dark')?.click()}
                >
                  Upload
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo Mark (Icon)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {branding.logo_mark_url ? (
                  <img
                    src={branding.logo_mark_url}
                    alt="Logo Mark"
                    className="max-h-16 mx-auto mb-2"
                  />
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, 'mark')}
                  id="logo-mark"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-mark')?.click()}
                >
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Colors
          </CardTitle>
          <CardDescription>
            Set your primary and accent colors. Upload a logo to auto-extract colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {extractedColors.length > 0 && (
            <div className="space-y-2">
              <Label>Extracted from Logo</Label>
              <div className="flex gap-2">
                {extractedColors.map((color, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => applyExtractedColor(color, i === 0 ? 'primary' : 'accent')}
                    title={`Click to apply: ${color}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click a color to apply it as primary or accent
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={branding.primary_color || '#1e40af'}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, primary_color: e.target.value }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={branding.primary_color || '#1e40af'}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, primary_color: e.target.value }))
                  }
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={branding.accent_color || '#f59e0b'}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, accent_color: e.target.value }))
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={branding.accent_color || '#f59e0b'}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, accent_color: e.target.value }))
                  }
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex gap-4 items-center p-4 border rounded-lg">
              <div
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: branding.primary_color || '#1e40af' }}
              >
                Primary Button
              </div>
              <div
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: branding.accent_color || '#f59e0b' }}
              >
                Accent Button
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Branding
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
