import { getOrgContext } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { getROIDefaultsAction } from '@/lib/actions/roi-actions'
import { ROICalculator } from './roi-calculator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ROIPage() {
  const context = await getOrgContext()

  if (!context) {
    redirect('/app')
  }

  const roiData = await getROIDefaultsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ROI Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the potential value and impact of CompassIQ for your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ROI Inputs</CardTitle>
          <CardDescription>
            Enter your current metrics and target improvements. Values can be populated from your live KPIs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ROICalculator
            initialDefaults={roiData.defaults || {}}
            liveKPIs={roiData.liveKPIs || {}}
            isDemo={context.isDemo}
          />
        </CardContent>
      </Card>
    </div>
  )
}
