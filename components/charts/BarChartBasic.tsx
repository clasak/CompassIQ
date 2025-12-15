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

export function BarChartBasic({
  data,
  dataKey = 'value',
  name = 'Value',
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'],
}: BarChartBasicProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} name={name} fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}


