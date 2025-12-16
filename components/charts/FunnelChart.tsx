'use client'

import { memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface FunnelData {
  stage: string
  count: number
  amount: number
}

interface FunnelChartProps {
  data: FunnelData[]
  showAmount?: boolean
}

// Format stage enum values to readable labels
function formatStageLabel(stage: string): string {
  return stage.charAt(0) + stage.slice(1).toLowerCase()
}

export const FunnelChart = memo(function FunnelChart({ data, showAmount = false }: FunnelChartProps) {
  // Professional BI color palette - cohesive blue-teal gradient
  const colors = [
    '#3B82F6', // Primary blue
    '#0EA5E9', // Sky blue
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#10B981', // Emerald (success)
    '#6B7280', // Gray (lost/neutral)
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 0, bottom: 8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.4}
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis
          dataKey="stage"
          type="category"
          width={85}
          tickFormatter={formatStageLabel}
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--surface-2))', opacity: 0.5 }}
          contentStyle={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '6px' }}
          formatter={(value: number, name: string) => {
            if (name === 'count') return [value.toLocaleString(), 'Opportunities']
            if (name === 'amount') return [`$${value.toLocaleString()}`, 'Value']
            return [value, name]
          }}
          labelFormatter={(label) => formatStageLabel(label)}
        />
        <Bar dataKey="count" name="Count" radius={[0, 6, 6, 0]} barSize={32}>
          {data.map((entry, index) => (
            <Cell key={entry.stage} fill={colors[index % colors.length]} />
          ))}
        </Bar>
        {showAmount && (
          <Bar dataKey="amount" name="Amount" radius={[0, 6, 6, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`${entry.stage}-amount`} fill={colors[index % colors.length]} opacity={0.6} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
})


