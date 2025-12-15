import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  Globe,
  Users,
  DollarSign,
  MapPin,
  Target,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DeleteCompanyButton } from './delete-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .eq('org_id', orgId)
    .single() as { data: any }

  if (!company) {
    notFound()
  }

  // Fetch related data
  const contactsResult = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', id)
    .order('is_primary', { ascending: false }) as { data: any[] | null }

  const opportunitiesResult = await supabase
    .from('opportunities')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const contacts = contactsResult.data
  const opportunities = opportunitiesResult.data

  const statusColors: Record<string, string> = {
    prospect: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    churned: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/sales/companies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <Badge className={statusColors[company.status]}>{company.status}</Badge>
              </div>
              <p className="text-muted-foreground">
                {company.industry || 'No industry specified'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/sales/companies/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeleteCompanyButton companyId={id} companyName={company.name} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Company Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              {company.employee_count && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{company.employee_count.toLocaleString()} employees</span>
                </div>
              )}
              {company.annual_revenue && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{formatCurrency(company.annual_revenue)} annual revenue</span>
                </div>
              )}
              {(company.city || company.state) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[company.address, company.city, company.state, company.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
            {company.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {company.notes}
                  </p>
                </div>
              </>
            )}
            <Separator />
            <div className="text-sm text-muted-foreground">
              Created {formatDate(company.created_at)} • Last updated {formatDate(company.updated_at)}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contacts?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{opportunities?.length || 0}</div>
              {opportunities && opportunities.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(opportunities.reduce((sum, o) => sum + (o.value || 0), 0))} total pipeline
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contacts Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>People at this company</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/app/sales/contacts/new?company=${id}`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {contacts && contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/app/sales/contacts/${contact.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {contact.first_name} {contact.last_name}
                      {contact.is_primary && (
                        <Badge variant="secondary" className="ml-2">Primary</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{contact.title || contact.email}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No contacts yet</p>
          )}
        </CardContent>
      </Card>

      {/* Opportunities Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Opportunities</CardTitle>
            <CardDescription>Sales opportunities with this company</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/app/sales/opportunities/new?company=${id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Opportunity
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {opportunities && opportunities.length > 0 ? (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href={`/app/sales/opportunities/${opp.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{opp.name}</p>
                      <Badge variant="outline">{opp.stage.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(opp.value)}</p>
                    <p className="text-xs text-muted-foreground">{opp.probability}% probability</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No opportunities yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
