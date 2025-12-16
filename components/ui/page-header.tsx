import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
}

export function PageHeader({ title, subtitle, primaryAction, secondaryAction }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  )
}
