import { NextResponse } from 'next/server'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'
import type { MappingConfigV1 } from '@/lib/ingestion/types'

function isMappingV1(value: any): value is MappingConfigV1 {
  return (
    value &&
    typeof value === 'object' &&
    value.version === 1 &&
    value.target === 'metric_values' &&
    typeof value.metric_key === 'string' &&
    value.metric_key.length > 0 &&
    value.occurred_on &&
    (value.occurred_on.mode === 'today' ||
      (value.occurred_on.mode === 'field' && typeof value.occurred_on.field === 'string'))
  )
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
    const connectionId = String(body?.source_connection_id || '').trim()
    const mapping = body?.mapping

    if (!connectionId) {
      return NextResponse.json({ ok: false, error: 'source_connection_id required' }, { status: 400 })
    }
    if (!isMappingV1(mapping)) {
      return NextResponse.json({ ok: false, error: 'Invalid mapping' }, { status: 400 })
    }

    const supabase = await createClient()
    // Ensure connection belongs to org (RLS should also enforce)
    const { data: conn } = await supabase
      .from('source_connections')
      .select('id')
      .eq('org_id', context.orgId)
      .eq('id', connectionId)
      .maybeSingle()

    if (!conn) return NextResponse.json({ ok: false, error: 'Connection not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('field_mappings')
      .upsert(
        {
          org_id: context.orgId,
          source_connection_id: connectionId,
          target: 'metric_values',
          mapping,
          transform: {},
        },
        { onConflict: 'org_id,source_connection_id,target' },
      )
      .select('id, org_id, source_connection_id, target, mapping, updated_at')
      .single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, field_mapping: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Save failed' }, { status: 500 })
  }
}

