import { NextResponse } from 'next/server'
import { getOrgContext } from '@/lib/org-context'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const BUCKET = 'brand-assets'
const MAX_BYTES = 2 * 1024 * 1024

const TYPE_MAP: Record<string, string> = {
  logo_light: 'logo-light',
  logo_dark: 'logo-dark',
  mark: 'mark',
}

const ALLOWED_MIME = new Set(['image/png', 'image/svg+xml', 'image/webp'])

function extFromMime(mime: string) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/svg+xml') return 'svg'
  return null
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

    const form = await request.formData()
    const type = String(form.get('type') || '')
    const file = form.get('file')

    const base = TYPE_MAP[type]
    if (!base) {
      return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 })
    }
    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 })
    }

    const mime = (file as File).type || ''
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file type (png/svg/webp only)' },
        { status: 400 },
      )
    }

    const size = Number((file as File).size || 0)
    if (!size || size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'File too large (max 2MB)' },
        { status: 400 },
      )
    }

    const ext = extFromMime(mime)
    if (!ext) {
      return NextResponse.json({ ok: false, error: 'Unsupported mime' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: false, error: 'Supabase env not configured' }, { status: 500 })
    }

    const supabase = createServiceRoleClient()
    const bytes = Buffer.from(await (file as File).arrayBuffer())

    const objectPath = `${context.orgId}/${base}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, { upsert: true, contentType: mime })

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 400 })
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
    return NextResponse.json({
      ok: true,
      type,
      path: objectPath,
      url: data.publicUrl,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Upload failed' },
      { status: 500 },
    )
  }
}

