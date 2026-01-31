'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/use-role'
import { PermissionButton } from '@/components/ui/permission-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OsPage } from '@/components/os/OsPage'
import { ReadOnlyBanner } from '@/components/os/ReadOnlyBanner'
import { OsEmptyState } from '@/components/os/OsEmptyState'
import { OsErrorState } from '@/components/os/OsErrorState'
import { OsTableSkeleton } from '@/components/os/OsTableSkeleton'
import { ActiveFilters } from '@/components/os/ActiveFilters'
import { TaskStatePill } from '@/components/os/OsPills'
import { formatDate } from '@/lib/utils'
import { ClipboardCheck, Plus, RefreshCw, Search } from 'lucide-react'

interface Task {
  id: string
  alert_id: string | null
  title: string
  description: string | null
  owner: string
  state: 'open' | 'in_progress' | 'done' | 'canceled'
  due_at: string | null
  completed_at: string | null
  proof: any
  alerts?: {
    title: string
    severity: string
  }
}

export default function TasksPage() {
  const { canWriteAdmin, isDemo, loading: roleLoading } = useRole()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', owner: '', due_at: '' })

  const [proofOpen, setProofOpen] = useState(false)
  const [proofMode, setProofMode] = useState<'add' | 'view'>('add')
  const [proofNotes, setProofNotes] = useState('')
  const [proofTaskId, setProofTaskId] = useState<string | null>(null)
  const [proofTaskTitle, setProofTaskTitle] = useState<string | null>(null)
  const [savingProof, setSavingProof] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setError(null)
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (stateFilter !== 'all') params.append('state', stateFilter)

      const res = await fetch(`/api/os/tasks?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load tasks (${res.status})`)
      }
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tasks'
      setError(message)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [stateFilter])

  async function handleCreateTask() {
    if (!canWriteAdmin) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return false
    }

    if (!newTask.title || !newTask.owner) {
      toast.error('Title and owner are required')
      return false
    }

    try {
      setCreating(true)
      const res = await fetch('/api/os/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || undefined,
          owner: newTask.owner,
          due_at: newTask.due_at || undefined
        })
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
          return false
        }
        throw new Error(data.error || 'Failed to create task')
      }

      setCreateOpen(false)
      setNewTask({ title: '', description: '', owner: '', due_at: '' })
      await fetchTasks()
      toast.success('Task created')
      return true
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create task')
      return false
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateTask(taskId: string, updates: any): Promise<boolean> {
    if (!canWriteAdmin) {
      toast.error(isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required')
      return false
    }

    try {
      const res = await fetch(`/api/os/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.code === 'DEMO_READ_ONLY') {
          toast.error('Demo org is read-only')
          return false
        }
        throw new Error(data.error || 'Failed to update task')
      }

      await fetchTasks()
      return true
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update task')
      return false
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tasks
    return tasks.filter((t) => {
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.owner || '').toLowerCase().includes(q) ||
        (t.alerts?.title || '').toLowerCase().includes(q)
      )
    })
  }, [tasks, search])

  function openProof(task: Task, mode: 'add' | 'view') {
    setProofMode(mode)
    setProofTaskId(task.id)
    setProofTaskTitle(task.title)
    setProofNotes(mode === 'view' ? (task.proof?.notes || '') : '')
    setProofOpen(true)
  }

  async function submitProof() {
    if (!proofTaskId) return
    if (!proofNotes.trim()) {
      toast.error('Proof notes are required')
      return
    }
    setSavingProof(true)
    try {
      const ok = await handleUpdateTask(proofTaskId, {
        state: 'done',
        proof: { notes: proofNotes.trim(), timestamp: new Date().toISOString() },
      })
      if (ok) {
        setProofOpen(false)
        toast.success('Task marked done with proof')
      }
    } finally {
      setSavingProof(false)
    }
  }

  return (
    <OsPage
      title="Tasks"
      description="Manage execution tasks and proof-of-fix."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={fetchTasks} aria-label="Refresh tasks">
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
          <PermissionButton
            allowed={canWriteAdmin}
            disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create task
          </PermissionButton>
        </>
      }
    >
      {(!canWriteAdmin || isDemo) && (
        <ReadOnlyBanner
          title={isDemo ? 'Demo org is read-only' : 'Permission required'}
          description={
            isDemo
              ? 'Task creation and updates are disabled in the demo organization.'
              : 'Task updates require OWNER or ADMIN permissions.'
          }
        />
      )}

      <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-background/80 backdrop-blur border-b">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="pl-9"
                aria-label="Search tasks"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {filtered.length} tasks
          </div>
        </div>

        <div className="pt-3">
          <ActiveFilters
            filters={[
              ...(search.trim()
                ? [{ key: 'search', label: `Search: “${search.trim()}”`, onClear: () => setSearch('') }]
                : []),
              ...(stateFilter !== 'all'
                ? [{ key: 'state', label: `State: ${stateFilter}`, onClear: () => setStateFilter('all') }]
                : []),
            ]}
            onReset={() => {
              setSearch('')
              setStateFilter('all')
            }}
          />
        </div>
      </div>

      {error && <OsErrorState description={error} onRetry={fetchTasks} />}

      {(loading || roleLoading) && !error ? (
        <OsTableSkeleton rows={7} columns={6} />
      ) : filtered.length === 0 ? (
        <OsEmptyState
          title="No tasks found"
          description="Create a task to track follow-ups and attach proof-of-fix."
          icon={<ClipboardCheck className="h-6 w-6" aria-hidden="true" />}
          action={
            <PermissionButton
              allowed={canWriteAdmin}
              disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
              onClick={() => setCreateOpen(true)}
            >
              Create task
            </PermissionButton>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="hidden md:table-cell">Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="max-w-[520px]">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {task.alerts?.title ? `From alert: ${task.alerts.title}` : task.description || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {task.owner}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {task.due_at ? formatDate(task.due_at) : '—'}
                    </TableCell>
                    <TableCell>
                      <TaskStatePill state={task.state} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {task.proof ? 'Yes' : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {task.state === 'open' && (
                          <PermissionButton
                            allowed={canWriteAdmin}
                            disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTask(task.id, { state: 'in_progress' })}
                          >
                            Start
                          </PermissionButton>
                        )}
                        {task.state !== 'done' && task.state !== 'canceled' && (
                          <PermissionButton
                            allowed={canWriteAdmin}
                            disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
                            size="sm"
                            onClick={() => openProof(task, 'add')}
                          >
                            Mark done + proof
                          </PermissionButton>
                        )}
                        {task.state === 'done' && task.proof?.notes && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openProof(task, 'view')}
                          >
                            View proof
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Create a task to track follow-ups and proof-of-fix.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner *</label>
              <Input
                value={newTask.owner}
                onChange={(e) => setNewTask({ ...newTask, owner: e.target.value })}
                placeholder="Owner email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due date</label>
              <Input
                type="date"
                value={newTask.due_at}
                onChange={(e) => setNewTask({ ...newTask, due_at: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <PermissionButton
              allowed={canWriteAdmin}
              disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
              onClick={handleCreateTask}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create'}
            </PermissionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={proofOpen}
        onOpenChange={(open) => {
          setProofOpen(open)
          if (!open) {
            setProofNotes('')
            setProofTaskId(null)
            setProofTaskTitle(null)
            setSavingProof(false)
            setProofMode('add')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{proofMode === 'view' ? 'Proof of Fix' : 'Mark done with proof'}</DialogTitle>
            <DialogDescription>
              {proofTaskTitle ? `Task: ${proofTaskTitle}` : 'Add proof-of-fix notes.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="What changed? What was verified? Include key details."
              disabled={proofMode === 'view'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofOpen(false)}>
              {proofMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {proofMode === 'add' && (
              <PermissionButton
                allowed={canWriteAdmin}
                disabledReason={isDemo ? 'Demo org is read-only' : 'OWNER/ADMIN permission required'}
                onClick={submitProof}
                disabled={savingProof}
              >
                {savingProof ? 'Saving…' : 'Save proof'}
              </PermissionButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OsPage>
  )
}

