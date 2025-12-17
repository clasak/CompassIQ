'use client'

import { useState } from 'react'
import { ClientDeliverable, getDeliverables, createDeliverable, deleteDeliverable } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, FileText, Trash2, Download, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface DeliverablesTabProps {
  projectId: string
  initialDeliverables: ClientDeliverable[]
}

const deliverableTypes = [
  { value: 'pilot_plan', label: 'Pilot Plan', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'kpi_dictionary', label: 'KPI Dictionary', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'weekly_pack', label: 'Weekly Pack', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'exec_pack', label: 'Executive Pack', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800 border-gray-200' },
]

export function DeliverablesTab({ projectId, initialDeliverables }: DeliverablesTabProps) {
  const router = useRouter()
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>(initialDeliverables)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'custom' as 'pilot_plan' | 'kpi_dictionary' | 'weekly_pack' | 'exec_pack' | 'custom',
    title: '',
    description: '',
    fileUrl: '',
  })

  const handleCreate = async () => {
    if (!formData.title || !formData.fileUrl) return

    setIsLoading(true)
    const result = await createDeliverable({
      projectId,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      fileUrl: formData.fileUrl,
    })

    if (result.success && result.deliverable) {
      setDeliverables([result.deliverable, ...deliverables])
      setIsCreateOpen(false)
      setFormData({ type: 'custom', title: '', description: '', fileUrl: '' })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deliverable?')) return

    setIsLoading(true)
    const result = await deleteDeliverable(id)
    if (result.success) {
      setDeliverables(deliverables.filter((d) => d.id !== id))
      router.refresh()
    }
    setIsLoading(false)
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deliverables</CardTitle>
              <CardDescription>
                Manage client deliverables, reports, and documentation
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Deliverable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Deliverable</DialogTitle>
                  <DialogDescription>
                    Upload or link to a client deliverable
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliverableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Q1 2025 Pilot Plan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileUrl">File URL</Label>
                    <Input
                      id="fileUrl"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link to file in cloud storage (Google Drive, Dropbox, etc.)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading || !formData.title || !formData.fileUrl}>
                    {isLoading ? 'Adding...' : 'Add Deliverable'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deliverables yet.</p>
              <p className="text-sm">Add deliverables to track client documentation and reports.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliverables.map((deliverable) => {
                const typeInfo = deliverableTypes.find((t) => t.value === deliverable.type)

                return (
                  <div
                    key={deliverable.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{deliverable.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(deliverable.created_at)}
                          </div>
                        </div>
                        <Badge variant="outline" className={typeInfo?.color}>
                          {typeInfo?.label || deliverable.type}
                        </Badge>
                      </div>
                      {deliverable.description && (
                        <p className="text-sm text-muted-foreground mb-2">{deliverable.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {deliverable.file_size && <span>{formatFileSize(deliverable.file_size)}</span>}
                        {deliverable.mime_type && <span>{deliverable.mime_type}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(deliverable.id)}
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


