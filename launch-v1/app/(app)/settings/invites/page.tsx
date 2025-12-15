import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Plus, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/role'
import type { Role } from '@/lib/database.types'

export default async function InvitesPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: invites } = await supabase
    .from('org_invites')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const getInviteStatus = (invite: any) => {
    if (invite.accepted_at) return { status: 'accepted', color: 'bg-green-100 text-green-800' }
    if (invite.revoked_at) return { status: 'revoked', color: 'bg-red-100 text-red-800' }
    if (new Date(invite.expires_at) < new Date())
      return { status: 'expired', color: 'bg-gray-100 text-gray-800' }
    return { status: 'pending', color: 'bg-yellow-100 text-yellow-800' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">
            Manage team invitations and pending requests.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/settings/invites/new">
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations
          </CardTitle>
          <CardDescription>
            {invites?.length || 0} invitations sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites && invites.length > 0 ? (
            <div className="space-y-4">
              {invites.map((invite) => {
                const { status, color } = getInviteStatus(invite)
                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {status === 'accepted' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : status === 'revoked' || status === 'expired' ? (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Sent {formatDate(invite.created_at)}
                          </div>
                          {status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {formatDate(invite.expires_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(invite.role as Role)}>
                        {getRoleLabel(invite.role as Role)}
                      </Badge>
                      <Badge className={color}>{status}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No invitations sent yet</p>
              <Button asChild className="mt-4">
                <Link href="/app/settings/invites/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Send First Invitation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
