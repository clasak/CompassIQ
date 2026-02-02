'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { useLeads } from '@/hooks/use-leads'
import {
  Target,
  Mail,
  Phone,
  FileText,
  Trophy,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  ArrowRight,
  ChevronRight,
  Loader2,
  AlertCircle,
  BarChart3,
  LayoutGrid,
  List
} from 'lucide-react'

type PipelineStage = 'research' | 'outreach' | 'call-scheduled' | 'proposal' | 'won' | 'lost'

interface StageConfig {
  id: PipelineStage
  name: string
  icon: any
  color: string
  bgColor: string
}

const stages: StageConfig[] = [
  { id: 'research', name: 'Research', icon: Target, color: 'text-text-secondary', bgColor: 'bg-surface-subtle' },
  { id: 'outreach', name: 'Outreach', icon: Mail, color: 'text-pipeline', bgColor: 'bg-pipeline/10' },
  { id: 'call-scheduled', name: 'Call Scheduled', icon: Phone, color: 'text-warning', bgColor: 'bg-warning/10' },
  { id: 'proposal', name: 'Proposal', icon: FileText, color: 'text-revenue', bgColor: 'bg-revenue/10' },
  { id: 'won', name: 'Won', icon: Trophy, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'lost', name: 'Lost', icon: XCircle, color: 'text-danger', bgColor: 'bg-danger/10' },
]

export default function PipelinePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const { leads, isLoading, error } = useLeads()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pipeline animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Failed to load pipeline</h3>
            <p className="text-text-secondary mb-4">{error}</p>
            <Button variant="default" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group prospects by stage
  const prospectsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(p => p.status === stage.id)
    return acc
  }, {} as Record<PipelineStage, typeof leads>)

  // Calculate stats
  const totalProspects = leads.length
  const activeProspects = leads.filter(p => !['won', 'lost'].includes(p.status)).length
  const wonDeals = leads.filter(p => p.status === 'won').length
  const totalPipelineValue = leads
    .filter(p => !['won', 'lost'].includes(p.status))
    .reduce((sum, p) => sum + p.estimated_value, 0)
  const wonValue = leads
    .filter(p => p.status === 'won')
    .reduce((sum, p) => sum + p.estimated_value, 0)
  
  // Conversion rates
  const researchToOutreach = leads.filter(p => p.status !== 'research').length
  const outreachToCall = leads.filter(p => ['call-scheduled', 'proposal', 'won'].includes(p.status)).length
  const callToProposal = leads.filter(p => ['proposal', 'won'].includes(p.status)).length
  const proposalToWon = wonDeals

  const conversionRate = totalProspects > 0 ? (wonDeals / totalProspects) * 100 : 0

  // Empty state
  if (leads.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Pipeline Tracker"
          description="Track prospects through your sales process"
          actions={
            <Button variant="default" onClick={() => router.push('/leads')}>
              <Target className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          }
        />
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No prospects in pipeline</h3>
            <p className="text-text-secondary mb-4">Start by adding prospects to your pipeline</p>
            <Button variant="default" onClick={() => router.push('/leads')}>
              <Target className="w-4 h-4 mr-2" />
              View Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock activity data
  const recentActivity = [
    { prospect: 'HTS Texas', action: 'Moved to Outreach', time: '2 hours ago', stage: 'outreach' },
    { prospect: 'Power Plumbing', action: 'Call scheduled for Jan 15', time: '5 hours ago', stage: 'call-scheduled' },
    { prospect: 'Abacus Plumbing', action: 'Proposal sent', time: '1 day ago', stage: 'proposal' },
    { prospect: 'John Moore Electric', action: 'Email opened', time: '1 day ago', stage: 'outreach' },
    { prospect: 'Service Experts', action: 'Added to pipeline', time: '2 days ago', stage: 'research' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Pipeline Tracker"
        description="Track prospects through your sales process"
        actions={
          <div className="flex gap-2 flex-wrap">
            {/* View Toggle */}
            <div className="flex gap-1 bg-surface-subtle rounded-lg p-1">
              <Button 
                variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                Kanban
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-1.5" />
                List
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => router.push('/analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button variant="default" size="sm" onClick={() => router.push('/leads')}>
              <Target className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Total Pipeline"
          value={`$${(totalPipelineValue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          variant="success"
          delay={0}
        />
        <StatCard
          label="Active Prospects"
          value={activeProspects.toString()}
          icon={Users}
          variant="default"
          delay={0.1}
        />
        <StatCard
          label="Won Deals"
          value={wonDeals.toString()}
          icon={Trophy}
          variant="success"
          delay={0.2}
        />
        <StatCard
          label="Closed Value"
          value={`$${(wonValue / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          variant="success"
          delay={0.3}
        />
        <StatCard
          label="Win Rate"
          value={`${conversionRate.toFixed(1)}%`}
          icon={Percent}
          variant="default"
          delay={0.4}
        />
      </div>

      {/* Pipeline Stages */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="py-12 text-center">
            <List className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">List View Coming Soon</h3>
            <p className="text-text-secondary mb-4">Switch to Kanban view to see your pipeline</p>
            <Button variant="default" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="w-4 h-4 mr-2" />
              Switch to Kanban
            </Button>
          </CardContent>
        </Card>
      )}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 min-w-max lg:min-w-0">
        {stages.map((stage, stageIndex) => {
          const stageProspects = prospectsByStage[stage.id]
          const stageValue = stageProspects.reduce((sum, p) => sum + p.estimated_value, 0)
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stageIndex * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                      <stage.icon className={`w-4 h-4 ${stage.color}`} />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{stageProspects.length}</span>
                  </div>
                  <CardTitle className="text-sm">{stage.name}</CardTitle>
                  <CardDescription className="text-xs">
                    ${(stageValue / 1000).toFixed(0)}K value
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stageProspects.slice(0, 5).map((prospect, index) => (
                    <motion.div
                      key={prospect.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="p-2 rounded-lg bg-surface-subtle hover:bg-surface-overlay border border-border-subtle hover:border-border-accent transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate group-hover:text-pipeline transition-colors">
                            {prospect.company}
                          </p>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            ${(prospect.estimated_value / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                          prospect.priority === 'high' ? 'bg-revenue' :
                          prospect.priority === 'medium' ? 'bg-warning' :
                          'bg-pipeline'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                  {stageProspects.length > 5 && (
                    <button className="w-full text-xs text-text-tertiary hover:text-pipeline transition-colors py-2">
                      +{stageProspects.length - 5} more
                    </button>
                  )}
                  {stageProspects.length === 0 && (
                    <p className="text-xs text-text-tertiary text-center py-4">No prospects</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Track how prospects move through the pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { from: 'Research', to: 'Outreach', count: researchToOutreach, total: totalProspects },
              { from: 'Outreach', to: 'Call', count: outreachToCall, total: researchToOutreach },
              { from: 'Call', to: 'Proposal', count: callToProposal, total: outreachToCall },
              { from: 'Proposal', to: 'Won', count: proposalToWon, total: callToProposal },
            ].map((step, index) => {
              const percentage = step.total > 0 ? (step.count / step.total) * 100 : 0
              const isGood = percentage >= 50
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">{step.from}</span>
                      <ArrowRight className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-primary font-medium">{step.to}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary">
                        {step.count} / {step.total}
                      </span>
                      <span className={`font-mono text-sm font-semibold ${isGood ? 'text-revenue' : 'text-warning'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`absolute top-0 bottom-0 left-0 rounded-full ${
                        isGood ? 'bg-revenue' : 'bg-warning'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pipeline" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle"
              >
                <div className="w-2 h-2 rounded-full bg-pipeline mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {activity.prospect}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">{activity.action}</p>
                  <p className="text-xs text-text-tertiary mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Next Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-revenue" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { task: 'Follow up with HTS Texas', priority: 'high', due: 'Today' },
              { task: 'Prepare proposal for Abacus Plumbing', priority: 'high', due: 'Tomorrow' },
              { task: 'Research John Moore Electric pain points', priority: 'medium', due: 'This week' },
              { task: 'Send follow-up to Power Plumbing', priority: 'medium', due: 'This week' },
              { task: 'Update prospect notes for Service Experts', priority: 'low', due: 'Next week' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle hover:border-border-accent transition-colors cursor-pointer group"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  item.priority === 'high' ? 'bg-danger' :
                  item.priority === 'medium' ? 'bg-warning' :
                  'bg-pipeline'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-pipeline transition-colors">
                    {item.task}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">Due: {item.due}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-pipeline transition-colors mt-1" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
