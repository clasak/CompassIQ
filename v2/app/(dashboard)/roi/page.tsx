'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HeroMetric } from '@/components/ui/hero-metric'
import { formatCurrency } from '@/lib/utils'
import {
  Calculator,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Target,
  Zap,
  Download,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'

interface ROIInputs {
  avgDealSize: number
  dealsPerMonth: number
  winRate: number
  avgSalesCycle: number
  salesReps: number
  hourlyRate: number
  hoursOnAdmin: number
  leadResponseTime: number
  dataAccuracyIssues: number
}

const defaultInputs: ROIInputs = {
  avgDealSize: 48000,
  dealsPerMonth: 12,
  winRate: 34,
  avgSalesCycle: 42,
  salesReps: 8,
  hourlyRate: 75,
  hoursOnAdmin: 10,
  leadResponseTime: 4,
  dataAccuracyIssues: 15,
}

// Improvement factors based on industry benchmarks
const improvements = {
  winRateIncrease: 0.15, // 15% improvement in win rate
  cycleReduction: 0.20, // 20% reduction in sales cycle
  adminReduction: 0.60, // 60% reduction in admin time
  responseTimeReduction: 0.75, // 75% faster lead response
  accuracyImprovement: 0.80, // 80% reduction in data issues
}

function InputSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  icon: Icon,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  prefix?: string
  suffix?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-text-tertiary" />
          <span className="text-sm font-medium text-text-primary">{label}</span>
        </div>
        <span className="font-mono text-sm text-pipeline tabular-nums">
          {prefix}{value.toLocaleString()}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-surface-subtle rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-pipeline
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-pipeline
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-xs text-text-tertiary">
        <span>{prefix}{min.toLocaleString()}{suffix}</span>
        <span>{prefix}{max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  )
}

function ImpactCard({
  label,
  before,
  after,
  improvement,
  prefix = '',
  suffix = '',
  delay = 0,
}: {
  label: string
  before: number
  after: number
  improvement: string
  prefix?: string
  suffix?: string
  delay?: number
}) {
  const isPositive = after > before || (suffix === ' days' && after < before)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 rounded-xl bg-surface-subtle border border-border"
    >
      <span className="text-xs uppercase tracking-wider text-text-tertiary font-medium">
        {label}
      </span>
      <div className="mt-2 flex items-end gap-3">
        <div className="flex-1">
          <span className="text-text-tertiary text-sm line-through">
            {prefix}{before.toLocaleString()}{suffix}
          </span>
          <span className="block font-mono text-2xl font-bold text-text-primary tabular-nums">
            {prefix}{after.toLocaleString()}{suffix}
          </span>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-md ${
          isPositive ? 'bg-revenue-muted text-revenue' : 'bg-danger-muted text-danger'
        }`}>
          {improvement}
        </span>
      </div>
    </motion.div>
  )
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState<ROIInputs>(defaultInputs)

  const updateInput = (key: keyof ROIInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const resetInputs = () => setInputs(defaultInputs)

  const calculations = useMemo(() => {
    // Current state
    const currentAnnualRevenue = inputs.avgDealSize * inputs.dealsPerMonth * 12 * (inputs.winRate / 100)
    const currentAdminCost = inputs.salesReps * inputs.hoursOnAdmin * 4 * 12 * inputs.hourlyRate
    
    // Improved state
    const improvedWinRate = Math.min(inputs.winRate * (1 + improvements.winRateIncrease), 100)
    const improvedCycle = Math.round(inputs.avgSalesCycle * (1 - improvements.cycleReduction))
    const improvedAdminHours = Math.round(inputs.hoursOnAdmin * (1 - improvements.adminReduction))
    const improvedResponseTime = Math.round(inputs.leadResponseTime * (1 - improvements.responseTimeReduction))
    const improvedDataIssues = Math.round(inputs.dataAccuracyIssues * (1 - improvements.accuracyImprovement))
    
    // More deals due to faster cycle
    const cycleMultiplier = inputs.avgSalesCycle / improvedCycle
    const improvedDealsPerMonth = Math.round(inputs.dealsPerMonth * cycleMultiplier * 0.9) // Conservative
    
    const improvedAnnualRevenue = inputs.avgDealSize * improvedDealsPerMonth * 12 * (improvedWinRate / 100)
    const improvedAdminCost = inputs.salesReps * improvedAdminHours * 4 * 12 * inputs.hourlyRate
    
    // ROI calculations
    const revenueGain = improvedAnnualRevenue - currentAnnualRevenue
    const costSavings = currentAdminCost - improvedAdminCost
    const totalAnnualValue = revenueGain + costSavings
    
    // Payback period (assuming $50k annual investment)
    const annualInvestment = 50000
    const paybackMonths = Math.round((annualInvestment / totalAnnualValue) * 12)
    const roi = Math.round(((totalAnnualValue - annualInvestment) / annualInvestment) * 100)

    return {
      current: {
        annualRevenue: currentAnnualRevenue,
        adminCost: currentAdminCost,
        winRate: inputs.winRate,
        salesCycle: inputs.avgSalesCycle,
        adminHours: inputs.hoursOnAdmin,
        responseTime: inputs.leadResponseTime,
        dataIssues: inputs.dataAccuracyIssues,
      },
      improved: {
        annualRevenue: improvedAnnualRevenue,
        adminCost: improvedAdminCost,
        winRate: improvedWinRate,
        salesCycle: improvedCycle,
        adminHours: improvedAdminHours,
        responseTime: improvedResponseTime,
        dataIssues: improvedDataIssues,
        dealsPerMonth: improvedDealsPerMonth,
      },
      impact: {
        revenueGain,
        costSavings,
        totalAnnualValue,
        paybackMonths,
        roi,
      },
    }
  }, [inputs])

  return (
    <div className="space-y-8">
      <PageHeader
        title="ROI Calculator"
        description="Quantify the business impact of CompassIQ"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={resetInputs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Hero Impact Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HeroMetric
          label="Annual Value Created"
          value={formatCurrency(calculations.impact.totalAnnualValue)}
          variant="revenue"
          size="lg"
          delay={0}
        />
        <HeroMetric
          label="Return on Investment"
          value={`${calculations.impact.roi}%`}
          variant="revenue"
          size="lg"
          delay={0.1}
        />
        <HeroMetric
          label="Payback Period"
          value={`${calculations.impact.paybackMonths} mo`}
          variant={calculations.impact.paybackMonths <= 6 ? 'revenue' : 'warning'}
          size="lg"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-pipeline" />
              <CardTitle>Your Business Inputs</CardTitle>
            </div>
            <CardDescription>
              Adjust these values to match your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Average Deal Size"
              value={inputs.avgDealSize}
              onChange={(v) => updateInput('avgDealSize', v)}
              min={5000}
              max={500000}
              step={5000}
              prefix="$"
              icon={DollarSign}
            />
            <InputSlider
              label="Deals Closed Per Month"
              value={inputs.dealsPerMonth}
              onChange={(v) => updateInput('dealsPerMonth', v)}
              min={1}
              max={50}
              icon={Target}
            />
            <InputSlider
              label="Current Win Rate"
              value={inputs.winRate}
              onChange={(v) => updateInput('winRate', v)}
              min={5}
              max={80}
              suffix="%"
              icon={TrendingUp}
            />
            <InputSlider
              label="Average Sales Cycle"
              value={inputs.avgSalesCycle}
              onChange={(v) => updateInput('avgSalesCycle', v)}
              min={7}
              max={180}
              suffix=" days"
              icon={Clock}
            />
            <InputSlider
              label="Number of Sales Reps"
              value={inputs.salesReps}
              onChange={(v) => updateInput('salesReps', v)}
              min={1}
              max={50}
              icon={Users}
            />
            <InputSlider
              label="Hours on Admin/Week (per rep)"
              value={inputs.hoursOnAdmin}
              onChange={(v) => updateInput('hoursOnAdmin', v)}
              min={1}
              max={30}
              suffix=" hrs"
              icon={Clock}
            />
          </CardContent>
        </Card>

        {/* Impact Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-revenue" />
                <CardTitle>Projected Impact</CardTitle>
              </div>
              <CardDescription>
                Based on industry benchmarks and CompassIQ performance data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImpactCard
                label="Win Rate"
                before={calculations.current.winRate}
                after={Math.round(calculations.improved.winRate)}
                improvement={`+${Math.round(improvements.winRateIncrease * 100)}%`}
                suffix="%"
                delay={0.1}
              />
              <ImpactCard
                label="Sales Cycle"
                before={calculations.current.salesCycle}
                after={calculations.improved.salesCycle}
                improvement={`-${Math.round(improvements.cycleReduction * 100)}%`}
                suffix=" days"
                delay={0.15}
              />
              <ImpactCard
                label="Admin Hours/Week"
                before={calculations.current.adminHours}
                after={calculations.improved.adminHours}
                improvement={`-${Math.round(improvements.adminReduction * 100)}%`}
                suffix=" hrs"
                delay={0.2}
              />
              <ImpactCard
                label="Lead Response Time"
                before={calculations.current.responseTime}
                after={calculations.improved.responseTime}
                improvement={`-${Math.round(improvements.responseTimeReduction * 100)}%`}
                suffix=" hrs"
                delay={0.25}
              />
            </CardContent>
          </Card>

          {/* Value Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Value Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center justify-between p-4 rounded-lg bg-revenue-muted border border-revenue/30"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">Revenue Increase</span>
                  <span className="block text-xs text-text-tertiary mt-1">
                    From improved win rate & faster cycles
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-revenue tabular-nums">
                  +{formatCurrency(calculations.impact.revenueGain)}
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="flex items-center justify-between p-4 rounded-lg bg-pipeline-muted border border-pipeline/30"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">Cost Savings</span>
                  <span className="block text-xs text-text-tertiary mt-1">
                    From reduced admin time
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-pipeline tabular-nums">
                  +{formatCurrency(calculations.impact.costSavings)}
                </span>
              </motion.div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-text-primary">Total Annual Value</span>
                  <span className="font-mono text-2xl font-bold text-revenue tabular-nums">
                    {formatCurrency(calculations.impact.totalAnnualValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center p-8 rounded-2xl bg-gradient-to-br from-pipeline/10 to-revenue/10 border border-pipeline/30"
      >
        <h3 className="text-2xl font-bold text-text-primary mb-2">
          Ready to realize {formatCurrency(calculations.impact.totalAnnualValue)}/year in value?
        </h3>
        <p className="text-text-secondary mb-6">
          Start your 60-day proof pilot and see results in weeks, not months.
        </p>
        <Button size="lg">
          Schedule a Demo
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}
