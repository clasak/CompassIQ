'use client'

import { useState } from 'react'
import { setupClientInstance } from '@/lib/actions/client-setup-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

const STEPS = [
  { id: 1, title: 'Organization Details', description: 'Enter client organization name and slug' },
  { id: 2, title: 'Seed Metrics', description: 'Baseline metric catalog will be added automatically' },
  { id: 3, title: 'Create Admin Invite', description: 'Invite the client admin user' },
  { id: 4, title: 'Complete', description: 'Setup complete - share invite link with client' },
]

export function ClientSetupWizard() {
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ orgId?: string; inviteLink?: string } | null>(null)

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleOrgNameChange(value: string) {
    setOrgName(value)
    if (!orgSlug || orgSlug === generateSlug(orgName)) {
      setOrgSlug(generateSlug(value))
    }
  }

  async function handleSubmit() {
    if (!orgName.trim() || !orgSlug.trim() || !adminEmail.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    try {
      const setupResult = await setupClientInstance(orgName.trim(), orgSlug.trim(), adminEmail.trim())
      if (setupResult.success) {
        setResult({
          orgId: setupResult.orgId,
          inviteLink: setupResult.inviteLink,
        })
        setStep(4)
        toast.success('Client instance setup complete!')
      } else {
        toast.error(setupResult.error || 'Failed to setup client instance')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  function copyInviteLink() {
    if (result?.inviteLink) {
      navigator.clipboard.writeText(result.inviteLink)
      toast.success('Invite link copied to clipboard')
    }
  }

  return (
    <div className="space-y-6" data-demo-tour="settings-setup">
      {/* Step Progress */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold
                  ${step > s.id ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${step === s.id ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${step < s.id ? 'bg-background border-muted text-muted-foreground' : ''}
                `}
              >
                {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
              </div>
              <div className="mt-2 text-xs text-center max-w-[100px]">
                {s.title}
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2
                  ${step > s.id ? 'bg-green-500' : 'bg-muted'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              placeholder="Acme Corporation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgSlug">Organization Slug</Label>
            <Input
              id="orgSlug"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="acme-corporation"
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier (auto-generated from name, but editable)
            </p>
          </div>
          <Button onClick={() => setStep(2)} disabled={!orgName.trim() || !orgSlug.trim()}>
            Next: Seed Metrics
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              A baseline metric catalog with 12 standard KPIs will be automatically seeded.
              This includes revenue, pipeline, AR, win rates, delivery metrics, and more.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setStep(3)}>Next: Create Admin Invite</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@client.com"
            />
            <p className="text-xs text-muted-foreground">
              The client administrator will receive an invite link to join the organization with ADMIN role.
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting || !adminEmail.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </div>
      )}

      {step === 4 && result && (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Client instance setup complete!
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Share the invite link with your client administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Invite Link</Label>
                <div className="flex gap-2">
                  <Input value={result.inviteLink} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={copyInviteLink} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" asChild className="gap-2">
                    <a href={result.inviteLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold">Client Checklist:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Share invite link with client admin</li>
                  <li>Client admin accepts invite and logs in</li>
                  <li>Client configures data integrations</li>
                  <li>Client reviews and customizes metric catalog</li>
                  <li>Client sets up additional users and roles</li>
                </ul>
              </div>

              <Button onClick={() => window.location.reload()} className="w-full">
                Setup Another Client
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
