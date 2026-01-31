export type ConnectionType = 'csv' | 'webhook'

export type MappingConfigV1 = {
  version: 1
  target: 'metric_values'
  metric_key: string
  occurred_on: { mode: 'field'; field: string } | { mode: 'today' }
  value_num?: { field: string }
  value_text?: { field: string }
  source?: { mode: 'fixed'; value: string } | { mode: 'field'; field: string }
}

export type NormalizedMetricValue = {
  metric_key: string
  occurred_on: string // YYYY-MM-DD
  value_num: number | null
  value_text: string | null
  source: string | null
}

