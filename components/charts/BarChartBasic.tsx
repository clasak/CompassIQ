'use client'

import { memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface BarChartData {
  name: string
  value: number
  [key: string]: string | number
}

interface BarChartBasicProps {
  data: BarChartData[]
  dataKey?: string
  name?: string
  colors?: string[]
}

// BI Sleek Enhanced Color Palette - Professional Data Viz
const defaultColors = [
  'hsl(var(--chart-1))',  // Primary Blue
  'hsl(var(--chart-2))',  // Cyan
  'hsl(var(--chart-3))',  // Green
  'hsl(var(--chart-4))',  // Purple
  'hsl(var(--chart-5))',  // Orange
  'hsl(var(--chart-6))',  // Pink
  'hsl(var(--chart-7))',  // Teal
  'hsl(var(--chart-8))',  // Coral
]

export const BarChartBasic = memo(function BarChartBasic({
  data,
  dataKey = 'value',
  name = 'Value',
  colors = defaultColors,
}: BarChartBasicProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.2}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--surface))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '12px',
            boxShadow: 'var(--shadow-lg)',
          }}
          labelStyle={{
            color: 'hsl(var(--text))',
            fontWeight: 600,
            marginBottom: '6px'
          }}
          cursor={{ fill: 'hsl(var(--surface-hover))', opacity: 0.15 }}
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            color: 'hsl(var(--text-secondary))',
            paddingTop: '16px'
          }}
        />
        <Bar
          dataKey={dataKey}
          name={name}
          radius={[6, 6, 0, 0]}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={colors[index % colors.length]}
              opacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})
