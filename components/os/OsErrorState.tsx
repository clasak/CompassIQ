import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface OsErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export function OsErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: OsErrorStateProps) {
  return (
    <Alert variant="destructive" className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4" />
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Alert>
  )
}

