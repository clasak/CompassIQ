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

// CompassIQ Logo Colors - Maximum contrast for clarity
const defaultColors = [
  '#C3F320',  // Lime Green (arrow) - Hue 74°
  '#00A4A9',  // Teal (IQ text) - Hue 182°
  '#052974',  // Dark Blue (ring) - Hue 221°
  '#3ECE35',  // Medium Green (arrow) - Hue 116°
  '#B7F026',  // Yellow-Lime (arrow tip) - Hue 77°
  '#C3F320',  // Lime repeat
  '#00A4A9',  // Teal repeat
  '#052974',  // Blue repeat
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


