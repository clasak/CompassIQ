'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  Database,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Sparkles,
} from 'lucide-react'

interface SetupData {
  companyName: string
  industry: string
  size: string
  adminName: string
  adminEmail: string
  dataSources: string[]
  kpiCategories: string[]
  timezone: string
}

const industries = [
  'Technology',
  'SaaS',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Other',
]

const companySizes = [
  { label: '1-10 employees', value: 'startup' },
  { label: '11-50 employees', value: 'small' },
  { label: '51-200 employees', value: 'medium' },
  { label: '201-1000 employees', value: 'large' },
  { label: '1000+ employees', value: 'enterprise' },
]

const dataSourceOptions = [
  { id: 'salesforce', label: 'Salesforce', icon: Globe },
  { id: 'hubspot', label: 'HubSpot', icon: Target },
  { id: 'quickbooks', label: 'QuickBooks', icon: Database },
  { id: 'stripe', label: 'Stripe', icon: Zap },
  { id: 'sheets', label: 'Google Sheets', icon: BarChart3 },
  { id: 'api', label: 'Custom API', icon: Database },
]

const kpiCategoryOptions = [
  { id: 'revenue', label: 'Revenue & Sales', description: 'ARR, MRR, Win Rate, Pipeline' },
  { id: 'operations', label: 'Operations', description: 'SLA, Utilization, Delivery' },
  { id: 'finance', label: 'Finance', description: 'AR, Collections, Margins' },
  { id: 'customer', label: 'Customer Success', description: 'NPS, Churn, Health Score' },
  { id: 'marketing', label: 'Marketing', description: 'CAC, LTV, Conversion' },
]

const steps = [
  { id: 1, title: 'Company', icon: Building2 },
  { id: 2, title: 'Admin', icon: Users },
  { id: 3, title: 'Data Sources', icon: Database },
  { id: 4, title: 'KPIs', icon: Target },
  { id: 5, title: 'Review', icon: CheckCircle2 },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => {
        const isActive = step.id === currentStep
        const isCompleted = step.id < currentStep
        const Icon = step.icon
        
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
                backgroundColor: isCompleted ? '#10B981' : isActive ? '#3B82F6' : 'transparent',
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isCompleted
                  ? 'border-revenue'
                  : isActive
                  ? 'border-pipeline'
                  : 'border-border'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-tertiary'}`} />
              )}
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                isCompleted ? 'bg-revenue' : 'bg-border'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-surface-subtle border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-pipeline focus:border-transparent transition-all"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[] | string[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-surface-subtle border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-pipeline focus:border-transparent transition-all appearance-none cursor-pointer"
      >
        <option value="">Select...</option>
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          )
        })}
      </select>
    </div>
  )
}

function ToggleCard({
  id,
  label,
  description,
  icon: Icon,
  selected,
  onToggle,
}: {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  selected: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-pipeline bg-pipeline/10'
          : 'border-border hover:border-border-accent bg-surface-subtle'
      }`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${selected ? 'bg-pipeline/20' : 'bg-surface-overlay'}`}>
            <Icon className={`w-5 h-5 ${selected ? 'text-pipeline' : 'text-text-tertiary'}`} />
          </div>
        )}
        <div className="flex-1">
          <span className={`font-medium ${selected ? 'text-pipeline' : 'text-text-primary'}`}>
            {label}
          </span>
          {description && (
            <span className="block text-xs text-text-tertiary mt-1">{description}</span>
          )}
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-pipeline bg-pipeline' : 'border-border'
        }`}>
          {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
      </div>
    </motion.button>
  )
}

export default function SetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [data, setData] = useState<SetupData>({
    companyName: '',
    industry: '',
    size: '',
    adminName: '',
    adminEmail: '',
    dataSources: [],
    kpiCategories: ['revenue'],
    timezone: 'America/Chicago',
  })

  const updateData = (key: keyof SetupData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayItem = (key: 'dataSources' | 'kpiCategories', item: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((i) => i !== item)
        : [...prev[key], item],
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.companyName && data.industry && data.size
      case 2:
        return data.adminName && data.adminEmail
      case 3:
        return data.dataSources.length > 0
      case 4:
        return data.kpiCategories.length > 0
      default:
        return true
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    // Simulate deployment
    await new Promise((r) => setTimeout(r, 3000))
    setIsDeploying(false)
    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-revenue/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-revenue" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {data.companyName} is Ready!
          </h2>
          <p className="text-text-secondary mb-6">
            Your CompassIQ instance has been configured. The admin will receive
            an email with login instructions.
          </p>
          <div className="space-y-3">
            <Button size="lg" className="w-full">
              Open Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full">
              Configure Another Client
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Client Setup Wizard"
        description="Configure a new CompassIQ instance in minutes"
      />

      <StepIndicator currentStep={currentStep} />

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    Company Information
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Tell us about the organization
                  </p>
                </div>
                <InputField
                  label="Company Name"
                  value={data.companyName}
                  onChange={(v) => updateData('companyName', v)}
                  placeholder="Acme Corporation"
                />
                <SelectField
                  label="Industry"
                  value={data.industry}
                  onChange={(v) => updateData('industry', v)}
                  options={industries}
                />
                <SelectField
                  label="Company Size"
                  value={data.size}
                  onChange={(v) => updateData('size', v)}
                  options={companySizes}
                />
              </motion.div>
            )}

            {/* Step 2: Admin */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    Admin Account
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Who will manage this instance?
                  </p>
                </div>
                <InputField
                  label="Admin Name"
                  value={data.adminName}
                  onChange={(v) => updateData('adminName', v)}
                  placeholder="John Smith"
                />
                <InputField
                  label="Admin Email"
                  value={data.adminEmail}
                  onChange={(v) => updateData('adminEmail', v)}
                  placeholder="john@company.com"
                  type="email"
                />
                <div className="p-4 rounded-lg bg-pipeline/10 border border-pipeline/30">
                  <div className="flex items-center gap-2 text-pipeline text-sm">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Secure Invite</span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    An email with a secure login link will be sent to the admin.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Data Sources */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    Data Sources
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Select the systems to connect (can be configured later)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dataSourceOptions.map((source) => (
                    <ToggleCard
                      key={source.id}
                      id={source.id}
                      label={source.label}
                      icon={source.icon}
                      selected={data.dataSources.includes(source.id)}
                      onToggle={() => toggleArrayItem('dataSources', source.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: KPIs */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    KPI Categories
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Which metrics matter most?
                  </p>
                </div>
                <div className="space-y-3">
                  {kpiCategoryOptions.map((cat) => (
                    <ToggleCard
                      key={cat.id}
                      id={cat.id}
                      label={cat.label}
                      description={cat.description}
                      selected={data.kpiCategories.includes(cat.id)}
                      onToggle={() => toggleArrayItem('kpiCategories', cat.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    Review & Deploy
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Confirm the configuration
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-tertiary">
                      Company
                    </span>
                    <div className="mt-1">
                      <span className="font-medium text-text-primary">
                        {data.companyName}
                      </span>
                      <span className="text-text-secondary ml-2">
                        ({data.industry} · {companySizes.find(s => s.value === data.size)?.label})
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-tertiary">
                      Admin
                    </span>
                    <div className="mt-1">
                      <span className="font-medium text-text-primary">
                        {data.adminName}
                      </span>
                      <span className="text-text-secondary ml-2">
                        ({data.adminEmail})
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-tertiary">
                      Data Sources
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.dataSources.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-1 rounded-md bg-pipeline/10 text-pipeline text-xs font-medium"
                        >
                          {dataSourceOptions.find((s) => s.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-subtle border border-border">
                    <span className="text-xs uppercase tracking-wider text-text-tertiary">
                      KPI Categories
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.kpiCategories.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-1 rounded-md bg-revenue/10 text-revenue text-xs font-medium"
                        >
                          {kpiCategoryOptions.find((c) => c.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 mr-2"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Deploy Instance
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
