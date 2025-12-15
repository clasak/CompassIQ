'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
}

export default function NewOpportunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyParam = searchParams.get('company')

  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState(companyParam || '')

  useEffect(() => {
    async function loadCompanies() {
      const { orgId } = await fetch('/api/org/current').then((r) => r.json())
      if (!orgId) return

      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('org_id', orgId)
        .order('name')

      setCompanies(data || [])
    }
    loadCompanies()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const { orgId } = await fetch('/api/org/current').then((r) => r.json())

    if (!orgId) {
      toast.error('No organization selected')
      setIsLoading(false)
      return
    }

    const { data, error } = await (supabase
      .from('opportunities') as any)
      .insert({
        org_id: orgId,
        company_id: selectedCompany,
        name: formData.get('name') as string,
        value: parseFloat(formData.get('value') as string) || 0,
        stage: formData.get('stage') as any || 'lead',
        probability: parseInt(formData.get('probability') as string) || 0,
        expected_close_date: formData.get('expected_close_date') as string || null,
        notes: formData.get('notes') as string || null,
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Opportunity created successfully')
    router.push(`/app/sales/opportunities/${data.id}`)
  }

  const stageProbabilities: Record<string, number> = {
    lead: 10,
    qualified: 25,
    discovery: 40,
    proposal: 60,
    negotiation: 80,
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/sales/opportunities">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Opportunity</h1>
          <p className="text-muted-foreground">Create a new sales opportunity.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>Enter the opportunity information below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Opportunity Name *</Label>
                <Input id="name" name="name" required placeholder="Q1 Dashboard Implementation" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company">Company *</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {companies.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No companies found.{' '}
                    <Link href="/app/sales/companies/new" className="text-primary hover:underline">
                      Create one first
                    </Link>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Deal Value ($)</Label>
                <Input id="value" name="value" type="number" placeholder="50000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  name="stage"
                  defaultValue="lead"
                  onValueChange={(v) => {
                    const probInput = document.getElementById('probability') as HTMLInputElement
                    if (probInput && stageProbabilities[v]) {
                      probInput.value = stageProbabilities[v].toString()
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  name="probability"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input id="expected_close_date" name="expected_close_date" type="date" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes..." rows={4} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || !selectedCompany}>
                {isLoading ? 'Creating...' : 'Create Opportunity'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/sales/opportunities">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
