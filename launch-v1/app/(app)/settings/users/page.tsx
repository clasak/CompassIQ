import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users2, Mail, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/role'
import type { Role } from '@/lib/database.types'

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: memberships } = await supabase
    .from('memberships')
    .select('*, users:user_id(email, created_at)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true }) as { data: any[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage team members and their roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {memberships?.length || 0} users in this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberships && memberships.length > 0 ? (
            <div className="space-y-4">
              {memberships.map((membership) => {
                const user = membership.users as any
                return (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {user?.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user?.email || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDate(membership.created_at)}
                        </div>
                      </div>
                    </div>
                    <Badge className={getRoleBadgeColor(membership.role as Role)}>
                      {getRoleLabel(membership.role as Role)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No team members found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
