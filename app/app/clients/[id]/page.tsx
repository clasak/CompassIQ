import { 
  getClientProject, 
  getIntakePack,
  getDataSources,
  getKPICatalog,
  getAlertRules,
  getCadences,
  getMeetings,
  getDeliverables
} from '@/lib/actions/client-project-actions'
import { notFound } from 'next/navigation'
import { ClientProjectDetailView } from './client-project-detail-view'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ClientProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientProjectDetailPage({ params }: ClientProjectDetailPageProps) {
  const { id } = await params
  const result = await getClientProject(id)

  if (!result.success || !result.project) {
    notFound()
  }

  // Fetch all related data in parallel
  const [
    intakePackResult,
    dataSourcesResult,
    kpisResult,
    alertsResult,
    cadencesResult,
    meetingsResult,
    deliverablesResult,
  ] = await Promise.all([
    result.project.intake_pack_id ? getIntakePack(result.project.intake_pack_id) : Promise.resolve({ success: false }),
    getDataSources(id),
    getKPICatalog(id),
    getAlertRules(id),
    getCadences(id),
    getMeetings(id),
    getDeliverables(id),
  ])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/clients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Projects
          </Link>
        </Button>
      </div>
      <PageHeader
        title={result.project.name}
        subtitle={`Client project workspace and engagement details`}
      />
      <ClientProjectDetailView 
        project={result.project} 
        intakePack={intakePackResult.success ? (intakePackResult as any).intakePack || null : null}
        dataSources={dataSourcesResult.success ? (dataSourcesResult as any).dataSources || [] : []}
        kpis={kpisResult.success ? (kpisResult as any).kpis || [] : []}
        alertRules={alertsResult.success ? (alertsResult as any).alertRules || [] : []}
        cadences={cadencesResult.success ? (cadencesResult as any).cadences || [] : []}
        meetings={meetingsResult.success ? (meetingsResult as any).meetings || [] : []}
        deliverables={deliverablesResult.success ? (deliverablesResult as any).deliverables || [] : []}
      />
    </div>
  )
}
