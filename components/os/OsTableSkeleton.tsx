import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface OsTableSkeletonProps {
  rows?: number
  columns?: number
}

export function OsTableSkeleton({ rows = 6, columns = 5 }: OsTableSkeletonProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 w-24" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={`r-${r}`}
              className="grid gap-3 items-center py-3 border-b last:border-b-0"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={`c-${r}-${c}`} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

