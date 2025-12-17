'use client'

import { useState } from 'react'
import { ClientKPI, getKPICatalog, createKPI, updateKPI, deleteKPI } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, TrendingUp, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface KPICatalogTabProps {
  projectId: string
  initialKPIs: ClientKPI[]
}

export function KPICatalogTab({ projectId, initialKPIs }: KPICatalogTabProps) {
  const router = useRouter()
  const [kpis, setKPIs] = useState<ClientKPI[]>(initialKPIs)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    metricKey: '',
    metricName: '',
    definition: '',
    formula: '',
    targetValue: '',
    unit: '',
  })

  const handleCreate = async () => {
    if (!formData.metricKey || !formData.metricName) return

    setIsLoading(true)
    const result = await createKPI({
      projectId,
      metricKey: formData.metricKey,
      metricName: formData.metricName,
      definition: formData.definition,
      formula: formData.formula,
      targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      unit: formData.unit,
    })

    if (result.success && result.kpi) {
      setKPIs([...kpis, result.kpi])
      setIsCreateOpen(false)
      setFormData({ metricKey: '', metricName: '', definition: '', formula: '', targetValue: '', unit: '' })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    await updateKPI(id, { is_active: !currentStatus })
    setKPIs(kpis.map((kpi) => (kpi.id === id ? { ...kpi, is_active: !currentStatus } : kpi)))
    router.refresh()
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this KPI?')) return

    setIsLoading(true)
    const result = await deleteKPI(id)
    if (result.success) {
      setKPIs(kpis.filter((kpi) => kpi.id !== id))
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
              <CardTitle>KPI Catalog</CardTitle>
              <CardDescription>
                Define and manage client-specific KPIs and metrics
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add KPI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add KPI</DialogTitle>
                  <DialogDescription>
                    Define a new KPI for this client project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metricKey">Metric Key</Label>
                      <Input
                        id="metricKey"
                        value={formData.metricKey}
                        onChange={(e) => setFormData({ ...formData, metricKey: e.target.value })}
                        placeholder="e.g., revenue_growth"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metricName">Metric Name</Label>
                      <Input
                        id="metricName"
                        value={formData.metricName}
                        onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
                        placeholder="e.g., Revenue Growth"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="definition">Definition</Label>
                    <Textarea
                      id="definition"
                      value={formData.definition}
                      onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                      placeholder="What does this metric measure?"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="formula">Formula</Label>
                    <Input
                      id="formula"
                      value={formData.formula}
                      onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                      placeholder="e.g., (Current - Previous) / Previous * 100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetValue">Target Value</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        value={formData.targetValue}
                        onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                        placeholder="e.g., 15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g., %, $, days"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading || !formData.metricKey || !formData.metricName}>
                    {isLoading ? 'Adding...' : 'Add KPI'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No KPIs defined yet.</p>
              <p className="text-sm">Add KPIs to track client metrics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{kpi.metric_name}</div>
                        <div className="text-sm text-muted-foreground">{kpi.metric_key}</div>
                      </div>
                      {!kpi.is_active && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {kpi.definition && (
                      <p className="text-sm text-muted-foreground mb-2">{kpi.definition}</p>
                    )}
                    {kpi.formula && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Formula:</span> <code className="bg-muted px-2 py-1 rounded">{kpi.formula}</code>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      {kpi.target_value && (
                        <span>
                          <span className="font-medium">Target:</span> {kpi.target_value}{kpi.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(kpi.id, kpi.is_active)}
                      disabled={isLoading}
                    >
                      {kpi.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(kpi.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


