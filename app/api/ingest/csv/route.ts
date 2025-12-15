import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { computeDedupeHash, normalizeMetricValueFromPayload } from '@/lib/ingestion/normalize'
import type { MappingConfigV1 } from '@/lib/ingestion/types'

const MAX_BYTES = 2 * 1024 * 1024

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    // ignore empty last line
    if (row.length === 1 && row[0] === '' && rows.length === 0) return
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1]
        if (next === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }

    if (c === '"') {
      inQuotes = true
      continue
    }
    if (c === ',') {
      pushField()
      continue
    }
    if (c === '\n') {
      pushField()
      pushRow()
      continue
    }
    if (c === '\r') continue
    field += c
  }
  pushField()
  if (row.length) pushRow()

  return rows
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

    const form = await request.formData()
    const connectionId = String(form.get('source_connection_id') || '').trim()
    const file = form.get('file')
    if (!connectionId) return NextResponse.json({ ok: false, error: 'source_connection_id required' }, { status: 400 })
    if (!file || typeof file === 'string') return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 })

    const size = Number((file as File).size || 0)
    if (!size || size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'File too large (max 2MB)' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: conn } = await supabase
      .from('source_connections')
      .select('id, type')
      .eq('org_id', context.orgId)
      .eq('id', connectionId)
      .maybeSingle()

    if (!conn) return NextResponse.json({ ok: false, error: 'Connection not found' }, { status: 404 })
    if (conn.type !== 'csv') return NextResponse.json({ ok: false, error: 'Not a CSV connection' }, { status: 400 })

    const service = createServiceRoleClient()
    const runId = crypto.randomUUID()
    await service.from('source_runs').insert({
      id: runId,
      org_id: context.orgId,
      source_connection_id: connectionId,
      status: 'running',
      rows_in: 0,
    })

    const content = await (file as File).text()
    const parsed = parseCsv(content)
    if (parsed.length < 2) {
      await service.from('source_runs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        rows_in: parsed.length,
        rows_valid: 0,
        rows_invalid: parsed.length,
        error: 'CSV must include header row and at least one data row',
      }).eq('id', runId)
      return NextResponse.json({ ok: false, error: 'Invalid CSV (needs header + rows)' }, { status: 400 })
    }

    const headers = parsed[0].map((h) => h.trim())
    const rows = parsed.slice(1)

    const { data: mappingRow } = await service
      .from('field_mappings')
      .select('mapping')
      .eq('org_id', context.orgId)
      .eq('source_connection_id', connectionId)
      .eq('target', 'metric_values')
      .maybeSingle()

    const mapping = (mappingRow as any)?.mapping as MappingConfigV1 | undefined

    let rowsValid = 0
    let rowsInvalid = 0
    let rowsIn = 0

    for (let idx = 0; idx < rows.length; idx++) {
      const rowVals = rows[idx]
      if (rowVals.length === 1 && rowVals[0] === '') continue
      rowsIn++
      const obj: Record<string, any> = {}
      headers.forEach((h, i) => {
        obj[h] = rowVals[i] ?? ''
      })

      const payload = { data: obj, row_index: idx + 1 }
      const dedupeHash = computeDedupeHash({
        orgId: context.orgId,
        connectionId,
        eventType: 'csv_row',
        payload,
      })

      // Store raw event
      const { error: rawErr } = await service.from('raw_events').insert({
        org_id: context.orgId,
        source_connection_id: connectionId,
        event_type: 'csv_row',
        payload,
        dedupe_hash: dedupeHash,
      })

      if (rawErr) {
        rowsInvalid++
        continue
      }

      if (!mapping) {
        rowsInvalid++
        continue
      }

      const normalized = normalizeMetricValueFromPayload(mapping, payload)
      if (!normalized) {
        rowsInvalid++
        continue
      }

      const { error: mvErr } = await service.from('metric_values').insert({
        org_id: context.orgId,
        metric_key: normalized.metric_key,
        value_num: normalized.value_num,
        value_text: normalized.value_text,
        occurred_on: normalized.occurred_on,
        source: normalized.source,
      })

      if (mvErr) rowsInvalid++
      else rowsValid++
    }

    await service.from('source_runs').update({
      status: 'success',
      finished_at: new Date().toISOString(),
      rows_in: rowsIn,
      rows_valid: rowsValid,
      rows_invalid: rowsInvalid,
    }).eq('id', runId)

    return NextResponse.json({ ok: true, runId, rows_in: rowsIn, rows_valid: rowsValid, rows_invalid: rowsInvalid })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Import failed' }, { status: 500 })
  }
}

