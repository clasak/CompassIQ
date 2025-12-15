'use client'

import { isDevDemoMode } from '@/lib/runtime'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ModeBanner() {
  const [isDemo, setIsDemo] = useState(false)
  const [isDevDemo, setIsDevDemo] = useState(false)

  useEffect(() => {
    setIsDevDemo(isDevDemoMode())
    // Check if real demo org (would need to fetch from context)
    // For now, just check dev demo mode
  }, [])

  if (!isDevDemo && !isDemo) {
    return null
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        {isDevDemo
          ? 'DEV DEMO MODE (mock data, read-only)'
          : 'DEMO ORG (read-only)'}
      </AlertDescription>
    </Alert>
  )
}

