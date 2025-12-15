'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function DemoResetButton() {
  const [loading, setLoading] = useState(false)

  async function reset() {
    setLoading(true)
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' })
      if (!res.ok) {
        toast.error('Reset failed')
        return
      }

      // Local demo UI state reset (safe)
      try {
        localStorage.removeItem('DEMO_TOUR_ACTIVE')
        localStorage.removeItem('DEMO_TOUR_STEP')
        localStorage.removeItem('presentation-mode')
      } catch {
        // ignore
      }

      toast.success('Demo reset complete')
      window.location.reload()
    } catch {
      toast.error('Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={reset}
      disabled={loading}
      title="Resets demo org settings to baseline"
    >
      {loading ? 'Resetting…' : 'Reset Demo Data'}
    </Button>
  )
}
