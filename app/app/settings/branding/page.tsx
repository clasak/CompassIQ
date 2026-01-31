import { getOrgContext } from '@/lib/org-context'
import { getBrandingForActiveOrg } from '@/lib/branding/server'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

const BrandingSettings = dynamic(() => import('./BrandingSettingsClient'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    </div>
  ),
})

export default async function BrandingPage() {
  const context = await getOrgContext()

  if (!context) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Branding</h1>
          <p className="text-muted-foreground mt-2">Configure logos, name, and colors for this org</p>
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
          <h1 className="text-3xl font-bold">Branding</h1>
          <p className="text-muted-foreground mt-2">Configure logos, name, and colors for this org</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>Access denied. OWNER or ADMIN role required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const branding = await getBrandingForActiveOrg()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Branding</h1>
          <p className="text-muted-foreground mt-2">
            Logos and colors apply across the app for this organization.
          </p>
        </div>
      </div>

      <SettingsNav />

      {context.isDemo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Demo organization is read-only. Branding changes are disabled.</AlertDescription>
        </Alert>
      )}

      <BrandingSettings initialBranding={branding} readOnly={context.isDemo} />
    </div>
  )
}
