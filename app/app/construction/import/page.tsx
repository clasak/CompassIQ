import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export default async function ConstructionImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Construction Data Import"
        subtitle="Import job cost snapshots and AR aging data via CSV"
      />

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          CSV import functionality is coming soon. For now, use the Construction Intake Pack JSON import via the Sales Intake wizard.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Cost Snapshot Import</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import budget vs actual cost data by cost code. CSV format: project_id, snapshot_date, cost_code, budget, committed, actual_cost
            </p>
            <p className="text-sm text-muted-foreground">Coming soon: CSV upload and column mapping interface.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AR Aging Import</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import AR invoice data with aging information. CSV format: invoice_number, customer, invoice_date, due_date, amount, balance, status
            </p>
            <p className="text-sm text-muted-foreground">Coming soon: CSV upload and column mapping interface.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
