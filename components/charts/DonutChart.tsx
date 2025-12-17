'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface DonutChartProps {
  /** Data array with name and value */
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  /** Center text (e.g., total value) */
  centerText?: string
  /** Center label */
  centerLabel?: string
  /** Chart height */
  height?: number
  /** Inner radius ratio (0-1) */
  innerRadius?: number
  /** Show legend */
  showLegend?: boolean
  /** Custom colors array */
  colors?: string[]
  /** Custom class name */
  className?: string
}

const defaultColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
]

export function DonutChart({
  data,
  centerText,
  centerLabel,
  height = 300,
  innerRadius = 0.6,
  showLegend = true,
  colors = defaultColors,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const outerRadius = Math.min(height / 2 - 20, 120)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const percentage = ((item.value / total) * 100).toFixed(1)
      return (
        <div className="bg-popover border rounded-lg shadow-lg px-3 py-2">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={outerRadius * innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            animationDuration={500}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      {(centerText || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerText && (
            <span className="text-2xl font-bold">{centerText}</span>
          )}
          {centerLabel && (
            <span className="text-sm text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
