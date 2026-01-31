'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, StatusBadge } from '@/components/ui/data-table'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

const workOrders = [
  {
    id: '1',
    title: 'Server Migration - Phase 2',
    client: 'Acme Corp',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-02-05',
    assignee: 'Tech Team A',
    progress: 65,
  },
  {
    id: '2',
    title: 'Network Security Audit',
    client: 'TechStart Inc',
    status: 'blocked',
    priority: 'urgent',
    dueDate: '2026-02-02',
    assignee: 'Security Team',
    progress: 30,
    blocker: 'Waiting on client credentials',
  },
  {
    id: '3',
    title: 'CRM Integration Setup',
    client: 'Global Systems',
    status: 'pending',
    priority: 'medium',
    dueDate: '2026-02-10',
    assignee: 'Integration Team',
    progress: 0,
  },
  {
    id: '4',
    title: 'Data Warehouse Optimization',
    client: 'DataFlow Analytics',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-02-08',
    assignee: 'Data Team',
    progress: 45,
  },
  {
    id: '5',
    title: 'Mobile App Deployment',
    client: 'CloudNine Solutions',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-01-30',
    assignee: 'Dev Team B',
    progress: 100,
  },
]

const slaMetrics = [
  { name: 'On-Time Delivery', value: 94, target: 95, status: 'warning' },
  { name: 'First Response', value: 98, target: 95, status: 'success' },
  { name: 'Resolution Time', value: 4.2, target: 4, unit: 'hrs', status: 'warning' },
  { name: 'Customer Satisfaction', value: 4.7, target: 4.5, unit: '/5', status: 'success' },
]

export default function OpsPage() {
  const completed = workOrders.filter((w) => w.status === 'completed').length
  const inProgress = workOrders.filter((w) => w.status === 'in_progress').length
  const blocked = workOrders.filter((w) => w.status === 'blocked').length
  const pending = workOrders.filter((w) => w.status === 'pending').length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations Hub"
        description="Work order management and SLA tracking"
        actions={
          <Button variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Status
          </Button>
        }
      />

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Completed"
          value={completed.toString()}
          icon={CheckCircle2}
          variant="success"
          delay={0}
        />
        <StatCard
          label="In Progress"
          value={inProgress.toString()}
          icon={Zap}
          delay={0.1}
        />
        <StatCard
          label="Blocked"
          value={blocked.toString()}
          icon={AlertTriangle}
          variant="danger"
          delay={0.2}
        />
        <StatCard
          label="Pending"
          value={pending.toString()}
          icon={Clock}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Orders - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Active Work Orders</CardTitle>
              <CardDescription>Current projects and their status</CardDescription>
            </div>
            <Button variant="secondary" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent padding="none">
            <DataTable
              data={workOrders}
              columns={[
                {
                  key: 'title',
                  label: 'Work Order',
                  render: (item) => (
                    <div>
                      <span className="font-medium text-text-primary">
                        {item.title}
                      </span>
                      <span className="block text-xs text-text-tertiary">
                        {item.client}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (item) => (
                    <StatusBadge
                      status={item.status.replace('_', ' ')}
                      variant={
                        item.status === 'completed'
                          ? 'success'
                          : item.status === 'blocked'
                          ? 'danger'
                          : item.status === 'in_progress'
                          ? 'info'
                          : 'warning'
                      }
                    />
                  ),
                },
                {
                  key: 'progress',
                  label: 'Progress',
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-surface-subtle rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${
                            item.progress === 100
                              ? 'bg-revenue'
                              : item.status === 'blocked'
                              ? 'bg-danger'
                              : 'bg-pipeline'
                          }`}
                        />
                      </div>
                      <span className="font-mono text-xs text-text-secondary tabular-nums w-8">
                        {item.progress}%
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (item) => (
                    <span
                      className={`text-xs font-medium uppercase ${
                        item.priority === 'urgent'
                          ? 'text-danger'
                          : item.priority === 'high'
                          ? 'text-warning'
                          : 'text-text-secondary'
                      }`}
                    >
                      {item.priority}
                    </span>
                  ),
                },
                {
                  key: 'assignee',
                  label: 'Assignee',
                  render: (item) => (
                    <span className="text-text-secondary text-sm">
                      {item.assignee}
                    </span>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* SLA Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {slaMetrics.map((metric, i) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {metric.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-lg font-bold tabular-nums ${
                        metric.status === 'success'
                          ? 'text-revenue'
                          : 'text-warning'
                      }`}
                    >
                      {metric.value}
                      {metric.unit || '%'}
                    </span>
                  </div>
                </div>
                <div className="relative h-2 bg-surface-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (metric.value / (metric.target * 1.1)) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`h-full rounded-full ${
                      metric.status === 'success' ? 'bg-revenue' : 'bg-warning'
                    }`}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-text-tertiary"
                    style={{
                      left: `${(metric.target / (metric.target * 1.1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-text-tertiary">
                    Target: {metric.target}
                    {metric.unit || '%'}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Blocked Items Alert */}
      {blocked > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-danger-muted border border-danger/30"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-danger mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-danger">
                {blocked} Work Order{blocked > 1 ? 's' : ''} Blocked
              </h3>
              <ul className="mt-2 space-y-1">
                {workOrders
                  .filter((w) => w.status === 'blocked')
                  .map((w) => (
                    <li key={w.id} className="text-sm text-text-primary">
                      <span className="font-medium">{w.title}</span>
                      {w.blocker && (
                        <span className="text-text-secondary">
                          {' '}
                          — {w.blocker}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
            <Button variant="destructive" size="sm">
              Resolve Blockers
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
