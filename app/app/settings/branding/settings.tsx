'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandMark } from '@/components/branding/BrandMark'
import { BrandWordmark } from '@/components/branding/BrandWordmark'
import { BRANDING_DEFAULTS, isHexColor, normalizeBranding, type OrgBranding } from '@/lib/branding'

function readOnlyProps(readOnly: boolean, reason: string) {
  return readOnly
    ? { disabled: true, title: reason, 'data-disabled-reason': reason }
    : {}
}

async function uploadBrandAsset(file: File, type: 'logo_light' | 'logo_dark' | 'mark') {
  const form = new FormData()
  form.append('type', type)
  form.append('file', file)
  const res = await fetch('/api/branding/upload', { method: 'POST', body: form })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || 'Upload failed')
  }
  return String(json.url)
}

export function BrandingSettings({
  initialBranding,
  readOnly,
}: {
  initialBranding: OrgBranding
  readOnly: boolean
}) {
  const [branding, setBranding] = useState<OrgBranding>(() => normalizeBranding(initialBranding))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo_light' | 'logo_dark' | 'mark' | null>(null)

  const reason = 'Demo org is read-only'

  const previews = useMemo(() => {
    return normalizeBranding(branding)
  }, [branding])

  async function handleUpload(type: 'logo_light' | 'logo_dark' | 'mark', file: File | null) {
    if (!file) return
    if (readOnly) {
      toast.error(reason)
      return
    }
    setUploading(type)
    try {
      const url = await uploadBrandAsset(file, type)
      setBranding((prev) => ({
        ...prev,
        ...(type === 'logo_light' ? { logo_light_url: url } : {}),
        ...(type === 'logo_dark' ? { logo_dark_url: url } : {}),
        ...(type === 'mark' ? { mark_url: url } : {}),
      }))
      toast.success('Uploaded')
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  async function save() {
    if (readOnly) {
      toast.error(reason)
      return
    }
    if (!isHexColor(branding.primary_color) || !isHexColor(branding.accent_color)) {
      toast.error('Colors must be valid hex values like #112233')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/branding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Save failed')
      setBranding(normalizeBranding(json.branding))
      toast.success('Branding saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function resetToDefault() {
    if (readOnly) {
      toast.error(reason)
      return
    }
    setBranding(BRANDING_DEFAULTS)
    toast.success('Reset to default (remember to Save)')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Brand Identity</CardTitle>
          <CardDescription>Name + tagline shown across the product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand_name">Brand name</Label>
            <Input
              id="brand_name"
              value={branding.brand_name}
              onChange={(e) => setBranding((p) => ({ ...p, brand_name: e.target.value }))}
              {...readOnlyProps(readOnly, reason)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={branding.tagline || ''}
              onChange={(e) => setBranding((p) => ({ ...p, tagline: e.target.value }))}
              placeholder="Optional"
              {...readOnlyProps(readOnly, reason)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Quick check before you save</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <BrandMark url={previews.mark_url} size={28} alt={previews.brand_name} />
            <div className="min-w-0">
              <BrandWordmark
                brandName={previews.brand_name}
                logoLightUrl={previews.logo_light_url}
                logoDarkUrl={previews.logo_dark_url}
                height={22}
              />
              <div className="text-xs text-muted-foreground truncate">
                {previews.tagline || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Primary</div>
              <div
                className="h-8 w-16 rounded border"
                style={{ backgroundColor: previews.primary_color }}
              />
              <div className="font-mono text-xs">{previews.primary_color}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Accent</div>
              <div
                className="h-8 w-16 rounded border"
                style={{ backgroundColor: previews.accent_color }}
              />
              <div className="font-mono text-xs">{previews.accent_color}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving || readOnly} {...readOnlyProps(readOnly, reason)}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefault}
              disabled={readOnly}
              {...readOnlyProps(readOnly, reason)}
            >
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logos</CardTitle>
          <CardDescription>Upload light/dark logos and the mark (icon)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Light logo</Label>
              <div className="h-20 rounded border bg-muted/30 flex items-center justify-center overflow-hidden">
                {branding.logo_light_url ? (
                  <img src={branding.logo_light_url} alt="Light logo" className="max-h-16 object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">Not set</span>
                )}
              </div>
              <Input
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                onChange={(e) => handleUpload('logo_light', e.target.files?.[0] || null)}
                {...readOnlyProps(readOnly, reason)}
              />
              {uploading === 'logo_light' && <div className="text-xs text-muted-foreground">Uploading…</div>}
            </div>

            <div className="space-y-2">
              <Label>Dark logo</Label>
              <div className="h-20 rounded border bg-muted/30 flex items-center justify-center overflow-hidden">
                {branding.logo_dark_url ? (
                  <img src={branding.logo_dark_url} alt="Dark logo" className="max-h-16 object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">Not set</span>
                )}
              </div>
              <Input
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                onChange={(e) => handleUpload('logo_dark', e.target.files?.[0] || null)}
                {...readOnlyProps(readOnly, reason)}
              />
              {uploading === 'logo_dark' && <div className="text-xs text-muted-foreground">Uploading…</div>}
            </div>

            <div className="space-y-2">
              <Label>Mark / App icon</Label>
              <div className="h-20 rounded border bg-muted/30 flex items-center justify-center overflow-hidden">
                <BrandMark url={branding.mark_url} size={40} alt="Mark" />
              </div>
              <Input
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                onChange={(e) => handleUpload('mark', e.target.files?.[0] || null)}
                {...readOnlyProps(readOnly, reason)}
              />
              {uploading === 'mark' && <div className="text-xs text-muted-foreground">Uploading…</div>}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Recommended: SVG or transparent PNG. Max size 2MB.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>Primary + accent colors used for UI accents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary_color"
                  value={branding.primary_color}
                  onChange={(e) => setBranding((p) => ({ ...p, primary_color: e.target.value }))}
                  placeholder="#0A192F"
                  {...readOnlyProps(readOnly, reason)}
                />
                <input
                  type="color"
                  value={isHexColor(branding.primary_color) ? branding.primary_color : '#0A192F'}
                  onChange={(e) => setBranding((p) => ({ ...p, primary_color: e.target.value }))}
                  disabled={readOnly}
                  title={readOnly ? reason : 'Pick primary color'}
                  className="h-10 w-12 rounded border bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="accent_color"
                  value={branding.accent_color}
                  onChange={(e) => setBranding((p) => ({ ...p, accent_color: e.target.value }))}
                  placeholder="#007BFF"
                  {...readOnlyProps(readOnly, reason)}
                />
                <input
                  type="color"
                  value={isHexColor(branding.accent_color) ? branding.accent_color : '#007BFF'}
                  onChange={(e) => setBranding((p) => ({ ...p, accent_color: e.target.value }))}
                  disabled={readOnly}
                  title={readOnly ? reason : 'Pick accent color'}
                  className="h-10 w-12 rounded border bg-transparent"
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Colors apply immediately in this tab after saving (hard refresh may be needed in other tabs).
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

