import { getOrgContext } from '@/lib/org-context'
import { OrgSettingsForm } from './org-settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function OrgSettingsPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your organization details and preferences</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>No organization context found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Only OWNER/ADMIN can access settings
  if (!context.isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your organization details and preferences</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Access denied. OWNER or ADMIN role required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your organization details and preferences</p>
      </div>

      <SettingsNav />

      {context.isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>This is a demo organization. Settings are read-only.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization name and view other details</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgSettingsForm initialName={context.orgName} slug={context.orgSlug} isDemo={context.isDemo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Slug</label>
            <p className="text-sm mt-1">{context.orgSlug}</p>
            <p className="text-xs text-muted-foreground mt-1">Organization slug cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Organization ID</label>
            <p className="text-sm mt-1 font-mono text-xs">{context.orgId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <p className="text-sm mt-1">{context.isDemo ? 'Demo Organization' : 'Production Organization'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
