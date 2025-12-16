'use client'

import { useState } from 'react'
import { ClientMeeting, getMeetings, createMeeting, updateMeeting, deleteMeeting } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Users, Trash2, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface MeetingsTabProps {
  projectId: string
  initialMeetings: ClientMeeting[]
}

export function MeetingsTab({ projectId, initialMeetings }: MeetingsTabProps) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<ClientMeeting[]>(initialMeetings)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    meetingDate: new Date().toISOString().split('T')[0],
    notes: '',
    attendeeEmail: '',
    attendeeName: '',
  })
  const [attendees, setAttendees] = useState<Array<{ email: string; name: string; attended: boolean }>>([])

  const handleAddAttendee = () => {
    if (!formData.attendeeEmail || !formData.attendeeName) return
    setAttendees([...attendees, { email: formData.attendeeEmail, name: formData.attendeeName, attended: true }])
    setFormData({ ...formData, attendeeEmail: '', attendeeName: '' })
  }

  const handleCreate = async () => {
    if (attendees.length === 0) return

    setIsLoading(true)
    const result = await createMeeting({
      projectId,
      meetingDate: new Date(formData.meetingDate).toISOString(),
      attendees,
      notes: formData.notes,
      actionItems: [],
    })

    if (result.success && result.meeting) {
      setMeetings([result.meeting, ...meetings])
      setIsCreateOpen(false)
      setAttendees([])
      setFormData({ meetingDate: new Date().toISOString().split('T')[0], notes: '', attendeeEmail: '', attendeeName: '' })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting record?')) return

    setIsLoading(true)
    const result = await deleteMeeting(id)
    if (result.success) {
      setMeetings(meetings.filter((m) => m.id !== id))
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
              <CardTitle>Meeting History</CardTitle>
              <CardDescription>
                Track client meetings, action items, and follow-ups
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Log Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Meeting</DialogTitle>
                  <DialogDescription>
                    Record a client meeting and its outcomes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meetingDate">Meeting Date</Label>
                    <Input
                      id="meetingDate"
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    />
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
                  <div>
                    <Label htmlFor="notes">Meeting Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Key discussion points, decisions, and outcomes..."
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading || attendees.length === 0}>
                    {isLoading ? 'Logging...' : 'Log Meeting'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meetings logged yet.</p>
              <p className="text-sm">Log client meetings to track discussions and action items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatDate(meeting.meeting_date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(meeting.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {meeting.notes && (
                    <div className="text-sm whitespace-pre-wrap mb-3 p-3 bg-muted rounded">
                      {meeting.notes}
                    </div>
                  )}
                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium mb-2">Action Items:</div>
                      <ul className="space-y-1 ml-4">
                        {meeting.action_items.map((item) => (
                          <li key={item.id} className="list-disc">
                            {item.title} - {item.owner} (Due: {formatDate(item.due_date)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(meeting.recording_url || meeting.exec_pack_url) && (
                    <div className="flex gap-2 mt-3">
                      {meeting.recording_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={meeting.recording_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Recording
                          </a>
                        </Button>
                      )}
                      {meeting.exec_pack_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={meeting.exec_pack_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Exec Pack
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
