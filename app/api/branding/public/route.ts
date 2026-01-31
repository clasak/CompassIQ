import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const DEFAULTS = {
  brand_name: 'CompassIQ',
  tagline: null as string | null,
  logo_light_url: null as string | null,
  logo_dark_url: null as string | null,
  mark_url: null as string | null,
  primary_color: '#0A192F',
  accent_color: '#007BFF',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = (searchParams.get('slug') || '').trim()
  if (!slug) {
    return NextResponse.json({ ok: true, branding: DEFAULTS })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ ok: true, branding: DEFAULTS })
  }

  try {
    const supabase = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data, error } = await supabase.rpc('get_public_branding', { p_org_slug: slug })
    if (error) {
      return NextResponse.json({ ok: true, branding: DEFAULTS })
    }
    const row = Array.isArray(data) ? data[0] : data
    return NextResponse.json({
      ok: true,
      branding: {
        brand_name: row?.brand_name ?? DEFAULTS.brand_name,
        tagline: row?.tagline ?? DEFAULTS.tagline,
        logo_light_url: row?.logo_light_url ?? DEFAULTS.logo_light_url,
        logo_dark_url: row?.logo_dark_url ?? DEFAULTS.logo_dark_url,
        mark_url: row?.mark_url ?? DEFAULTS.mark_url,
        primary_color: row?.primary_color ?? DEFAULTS.primary_color,
        accent_color: row?.accent_color ?? DEFAULTS.accent_color,
      },
    })
  } catch {
    return NextResponse.json({ ok: true, branding: DEFAULTS })
  }
}

