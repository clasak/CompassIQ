'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useBranding } from '@/components/branding/BrandProvider'
import { BrandMark } from '@/components/branding/BrandMark'

type Shot = {
  id: string
  title: string
  url: string
  filename: string
  mustShow: string
}

const STORAGE_KEY = 'SCREENSHOT_PACK_PROGRESS'

const SHOTS: Shot[] = [
  {
    id: '01',
    title: 'Command Center',
    url: '/app',
    filename: '01-command-center.png',
    mustShow: 'KPI cards visible (Revenue, Pipeline, AR, Delivery, Churn)',
  },
  {
    id: '02',
    title: 'Sales Pipeline',
    url: '/app/sales?filter=pipeline',
    filename: '02-sales-pipeline.png',
    mustShow: 'Pipeline funnel + table visible',
  },
  {
    id: '03',
    title: 'Ops Control Tower',
    url: '/app/ops?filter=delivery',
    filename: '03-ops-control-tower.png',
    mustShow: 'Work orders table + delivery context',
  },
  {
    id: '04',
    title: 'Finance AR',
    url: '/app/finance?filter=ar',
    filename: '04-finance-ar.png',
    mustShow: 'Invoices table filtered to outstanding balances',
  },
  {
    id: '05',
    title: 'Success Tickets',
    url: '/app/success',
    filename: '05-success-tickets.png',
    mustShow: 'Tickets table visible',
  },
  {
    id: '06',
    title: 'ROI Calculator',
    url: '/app/roi',
    filename: '06-roi-calculator.png',
    mustShow: 'ROI defaults + results visible',
  },
  {
    id: '07',
    title: 'Demo Script',
    url: '/app/internal/script',
    filename: '07-demo-script.png',
    mustShow: 'Demo script sections visible',
  },
  {
    id: '08',
    title: 'Settings Setup',
    url: '/app/settings/setup',
    filename: '08-settings-setup.png',
    mustShow: 'Setup wizard visible (read-only banner in demo org is OK)',
  },
]

export function ScreenshotPack() {
  const [captured, setCaptured] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState<string>('')
  const { branding } = useBranding()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.captured) setCaptured(parsed.captured)
      if (typeof parsed?.notes === 'string') setNotes(parsed.notes)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ captured, notes }))
    } catch {
      // ignore
    }
  }, [captured, notes])

  const progress = useMemo(() => {
    const total = SHOTS.length
    const done = SHOTS.filter((s) => captured[s.id]).length
    return { total, done }
  }, [captured])

  function toggle(id: string) {
    setCaptured((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function exportProgress() {
    const payload = {
      version: 1,
      createdAt: new Date().toISOString(),
      progress,
      notes,
      shots: SHOTS.map((s) => ({
        ...s,
        captured: Boolean(captured[s.id]),
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compassiq-screenshot-pack-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Checklist exported')
  }

  function resetProgress() {
    setCaptured({})
    setNotes('')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    toast.success('Progress cleared')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrandMark url={branding.mark_url} size={22} alt={branding.brand_name} />
            <h1 className="text-3xl font-bold">{branding.brand_name} Screenshot Pack</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Capture 8 key screens in order. Use the suggested filenames for a consistent pack.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportProgress}>
            Export Checklist JSON
          </Button>
          <Button variant="outline" onClick={resetProgress} title="Clears checklist progress">
            Reset
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Progress</div>
          <div className="font-mono text-sm">
            {progress.done}/{progress.total}
          </div>
        </div>
      </Card>

      <div className="grid gap-3">
        {SHOTS.map((s) => (
          <Card key={s.id} className="p-4" data-screenshot-item={s.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold">
                  {s.id}. {s.title}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  URL: <span className="font-mono">{s.url}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Filename: <span className="font-mono">{s.filename}</span>
                </div>
                <div className="text-sm mt-2">
                  <span className="text-muted-foreground">Must show:</span> {s.mustShow}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button asChild variant="outline">
                  <Link href={s.url}>Open Screen</Link>
                </Button>
                <Button
                  variant={captured[s.id] ? 'default' : 'outline'}
                  onClick={() => toggle(s.id)}
                >
                  {captured[s.id] ? 'Captured' : 'Mark Captured'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-2">
        <div className="font-medium">Notes</div>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes (e.g., which org, what filters, what story you told)"
        />
      </Card>
    </div>
  )
}
