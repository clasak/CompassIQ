import { getOrgContext } from '@/lib/org-context'
import { ImportConfig } from './import-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'

export default async function ImportPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Import metric catalog and settings from an exported configuration file
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
          <h1 className="text-3xl font-bold">Import Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Import metric catalog and settings from an exported configuration file
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
          <h1 className="text-3xl font-bold">Import Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Import metric catalog and settings from an exported configuration file
          </p>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Demo organization cannot import configurations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Import metric catalog and settings from an exported configuration file
        </p>
      </div>

      <SettingsNav />

      <Card>
        <CardHeader>
          <CardTitle>Import Configuration</CardTitle>
          <CardDescription>
            Upload a JSON configuration file to import metric catalog entries and settings.
            Existing entries will be updated; new entries will be added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportConfig />
        </CardContent>
      </Card>
    </div>
  )
}
