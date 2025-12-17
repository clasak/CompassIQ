'use client'

import { useState } from 'react'
import { Calendar, Clock, Mail, Plus, Trash2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export interface ScheduledReport {
  id: string
  name: string
  reportType: string
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:MM format
  recipients: string[]
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

interface ReportSchedulerProps {
  reports?: ScheduledReport[]
  onSave?: (report: ScheduledReport) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string, enabled: boolean) => void
  availableReports?: { value: string; label: string }[]
}

const defaultReports = [
  { value: 'command-center', label: 'Command Center Dashboard' },
  { value: 'sales-pipeline', label: 'Sales Pipeline Report' },
  { value: 'finance-summary', label: 'Finance Summary' },
  { value: 'ops-metrics', label: 'Operations Metrics' },
  { value: 'client-health', label: 'Client Health Report' },
  { value: 'construction-overview', label: 'Construction Overview' },
]

const daysOfWeek = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

export function ReportScheduler({
  reports = [],
  onSave,
  onDelete,
  onToggle,
  availableReports = defaultReports,
}: ReportSchedulerProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<ScheduledReport>>({
    name: '',
    reportType: '',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '08:00',
    recipients: [],
    enabled: true,
  })
  const [recipientInput, setRecipientInput] = useState('')

  const handleSave = () => {
    if (!formData.name || !formData.reportType || formData.recipients?.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const newReport: ScheduledReport = {
      id: crypto.randomUUID(),
      name: formData.name || '',
      reportType: formData.reportType || '',
      frequency: formData.frequency || 'weekly',
      dayOfWeek: formData.dayOfWeek,
      dayOfMonth: formData.dayOfMonth,
      time: formData.time || '08:00',
      recipients: formData.recipients || [],
      enabled: formData.enabled ?? true,
      nextRun: calculateNextRun(formData),
    }

    onSave?.(newReport)
    toast.success('Report scheduled successfully')
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      reportType: '',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '08:00',
      recipients: [],
      enabled: true,
    })
    setRecipientInput('')
  }

  const addRecipient = () => {
    if (recipientInput && recipientInput.includes('@')) {
      setFormData(prev => ({
        ...prev,
        recipients: [...(prev.recipients || []), recipientInput],
      }))
      setRecipientInput('')
    } else {
      toast.error('Please enter a valid email address')
    }
  }

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients?.filter(r => r !== email) || [],
    }))
  }

  const calculateNextRun = (data: Partial<ScheduledReport>): string => {
    const now = new Date()
    const [hours, minutes] = (data.time || '08:00').split(':').map(Number)

    let nextDate = new Date(now)
    nextDate.setHours(hours, minutes, 0, 0)

    if (data.frequency === 'daily') {
      if (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 1)
      }
    } else if (data.frequency === 'weekly' && data.dayOfWeek !== undefined) {
      const currentDay = now.getDay()
      let daysUntil = data.dayOfWeek - currentDay
      if (daysUntil < 0 || (daysUntil === 0 && nextDate <= now)) {
        daysUntil += 7
      }
      nextDate.setDate(nextDate.getDate() + daysUntil)
    } else if (data.frequency === 'monthly' && data.dayOfMonth !== undefined) {
      nextDate.setDate(data.dayOfMonth)
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
    }

    return nextDate.toISOString()
  }

  const getFrequencyLabel = (report: ScheduledReport): string => {
    if (report.frequency === 'daily') {
      return `Daily at ${report.time}`
    } else if (report.frequency === 'weekly') {
      const day = daysOfWeek.find(d => d.value === String(report.dayOfWeek))?.label || ''
      return `Every ${day} at ${report.time}`
    } else {
      return `Monthly on day ${report.dayOfMonth} at ${report.time}`
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            Automatically send reports to your team
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule a Report</DialogTitle>
              <DialogDescription>
                Set up automatic report delivery to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name</Label>
                <Input
                  id="name"
                  placeholder="Weekly Sales Report"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportType">Report</Label>
                <Select
                  value={formData.reportType}
                  onValueChange={value => setFormData(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReports.map(report => (
                      <SelectItem key={report.value} value={report.value}>
                        {report.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={value => setFormData(prev => ({
                      ...prev,
                      frequency: value as 'daily' | 'weekly' | 'monthly'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              {formData.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={String(formData.dayOfWeek)}
                    onValueChange={value => setFormData(prev => ({ ...prev, dayOfWeek: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Select
                    value={String(formData.dayOfMonth)}
                    onValueChange={value => setFormData(prev => ({ ...prev, dayOfMonth: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={String(day)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={recipientInput}
                    onChange={e => setRecipientInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                  />
                  <Button type="button" variant="outline" onClick={addRecipient}>
                    Add
                  </Button>
                </div>
                {formData.recipients && formData.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.recipients.map(email => (
                      <Badge key={email} variant="secondary" className="gap-1">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(email)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Schedule Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Reports List */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No scheduled reports yet</p>
            <p className="text-sm">Click &quot;Schedule Report&quot; to get started</p>
          </div>
        ) : (
          reports.map(report => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${report.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Calendar className={`h-5 w-5 ${report.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h4 className="font-medium">{report.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{getFrequencyLabel(report)}</span>
                    <span>•</span>
                    <Mail className="h-3 w-3" />
                    <span>{report.recipients.length} recipients</span>
                  </div>
                  {report.nextRun && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Next run: {new Date(report.nextRun).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={report.enabled}
                  onCheckedChange={checked => onToggle?.(report.id, checked)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete?.(report.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
