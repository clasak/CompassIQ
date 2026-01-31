'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, Users, Building2, Database, Bell, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const settingsCategories = [
  {
    name: 'Organization',
    description: 'Company details, branding, and preferences',
    icon: Building2,
  },
  {
    name: 'Users & Permissions',
    description: 'Manage team members and access controls',
    icon: Users,
  },
  {
    name: 'Data Connections',
    description: 'Configure integrations and data sources',
    icon: Database,
  },
  {
    name: 'Notifications',
    description: 'Alert preferences and delivery settings',
    icon: Bell,
  },
  {
    name: 'Security',
    description: 'Authentication, SSO, and security policies',
    icon: Shield,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your CompassIQ workspace"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCategories.map((category, i) => {
          const Icon = category.icon
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card className="cursor-pointer hover:border-border-accent transition-all group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center group-hover:bg-pipeline/10 transition-colors">
                      <Icon className="w-6 h-6 text-text-tertiary group-hover:text-pipeline transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">
                        {category.name}
                      </h3>
                      <p className="text-sm text-text-tertiary mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
