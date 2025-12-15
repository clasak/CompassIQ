'use client'

import { useState, useEffect } from 'react'
import { saveROIDefaultsAction, type ROIDefaults } from '@/app/(app)/actions/roi-actions'
import { calculateROI, type ROIResult } from '@/lib/roi-calc'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Download } from 'lucide-react'
import { isDevDemoMode, getReadOnlyMessage } from '@/lib/runtime'

interface ROICalculatorProps {
  initialDefaults: ROIDefaults
  liveKPIs: {
    averageDealSize?: number
    winRate?: number
    averageSalesCycleDays?: number
    averageARDays?: number
  }
  isDemo: boolean
}

export function ROICalculator({ initialDefaults, liveKPIs, isDemo }: ROICalculatorProps) {
  const [defaults, setDefaults] = useState<ROIDefaults>(initialDefaults)
  const [isSaving, setIsSaving] = useState(false)
  const [results, setResults] = useState<ROIResult | null>(null)
  const devDemoMode = isDevDemoMode()

  // Load from localStorage in dev demo mode
  useEffect(() => {
    if (devDemoMode && typeof window !== 'undefined') {
      const saved = localStorage.getItem('roi-defaults')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setDefaults(parsed)
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [devDemoMode])

  useEffect(() => {
    setResults(calculateROI(defaults))
  }, [defaults])

  function handleChange(field: keyof ROIDefaults, value: string) {
    const numValue = value === '' ? undefined : parseFloat(value)
    setDefaults((prev) => ({ ...prev, [field]: numValue }))
  }

  function useLiveKPI(field: keyof ROIDefaults) {
    if (field === 'averageDealSize' && liveKPIs.averageDealSize) {
      setDefaults((prev) => ({ ...prev, averageDealSize: liveKPIs.averageDealSize }))
    } else if (field === 'currentWinRate' && liveKPIs.winRate) {
      setDefaults((prev) => ({ ...prev, currentWinRate: liveKPIs.winRate }))
    } else if (field === 'currentSalesCycleDays' && liveKPIs.averageSalesCycleDays) {
      setDefaults((prev) => ({ ...prev, currentSalesCycleDays: liveKPIs.averageSalesCycleDays }))
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      if (isDevDemoMode()) {
        // Save to localStorage in dev demo mode
        localStorage.setItem('roi-defaults', JSON.stringify(defaults))
        toast.success('Saved locally (Dev Demo Mode)')
        setIsSaving(false)
        return
      }

      const result = await saveROIDefaultsAction(defaults)
      if (result.success) {
        toast.success('ROI defaults saved successfully')
      } else {
        const errorMsg = result.error || 'Failed to save ROI defaults'
        if (errorMsg.includes('read-only') || errorMsg.includes('Demo')) {
          toast.error(getReadOnlyMessage())
        } else {
          toast.error(errorMsg)
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sales Metrics</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="averageDealSize">Average Deal Size ($)</Label>
                {liveKPIs.averageDealSize && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useLiveKPI('averageDealSize')}
                    className="h-6 text-xs"
                  >
                    Use Live: {formatCurrency(liveKPIs.averageDealSize)}
                  </Button>
                )}
              </div>
              <Input
                id="averageDealSize"
                type="number"
                value={defaults.averageDealSize || ''}
                onChange={(e) => handleChange('averageDealSize', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyLeads">Monthly Leads</Label>
              <Input
                id="monthlyLeads"
                type="number"
                value={defaults.monthlyLeads || ''}
                onChange={(e) => handleChange('monthlyLeads', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentWinRate">Current Win Rate (%)</Label>
                {liveKPIs.winRate !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useLiveKPI('currentWinRate')}
                    className="h-6 text-xs"
                  >
                    Use Live: {liveKPIs.winRate.toFixed(1)}%
                  </Button>
                )}
              </div>
              <Input
                id="currentWinRate"
                type="number"
                value={defaults.currentWinRate || ''}
                onChange={(e) => handleChange('currentWinRate', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWinRate">Target Win Rate (%)</Label>
              <Input
                id="targetWinRate"
                type="number"
                value={defaults.targetWinRate || ''}
                onChange={(e) => handleChange('targetWinRate', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="35"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentSalesCycleDays">Current Sales Cycle (days)</Label>
                {liveKPIs.averageSalesCycleDays && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useLiveKPI('currentSalesCycleDays')}
                    className="h-6 text-xs"
                  >
                    Use Live: {liveKPIs.averageSalesCycleDays}
                  </Button>
                )}
              </div>
              <Input
                id="currentSalesCycleDays"
                type="number"
                value={defaults.currentSalesCycleDays || ''}
                onChange={(e) => handleChange('currentSalesCycleDays', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetSalesCycleDays">Target Sales Cycle (days)</Label>
              <Input
                id="targetSalesCycleDays"
                type="number"
                value={defaults.targetSalesCycleDays || ''}
                onChange={(e) => handleChange('targetSalesCycleDays', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="60"
              />
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Operational Metrics</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportingHoursPerWeek">Reporting Hours/Week</Label>
              <Input
                id="reportingHoursPerWeek"
                type="number"
                value={defaults.reportingHoursPerWeek || ''}
                onChange={(e) => handleChange('reportingHoursPerWeek', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyCost">Hourly Fully-Loaded Cost ($/hr)</Label>
              <Input
                id="hourlyCost"
                type="number"
                value={defaults.hourlyCost || ''}
                onChange={(e) => handleChange('hourlyCost', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="75"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="arDaysReductionTarget">AR Days Reduction Target</Label>
                {liveKPIs.averageARDays !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Current: {liveKPIs.averageARDays} days
                  </span>
                )}
              </div>
              <Input
                id="arDaysReductionTarget"
                type="number"
                value={defaults.arDaysReductionTarget || ''}
                onChange={(e) => handleChange('arDaysReductionTarget', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="churnReductionTarget">Churn Reduction Target (%)</Label>
              <Input
                id="churnReductionTarget"
                type="number"
                value={defaults.churnReductionTarget || ''}
                onChange={(e) => handleChange('churnReductionTarget', e.target.value)}
                disabled={isDemo || devDemoMode}
                placeholder="2"
              />
            </div>
          </div>
        </div>
      </div>

      <ActionButton
        onClick={handleSave}
        disabled={isSaving || isDemo}
        actionType="admin"
        demoMessage="Demo organization cannot save settings"
      >
        {isSaving ? 'Saving...' : 'Save ROI Defaults'}
      </ActionButton>

      {/* Results */}
      {results && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Estimated Annual Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Incremental Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.incrementalRevenuePerYear)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(results.incrementalRevenuePerMonth)}/month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Time Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.timeSavingsPerYear)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(results.timeSavingsPerMonth)}/month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cash Acceleration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.cashAcceleration)}</div>
                <div className="text-xs text-muted-foreground mt-1">One-time impact</div>
              </CardContent>
            </Card>
            {results.churnReductionValue > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Churn Reduction Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(results.churnReductionValue)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Annual value</div>
                </CardContent>
              </Card>
            )}
            <Card className="md:col-span-2 lg:col-span-1 border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Annual Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(results.totalAnnualImpact)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Estimated annual value</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
