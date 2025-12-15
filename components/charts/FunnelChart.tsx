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
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="stage" 
          type="category" 
          width={120}
          tickFormatter={formatStageLabel}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'count') return [value, 'Count']
            if (name === 'amount') return [`$${value.toLocaleString()}`, 'Amount']
            return [value, name]
          }}
          labelFormatter={(label) => formatStageLabel(label)}
        />
        <Bar dataKey="count" fill="#8884d8" name="Count">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
        {showAmount && (
          <Bar dataKey="amount" fill="#82ca9d" name="Amount">
            {data.map((entry, index) => (
              <Cell key={`cell-amount-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}


