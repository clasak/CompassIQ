import { getOrgContext } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { IntakeWizard } from './IntakeWizard'

export default async function IntakePage() {
  const context = await getOrgContext()

  if (!context) {
    redirect('/login')
  }

  if (!context.isAdmin) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Client Intake</h1>
          <p className="text-muted-foreground mt-2">Import client data to generate a preview workspace</p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Access denied. OWNER or ADMIN role required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Client Intake</h1>
        <p className="text-muted-foreground mt-2">
          Upload client data to instantly generate a branded preview workspace
        </p>
      </div>
      <IntakeWizard isDemo={context.isDemo} />
    </div>
  )
}


