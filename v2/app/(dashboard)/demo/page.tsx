'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Play,
  Maximize2,
  Monitor,
} from 'lucide-react'
import Link from 'next/link'

interface DemoStep {
  id: number
  title: string
  subtitle: string
  route: string
  icon: React.ElementType
  keyPoints: string[]
  valueProps: string[]
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: 'Command Center',
    subtitle: 'Executive KPIs at a glance',
    route: '/',
    icon: LayoutDashboard,
    keyPoints: [
      'Real-time revenue and pipeline visibility',
      'Hero metrics with trend indicators',
      'Priority alerts requiring action',
      'Recent opportunities and tasks',
    ],
    valueProps: [
      'Eliminate morning standup data gathering',
      'Make faster decisions with live data',
      'Identify issues before they become problems',
    ],
  },
  {
    id: 2,
    title: 'Revenue Engine',
    subtitle: 'Pipeline & sales forecasting',
    route: '/revenue',
    icon: TrendingUp,
    keyPoints: [
      '30/60/90 day weighted forecast',
      'Stage-by-stage conversion analysis',
      'Team leaderboard and quota tracking',
      'Deal velocity metrics',
    ],
    valueProps: [
      'Accurate revenue forecasting for planning',
      'Identify bottlenecks in sales process',
      'Coach reps with data-driven insights',
    ],
  },
  {
    id: 3,
    title: 'Operations Hub',
    subtitle: 'Execution & exception tracking',
    route: '/ops',
    icon: Zap,
    keyPoints: [
      'Work order status and blockers',
      'SLA tracking and alerts',
      'Resource allocation view',
      'Exception-based management',
    ],
    valueProps: [
      'Improve on-time delivery rates',
      'Reduce manual status check-ins',
      'Proactive blocker identification',
    ],
  },
  {
    id: 4,
    title: 'Analytics Suite',
    subtitle: 'Deep-dive business intelligence',
    route: '/analytics',
    icon: BarChart3,
    keyPoints: [
      'Custom report builder',
      'Cohort and trend analysis',
      'Multi-dimensional drill-down',
      'Export and scheduling',
    ],
    valueProps: [
      'Self-service analytics for all users',
      'Reduce ad-hoc report requests',
      'Data-driven culture enablement',
    ],
  },
]

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const step = demoSteps[currentStep]
  const Icon = step.icon

  const goNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Presentation Mode"
        description="Guided walkthrough for demos and stakeholder presentations"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
            <Button asChild>
              <Link href={step.route}>
                <Play className="w-4 h-4 mr-2" />
                Launch Demo
              </Link>
            </Button>
          </div>
        }
      />

      {/* Progress Steps */}
      <div className="flex items-center justify-between gap-2">
        {demoSteps.map((s, i) => {
          const StepIcon = s.icon
          const isActive = i === currentStep
          const isPast = i < currentStep

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`flex-1 relative group`}
            >
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-pipeline/10 border-pipeline text-pipeline'
                    : isPast
                    ? 'bg-revenue/10 border-revenue/30 text-revenue'
                    : 'bg-surface-raised border-border text-text-secondary hover:border-border-accent'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium hidden md:block">
                  {s.title}
                </span>
                <span className="text-sm font-medium md:hidden">{i + 1}</span>
              </motion.div>
              {i < demoSteps.length - 1 && (
                <div
                  className={`absolute top-1/2 -right-1 w-2 h-0.5 ${
                    isPast ? 'bg-revenue' : 'bg-border'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Info */}
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-pipeline/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-pipeline" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">
                      {step.title}
                    </h2>
                    <p className="text-text-secondary">{step.subtitle}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-text-tertiary font-medium mb-4">
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {step.keyPoints.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-pipeline mt-2" />
                        <span className="text-text-primary">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-text-tertiary font-medium mb-4">
                    Business Value
                  </h3>
                  <ul className="space-y-3">
                    {step.valueProps.map((prop, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-revenue mt-0.5" />
                        <span className="text-text-primary">{prop}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Button asChild size="lg" className="w-full">
                    <Link href={step.route}>
                      <Monitor className="w-5 h-5 mr-2" />
                      View Live Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>

              {/* Right: Preview */}
              <div className="bg-surface-subtle border-l border-border p-8 flex items-center justify-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-md"
                >
                  <div className="bg-surface-raised rounded-xl border border-border p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-danger" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-revenue" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pipeline/20" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-surface-subtle rounded" />
                          <div className="h-3 w-1/2 bg-surface-subtle rounded" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 bg-surface-subtle rounded-lg" />
                        <div className="h-20 bg-surface-subtle rounded-lg" />
                      </div>
                      <div className="h-32 bg-surface-subtle rounded-lg" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <span className="text-text-tertiary text-sm">
          Step {currentStep + 1} of {demoSteps.length}
        </span>
        <Button
          onClick={goNext}
          disabled={currentStep === demoSteps.length - 1}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
