import { getOrgContext } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { DemoScript } from './demo-script'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DemoScriptPage() {
  const context = await getOrgContext()

  if (!context) {
    redirect('/app')
  }

  // Only OWNER can access
  if (context.role !== 'OWNER') {
    redirect('/app')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demo Script</h1>
        <p className="text-muted-foreground mt-2">
          Private talk track and objection handling for sales demos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Demo Script</CardTitle>
          <CardDescription>
            Your private talk track for presenting CompassIQ. Copy sections to clipboard as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoScript />
        </CardContent>
      </Card>
    </div>
  )
}

