'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PreviewBannerProps {
  previewId: string | null
}

export function PreviewBanner({ previewId: initialPreviewId }: PreviewBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if dismissed in sessionStorage
    if (initialPreviewId) {
      const key = `preview-dismissed-${initialPreviewId}`
      const wasDismissed = sessionStorage.getItem(key) === 'true'
      setDismissed(wasDismissed)
    }
  }, [initialPreviewId])

  if (!initialPreviewId || dismissed) return null

  function handleDismiss() {
    if (initialPreviewId) {
      const key = `preview-dismissed-${initialPreviewId}`
      sessionStorage.setItem(key, 'true')
      setDismissed(true)
    }
  }

  async function handleExit() {
    try {
      const res = await fetch('/api/preview/exit', { method: 'POST' })
      if (res.ok) {
        router.refresh()
        router.push('/app')
      } else {
        toast.error('Failed to exit preview')
      }
    } catch (error) {
      console.error('Exit preview error:', error)
      toast.error('Failed to exit preview')
    }
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Info className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900">PREVIEW MODE — Illustrative Data</AlertTitle>
      <AlertDescription className="text-orange-800">
        You are viewing a preview workspace with sample data. This is not your production data.
      </AlertDescription>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={handleExit}>
          Exit Preview
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="h-4 w-4 mr-1" />
          Dismiss
        </Button>
      </div>
    </Alert>
  )
}

