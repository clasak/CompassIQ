import { NextResponse } from 'next/server'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'

function isHexColor(value: unknown) {
  if (typeof value !== 'string') return false
  return /^#[0-9a-fA-F]{6}$/.test(value.trim())
}

export async function POST(request: Request) {
  try {
    const context = await getOrgContext()
    if (!context) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }
    if (!context.isAdmin) {
      return NextResponse.json({ ok: false, error: 'OWNER/ADMIN required' }, { status: 403 })
    }
    if (context.isDemo) {
      return NextResponse.json({ ok: false, error: 'Demo org is read-only' }, { status: 403 })
    }

    const payload = await request.json().catch(() => null)
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const brandName =
      typeof payload.brand_name === 'string' && payload.brand_name.trim().length
        ? payload.brand_name.trim()
        : 'CompassIQ'

    const primaryColor = isHexColor(payload.primary_color) ? payload.primary_color.trim() : '#0A192F'
    const accentColor = isHexColor(payload.accent_color) ? payload.accent_color.trim() : '#007BFF'

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('org_branding')
      .upsert(
        {
          org_id: context.orgId,
          brand_name: brandName,
          tagline: typeof payload.tagline === 'string' ? payload.tagline.trim() : null,
          logo_light_url: typeof payload.logo_light_url === 'string' ? payload.logo_light_url.trim() : null,
          logo_dark_url: typeof payload.logo_dark_url === 'string' ? payload.logo_dark_url.trim() : null,
          mark_url: typeof payload.mark_url === 'string' ? payload.mark_url.trim() : null,
          primary_color: primaryColor,
          accent_color: accentColor,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' },
      )
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, branding: data })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Save failed' },
      { status: 500 },
    )
  }
}

