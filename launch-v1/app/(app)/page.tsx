import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Building2,
  FolderKanban,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

interface KPICardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  href?: string
}

function KPICard({ title, value, change, changeType, icon: Icon, href }: KPICardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={`text-xs ${
              changeType === 'positive'
                ? 'text-green-600'
                : changeType === 'negative'
                ? 'text-red-600'
                : 'text-muted-foreground'
            }`}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

export default async function CommandCenterPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  // Fetch summary data
  const companiesResult = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('org_id', orgId)
  const opportunitiesResult = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('org_id', orgId)
  const projectsResult = await supabase.from('delivery_projects').select('*', { count: 'exact', head: true }).eq('org_id', orgId)
  const opportunitiesDataResult = await supabase
    .from('opportunities')
    .select('id, name, value, stage, probability')
    .eq('org_id', orgId)
    .in('stage', ['qualified', 'discovery', 'proposal', 'negotiation']) as { data: any[] | null }
  const tasksResult = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date')
    .eq('org_id', orgId)
    .neq('status', 'done')
    .order('due_date', { ascending: true })
    .limit(5) as { data: any[] | null }

  const companiesCount = companiesResult.count
  const opportunitiesCount = opportunitiesResult.count
  const projectsCount = projectsResult.count
  const opportunities = opportunitiesDataResult.data
  const recentTasks = tasksResult.data

  // Calculate pipeline value
  const pipelineValue = opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0
  const weightedPipeline =
    opportunities?.reduce((sum, opp) => sum + (opp.value || 0) * (opp.probability / 100), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-muted-foreground">
          Overview of your operational metrics and key performance indicators.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Pipeline"
          value={`$${(pipelineValue / 1000).toFixed(0)}K`}
          change={`$${(weightedPipeline / 1000).toFixed(0)}K weighted`}
          changeType="neutral"
          icon={DollarSign}
          href="/app/sales/opportunities"
        />
        <KPICard
          title="Active Opportunities"
          value={opportunitiesCount || 0}
          icon={Target}
          href="/app/sales/opportunities"
        />
        <KPICard
          title="Companies"
          value={companiesCount || 0}
          icon={Building2}
          href="/app/sales/companies"
        />
        <KPICard
          title="Active Projects"
          value={projectsCount || 0}
          icon={FolderKanban}
          href="/app/delivery/projects"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pipeline by Stage
            </CardTitle>
            <CardDescription>Active opportunities in your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {opportunities && opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/app/sales/opportunities/${opp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{opp.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {opp.stage.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(opp.value / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">{opp.probability}% prob</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active opportunities</p>
                <Link
                  href="/app/sales/opportunities/new"
                  className="text-primary hover:underline text-sm"
                >
                  Create your first opportunity
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Action Items
            </CardTitle>
            <CardDescription>Tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks && recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-red-500'
                            : task.priority === 'high'
                            ? 'bg-orange-500'
                            : task.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <Badge
                      variant={
                        task.status === 'blocked'
                          ? 'destructive'
                          : task.status === 'in_progress'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending tasks</p>
                <Link
                  href="/app/delivery/projects"
                  className="text-primary hover:underline text-sm"
                >
                  View delivery projects
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Early Warning Alerts
          </CardTitle>
          <CardDescription>
            Items requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No alerts at this time</p>
            <p className="text-sm">Alerts will appear when KPIs exceed thresholds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
