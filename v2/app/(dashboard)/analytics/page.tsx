'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, formatPercent } from '@/lib/utils'

// Revenue by channel data
const revenueByChannel = [
  { channel: 'Direct Sales', value: 1250000, percentage: 45, trend: 12 },
  { channel: 'Partner Referrals', value: 680000, percentage: 24, trend: 8 },
  { channel: 'Marketing Leads', value: 520000, percentage: 19, trend: -3 },
  { channel: 'Inbound', value: 340000, percentage: 12, trend: 15 },
]

// Win/Loss analysis
const winLossData = [
  { reason: 'Price', won: 12, lost: 28, total: 40 },
  { reason: 'Feature Gap', won: 8, lost: 22, total: 30 },
  { reason: 'Timing', won: 15, lost: 10, total: 25 },
  { reason: 'Competition', won: 6, lost: 19, total: 25 },
  { reason: 'Relationship', won: 18, lost: 7, total: 25 },
]

// Monthly performance
const monthlyPerformance = [
  { month: 'Aug', revenue: 1900000, target: 2000000, deals: 38 },
  { month: 'Sep', revenue: 2100000, target: 2200000, deals: 42 },
  { month: 'Oct', revenue: 2500000, target: 2400000, deals: 48 },
  { month: 'Nov', revenue: 2300000, target: 2600000, deals: 44 },
  { month: 'Dec', revenue: 2800000, target: 2800000, deals: 52 },
  { month: 'Jan', revenue: 2650000, target: 3000000, deals: 49 },
]

// Rep performance
const repPerformance = [
  { name: 'Sarah Chen', quota: 112, deals: 18, avgDeal: 68000, winRate: 42 },
  { name: 'Mike Johnson', quota: 95, deals: 14, avgDeal: 52000, winRate: 38 },
  { name: 'James Wilson', quota: 88, deals: 12, avgDeal: 71000, winRate: 35 },
  { name: 'Emma Davis', quota: 78, deals: 10, avgDeal: 48000, winRate: 31 },
  { name: 'Chris Park', quota: 65, deals: 8, avgDeal: 45000, winRate: 28 },
]

function HorizontalBar({ 
  label, 
  value, 
  maxValue, 
  color = 'pipeline',
  delay = 0,
}: {
  label: string
  value: number
  maxValue: number
  color?: string
  delay?: number
}) {
  const percentage = (value / maxValue) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-text-primary tabular-nums">
          {formatCurrency(value)}
        </span>
      </div>
      <div className="h-3 bg-surface-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          className={`h-full rounded-full bg-${color}`}
        />
      </div>
    </motion.div>
  )
}

function WinLossBar({ 
  reason, 
  won, 
  lost, 
  total,
  delay = 0,
}: {
  reason: string
  won: number
  lost: number
  total: number
  delay?: number
}) {
  const wonPct = (won / total) * 100
  const lostPct = (lost / total) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{reason}</span>
        <span className="text-xs text-text-tertiary">
          <span className="text-revenue">{won}W</span>
          {' / '}
          <span className="text-danger">{lost}L</span>
        </span>
      </div>
      <div className="h-2 bg-surface-subtle rounded-full overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${wonPct}%` }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
          className="h-full bg-revenue"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${lostPct}%` }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="h-full bg-danger"
        />
      </div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m')
  
  const totalRevenue = revenueByChannel.reduce((sum, c) => sum + c.value, 0)
  const avgWinRate = Math.round(repPerformance.reduce((sum, r) => sum + r.winRate, 0) / repPerformance.length)
  const totalDeals = monthlyPerformance.reduce((sum, m) => sum + m.deals, 0)
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics Suite"
        description="Deep-dive business intelligence and performance analysis"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-surface-overlay rounded-lg p-1">
              {['1m', '3m', '6m', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timeRange === range
                      ? 'bg-pipeline text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          trend={8.5}
          icon={TrendingUp}
          variant="success"
          delay={0}
        />
        <StatCard
          label="Avg Win Rate"
          value={`${avgWinRate}%`}
          trend={2.1}
          icon={BarChart3}
          variant="success"
          delay={0.1}
        />
        <StatCard
          label="Total Deals"
          value={totalDeals.toString()}
          trend={12}
          icon={PieChart}
          delay={0.2}
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(56800)}
          trend={-1.8}
          icon={LineChart}
          variant="warning"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue by Channel</CardTitle>
              <CardDescription>Source attribution analysis</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {revenueByChannel.map((channel, i) => (
              <div key={channel.channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {channel.channel}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-text-secondary tabular-nums">
                      {channel.percentage}%
                    </span>
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${
                      channel.trend >= 0 ? 'text-revenue' : 'text-danger'
                    }`}>
                      {channel.trend >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(channel.trend)}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-surface-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${channel.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full bg-pipeline"
                  />
                </div>
                <div className="text-xs text-text-tertiary">
                  {formatCurrency(channel.value)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Win/Loss Analysis */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Win/Loss Analysis</CardTitle>
              <CardDescription>Primary deal outcome factors</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {winLossData.map((item, i) => (
              <WinLossBar
                key={item.reason}
                reason={item.reason}
                won={item.won}
                lost={item.lost}
                total={item.total}
                delay={i * 0.1}
              />
            ))}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-revenue" />
                  Won
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  Lost
                </span>
              </div>
              <span>Based on 145 deals analyzed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Trend */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Revenue vs target with deal volume</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyPerformance.map((month, i) => {
              const attainment = (month.revenue / month.target) * 100
              const isAboveTarget = attainment >= 100
              
              return (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-1">
                    <span className="text-sm font-medium text-text-secondary">
                      {month.month}
                    </span>
                  </div>
                  <div className="col-span-7">
                    <div className="relative h-8 bg-surface-subtle rounded-lg overflow-hidden">
                      {/* Target marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-text-tertiary/50 z-10"
                        style={{ left: '100%' }}
                      />
                      {/* Revenue bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(attainment, 100)}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={`absolute top-0 bottom-0 left-0 rounded-lg ${
                          isAboveTarget ? 'bg-revenue' : 'bg-pipeline'
                        }`}
                      />
                      {attainment > 100 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${attainment - 100}%` }}
                          transition={{ duration: 0.3, delay: i * 0.1 + 0.3 }}
                          className="absolute top-0 bottom-0 left-full bg-revenue/50 rounded-r-lg"
                          style={{ maxWidth: '20%' }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-mono text-sm text-text-primary tabular-nums">
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className={`text-xs font-medium ${
                      isAboveTarget ? 'text-revenue' : 'text-warning'
                    }`}>
                      {Math.round(attainment)}%
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-xs text-text-tertiary">
                      {month.deals} deals
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pipeline" />
                Below Target
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-revenue" />
                At/Above Target
              </span>
            </div>
            <span>Target shown as vertical line</span>
          </div>
        </CardContent>
      </Card>

      {/* Rep Performance Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Rep Performance</CardTitle>
            <CardDescription>Individual sales metrics breakdown</CardDescription>
          </div>
          <Button variant="secondary" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4 text-left">
                    Rep
                  </th>
                  <th className="text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4 text-center">
                    Quota Attainment
                  </th>
                  <th className="text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4 text-right">
                    Deals Closed
                  </th>
                  <th className="text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4 text-right">
                    Avg Deal Size
                  </th>
                  <th className="text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4 text-right">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {repPerformance.map((rep, i) => (
                  <motion.tr
                    key={rep.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="border-b border-border-subtle hover:bg-surface-overlay transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-text-primary">
                        {rep.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-surface-subtle rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(rep.quota, 100)}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`h-full rounded-full ${
                              rep.quota >= 100 ? 'bg-revenue' :
                              rep.quota >= 80 ? 'bg-warning' : 'bg-danger'
                            }`}
                          />
                        </div>
                        <span className={`font-mono text-sm tabular-nums ${
                          rep.quota >= 100 ? 'text-revenue' :
                          rep.quota >= 80 ? 'text-warning' : 'text-danger'
                        }`}>
                          {rep.quota}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm text-text-primary tabular-nums">
                        {rep.deals}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm text-text-primary tabular-nums">
                        {formatCurrency(rep.avgDeal)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono text-sm tabular-nums ${
                        rep.winRate >= 40 ? 'text-revenue' :
                        rep.winRate >= 30 ? 'text-text-primary' : 'text-warning'
                      }`}>
                        {rep.winRate}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
