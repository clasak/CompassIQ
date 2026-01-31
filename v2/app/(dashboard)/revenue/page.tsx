'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { HeroMetric } from '@/components/ui/hero-metric'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, StatusBadge, CurrencyCell, DateCell } from '@/components/ui/data-table'
import { FunnelChart } from '@/components/ui/funnel-chart'
import { formatCurrency } from '@/lib/utils'
import { kpis, funnelData, recentDeals, teamPerformance } from '@/lib/mock-data'
import {
  TrendingUp,
  Target,
  Users,
  Calendar,
  ArrowRight,
  Filter,
  Download,
  BarChart3,
  Trophy,
} from 'lucide-react'

export default function RevenuePage() {
  const forecast30 = recentDeals
    .filter((d) => new Date(d.closeDate) <= new Date('2026-02-28'))
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0)

  const forecast60 = recentDeals.reduce(
    (sum, d) => sum + d.value * (d.probability / 100),
    0
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Revenue Engine"
        description="Pipeline management and sales forecasting"
        actions={
          <div className="flex items-center gap-3">
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

      {/* Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HeroMetric
          label="30-Day Forecast"
          value={formatCurrency(forecast30)}
          variant="pipeline"
          size="md"
          delay={0}
        />
        <HeroMetric
          label="60-Day Forecast"
          value={formatCurrency(forecast60)}
          variant="pipeline"
          size="md"
          delay={0.1}
        />
        <HeroMetric
          label="Weighted Pipeline"
          value={formatCurrency(kpis.pipeline.current)}
          trend={kpis.pipeline.trend}
          trendLabel="vs last quarter"
          variant="revenue"
          size="md"
          delay={0.2}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Win Rate"
          value={`${kpis.winRate.current}%`}
          trend={kpis.winRate.trend}
          icon={Target}
          variant="success"
          delay={0.25}
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(kpis.avgDealSize.current)}
          trend={kpis.avgDealSize.trend}
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          label="Avg Sales Cycle"
          value="42 days"
          icon={Calendar}
          delay={0.35}
        />
        <StatCard
          label="Active Reps"
          value="8"
          icon={Users}
          delay={0.4}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales Funnel</CardTitle>
              <CardDescription>
                Stage-by-stage conversion analysis
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnelData} />
          </CardContent>
        </Card>

        {/* Team Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              <CardTitle>Team Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamPerformance
              .sort((a, b) => b.quota - a.quota)
              .map((rep, i) => (
                <motion.div
                  key={rep.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0
                        ? 'bg-warning text-surface'
                        : i === 1
                        ? 'bg-text-tertiary text-surface'
                        : i === 2
                        ? 'bg-orange-600 text-white'
                        : 'bg-surface-subtle text-text-secondary'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {rep.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {rep.closed} deals · {formatCurrency(rep.pipeline)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-medium tabular-nums ${
                        rep.quota >= 80
                          ? 'text-revenue'
                          : rep.quota >= 60
                          ? 'text-warning'
                          : 'text-danger'
                      }`}
                    >
                      {rep.quota}%
                    </span>
                    <span className="block text-xs text-text-tertiary">
                      of quota
                    </span>
                  </div>
                </motion.div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Pipeline</CardTitle>
            <CardDescription>All open opportunities by close date</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Chart View
            </Button>
            <Button variant="secondary" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent padding="none">
          <DataTable
            data={recentDeals}
            columns={[
              {
                key: 'name',
                label: 'Opportunity',
                render: (item) => (
                  <div>
                    <span className="font-medium text-text-primary">
                      {item.name}
                    </span>
                    <span className="block text-xs text-text-tertiary">
                      {item.account}
                    </span>
                  </div>
                ),
              },
              {
                key: 'value',
                label: 'Value',
                align: 'right',
                render: (item) => <CurrencyCell value={item.value} />,
              },
              {
                key: 'weighted',
                label: 'Weighted',
                align: 'right',
                render: (item) => (
                  <span className="font-mono text-sm text-text-secondary tabular-nums">
                    {formatCurrency(item.value * (item.probability / 100))}
                  </span>
                ),
              },
              {
                key: 'stage',
                label: 'Stage',
                render: (item) => (
                  <StatusBadge
                    status={item.stage}
                    variant={
                      item.stage === 'Negotiation'
                        ? 'success'
                        : item.stage === 'Proposal'
                        ? 'info'
                        : item.stage === 'Qualified'
                        ? 'warning'
                        : 'default'
                    }
                  />
                ),
              },
              {
                key: 'probability',
                label: 'Probability',
                align: 'center',
                render: (item) => {
                  const color =
                    item.probability >= 70
                      ? 'bg-revenue'
                      : item.probability >= 40
                      ? 'bg-warning'
                      : 'bg-pipeline'
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-surface-subtle rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.probability}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                      <span className="font-mono text-xs text-text-secondary tabular-nums w-8">
                        {item.probability}%
                      </span>
                    </div>
                  )
                },
              },
              {
                key: 'closeDate',
                label: 'Close Date',
                render: (item) => <DateCell value={item.closeDate} />,
              },
              {
                key: 'owner',
                label: 'Owner',
                render: (item) => (
                  <span className="text-text-secondary">{item.owner}</span>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
