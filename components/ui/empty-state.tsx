import { ReactNode } from 'react'
import { Button } from './button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  primaryAction, 
  secondaryAction 
}: EmptyStateProps) {
  return (
    <div className="py-12 text-center px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
        {description}
      </p>
      <div className="flex items-center justify-center gap-3">
        {secondaryAction && (
          <Button 
            variant="outline" 
            onClick={secondaryAction.onClick}
            asChild={!!secondaryAction.href}
          >
            {secondaryAction.href ? (
              <a href={secondaryAction.href}>{secondaryAction.label}</a>
            ) : (
              secondaryAction.label
            )}
          </Button>
        )}
        {primaryAction && (
          <Button 
            onClick={primaryAction.onClick}
            asChild={!!primaryAction.href}
          >
            {primaryAction.href ? (
              <a href={primaryAction.href}>{primaryAction.label}</a>
            ) : (
              primaryAction.label
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
