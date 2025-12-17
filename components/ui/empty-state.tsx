'use client'

import { ReactNode, isValidElement } from 'react'
import { Button } from './button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode
  title: string
  description: string
  action?: ReactNode
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
  icon,
  title,
  description,
  action,
  primaryAction,
  secondaryAction
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null
    if (isValidElement(icon)) {
      return icon
    }
    const Icon = icon as LucideIcon
    return <Icon className="w-8 h-8 text-muted-foreground" />
  }

  return (
    <div className="py-12 text-center px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center">
        {renderIcon()}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <div className="flex items-center justify-center gap-3">
          {action}
        </div>
      )}
      {!action && (primaryAction || secondaryAction) && (
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
      )}
    </div>
  )
}


