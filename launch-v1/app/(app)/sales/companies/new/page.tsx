'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function NewCompanyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    // Get current org from cookie via API
    const orgResponse = await fetch('/api/org/current')
    const { orgId } = await orgResponse.json()

    if (!orgId) {
      toast.error('No organization selected')
      setIsLoading(false)
      return
    }

    const { data, error } = await (supabase.from('companies') as any).insert({
      org_id: orgId,
      name: formData.get('name') as string,
      industry: formData.get('industry') as string || null,
      website: formData.get('website') as string || null,
      employee_count: formData.get('employee_count') ? parseInt(formData.get('employee_count') as string) : null,
      annual_revenue: formData.get('annual_revenue') ? parseFloat(formData.get('annual_revenue') as string) : null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      zip: formData.get('zip') as string || null,
      status: formData.get('status') as any || 'prospect',
      notes: formData.get('notes') as string || null,
    }).select().single()

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Company created successfully')
    router.push(`/app/sales/companies/${data.id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/sales/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Company</h1>
          <p className="text-muted-foreground">Add a new company to your pipeline.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Enter the company information below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" required placeholder="Acme Construction" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" placeholder="Construction" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" placeholder="https://example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_count">Employee Count</Label>
                <Input id="employee_count" name="employee_count" type="number" placeholder="150" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual_revenue">Annual Revenue</Label>
                <Input id="annual_revenue" name="annual_revenue" type="number" placeholder="50000000" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="123 Main St" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Denver" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" placeholder="CO" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" name="zip" placeholder="80202" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="prospect">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes about the company..." rows={4} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Company'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/sales/companies">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
