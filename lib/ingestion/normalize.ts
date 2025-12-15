import crypto from 'crypto'
import type { MappingConfigV1, NormalizedMetricValue } from './types'

function stableStringify(value: any): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const keys = Object.keys(value).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`
}

export function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function computeDedupeHash(params: {
  orgId: string
  connectionId: string | null
  eventType: string
  payload: any
}) {
  const base = stableStringify({
    orgId: params.orgId,
    connectionId: params.connectionId,
    eventType: params.eventType,
    payload: params.payload,
  })
  return sha256Hex(base)
}

function pickField(data: Record<string, any>, field: string) {
  if (!data || typeof data !== 'object') return undefined
  return data[field]
}

function toIsoDate(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') {
    const s = value.trim()
    // Accept YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    return null
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10)
  return null
}

function toNumber(value: any): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const n = Number(trimmed.replace(/,/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function normalizeMetricValueFromPayload(mapping: MappingConfigV1, payload: any): NormalizedMetricValue | null {
  const data = payload?.data
  if (!data || typeof data !== 'object') return null

  const occurredOn =
    mapping.occurred_on.mode === 'today'
      ? new Date().toISOString().slice(0, 10)
      : toIsoDate(pickField(data, mapping.occurred_on.field))

  if (!occurredOn) return null

  const valueNum = mapping.value_num?.field ? toNumber(pickField(data, mapping.value_num.field)) : null
  const valueText =
    mapping.value_text?.field ? String(pickField(data, mapping.value_text.field) ?? '') || null : null

  const source =
    mapping.source?.mode === 'fixed'
      ? (mapping.source.value || null)
      : mapping.source?.mode === 'field'
        ? (String(pickField(data, mapping.source.field) ?? '') || null)
        : null

  // Require at least one value type
  if (valueNum === null && !valueText) return null

  return {
    metric_key: mapping.metric_key,
    occurred_on: occurredOn,
    value_num: valueNum,
    value_text: valueText,
    source,
  }
}

