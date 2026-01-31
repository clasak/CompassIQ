'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { HeroMetric } from '@/components/ui/hero-metric'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, StatusBadge, CurrencyCell, DateCell } from '@/components/ui/data-table'
import { FunnelChart } from '@/components/ui/funnel-chart'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { kpis, funnelData, recentDeals, openTasks, alerts, revenueByMonth } from '@/lib/mock-data'
import {
  TrendingUp,
  Target,
  Percent,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bell,
  Zap,
} from 'lucide-react'

export function CommandCenter() {
  return (
    <div className="space-y-8">
      {/* Header with live indicator */}
      <PageHeader
        title="Command Center"
        description="Real-time business intelligence at a glance"
        actions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-revenue">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-revenue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-revenue"></span>
              </span>
              Live
            </div>
            <Button variant="secondary" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Last 30 days
            </Button>
          </div>
        }
      />

      {/* Hero Metrics - F-Pattern: Critical KPIs top-left */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <HeroMetric
            label="Revenue MTD"
            value={formatCurrency(kpis.revenue.current)}
            trend={kpis.revenue.trend}
            trendLabel="vs last month"
            variant="revenue"
            size="lg"
            sparkline={kpis.revenue.sparkline}
            delay={0}
          />
        </div>
        <div className="lg:col-span-2">
          <HeroMetric
            label="Pipeline (90-Day)"
            value={formatCurrency(kpis.pipeline.current)}
            trend={kpis.pipeline.trend}
            trendLabel="vs last quarter"
            variant="pipeline"
            size="lg"
            sparkline={kpis.pipeline.sparkline}
            delay={0.1}
          />
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Win Rate"
          value={`${kpis.winRate.current}%`}
          trend={kpis.winRate.trend}
          icon={Target}
          variant="success"
          delay={0.2}
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(kpis.avgDealSize.current)}
          trend={kpis.avgDealSize.trend}
          icon={DollarSign}
          variant={kpis.avgDealSize.trend >= 0 ? 'success' : 'warning'}
          delay={0.25}
        />
        <StatCard
          label="Open Opportunities"
          value="135"
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          label="Tasks Due This Week"
          value="12"
          icon={CheckCircle2}
          variant="warning"
          delay={0.35}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Pipeline Funnel</CardTitle>
              <CardDescription>
                Lead to close conversion analysis
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnelData} />
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              <CardTitle>Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`p-4 rounded-lg border ${
                  alert.type === 'danger'
                    ? 'bg-danger-muted border-danger/30'
                    : alert.type === 'warning'
                    ? 'bg-warning-muted border-warning/30'
                    : 'bg-pipeline-muted border-pipeline/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 ${
                      alert.type === 'danger'
                        ? 'text-danger'
                        : alert.type === 'warning'
                        ? 'text-warning'
                        : 'text-pipeline'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {alert.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-text-tertiary mt-2">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              View All Alerts
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Deals Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Opportunities</CardTitle>
            <CardDescription>
              Top deals by expected close date
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent padding="none">
          <DataTable
            data={recentDeals}
            columns={[
              {
                key: 'name',
                label: 'Deal',
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
                        : 'default'
                    }
                  />
                ),
              },
              {
                key: 'probability',
                label: 'Probability',
                align: 'center',
                render: (item) => (
                  <span
                    className={`font-mono text-sm tabular-nums ${
                      item.probability >= 70
                        ? 'text-revenue'
                        : item.probability >= 40
                        ? 'text-warning'
                        : 'text-text-secondary'
                    }`}
                  >
                    {item.probability}%
                  </span>
                ),
              },
              {
                key: 'closeDate',
                label: 'Expected Close',
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

      {/* Tasks and Revenue Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-pipeline" />
              <CardTitle>Priority Tasks</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {openTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle hover:border-border-accent transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'urgent'
                      ? 'bg-danger'
                      : task.priority === 'high'
                      ? 'bg-warning'
                      : 'bg-pipeline'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-tertiary">
                      {task.account}
                    </span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-xs text-text-tertiary">
                      Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-text-secondary">
                  {task.assignee.split(' ')[0]}
                </span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue vs target</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByMonth.map((month, i) => {
                const percentage = (month.revenue / month.target) * 100
                const isAboveTarget = month.revenue >= month.target
                return (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">
                        {month.month}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-text-primary tabular-nums">
                          {formatCurrency(month.revenue)}
                        </span>
                        <span
                          className={`text-xs tabular-nums ${
                            isAboveTarget ? 'text-revenue' : 'text-warning'
                          }`}
                        >
                          {isAboveTarget ? '+' : ''}
                          {((percentage - 100).toFixed(0))}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-surface-subtle rounded-full overflow-hidden">
                      {/* Target line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-text-tertiary z-10"
                        style={{ left: '100%' }}
                      />
                      {/* Progress bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 120)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 + 0.2 }}
                        className={`absolute top-0 bottom-0 left-0 rounded-full ${
                          isAboveTarget ? 'bg-revenue' : 'bg-pipeline'
                        }`}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
