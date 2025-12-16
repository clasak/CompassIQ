import { requireAdmin } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { PreviewWizard } from './preview-wizard'

export default async function PreviewPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/app')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Preview Generator</h1>
        <p className="text-muted-foreground">
          Create a branded preview workspace for client demonstrations
        </p>
      </div>
      <PreviewWizard />
    </div>
  )
}


