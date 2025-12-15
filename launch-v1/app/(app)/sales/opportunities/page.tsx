import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Plus, Building2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function OpportunitiesPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*, companies(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage your sales pipeline.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/sales/opportunities/new">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Link>
        </Button>
      </div>

      {opportunities && opportunities.length > 0 ? (
        <div className="grid gap-4">
          {opportunities.map((opp) => (
            <Link key={opp.id} href={`/app/sales/opportunities/${opp.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{opp.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{(opp.companies as any)?.name || 'No company'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-semibold">
                        {formatCurrency(opp.value)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={stageColors[opp.stage]}>
                          {stageLabels[opp.stage]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {opp.probability}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {opp.expected_close_date && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Expected close: {formatDate(opp.expected_close_date)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking deals by creating your first opportunity.
            </p>
            <Button asChild>
              <Link href="/app/sales/opportunities/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Opportunity
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
