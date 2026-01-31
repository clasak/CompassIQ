import { getOrgContext } from '@/lib/org-context'
import { getOrgInvites } from '@/lib/actions/settings-actions'
import { InvitesManagement } from './invites-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function InvitesPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground mt-2">Invite users to join your organization</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>No organization context found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!context.isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground mt-2">Invite users to join your organization</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Access denied. OWNER or ADMIN role required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const invitesResult = await getOrgInvites()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground mt-2">Invite users to join your organization</p>
      </div>

      <SettingsNav />

      {context.isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>This is a demo organization. Invitations cannot be created.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create Invitation</CardTitle>
          <CardDescription>
            Generate an invitation link to share with users. Invitations expire after 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitesManagement
            initialInvites={invitesResult.success ? invitesResult.invites || [] : []}
            isDemo={context.isDemo}
            canAssignOwner={context.role === 'OWNER'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
