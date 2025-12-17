import { acceptInvite } from '@/lib/actions/settings-actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

interface InviteAcceptPageProps {
  params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: InviteAcceptPageProps) {
  const { token } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in, redirect to login with redirect back
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`)
  }

  // Try to accept the invite
  const result = await acceptInvite(token)

  if (result.success && result.orgId) {
    // Success - redirect to app
    redirect('/app')
  }

  // Show error state
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            {result.error || 'Failed to accept invitation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Invitation accepted successfully! Redirecting...
                </AlertDescription>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.error || 'Failed to accept invitation. The invitation may be invalid, expired, or already accepted.'}
                </AlertDescription>
              </>
            )}
          </Alert>
          {!result.success && (
            <Button asChild className="w-full">
              <Link href="/app">Go to Dashboard</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



