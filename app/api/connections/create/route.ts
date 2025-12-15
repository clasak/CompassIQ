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
    const type = String(body?.type || '').trim()
    const name = String(body?.name || '').trim()

    if (!['csv', 'webhook'].includes(type)) {
      return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const config: any = {}
    let token: string | null = null
    if (type === 'webhook') {
      token = randomToken()
      config.webhook_token_hash = sha256Hex(token)
      config.webhook_token_prefix = token.slice(0, 6)
    }

    const { data, error } = await supabase
      .from('source_connections')
      .insert({
        org_id: context.orgId,
        type,
        name,
        status: 'active',
        config,
        created_by: user?.id || null,
      })
      .select('id, org_id, type, name, status, config, created_at')
      .single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, connection: data, token })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Create failed' }, { status: 500 })
  }
}

