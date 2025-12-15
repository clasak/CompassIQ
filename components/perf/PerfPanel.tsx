'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { isPerfClientEnabled, perfClearEvents, perfGetEvents, perfSummarizeRendered } from '@/lib/perf'
import { cn } from '@/lib/utils'

export function PerfPanel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [enabled, setEnabled] = useState(false)
  const [eventsCount, setEventsCount] = useState(0)

  const pageKey = useMemo(() => {
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    setEnabled(isPerfClientEnabled())
  }, [searchParams])

  useEffect(() => {
    if (!enabled) return
    const onUpdate = () => setEventsCount(perfGetEvents().length)
    onUpdate()
    window.addEventListener('compassiq:perf', onUpdate)
    return () => window.removeEventListener('compassiq:perf', onUpdate)
  }, [enabled])

  const summary = useMemo(() => {
    if (!enabled) return []
    return perfSummarizeRendered(perfGetEvents())
  }, [enabled, eventsCount])

  if (!enabled) return null

  return (
    <div className="fixed bottom-3 left-3 z-[9999] w-[420px]">
      <Card className="border-primary/30 shadow-lg">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">Perf</div>
            <div className="text-xs text-muted-foreground">{pageKey}</div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground">
              Events <span className="font-mono">{eventsCount}</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log(JSON.stringify(perfGetEvents(), null, 2))
                }}
              >
                Log JSON
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => perfClearEvents()}>
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  window.localStorage.setItem('UI_PERF', '0')
                  const url = new URL(window.location.href)
                  url.searchParams.delete('perf')
                  window.location.assign(url.toString())
                }}
              >
                Disable
              </Button>
            </div>
          </div>

          <div className="max-h-44 overflow-auto text-xs">
            {summary.length === 0 ? (
              <div className="text-muted-foreground">No nav timings yet.</div>
            ) : (
              <div className="space-y-1">
                {summary.map((row) => (
                  <div
                    key={row.path}
                    className={cn(
                      'flex items-center justify-between rounded border px-2 py-1 font-mono',
                      row.p95Ms > 800 && 'border-destructive text-destructive'
                    )}
                  >
                    <span className="truncate">{row.path}</span>
                    <span className="shrink-0">
                      {row.medianMs.toFixed(0)}ms / p95 {row.p95Ms.toFixed(0)}ms ({row.count})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground">
            Target: median &lt; 300ms, p95 &lt; 800ms
          </div>
        </div>
      </Card>
    </div>
  )
}

