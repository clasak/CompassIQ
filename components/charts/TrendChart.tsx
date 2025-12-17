'use client'

import { memo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendData {
  period: string
  value: number
  [key: string]: string | number
}

interface TrendChartProps {
  data: TrendData[]
  dataKey?: string
  name?: string
  color?: string
}

export const TrendChart = memo(function TrendChart({ 
  data, 
  dataKey = 'value', 
  name = 'Value',
  color = '#00A4A9'  // Teal from logo
}: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))"
          opacity={0.3}
        />
        <XAxis 
          dataKey="period" 
          tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.3 }}
        />
        <YAxis 
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
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted))' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          name={name}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})



