import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OsEmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
  className?: string
}

export function OsEmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  actionDisabled,
  className,
}: OsEmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="py-12 text-center space-y-3">
        {icon && <div className="mx-auto w-fit text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action ? (
          <div className="pt-2 flex justify-center">{action}</div>
        ) : (
          actionLabel &&
          onAction && (
            <div className="pt-2">
              <Button onClick={onAction} disabled={actionDisabled}>
                {actionLabel}
              </Button>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
