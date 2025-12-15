'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DemoStep {
  id: number
  title: string
  route: string
  whatItMeans: string[]
  valueToClient: string[]
  proof: string
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Command Center - Executive KPIs',
    route: '/app',
    whatItMeans: [
      'Real-time visibility into all key business metrics',
      'Drill-down capability from high-level KPIs to detailed data',
      'Single source of truth for executive decision-making',
    ],
    valueToClient: [
      'Eliminate time spent gathering data from multiple systems',
      'Make faster, data-driven decisions',
      'Identify issues before they become problems',
    ],
    proof: 'Click any KPI card to see detailed table view with filtering and export',
  },
  {
    id: 2,
    title: 'Sales Funnel & Pipeline Forecast',
    route: '/app/sales',
    whatItMeans: [
      'Visual pipeline with stage-by-stage conversion metrics',
      'Revenue forecasting based on close dates and probabilities',
      'Activity tracking tied directly to opportunities',
    ],
    valueToClient: [
      'Improve win rates by identifying bottlenecks in the sales process',
      'Accurate revenue forecasting for planning',
      'Reduce sales cycle time through better visibility',
    ],
    proof: 'Funnel chart shows conversion rates; forecast table shows 30/60/90 day pipeline',
  },
  {
    id: 3,
    title: 'Ops Exceptions & SLA Tracking',
    route: '/app/ops',
    whatItMeans: [
      'Work orders with status, priority, and blockers highlighted',
      'Task management with assignment and due dates',
      'Exception-based management (only see what needs attention)',
    ],
    valueToClient: [
      'Improve on-time delivery and customer satisfaction',
      'Reduce manual check-ins and status updates',
      'Identify recurring blockers proactively',
    ],
    proof: 'Work orders table shows status distribution; blocked items are highlighted',
  },
  {
    id: 4,
    title: 'Finance AR Aging & Overdue Invoices',
    route: '/app/finance',
    whatItMeans: [
      'Accounts receivable aging analysis',
      'Overdue invoice identification and prioritization',
      'Payment tracking tied to invoices',
    ],
    valueToClient: [
      'Reduce days sales outstanding (DSO)',
      'Improve cash flow through faster collections',
      'Identify at-risk accounts early',
    ],
    proof: 'AR aging chart shows outstanding balances by age; overdue list prioritizes collections',
  },
  {
    id: 5,
    title: 'Customer Health & Renewals',
    route: '/app/success',
    whatItMeans: [
      'Account health scoring with override capability',
      'Renewal date tracking and alerts',
      'Health trends over time',
    ],
    valueToClient: [
      'Reduce churn by identifying at-risk accounts early',
      'Increase upsell/cross-sell opportunities',
      'Prioritize customer success efforts',
    ],
    proof: 'Account health scores are visible; renewal dates drive proactive outreach',
  },
  {
    id: 6,
    title: 'Data Quality & Metric Catalog',
    route: '/app/data/metrics',
    whatItMeans: [
      'Freshness, completeness, duplicate, and orphan detection',
      'Curated metric catalog with formulas and sources',
      'Data credibility dashboard',
    ],
    valueToClient: [
      'Trust your data - know when metrics are stale or incomplete',
      'Standardize metric definitions across the organization',
      'Build confidence in reporting and decision-making',
    ],
    proof: 'Data quality panel shows freshness/completeness scores; metric catalog documents each KPI',
  },
  {
    id: 7,
    title: 'Action Center - Writeback & Execution',
    route: '/app/actions',
    whatItMeans: [
      'Unified task list across all business functions',
      'Writeback capabilities (update status, assign, add notes)',
      'Integration points for external systems',
    ],
    valueToClient: [
      'Close the loop - take action on insights',
      'Reduce context switching between systems',
      'Enable self-service for common updates',
    ],
    proof: 'Action Center shows "My Tasks"; in production, updates write back to source systems',
  },
]

interface DemoPresentationProps {
  orgContext: {
    orgId: string
    orgName: string
    isDemo: boolean
  }
}

export function DemoPresentation({ orgContext }: DemoPresentationProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  const currentStepData = DEMO_STEPS.find((s) => s.id === currentStep) || DEMO_STEPS[0]
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === DEMO_STEPS.length

  function handleNext() {
    if (currentStep < DEMO_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleStepClick(stepId: number) {
    setCurrentStep(stepId)
  }

  function handleGoToRoute() {
    router.push(currentStepData.route)
  }

  return (
    <div className="space-y-6">
      {/* Step Navigation */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {DEMO_STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              currentStep === step.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-accent border-border',
              step.id < currentStep && 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
            )}
          >
            {step.id < currentStep && <CheckCircle2 className="h-4 w-4" />}
            <span className="font-medium">{step.id}</span>
            <span className="hidden sm:inline text-sm">{step.title.split(' - ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Step {currentStep}: {currentStepData.title}</CardTitle>
              <CardDescription className="mt-2">
                Click the button below to view this section in the app
              </CardDescription>
            </div>
            <Button onClick={handleGoToRoute} variant="outline" className="gap-2">
              View in App
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What This Means */}
          <div>
            <h3 className="text-lg font-semibold mb-3">What This Means</h3>
            <ul className="space-y-2">
              {currentStepData.whatItMeans.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Value to Client */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Value to Client</h3>
            <ul className="space-y-2">
              {currentStepData.valueToClient.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Proof */}
          <div className="p-4 bg-muted rounded-lg border">
            <h3 className="text-sm font-semibold mb-2">Proof</h3>
            <p className="text-sm text-muted-foreground">{currentStepData.proof}</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {DEMO_STEPS.length}
            </span>
            <Button
              onClick={handleNext}
              disabled={isLastStep}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {isLastStep && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Demo Complete
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              You've seen the key capabilities of CompassIQ. Next steps:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>• Review the ROI Calculator to see potential impact</li>
              <li>• Discuss implementation timeline and data integration</li>
              <li>• Schedule a follow-up to answer questions</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

