import { Skeleton } from '@/components/ui/skeleton'
import { PerfLoadingMark } from '@/components/perf/PerfLoadingMark'

export default function Loading() {
  return (
    <div className="space-y-6">
      <PerfLoadingMark />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-80" />
    </div>
  )
}

