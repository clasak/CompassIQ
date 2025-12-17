'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Account, Opportunity, Task, Quote } from '@/lib/actions/crm-actions'
import Link from 'next/link'
import { Building2, TrendingUp, CheckSquare, FileText, Plus, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { GettingStartedPanel } from '@/components/getting-started/GettingStartedPanel'
import { KPIStatCard } from '@/components/kpi/KPIStatCard'

interface CommandCenterViewProps {
  recentAccounts: Account[]
  recentOpportunities: Opportunity[]
  recentTasks: Task[]
  recentQuotes: Quote[]
  totalAccounts: number
  totalOpportunities: number
  openTasksCount: number
  totalQuotes: number
  isDemo?: boolean
  isEmpty?: boolean
}

export function CommandCenterView({
  recentAccounts,
  recentOpportunities,
  recentTasks,
  recentQuotes,
  totalAccounts,
  totalOpportunities,
  openTasksCount,
  totalQuotes,
  isDemo = false,
  isEmpty = false,
}: CommandCenterViewProps) {
  return (
    <div className="page-container">
      <PageHeader
        title="Command Center"
        subtitle="Overview of your CRM data and recent activity"
      />

      {/* Getting Started Panel for empty orgs */}
      {isEmpty && <GettingStartedPanel isDemo={isDemo} />}

      {/* KPI Cards - BI Sleek Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          title="Total Accounts"
          value={totalAccounts}
          timeframe="MTD"
          onClick={() => window.location.href = '/app/crm/accounts'}
        />
        <KPIStatCard
          title="Opportunities"
          value={totalOpportunities}
          timeframe="MTD"
          onClick={() => window.location.href = '/app/crm/opportunities'}
        />
        <KPIStatCard
          title="Open Tasks"
          value={openTasksCount}
          timeframe="Last 7"
          onClick={() => window.location.href = '/app/crm/tasks'}
        />
        <KPIStatCard
          title="Quotes"
          value={totalQuotes}
          timeframe="MTD"
          onClick={() => window.location.href = '/app/crm/quotes'}
        />
      </div>

      {/* Recent Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Accounts */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-section font-semibold">Recent Accounts</CardTitle>
              <CardDescription className="text-table-sm text-muted-foreground">Latest customer accounts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/crm/accounts">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/app/crm/accounts?create=true">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentAccounts.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                No accounts yet. Create your first account.
              </div>
            ) : (
              <Table className="table-standard">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <Link
                          href={`/app/crm/accounts/${account.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {account.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {account.industry || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(account.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-section font-semibold">Recent Opportunities</CardTitle>
              <CardDescription className="text-table-sm text-muted-foreground">Latest sales deals</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/crm/opportunities">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/app/crm/opportunities?create=true">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentOpportunities.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                No opportunities yet. Create your first opportunity.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOpportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <Link
                          href={`/app/crm/opportunities/${opp.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {opp.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{opp.stage}</TableCell>
                      <TableCell className="text-muted-foreground text-numeric">
                        {formatCurrency(opp.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-section font-semibold">Open Tasks</CardTitle>
              <CardDescription className="text-table-sm text-muted-foreground">Due in next 7 days</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/crm/tasks">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/app/crm/tasks?create=true">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentTasks.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                No upcoming tasks.
              </div>
            ) : (
              <Table className="table-standard">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Link
                          href={`/app/crm/tasks/${task.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {task.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{task.status}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.due_date ? formatDate(task.due_date) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="space-y-0.5">
              <CardTitle className="text-section font-semibold">Recent Quotes</CardTitle>
              <CardDescription className="text-table-sm text-muted-foreground">Latest proposals</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/crm/quotes">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/app/crm/quotes?create=true">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentQuotes.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                No quotes yet. Create your first quote.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Link
                          href={`/app/crm/quotes/${quote.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {quote.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{quote.status}</TableCell>
                      <TableCell className="text-muted-foreground text-numeric">
                        {formatCurrency((quote.one_time_total || 0) + (quote.recurring_total || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
