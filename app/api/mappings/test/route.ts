import { NextResponse } from 'next/server'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'
import { normalizeMetricValueFromPayload } from '@/lib/ingestion/normalize'
import type { MappingConfigV1 } from '@/lib/ingestion/types'

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
    if (!connectionId) {
      return NextResponse.json({ ok: false, error: 'source_connection_id required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: mappingRow } = await supabase
      .from('field_mappings')
      .select('mapping')
      .eq('org_id', context.orgId)
      .eq('source_connection_id', connectionId)
      .eq('target', 'metric_values')
      .maybeSingle()

    const mapping = (mappingRow as any)?.mapping as MappingConfigV1 | undefined
    if (!mapping) {
      return NextResponse.json({ ok: false, error: 'No mapping configured' }, { status: 404 })
    }

    const { data: raws } = await supabase
      .from('raw_events')
      .select('payload, received_at')
      .eq('org_id', context.orgId)
      .eq('source_connection_id', connectionId)
      .order('received_at', { ascending: false })
      .limit(20)

    const previews =
      raws?.map((r: any) => ({ received_at: r.received_at, normalized: normalizeMetricValueFromPayload(mapping, r.payload) })) ||
      []

    return NextResponse.json({
      ok: true,
      preview: previews.filter((p: any) => p.normalized).slice(0, 20),
      nullCount: previews.filter((p: any) => !p.normalized).length,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Test failed' }, { status: 500 })
  }
}

