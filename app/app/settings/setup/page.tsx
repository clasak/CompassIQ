import { getOrgContext } from '@/lib/org-context'
import { ClientSetupWizard } from './client-setup-wizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function ClientSetupPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6" data-demo-tour="settings-setup">
        <div>
          <h1 className="text-3xl font-bold">Client Instance Setup</h1>
          <p className="text-muted-foreground mt-2">
            Create a new organization for a client and seed with baseline configuration
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>No organization context found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Only OWNER/ADMIN can access
  if (!context.isAdmin) {
    return (
      <div className="space-y-6" data-demo-tour="settings-setup">
        <div>
          <h1 className="text-3xl font-bold">Client Instance Setup</h1>
          <p className="text-muted-foreground mt-2">
            Create a new organization for a client and seed with baseline configuration
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Access denied. OWNER or ADMIN role required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (context.isDemo) {
    return (
      <div className="space-y-6" data-demo-tour="settings-setup">
        <div>
          <h1 className="text-3xl font-bold">Client Instance Setup</h1>
          <p className="text-muted-foreground mt-2">
            Create a new organization for a client and seed with baseline configuration
          </p>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Demo organization cannot create new client instances.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-demo-tour="settings-setup">
      <div>
        <h1 className="text-3xl font-bold">Client Instance Setup</h1>
        <p className="text-muted-foreground mt-2">
          Create a new organization for a client and seed with baseline configuration
        </p>
      </div>

      <SettingsNav />

      <Card>
        <CardHeader>
          <CardTitle>Setup Wizard</CardTitle>
          <CardDescription>
            Follow the steps to create a client organization with baseline metrics and an admin invite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientSetupWizard />
        </CardContent>
      </Card>
    </div>
  )
}
