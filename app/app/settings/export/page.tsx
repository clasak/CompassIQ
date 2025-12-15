import { getOrgContext } from '@/lib/org-context'
import { ExportConfig } from './export-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function ExportPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Export Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Export metric catalog and settings to replicate across client instances
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Export Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Export metric catalog and settings to replicate across client instances
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Export Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Export metric catalog and settings to replicate across client instances
          </p>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Demo organization cannot export configurations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Export metric catalog and settings to replicate across client instances
        </p>
      </div>

      <SettingsNav />

      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>
            Download a JSON file containing your metric catalog and organization settings.
            This can be imported into other organizations to replicate your setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportConfig />
        </CardContent>
      </Card>
    </div>
  )
}
