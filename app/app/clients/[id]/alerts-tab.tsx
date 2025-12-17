'use client'

import { useState } from 'react'
import { ClientAlertRule, getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AlertsTabProps {
  projectId: string
  initialAlerts: ClientAlertRule[]
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

export function AlertsTab({ projectId, initialAlerts }: AlertsTabProps) {
  const router = useRouter()
  const [alerts, setAlerts] = useState<ClientAlertRule[]>(initialAlerts)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    kpiKey: '',
    conditionType: 'threshold' as 'threshold' | 'trend' | 'anomaly' | 'forecast',
    operator: 'gt',
    value: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  })

  const handleCreate = async () => {
    if (!formData.kpiKey || !formData.value) return

    setIsLoading(true)
    const result = await createAlertRule({
      projectId,
      kpiKey: formData.kpiKey,
      conditionType: formData.conditionType,
      conditionConfig: {
        operator: formData.operator,
        value: parseFloat(formData.value),
      },
      severity: formData.severity,
    })

    if (result.success && result.alertRule) {
      setAlerts([result.alertRule, ...alerts])
      setIsCreateOpen(false)
      setFormData({ kpiKey: '', conditionType: 'threshold', operator: 'gt', value: '', severity: 'medium' })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    await updateAlertRule(id, { is_active: !currentStatus })
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, is_active: !currentStatus } : alert)))
    router.refresh()
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return

    setIsLoading(true)
    const result = await deleteAlertRule(id)
    if (result.success) {
      setAlerts(alerts.filter((alert) => alert.id !== id))
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
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>
                Configure threshold alerts and notifications for KPIs
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Alert Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Alert Rule</DialogTitle>
                  <DialogDescription>
                    Create a new alert rule for KPI monitoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="kpiKey">KPI Key</Label>
                    <Input
                      id="kpiKey"
                      value={formData.kpiKey}
                      onChange={(e) => setFormData({ ...formData, kpiKey: e.target.value })}
                      placeholder="e.g., revenue_growth"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditionType">Condition Type</Label>
                    <Select
                      value={formData.conditionType}
                      onValueChange={(value: any) => setFormData({ ...formData, conditionType: value })}
                    >
                      <SelectTrigger id="conditionType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="threshold">Threshold</SelectItem>
                        <SelectItem value="trend">Trend</SelectItem>
                        <SelectItem value="anomaly">Anomaly</SelectItem>
                        <SelectItem value="forecast">Forecast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operator">Operator</Label>
                      <Select
                        value={formData.operator}
                        onValueChange={(value) => setFormData({ ...formData, operator: value })}
                      >
                        <SelectTrigger id="operator">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gt">Greater than</SelectItem>
                          <SelectItem value="lt">Less than</SelectItem>
                          <SelectItem value="eq">Equal to</SelectItem>
                          <SelectItem value="gte">Greater than or equal</SelectItem>
                          <SelectItem value="lte">Less than or equal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value">Threshold Value</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading || !formData.kpiKey || !formData.value}>
                    {isLoading ? 'Adding...' : 'Add Alert Rule'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alert rules configured yet.</p>
              <p className="text-sm">Add alert rules to monitor KPI thresholds.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{alert.kpi_key}</div>
                        <div className="text-sm text-muted-foreground capitalize">{alert.condition_type} alert</div>
                      </div>
                      <Badge variant="outline" className={severityColors[alert.severity]}>
                        {alert.severity}
                      </Badge>
                      {!alert.is_active && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Condition: {alert.condition_config.operator} {alert.condition_config.value}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(alert.id, alert.is_active)}
                      disabled={isLoading}
                    >
                      {alert.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(alert.id)}
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


