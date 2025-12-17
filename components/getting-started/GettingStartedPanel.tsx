'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Rocket, FileText, Building2, TrendingUp, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface GettingStartedPanelProps {
  isDemo?: boolean
}

export function GettingStartedPanel({ isDemo }: GettingStartedPanelProps) {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has dismissed this panel
    const dismissedKey = 'getting-started-dismissed'
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true'
    setDismissed(wasDismissed)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('getting-started-dismissed', 'true')
    setDismissed(true)
  }

  if (isDemo || dismissed) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Getting Started</CardTitle>
              <CardDescription className="text-xs">
                Quick actions to populate your CRM
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleDismiss}
            aria-label="Dismiss getting started panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            asChild
          >
            <Link href="/app/sales/intake">
              <FileText className="h-4 w-4 mr-2" />
              Import Intake Pack
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => router.push('/app/crm/accounts?create=true')}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Create Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => router.push('/app/crm/opportunities?create=true')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => router.push('/app/crm/tasks?create=true')}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


