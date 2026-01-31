import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, CircleDot, Clock, XCircle } from 'lucide-react'

type InstanceStatus = 'draft' | 'published' | 'archived'
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
type AlertState = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'
type TaskState = 'open' | 'in_progress' | 'done' | 'canceled'

export function InstanceStatusPill({ status }: { status: InstanceStatus }) {
  const meta: Record<InstanceStatus, { label: string; className: string }> = {
    draft: {
      label: 'Draft',
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    },
    published: {
      label: 'Published',
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
    },
    archived: {
      label: 'Archived',
      className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    },
  }
  const m = meta[status] || meta.draft
  return (
    <Badge variant="outline" className={cn('gap-1', m.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {m.label}
    </Badge>
  )
}

export function SeverityPill({ severity }: { severity: AlertSeverity }) {
  const meta: Record<AlertSeverity, { label: string; className: string }> = {
    critical: {
      label: 'Critical',
      className: 'border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200',
    },
    high: {
      label: 'High',
      className: 'border-orange-500/30 bg-orange-500/10 text-orange-900 dark:text-orange-200',
    },
    medium: {
      label: 'Medium',
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    },
    low: {
      label: 'Low',
      className: 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200',
    },
  }
  const m = meta[severity] || meta.medium
  return (
    <Badge variant="outline" className={cn('gap-1', m.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {m.label}
    </Badge>
  )
}

export function AlertStatePill({ state }: { state: AlertState }) {
  const meta: Record<AlertState, { label: string; icon: React.ReactNode; className: string }> = {
    open: {
      label: 'Open',
      icon: <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    },
    acknowledged: {
      label: 'Acknowledged',
      icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200',
    },
    in_progress: {
      label: 'In Progress',
      icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200',
    },
    resolved: {
      label: 'Resolved',
      icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
    },
    dismissed: {
      label: 'Dismissed',
      icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    },
  }
  const m = meta[state] || meta.open
  return (
    <Badge variant="outline" className={cn('gap-1', m.className)}>
      {m.icon}
      {m.label}
    </Badge>
  )
}

export function TaskStatePill({ state }: { state: TaskState }) {
  const meta: Record<TaskState, { label: string; icon: React.ReactNode; className: string }> = {
    open: {
      label: 'Open',
      icon: <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    },
    in_progress: {
      label: 'In Progress',
      icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200',
    },
    done: {
      label: 'Done',
      icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
    },
    canceled: {
      label: 'Canceled',
      icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
      className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    },
  }
  const m = meta[state] || meta.open
  return (
    <Badge variant="outline" className={cn('gap-1', m.className)}>
      {m.icon}
      {m.label}
    </Badge>
  )
}

