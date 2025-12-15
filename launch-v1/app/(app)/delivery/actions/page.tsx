import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ListTodo, Plus, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ActionLogPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: actions } = await supabase
    .from('action_log')
    .select('*, delivery_projects(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Action Log</h1>
          <p className="text-muted-foreground">
            Track action items and commitments from weekly reviews.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/delivery/actions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Action
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actions?.filter((a) => a.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actions?.filter((a) => a.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {actions?.filter((a) => a.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions List */}
      {actions && actions.length > 0 ? (
        <div className="grid gap-4">
          {actions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ListTodo className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      {action.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {action.owner && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {action.owner}
                          </div>
                        )}
                        {action.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {formatDate(action.due_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[action.status]}>
                    {action.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No action items yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Action items are created from weekly review meetings.
            </p>
            <Button asChild>
              <Link href="/app/delivery/actions/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Action Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
