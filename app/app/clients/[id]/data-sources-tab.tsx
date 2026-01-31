'use client'

import { useState } from 'react'
import { ClientDataSource, getDataSources, createDataSource, updateDataSource, deleteDataSource } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Database, Trash2, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface DataSourcesTabProps {
  projectId: string
  initialDataSources: ClientDataSource[]
}

const statusIcons = {
  pending: Clock,
  connected: CheckCircle2,
  error: XCircle,
  disconnected: AlertCircle,
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  connected: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  disconnected: 'bg-gray-100 text-gray-800 border-gray-200',
}

const dataSourceTypes = [
  { value: 'google_sheets', label: 'Google Sheets' },
  { value: 'procore', label: 'Procore' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV Upload' },
  { value: 'api', label: 'Custom API' },
  { value: 'database', label: 'Database' },
  { value: 'custom', label: 'Custom' },
]

export function DataSourcesTab({ projectId, initialDataSources }: DataSourcesTabProps) {
  const router = useRouter()
  const [dataSources, setDataSources] = useState<ClientDataSource[]>(initialDataSources)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
  })

  const handleCreate = async () => {
    if (!formData.type || !formData.name) return

    setIsLoading(true)
    const result = await createDataSource({
      projectId,
      type: formData.type,
      name: formData.name,
      description: formData.description,
    })

    if (result.success && result.dataSource) {
      setDataSources([result.dataSource, ...dataSources])
      setIsCreateOpen(false)
      setFormData({ type: '', name: '', description: '' })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return

    setIsLoading(true)
    const result = await deleteDataSource(id)
    if (result.success) {
      setDataSources(dataSources.filter((ds) => ds.id !== id))
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleSync = async (id: string) => {
    setIsLoading(true)
    // Simulate sync - in real implementation, this would trigger actual sync
    await updateDataSource(id, {
      status: 'connected',
      last_sync_at: new Date().toISOString(),
    })
    
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id
          ? { ...ds, status: 'connected', last_sync_at: new Date().toISOString() }
          : ds
      )
    )
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                Connect and manage data sources for this client project
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Data Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Data Source</DialogTitle>
                  <DialogDescription>
                    Connect a new data source to this client project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select data source type" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Production Schedule Sheet"
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading || !formData.type || !formData.name}>
                    {isLoading ? 'Adding...' : 'Add Data Source'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {dataSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data sources configured yet.</p>
              <p className="text-sm">Add a data source to start collecting metrics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dataSources.map((dataSource) => {
                const StatusIcon = statusIcons[dataSource.status]
                const typeLabel = dataSourceTypes.find((t) => t.value === dataSource.type)?.label || dataSource.type

                return (
                  <div
                    key={dataSource.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{dataSource.name}</div>
                          <div className="text-sm text-muted-foreground">{typeLabel}</div>
                        </div>
                      </div>
                      {dataSource.description && (
                        <p className="text-sm text-muted-foreground mb-2">{dataSource.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className={statusColors[dataSource.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {dataSource.status}
                        </Badge>
                        {dataSource.last_sync_at && (
                          <span className="text-muted-foreground">
                            Last sync: {formatDate(dataSource.last_sync_at)}
                          </span>
                        )}
                      </div>
                      {dataSource.sync_error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          {dataSource.sync_error}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(dataSource.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(dataSource.id)}
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
