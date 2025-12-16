'use client'

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

// BI Sleek color palette: primary for current, neutral for baseline, accent for emphasis
const defaultColors = [
  'hsl(var(--primary))',      // Primary color
  'hsl(var(--accent))',        // Accent color
  'hsl(var(--muted))',         // Neutral/baseline
  'hsl(var(--success))',        // Success
  'hsl(var(--warning))',        // Warning
]

export function BarChartBasic({
  data,
  dataKey = 'value',
  name = 'Value',
  colors = defaultColors,
}: BarChartBasicProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))"
          opacity={0.3}
        />
        <XAxis 
          dataKey="name" 
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
        <Bar dataKey={dataKey} name={name} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}



