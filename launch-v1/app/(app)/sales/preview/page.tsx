import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Plus, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function PreviewsPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: previews } = await supabase
    .from('preview_workspaces')
    .select('*, opportunities(name, companies(name))')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Preview Generator</h1>
          <p className="text-muted-foreground">
            Create branded preview workspaces for client presentations.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/sales/preview/new">
            <Plus className="h-4 w-4 mr-2" />
            New Preview
          </Link>
        </Button>
      </div>

      {previews && previews.length > 0 ? (
        <div className="grid gap-4">
          {previews.map((preview) => (
            <Card key={preview.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{preview.name}</h3>
                      {(preview.opportunities as any)?.name && (
                        <p className="text-sm text-muted-foreground">
                          {(preview.opportunities as any).name} •{' '}
                          {(preview.opportunities as any)?.companies?.name}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        Created {formatDate(preview.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app?preview=${preview.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Enter Preview
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/app/sales/preview/${preview.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary">
                    {(preview.pains as any[])?.length || 0} pains
                  </Badge>
                  <Badge variant="secondary">
                    {Object.keys(preview.kpi_values || {}).length} KPIs
                  </Badge>
                  <Badge variant="secondary">
                    {(preview.alerts as any[])?.length || 0} alerts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Eye className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No previews yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create a branded preview workspace to show clients what their
              dashboard could look like with their own data and branding.
            </p>
            <Button asChild>
              <Link href="/app/sales/preview/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Preview
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
