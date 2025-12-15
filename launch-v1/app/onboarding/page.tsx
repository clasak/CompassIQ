'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const slug = slugify(name)

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Not authenticated')
      setIsLoading(false)
      return
    }

    // Create organization
    const { data: org, error: orgError } = await (supabase
      .from('organizations') as any)
      .insert({ name, slug })
      .select()
      .single()

    if (orgError) {
      toast.error(orgError.message)
      setIsLoading(false)
      return
    }

    // Create membership as OWNER
    const { error: memberError } = await (supabase.from('memberships') as any).insert({
      org_id: org.id,
      user_id: user.id,
      role: 'OWNER',
    })

    if (memberError) {
      toast.error(memberError.message)
      setIsLoading(false)
      return
    }

    // Set org cookie
    await fetch('/api/org/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: org.id }),
    })

    toast.success('Organization created!')
    router.push('/app')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
              C
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to CompassIQ</CardTitle>
          <CardDescription>Create your organization to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Construction"
                required
              />
              {name && (
                <p className="text-xs text-muted-foreground">
                  URL: compassiq.app/{slugify(name)}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !name}>
              {isLoading ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
