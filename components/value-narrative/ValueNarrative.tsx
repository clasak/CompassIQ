'use client'

import { useEffect, useState } from 'react'
import { getROIDefaultsAction } from '@/lib/actions/roi-actions'
import { calculateROI } from '@/lib/roi-calc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ValueNarrativeProps {
  className?: string
}

interface ValueMetric {
  label: string
  value: string
  description: string
  isEstimate: boolean
}

export function ValueNarrative({ className }: ValueNarrativeProps) {
  const [valueMetrics, setValueMetrics] = useState<ValueMetric[]>([])
  const [totalImpact, setTotalImpact] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadValueMetrics()
  }, [])

  async function loadValueMetrics() {
    try {
      const result = await getROIDefaultsAction()
      if (result.success && result.defaults) {
        const defaults = result.defaults
        const roiResult = calculateROI(defaults)
        setTotalImpact(roiResult.totalAnnualImpact)

        // Calculate monthly values (divide annual by 12)
        const monthlyMetrics: ValueMetric[] = []

        // Hours saved (monthly from reporting time savings)
        if (roiResult.timeSavingsPerYear > 0 && defaults.reportingHoursPerWeek) {
          const monthlyHours = (defaults.reportingHoursPerWeek * 4 * 0.3) // 30% reduction assumption
          monthlyMetrics.push({
            label: 'Hours Saved',
            value: `${Math.round(monthlyHours)}h`,
            description: 'Reduced manual reporting tasks',
            isEstimate: true,
          })
        }

        // Margin protected (example: 0.5-1.5 pts flagged risks)
        if (defaults.averageDealSize && defaults.monthlyLeads) {
          const marginProtected = defaults.averageDealSize * defaults.monthlyLeads * 0.01 // 1% assumption
          if (marginProtected > 0) {
            monthlyMetrics.push({
              label: 'Margin Protected',
              value: formatCurrency(marginProtected / 12), // Monthly
              description: 'Example: 0.5-1.5 pts flagged risks',
              isEstimate: true,
            })
          }
        }

        // Cash acceleration (DSO improvement estimate)
        if (defaults.arDaysReductionTarget && defaults.averageDealSize && defaults.monthlyLeads) {
          // Simplified calculation - assume 1M monthly revenue, 10 day reduction = ~333k accelerated
          const monthlyRevenue = (defaults.averageDealSize * defaults.monthlyLeads) / 12
          const cashAccelerated = (monthlyRevenue * defaults.arDaysReductionTarget) / 30
          monthlyMetrics.push({
            label: 'Cash Accelerated',
            value: formatCurrency(cashAccelerated),
            description: 'DSO improvement estimate',
            isEstimate: true,
          })
        }

        // Fire drills avoided (alerts caught early) - estimate based on alerts
        const fireDrillsAvoided = 3 // Conservative estimate
        monthlyMetrics.push({
          label: 'Fire Drills Avoided',
          value: formatNumber(fireDrillsAvoided),
          description: 'Alerts caught early',
          isEstimate: true,
        })

        setValueMetrics(monthlyMetrics)
      }
    } catch (error) {
      console.error('Error loading value metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  // Don't show if no metrics
  if (valueMetrics.length === 0 && !totalImpact) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Value This Month</CardTitle>
            <CardDescription className="mt-1">
              Estimated value delivered (typical / example metrics)
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  These are example estimates based on typical ROI assumptions. Values are calculated from:
                  time savings from reduced reporting, margin protection from early risk detection,
                  cash acceleration from AR improvements, and proactive issue resolution.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {valueMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {valueMetrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.isEstimate && (
                    <Badge variant="outline" className="text-xs">
                      Estimate
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {totalImpact !== null && totalImpact > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalImpact / 12)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Estimated Monthly Impact</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-muted-foreground">
                  {formatCurrency(totalImpact)} annually
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

