import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock } from 'lucide-react'

interface ReadOnlyBannerProps {
  title?: string
  description?: string
}

export function ReadOnlyBanner({
  title = 'Read-only mode',
  description = 'This workspace is read-only. Switch to a writable organization to make changes.',
}: ReadOnlyBannerProps) {
  return (
    <Alert className="border-amber-500/30 bg-amber-500/10">
      <Lock className="h-4 w-4" />
      <div>
        <AlertTitle className="text-amber-900 dark:text-amber-200">{title}</AlertTitle>
        <AlertDescription className="text-amber-900/80 dark:text-amber-200/80">
          {description}
        </AlertDescription>
      </div>
    </Alert>
  )
}

