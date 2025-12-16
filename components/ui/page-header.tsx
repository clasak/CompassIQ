import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  action?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
}

export function PageHeader({ title, subtitle, description, action, primaryAction, secondaryAction }: PageHeaderProps) {
  const desc = description || subtitle
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {desc && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {desc}
            </p>
          )}
        </div>
        {(action || primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3">
            {secondaryAction}
            {primaryAction}
            {action}
          </div>
        )}
      </div>
    </div>
  )
}
