import { cn } from '@/lib/utils'

interface OsPageProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function OsPage({ title, description, actions, children, className }: OsPageProps) {
  return (
    <div className={cn('p-6 md:p-8 max-w-7xl mx-auto space-y-6', className)}>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  )
}

