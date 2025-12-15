import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId, isDemoOrg } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, Users, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function OrgSettingsPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const orgResult = await supabase.from('organizations').select('*').eq('id', orgId).single() as { data: any }
  const memberResult = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('org_id', orgId)

  const org = orgResult.data
  const memberCount = memberResult.count

  if (!org) {
    return <div>Organization not found</div>
  }

  const isDemo = isDemoOrg(orgId)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization details and configuration.
        </p>
      </div>

      {isDemo && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Demo Organization</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              This is a read-only demo organization. Changes cannot be saved.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{org.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Slug</p>
                <p className="font-medium">{org.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{memberCount || 0} users</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(org.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {org.is_demo ? (
                <Badge variant="secondary">Demo</Badge>
              ) : (
                <Badge variant="default">Active</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization ID</CardTitle>
          <CardDescription>Use this ID for API integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block p-3 bg-muted rounded-lg text-sm font-mono">{orgId}</code>
        </CardContent>
      </Card>
    </div>
  )
}
