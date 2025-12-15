import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'

function randomToken() {
  return crypto.randomBytes(32).toString('base64url')
}

function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export async function POST(request: Request) {
  try {
    const context = await getOrgContext()
    if (!context) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    if (!context.isAdmin) {
      return NextResponse.json({ ok: false, error: 'OWNER/ADMIN required' }, { status: 403 })
    }
    if (context.isDemo) {
      return NextResponse.json(
        { ok: false, code: 'DEMO_READ_ONLY', message: 'Demo org is read-only' },
        { status: 403 },
      )
    }

    const body = await request.json().catch(() => null)
    const connectionId = String(body?.connection_id || '').trim()
    if (!connectionId) return NextResponse.json({ ok: false, error: 'connection_id required' }, { status: 400 })

    const supabase = await createClient()
    const { data: existing, error: loadError } = await supabase
      .from('source_connections')
      .select('id, org_id, type, config')
      .eq('id', connectionId)
      .eq('org_id', context.orgId)
      .single()

    if (loadError || !existing) {
      return NextResponse.json({ ok: false, error: 'Connection not found' }, { status: 404 })
    }
    if (existing.type !== 'webhook') {
      return NextResponse.json({ ok: false, error: 'Not a webhook connection' }, { status: 400 })
    }

    const token = randomToken()
    const nextConfig = { ...(existing.config || {}) }
    nextConfig.webhook_token_hash = sha256Hex(token)
    nextConfig.webhook_token_prefix = token.slice(0, 6)

    const { data: updated, error } = await supabase
      .from('source_connections')
      .update({ config: nextConfig })
      .eq('id', connectionId)
      .eq('org_id', context.orgId)
      .select('id, org_id, type, name, status, config, created_at')
      .single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, connection: updated, token })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Regenerate failed' }, { status: 500 })
  }
}

