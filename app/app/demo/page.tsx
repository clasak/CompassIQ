import { getOrgContext } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { DemoPresentation } from './demo-presentation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DemoResetButton } from '@/components/demo/DemoResetButton'

export default async function DemoPage() {
  const context = await getOrgContext()

  if (!context) {
    redirect('/app')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Demo Presentation</h1>
          <p className="text-muted-foreground mt-2">
            Guided walkthrough of CompassIQ capabilities and value
          </p>
        </div>
        {context.isAdmin && (
          <div className="flex flex-wrap gap-2">
            {context.isDemo && <DemoResetButton />}
            <Button asChild variant="outline">
              <Link href="/app/demo/screenshots">Screenshot Pack</Link>
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What You're Seeing</CardTitle>
          <CardDescription>
            This is a live, interactive demonstration of CompassIQ using your actual data (or demo data).
            Each step highlights key features and demonstrates the value proposition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoPresentation orgContext={context} />
        </CardContent>
      </Card>
    </div>
  )
}
