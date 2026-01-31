'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, StatusBadge, CurrencyCell } from '@/components/ui/data-table'
import { StatCard } from '@/components/ui/stat-card'
import { Users, Building2, TrendingUp, AlertTriangle, Plus, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { accountHealthDistribution } from '@/lib/mock-data'

const accounts = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Technology',
    arr: 245000,
    health: 'healthy',
    renewalDate: '2026-06-15',
    owner: 'Sarah Chen',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    industry: 'SaaS',
    arr: 48000,
    health: 'at_risk',
    renewalDate: '2026-03-01',
    owner: 'Mike Johnson',
  },
  {
    id: '3',
    name: 'Global Systems Ltd',
    industry: 'Enterprise',
    arr: 380000,
    health: 'healthy',
    renewalDate: '2026-09-30',
    owner: 'Sarah Chen',
  },
  {
    id: '4',
    name: 'DataFlow Analytics',
    industry: 'Data',
    arr: 125000,
    health: 'critical',
    renewalDate: '2026-02-28',
    owner: 'James Wilson',
  },
  {
    id: '5',
    name: 'CloudNine Solutions',
    industry: 'Cloud',
    arr: 92000,
    health: 'healthy',
    renewalDate: '2026-08-15',
    owner: 'Emma Davis',
  },
]

export default function AccountsPage() {
  const totalARR = accounts.reduce((sum, a) => sum + a.arr, 0)
  const healthyCount = accounts.filter((a) => a.health === 'healthy').length
  const atRiskCount = accounts.filter((a) => a.health === 'at_risk').length
  const criticalCount = accounts.filter((a) => a.health === 'critical').length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        description="Customer portfolio and health management"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Accounts"
          value={accounts.length.toString()}
          icon={Building2}
          delay={0}
        />
        <StatCard
          label="Total ARR"
          value={`$${(totalARR / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          variant="success"
          delay={0.1}
        />
        <StatCard
          label="Healthy"
          value={healthyCount.toString()}
          icon={Users}
          variant="success"
          delay={0.2}
        />
        <StatCard
          label="At Risk / Critical"
          value={`${atRiskCount + criticalCount}`}
          icon={AlertTriangle}
          variant={criticalCount > 0 ? 'danger' : 'warning'}
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Table - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>All Accounts</CardTitle>
              <CardDescription>Customer portfolio overview</CardDescription>
            </div>
            <Button variant="secondary" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent padding="none">
            <DataTable
              data={accounts}
              columns={[
                {
                  key: 'name',
                  label: 'Account',
                  render: (item) => (
                    <div>
                      <span className="font-medium text-text-primary">
                        {item.name}
                      </span>
                      <span className="block text-xs text-text-tertiary">
                        {item.industry}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'arr',
                  label: 'ARR',
                  align: 'right',
                  render: (item) => <CurrencyCell value={item.arr} />,
                },
                {
                  key: 'health',
                  label: 'Health',
                  render: (item) => (
                    <StatusBadge
                      status={item.health.replace('_', ' ')}
                      variant={
                        item.health === 'healthy'
                          ? 'success'
                          : item.health === 'at_risk'
                          ? 'warning'
                          : 'danger'
                      }
                    />
                  ),
                },
                {
                  key: 'renewalDate',
                  label: 'Renewal',
                  render: (item) => (
                    <span className="text-text-secondary text-sm">
                      {new Date(item.renewalDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  ),
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

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Health Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {accountHealthDistribution.map((segment, i) => (
              <motion.div
                key={segment.health}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {segment.health}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold tabular-nums text-text-primary">
                      {segment.count}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      ({segment.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-surface-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`h-full rounded-full ${
                      segment.health === 'Healthy'
                        ? 'bg-revenue'
                        : segment.health === 'At Risk'
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
