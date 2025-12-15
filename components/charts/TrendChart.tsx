'use client'

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
}

export function TrendChart({ data, dataKey = 'value', name = 'Value' }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#8884d8"
          name={name}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


