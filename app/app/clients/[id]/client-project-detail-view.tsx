'use client'

import { ClientProject, ClientIntakePack, ClientDataSource, ClientKPI, ClientAlertRule, ClientCadence, ClientMeeting, ClientDeliverable } from '@/lib/actions/client-project-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ExternalLink, Building2, FileText, Eye, Settings, Database, AlertTriangle, Calendar, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DataSourcesTab } from './data-sources-tab'
import { KPICatalogTab } from './kpi-catalog-tab'
import { AlertsTab } from './alerts-tab'
import { CadenceTab } from './cadence-tab'
import { MeetingsTab } from './meetings-tab'
import { DeliverablesTab } from './deliverables-tab'

interface ClientProjectDetailViewProps {
  project: ClientProject
  intakePack: ClientIntakePack | null
  dataSources: ClientDataSource[]
  kpis: ClientKPI[]
  alertRules: ClientAlertRule[]
  cadences: ClientCadence[]
  meetings: ClientMeeting[]
  deliverables: ClientDeliverable[]
}

const statusColors: Record<string, string> = {
  onboarding: 'bg-blue-100 text-blue-800 border-blue-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  at_risk: 'bg-orange-100 text-orange-800 border-orange-200',
  paused: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200',
}

const statusLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  active: 'Active',
  at_risk: 'At Risk',
  paused: 'Paused',
  completed: 'Completed',
}

export function ClientProjectDetailView({ project, intakePack, dataSources, kpis, alertRules, cadences, meetings, deliverables }: ClientProjectDetailViewProps) {
  const router = useRouter()

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="intake">Intake Pack</TabsTrigger>
        <TabsTrigger value="data">Data Sources</TabsTrigger>
        <TabsTrigger value="kpis">KPI Catalog</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
        <TabsTrigger value="cadence">Cadence</TabsTrigger>
        <TabsTrigger value="meetings">Meetings</TabsTrigger>
        <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                <Badge
                  variant="outline"
                  className={statusColors[project.status] || 'bg-gray-100 text-gray-800 border-gray-200'}
                >
                  {statusLabels[project.status] || project.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Account</div>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => router.push(`/app/crm/accounts/${project.account_id}`)}
                >
                  View Account
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              {project.opportunity_id && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Opportunity</div>
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => router.push(`/app/crm/opportunities/${project.opportunity_id}`)}
                  >
                    View Opportunity
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
              {project.next_review_date && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Next Review</div>
                  <div>{formatDate(project.next_review_date)}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
                <div>{formatDate(project.created_at)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.production_os_instance_id && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/app/operate?client=${project.id}`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Open Operate Mode
                </Button>
              )}
              {project.preview_workspace_id && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/api/preview/enter?id=${project.preview_workspace_id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Preview Workspace
                </Button>
              )}
              {intakePack && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/app/clients/${project.id}?tab=intake`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Intake Pack
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {project.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="intake">
        {intakePack ? (
          <Card>
            <CardHeader>
              <CardTitle>Intake Pack</CardTitle>
              <CardDescription>Client intake information from preview generator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Company Name</div>
                <div>{intakePack.company_name}</div>
              </div>
              {intakePack.industry && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Industry</div>
                  <div>{intakePack.industry}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Pain Points</div>
                <div className="flex flex-wrap gap-2">
                  {intakePack.pains.map((pain) => (
                    <Badge key={pain} variant="outline">
                      {pain.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">KPIs</div>
                <div className="flex flex-wrap gap-2">
                  {intakePack.kpis.map((kpi) => (
                    <Badge key={kpi} variant="outline">
                      {kpi}
                    </Badge>
                  ))}
                </div>
              </div>
              {intakePack.branding && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Branding</div>
                  <div className="space-y-2">
                    <div>Brand Name: {intakePack.branding.brand_name}</div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Primary Color</div>
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: intakePack.branding.primary_color }}
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Accent Color</div>
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: intakePack.branding.accent_color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No intake pack available for this project.
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="data">
        <DataSourcesTab projectId={project.id} initialDataSources={dataSources} />
      </TabsContent>

      <TabsContent value="kpis">
        <KPICatalogTab projectId={project.id} initialKPIs={kpis} />
      </TabsContent>

      <TabsContent value="alerts">
        <AlertsTab projectId={project.id} initialAlerts={alertRules} />
      </TabsContent>

      <TabsContent value="cadence">
        <CadenceTab projectId={project.id} initialCadences={cadences} />
      </TabsContent>

      <TabsContent value="meetings">
        <MeetingsTab projectId={project.id} initialMeetings={meetings} />
      </TabsContent>

      <TabsContent value="deliverables">
        <DeliverablesTab projectId={project.id} initialDeliverables={deliverables} />
      </TabsContent>
    </Tabs>
  )
}
