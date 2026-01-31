import { getOrgContext } from '@/lib/org-context'
import { getOrgMembers } from '@/lib/actions/settings-actions'
import { UsersManagementTable } from './users-management-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function UsersPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage members and their roles in your organization</p>
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage members and their roles in your organization</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Access denied. OWNER or ADMIN role required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const membersResult = await getOrgMembers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage members and their roles in your organization</p>
      </div>

      <SettingsNav />

      {context.isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>This is a demo organization. User management is read-only.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>View and manage member roles. Only OWNER can assign OWNER role.</CardDescription>
        </CardHeader>
        <CardContent>
          {membersResult.success && membersResult.members ? (
            <UsersManagementTable
              members={membersResult.members}
              currentUserRole={context.role || 'VIEWER'}
              isDemo={context.isDemo}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {membersResult.error || 'Failed to load members'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
