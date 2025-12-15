import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function CompaniesPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const statusColors: Record<string, string> = {
    prospect: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    churned: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Manage your company accounts and prospects.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/sales/companies/new">
            <Plus className="h-4 w-4 mr-2" />
            New Company
          </Link>
        </Button>
      </div>

      {companies && companies.length > 0 ? (
        <div className="grid gap-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/app/sales/companies/${company.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {company.industry || 'No industry'}
                          {company.city && company.state && ` • ${company.city}, ${company.state}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {company.annual_revenue && (
                        <span className="text-sm font-medium">
                          {formatCurrency(company.annual_revenue)}
                        </span>
                      )}
                      <Badge className={statusColors[company.status]}>
                        {company.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your pipeline by adding your first company.
            </p>
            <Button asChild>
              <Link href="/app/sales/companies/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Company
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
