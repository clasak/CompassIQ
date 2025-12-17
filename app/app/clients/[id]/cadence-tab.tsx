'use client'

import { useState } from 'react'
import { ClientCadence, getCadences, createCadence, updateCadence, deleteCadence } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CadenceTabProps {
  projectId: string
  initialCadences: ClientCadence[]
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export function CadenceTab({ projectId, initialCadences }: CadenceTabProps) {
  const router = useRouter()
  const [cadences, setCadences] = useState<ClientCadence[]>(initialCadences)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    timeOfDay: '10:00',
    timezone: 'America/New_York',
    attendeeEmail: '',
    attendeeName: '',
  })
  const [attendees, setAttendees] = useState<Array<{ email: string; name: string }>>([])

  const handleAddAttendee = () => {
    if (!formData.attendeeEmail || !formData.attendeeName) return
    setAttendees([...attendees, { email: formData.attendeeEmail, name: formData.attendeeName }])
    setFormData({ ...formData, attendeeEmail: '', attendeeName: '' })
  }

  const handleCreate = async () => {
    if (attendees.length === 0) return

    setIsLoading(true)
    const result = await createCadence({
      projectId,
      dayOfWeek: formData.dayOfWeek,
      timeOfDay: formData.timeOfDay,
      timezone: formData.timezone,
      attendees,
    })

    if (result.success && result.cadence) {
      setCadences([...cadences, result.cadence])
      setIsCreateOpen(false)
      setAttendees([])
      setFormData({ dayOfWeek: 1, timeOfDay: '10:00', timezone: 'America/New_York', attendeeEmail: '', attendeeName: '' })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    await updateCadence(id, { is_active: !currentStatus })
    setCadences(cadences.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c)))
    router.refresh()
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cadence?')) return

    setIsLoading(true)
    const result = await deleteCadence(id)
    if (result.success) {
      setCadences(cadences.filter((c) => c.id !== id))
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meeting Cadence</CardTitle>
              <CardDescription>
                Configure recurring meeting schedules for client reviews
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Cadence
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Meeting Cadence</DialogTitle>
                  <DialogDescription>
                    Set up a recurring meeting schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dayOfWeek">Day of Week</Label>
                      <Select
                        value={formData.dayOfWeek.toString()}
                        onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}
                      >
                        <SelectTrigger id="dayOfWeek">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeOfDay">Time</Label>
                      <Input
                        id="timeOfDay"
                        type="time"
                        value={formData.timeOfDay}
                        onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Attendees</Label>
                    <div className="space-y-2">
                      {attendees.map((attendee, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                          <span className="flex-1">{attendee.name} ({attendee.email})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAttendees(attendees.filter((_, i) => i !== idx))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Name"
                          value={formData.attendeeName}
                          onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={formData.attendeeEmail}
                          onChange={(e) => setFormData({ ...formData, attendeeEmail: e.target.value })}
                        />
                        <Button type="button" variant="outline" onClick={handleAddAttendee}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading || attendees.length === 0}>
                    {isLoading ? 'Adding...' : 'Add Cadence'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {cadences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meeting cadences configured yet.</p>
              <p className="text-sm">Set up recurring meetings for client reviews.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cadences.map((cadence) => {
                const dayLabel = daysOfWeek.find((d) => d.value === cadence.day_of_week)?.label || 'Unknown'

                return (
                  <div
                    key={cadence.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {dayLabel}s at {cadence.time_of_day}
                          </div>
                          <div className="text-sm text-muted-foreground">{cadence.timezone}</div>
                        </div>
                        {!cadence.is_active && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {cadence.attendees.length} attendee{cadence.attendees.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(cadence.id, cadence.is_active)}
                        disabled={isLoading}
                      >
                        {cadence.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cadence.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


