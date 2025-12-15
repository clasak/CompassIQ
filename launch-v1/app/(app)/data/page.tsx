import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

export default function DataQualityPage() {
  // Demo data quality metrics
  const metrics = [
    {
      name: 'Pipeline Value',
      source: 'CRM',
      freshness: 'Live',
      status: 'healthy',
      lastUpdated: '2 minutes ago',
    },
    {
      name: 'Revenue MTD',
      source: 'ERP',
      freshness: 'Live',
      status: 'healthy',
      lastUpdated: '5 minutes ago',
    },
    {
      name: 'AR Aging',
      source: 'ERP',
      freshness: 'Daily',
      status: 'healthy',
      lastUpdated: '4 hours ago',
    },
    {
      name: 'Labor Hours',
      source: 'Project System',
      freshness: 'Daily',
      status: 'warning',
      lastUpdated: '26 hours ago',
    },
    {
      name: 'Equipment Utilization',
      source: 'IoT/Fleet',
      freshness: 'Hourly',
      status: 'healthy',
      lastUpdated: '45 minutes ago',
    },
  ]

  const statusColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  const statusIcons: Record<string, React.ElementType> = {
    healthy: CheckCircle2,
    warning: AlertTriangle,
    error: AlertTriangle,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Quality</h1>
        <p className="text-muted-foreground">
          Monitor data freshness and quality across your connected sources.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.filter((m) => m.status === 'healthy').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.filter((m) => m.status === 'warning').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.filter((m) => m.status === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Metric Catalog
          </CardTitle>
          <CardDescription>
            All tracked metrics and their data freshness status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.map((metric, i) => {
              const StatusIcon = statusIcons[metric.status]
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <StatusIcon
                      className={`h-5 w-5 ${
                        metric.status === 'healthy'
                          ? 'text-green-600'
                          : metric.status === 'warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    />
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Source: {metric.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{metric.freshness}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {metric.lastUpdated}
                    </div>
                    <Badge className={statusColors[metric.status]}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
