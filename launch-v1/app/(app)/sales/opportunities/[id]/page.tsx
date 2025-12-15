import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Target,
  ArrowLeft,
  Edit,
  Building2,
  Calendar,
  TrendingUp,
  FileSearch,
  Eye,
  FileText,
  FolderKanban,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*, companies(id, name)')
    .eq('id', id)
    .eq('org_id', orgId)
    .single() as { data: any }

  if (!opportunity) {
    notFound()
  }

  // Fetch related data
  const discoveryResult = await supabase
    .from('discovery_sessions')
    .select('*')
    .eq('opportunity_id', id)
    .order('session_date', { ascending: false }) as { data: any[] | null }

  const pilotResult = await supabase
    .from('pilot_scopes')
    .select('*')
    .eq('opportunity_id', id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const previewResult = await supabase
    .from('preview_workspaces')
    .select('*')
    .eq('opportunity_id', id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const discoverySessions = discoveryResult.data
  const pilotScopes = pilotResult.data
  const previews = previewResult.data

  const stageColors: Record<string, string> = {
    lead: 'bg-gray-100 text-gray-800',
    qualified: 'bg-blue-100 text-blue-800',
    discovery: 'bg-purple-100 text-purple-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800',
  }

  const stageLabels: Record<string, string> = {
    lead: 'Lead',
    qualified: 'Qualified',
    discovery: 'Discovery',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
  }

  // Determine next best actions based on current state
  const nextActions = []

  if (!discoverySessions || discoverySessions.length === 0) {
    nextActions.push({
      title: 'Start Discovery',
      description: 'Capture pains and KPI baselines',
      href: `/app/sales/opportunities/${id}/discovery/new`,
      icon: FileSearch,
    })
  }

  if (discoverySessions && discoverySessions.length > 0 && (!previews || previews.length === 0)) {
    nextActions.push({
      title: 'Generate Preview',
      description: 'Create a branded preview workspace',
      href: `/app/sales/preview/new?opportunity=${id}`,
      icon: Eye,
    })
  }

  if (discoverySessions && discoverySessions.length > 0 && (!pilotScopes || pilotScopes.length === 0)) {
    nextActions.push({
      title: 'Create Pilot Scope',
      description: 'Define the 60-day pilot deliverables',
      href: `/app/sales/opportunities/${id}/pilot/new`,
      icon: FileText,
    })
  }

  if (pilotScopes && pilotScopes.some((p) => p.status === 'accepted')) {
    nextActions.push({
      title: 'Convert to Delivery Project',
      description: 'Start implementation',
      href: `/app/sales/opportunities/${id}/convert`,
      icon: FolderKanban,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/sales/opportunities">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{opportunity.name}</h1>
                <Badge className={stageColors[opportunity.stage]}>
                  {stageLabels[opportunity.stage]}
                </Badge>
              </div>
              <Link
                href={`/app/sales/companies/${(opportunity.companies as any)?.id}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
                <Building2 className="h-4 w-4" />
                {(opportunity.companies as any)?.name}
              </Link>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/app/sales/opportunities/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Opportunity Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Deal Value</span>
                <span className="text-2xl font-bold">{formatCurrency(opportunity.value)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Probability</span>
                <span className="text-2xl font-bold">{opportunity.probability}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Weighted Value</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(opportunity.value * (opportunity.probability / 100))}
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              {opportunity.expected_close_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Expected close: {formatDate(opportunity.expected_close_date)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Stage: {stageLabels[opportunity.stage]}</span>
              </div>
            </div>

            {opportunity.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {opportunity.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Next Best Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Best Actions</CardTitle>
            <CardDescription>Recommended next steps</CardDescription>
          </CardHeader>
          <CardContent>
            {nextActions.length > 0 ? (
              <div className="space-y-3">
                {nextActions.map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recommended actions at this time
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discovery Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Discovery Sessions</CardTitle>
            <CardDescription>Captured pains and KPI baselines</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/app/sales/opportunities/${id}/discovery/new`}>
              <FileSearch className="h-4 w-4 mr-2" />
              New Session
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {discoverySessions && discoverySessions.length > 0 ? (
            <div className="space-y-3">
              {discoverySessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/app/sales/opportunities/${id}/discovery/${session.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{formatDate(session.session_date)}</p>
                    <p className="text-sm text-muted-foreground">
                      {(session.pains as any[])?.length || 0} pains captured
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No discovery sessions yet</p>
          )}
        </CardContent>
      </Card>

      {/* Pilot Scopes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pilot Scopes</CardTitle>
            <CardDescription>60-day pilot proposals</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/app/sales/opportunities/${id}/pilot/new`}>
              <FileText className="h-4 w-4 mr-2" />
              New Pilot Scope
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pilotScopes && pilotScopes.length > 0 ? (
            <div className="space-y-3">
              {pilotScopes.map((scope) => (
                <Link
                  key={scope.id}
                  href={`/app/sales/opportunities/${id}/pilot/${scope.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{scope.name}</p>
                    <Badge variant="outline">{scope.status}</Badge>
                  </div>
                  <div className="text-right">
                    {scope.price && (
                      <p className="font-semibold">{formatCurrency(scope.price)}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{scope.duration_days} days</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No pilot scopes yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
