import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { computeDedupeHash, normalizeMetricValueFromPayload, sha256Hex } from '@/lib/ingestion/normalize'
import type { MappingConfigV1 } from '@/lib/ingestion/types'

function extractBearer(authHeader: string | null) {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

async function resolveByBearerToken(token: string) {
  const supabase = createServiceRoleClient()
  const tokenHash = sha256Hex(token)

  const { data: conn } = await supabase
    .from('source_connections')
    .select('id, org_id, type, config, organizations(is_demo)')
    .eq('type', 'webhook')
    .eq('config->>webhook_token_hash', tokenHash)
    .eq('status', 'active')
    .maybeSingle()

  if (!conn) return null
  const isDemo = Boolean((conn as any).organizations?.is_demo)

  return {
    orgId: conn.org_id as string,
    connectionId: conn.id as string,
    isDemo,
  }
}

async function resolveBySession(connectionIdFromQuery?: string | null) {
  const context = await getOrgContext()
  if (!context) return { error: NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 }) }
  if (!context.isAdmin) {
    return { error: NextResponse.json({ ok: false, error: 'OWNER/ADMIN required' }, { status: 403 }) }
  }
  if (context.isDemo) {
    return {
      error: NextResponse.json(
        { ok: false, code: 'DEMO_READ_ONLY', message: 'Demo org is read-only' },
        { status: 403 },
      ),
    }
  }

  const supabase = await createClient()
  const { data: conn } = await supabase
    .from('source_connections')
    .select('id, org_id, type')
    .eq('org_id', context.orgId)
    .eq('type', 'webhook')
    .eq('id', connectionIdFromQuery || '')
    .maybeSingle()

  if (!conn) return { error: NextResponse.json({ ok: false, error: 'Connection not found' }, { status: 404 }) }

  return {
    orgId: context.orgId,
    connectionId: conn.id as string,
    isDemo: false,
  }
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization')
    const token = extractBearer(auth)
    const { searchParams } = new URL(request.url)
    const connectionParam = searchParams.get('connection')

    const resolved = token
      ? await resolveByBearerToken(token)
      : (await resolveBySession(connectionParam)) as any

    if (!resolved) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 })
    }
    if (resolved.error) return resolved.error

    if (resolved.isDemo) {
      return NextResponse.json(
        { ok: false, code: 'DEMO_READ_ONLY', message: 'Demo org is read-only' },
        { status: 403 },
      )
    }

    const body = await request.json().catch(() => null)
    const eventType = String(body?.event_type || 'metric').trim() || 'metric'
    const payload = {
      event_type: eventType,
      occurred_on: body?.occurred_on,
      data: body?.data && typeof body.data === 'object' ? body.data : {},
    }

    const supabase = createServiceRoleClient()

    const runId = crypto.randomUUID()
    await supabase.from('source_runs').insert({
      id: runId,
      org_id: resolved.orgId,
      source_connection_id: resolved.connectionId,
      status: 'running',
      rows_in: 1,
    })

    const dedupeHash = computeDedupeHash({
      orgId: resolved.orgId,
      connectionId: resolved.connectionId,
      eventType,
      payload,
    })

    const { data: rawEvent, error: rawErr } = await supabase
      .from('raw_events')
      .insert({
        org_id: resolved.orgId,
        source_connection_id: resolved.connectionId,
        event_type: eventType,
        payload,
        dedupe_hash: dedupeHash,
      })
      .select('id')
      .single()

    if (rawErr) {
      await supabase.from('source_runs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        rows_valid: 0,
        rows_invalid: 1,
        error: rawErr.message,
      }).eq('id', runId)

      return NextResponse.json({ ok: false, error: rawErr.message }, { status: 400 })
    }

    const { data: mappingRow } = await supabase
      .from('field_mappings')
      .select('mapping')
      .eq('org_id', resolved.orgId)
      .eq('source_connection_id', resolved.connectionId)
      .eq('target', 'metric_values')
      .maybeSingle()

    let normalizedCount = 0
    const mapping = (mappingRow as any)?.mapping as MappingConfigV1 | undefined
    if (mapping) {
      const normalized = normalizeMetricValueFromPayload(mapping, payload)
      if (normalized) {
        const { error: mvErr } = await supabase.from('metric_values').insert({
          org_id: resolved.orgId,
          metric_key: normalized.metric_key,
          value_num: normalized.value_num,
          value_text: normalized.value_text,
          occurred_on: normalized.occurred_on,
          source: normalized.source,
        })
        if (!mvErr) normalizedCount = 1
      }
    }

    await supabase.from('source_runs').update({
      status: 'success',
      finished_at: new Date().toISOString(),
      rows_valid: normalizedCount ? 1 : 0,
      rows_invalid: normalizedCount ? 0 : 1,
    }).eq('id', runId)

    return NextResponse.json({ ok: true, rawEventId: rawEvent.id, normalizedCount, runId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Ingest failed' }, { status: 500 })
  }
}
