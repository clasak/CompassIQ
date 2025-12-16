'use client'

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

export function FunnelChart({ data, showAmount = true }: FunnelChartProps) {
  // BI Sleek colors: primary for current, neutral for baseline
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--danger))',
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))"
          opacity={0.3}
        />
        <XAxis 
          type="number" 
          tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
        />
        <YAxis 
          dataKey="stage" 
          type="category" 
          width={120}
          tickFormatter={formatStageLabel}
          tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: 'hsl(var(--text))', fontWeight: 600, marginBottom: '4px' }}
          formatter={(value: number, name: string) => {
            if (name === 'count') return [value, 'Count']
            if (name === 'amount') return [`$${value.toLocaleString()}`, 'Amount']
            return [value, name]
          }}
          labelFormatter={(label) => formatStageLabel(label)}
        />
        <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
        {showAmount && (
          <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-amount-${index}`} fill={colors[index % colors.length]} opacity={0.7} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}


