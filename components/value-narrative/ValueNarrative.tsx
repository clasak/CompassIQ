'use client'

import { useEffect, useState } from 'react'
import { getROIDefaultsAction } from '@/lib/actions/roi-actions'
import { calculateROI } from '@/lib/roi-calc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'

interface ValueNarrativeProps {
  className?: string
}

export function ValueNarrative({ className }: ValueNarrativeProps) {
  const [narrative, setNarrative] = useState<string | null>(null)
  const [totalImpact, setTotalImpact] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNarrative()
  }, [])

  async function loadNarrative() {
    try {
      const result = await getROIDefaultsAction()
      if (result.success && result.defaults) {
        const roiResult = calculateROI(result.defaults)
        setTotalImpact(roiResult.totalAnnualImpact)

        // Generate narrative based on available data
        const parts: string[] = []
        if (roiResult.incrementalRevenuePerYear > 0) {
          parts.push(`incremental revenue of ${formatCurrency(roiResult.incrementalRevenuePerYear)}/year`)
        }
        if (roiResult.timeSavingsPerYear > 0) {
          parts.push(`time savings of ${formatCurrency(roiResult.timeSavingsPerYear)}/year`)
        }
        if (parts.length > 0) {
          setNarrative(
            `Based on your ROI settings, CompassIQ can deliver ${parts.join(' and ')}, ` +
            `resulting in an estimated total annual impact of ${formatCurrency(roiResult.totalAnnualImpact)}.`
          )
        } else {
          setNarrative(
            'Configure the ROI Calculator to see your estimated annual value.'
          )
        }
      } else {
        setNarrative('Configure the ROI Calculator to see your estimated annual value.')
      }
    } catch (error) {
      setNarrative(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !narrative) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Value Narrative</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  This estimate is based on your ROI Calculator settings. Values are calculated from:
                  incremental revenue from improved win rates, time savings from reduced reporting,
                  cash acceleration from AR improvements, and churn reduction value.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{narrative}</p>
        {totalImpact !== null && totalImpact > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalImpact)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Estimated Annual Impact</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
