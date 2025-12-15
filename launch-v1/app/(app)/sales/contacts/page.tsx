import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Building2, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default async function ContactsPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, companies(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and relationships.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/sales/contacts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Contact
          </Link>
        </Button>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Link key={contact.id} href={`/app/sales/contacts/${contact.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="font-semibold">
                          {contact.first_name[0]}
                          {contact.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {contact.first_name} {contact.last_name}
                          </h3>
                          {contact.is_primary && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.title || 'No title'}
                        </p>
                        {(contact.companies as any)?.name && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Building2 className="h-3 w-3" />
                            {(contact.companies as any).name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      )}
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
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building relationships by adding your first contact.
            </p>
            <Button asChild>
              <Link href="/app/sales/contacts/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Contact
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
