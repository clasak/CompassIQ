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
import { leadStats as staticLeadStats } from '@/lib/leads-data'
import { campaignStats as staticCampaignStats } from '@/lib/campaigns-data'
import { useLeads } from '@/hooks/use-leads'
import { useCampaigns } from '@/hooks/use-campaigns'
import { useDeals } from '@/hooks/use-deals'
import { useTasks } from '@/hooks/use-tasks'
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
  Users,
  Mail,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

export function CommandCenter() {
  // Use live data from Supabase
  const { stats: leadStatsLive, isLoading: leadsLoading, error: leadsError, fetchStats } = useLeads()
  const { stats: campaignStatsLive, campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { deals, pipeline, isLoading: dealsLoading } = useDeals()
  const { tasks, isLoading: tasksLoading } = useTasks()
  
  // Use live stats if available, otherwise use static data
  const leadStats = leadStatsLive || staticLeadStats
  const campaignStats = campaignStatsLive || staticCampaignStats
  const isLiveData = !!leadStatsLive && !leadsError
  const isLoading = leadsLoading || campaignsLoading || dealsLoading || tasksLoading
  
  // Build funnel data from deals
  const funnelData = pipeline?.byStage?.map(s => ({
    name: s.stage.charAt(0).toUpperCase() + s.stage.slice(1).replace('-', ' '),
    stage: s.stage.charAt(0).toUpperCase() + s.stage.slice(1).replace('-', ' '),
    count: s.count,
    value: s.value
  })) || []
  
  // Recent deals (top 5)
  const recentDeals = deals.slice(0, 5).map(d => ({
    id: d.id,
    name: d.name,
    account: d.company,
    value: d.value,
    stage: d.stage.charAt(0).toUpperCase() + d.stage.slice(1).replace('-', ' '),
    probability: d.probability,
    closeDate: d.expected_close_date || '',
    owner: d.owner
  }))
  
  // Open tasks (pending)
  const openTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    account: t.company || '',
    dueDate: t.due_date || '',
    priority: t.priority,
    assignee: t.assignee
  }))
  
  return (
    <div className="space-y-8">
      {/* Header with data source indicator */}
      <PageHeader
        title="Command Center"
        description={`🚀 Ready to execute with ${leadStats.total}+ researched leads and ${campaignStats.totalCampaigns} proven campaigns`}
        actions={
          <div className="flex items-center gap-4">
            {/* Data source indicator */}
            <div className={`flex items-center gap-2 text-sm ${isLiveData ? 'text-revenue' : 'text-warning'}`}>
              <Database className="w-4 h-4" />
              <span>{isLiveData ? 'Live Data' : 'Static Data'}</span>
              {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-pipeline">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pipeline opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pipeline"></span>
              </span>
              Active
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchStats()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Hero Metrics - Day 1: Honest status, emphasize readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <HeroMetric
            label="Revenue (Day 1)"
            value={formatCurrency(deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0))}
            trend={0}
            trendLabel={deals.filter(d => d.stage === 'closed-won').length > 0 ? `${deals.filter(d => d.stage === 'closed-won').length} deals won` : 'No closed deals yet'}
            variant="neutral"
            size="lg"
            delay={0}
          />
        </div>
        <div>
          <HeroMetric
            label={`Pipeline Potential (${leadStats.total} Leads)`}
            value={formatCurrency(pipeline?.total || leadStats.totalValue)}
            trend={deals.length}
            trendLabel={deals.length > 0 ? `${deals.length} active deals` : `${leadStats.total} leads ready`}
            variant="pipeline"
            size="lg"
            delay={0.1}
          />
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/leads" className="block">
          <StatCard
            label="Researched Leads"
            value={`${leadStats.total}+`}
            icon={Users}
            variant="success"
            delay={0.2}
          />
        </Link>
        <Link href="/campaigns" className="block">
          <StatCard
            label="Ready Campaigns"
            value={`${campaignStats.totalCampaigns}`}
            icon={Mail}
            variant="success"
            delay={0.25}
          />
        </Link>
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(leadStats.totalValue)}
          icon={DollarSign}
          variant="success"
          delay={0.3}
        />
        <StatCard
          label="Avg Deal Size"
          value={formatCurrency(leadStats.avgValue)}
          icon={TrendingUp}
          variant="default"
          delay={0.35}
        />
      </div>

      {/* CompassIQ Sales Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Link href="/leads">
          <Card className="h-full hover:border-pipeline transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 group-hover:text-pipeline transition-colors">
                    <Users className="w-5 h-5" />
                    {leadStats.total}+ Researched Leads
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Texas field service companies ready for outreach
                  </CardDescription>
                </div>
                <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-pipeline transition-all group-hover:translate-x-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-pipeline">{formatCurrency(leadStats.totalValue)}</div>
                  <div className="text-text-secondary">Total Value</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-revenue">{formatCurrency(leadStats.avgValue)}</div>
                  <div className="text-text-secondary">Avg Deal</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-revenue"></span>
                  <span>HVAC, Plumbing, Electrical, Pest Control</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/campaigns">
          <Card className="h-full hover:border-pipeline transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 group-hover:text-pipeline transition-colors">
                    <Mail className="w-5 h-5" />
                    {campaignStats.totalCampaigns} Proven Outreach Campaigns
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Ready-to-use email sequences that convert
                  </CardDescription>
                </div>
                <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-pipeline transition-all group-hover:translate-x-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-pipeline">{(campaignStats as any).totalEmailsSent || (campaignStats as any).totalEmails || 0}</div>
                  <div className="text-text-secondary">Emails Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-revenue">14 days</div>
                  <div className="text-text-secondary">Per Sequence</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex flex-col gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-revenue" />
                    <span>ServiceTitan complexity angle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-revenue" />
                    <span>Spreadsheet hell pain points</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pipeline Funnel - Day 1 Readiness */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Launch Readiness</CardTitle>
              <CardDescription>
                {leadStats.total} leads researched, {campaignStats.totalCampaigns} campaigns ready - starting outreach this week
              </CardDescription>
            </div>
            <Link href="/leads">
              <Button variant="ghost" size="sm">
                View All Leads
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnelData} />
            <div className="mt-6 pt-4 border-t border-border-subtle">
              <p className="text-sm text-text-secondary text-center">
                <strong className="text-pipeline">Day 1 Status:</strong> Foundation built, campaigns loaded, ready to execute 🚀
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel - Dynamic based on real data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              <CardTitle>Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generate alerts from real data */}
            {campaigns.filter(c => c.status === 'draft').length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg border bg-pipeline-muted border-pipeline/30"
              >
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-pipeline" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {campaigns.filter(c => c.status === 'draft').length} campaigns ready to launch
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Start a campaign to begin outreach
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {leadStats.total > 0 && deals.length === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg border bg-warning-muted border-warning/30"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-warning" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      No active deals yet
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {leadStats.total} leads ready — time to start outreach
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {tasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-lg border bg-surface-subtle border-border-subtle"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-revenue" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      No pending tasks
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      You&apos;re all caught up!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/leads" className="w-full">
              <Button variant="ghost" size="sm" className="w-full">
                View All Leads
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Deals Table - Day 1 Empty State */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Opportunities</CardTitle>
            <CardDescription>
              Deals in progress - outreach starting this week!
            </CardDescription>
          </div>
          <Link href="/leads">
            <Button variant="secondary" size="sm">
              View All Leads
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentDeals.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pipeline-muted mb-4">
                <Zap className="w-8 h-8 text-pipeline" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Ready to Launch
              </h3>
              <p className="text-text-secondary mb-4 max-w-md mx-auto">
                {leadStats.total} researched leads ready for outreach. First campaigns launching this week. 
                Check back soon to see deals in motion!
              </p>
              <Link href="/leads">
                <Button variant="secondary">
                  <Users className="w-4 h-4 mr-2" />
                  View Researched Leads
                </Button>
              </Link>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Tasks and Revenue Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pipeline by Stage</CardTitle>
              <CardDescription>
                {deals.length > 0 
                  ? `${deals.length} deals worth ${formatCurrency(pipeline?.total || 0)}`
                  : 'No deals yet — start outreach to build pipeline'
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {deals.length > 0 ? (
              <div className="space-y-4">
                {funnelData.map((stage, i) => {
                  const maxValue = Math.max(...funnelData.map(s => s.value), 1)
                  const percentage = (stage.value / maxValue) * 100
                  return (
                    <motion.div
                      key={stage.stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary font-medium">
                          {stage.stage}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-tertiary">
                            {stage.count} deal{stage.count !== 1 ? 's' : ''}
                          </span>
                          <span className="font-mono text-text-primary tabular-nums">
                            {formatCurrency(stage.value)}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-surface-subtle rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 + 0.2 }}
                          className="absolute top-0 bottom-0 left-0 rounded-full bg-pipeline"
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pipeline-muted mb-3">
                  <Target className="w-6 h-6 text-pipeline" />
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  Pipeline empty — {leadStats.total} leads ready for outreach
                </p>
                <Link href="/campaigns">
                  <Button variant="secondary" size="sm">
                    Start Campaign
                  </Button>
                </Link>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-secondary text-center">
                {deals.length > 0 
                  ? `Weighted pipeline: ${formatCurrency(pipeline?.weighted || 0)}`
                  : '🚀 Ready to execute — campaigns and leads are set'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
