'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { isDevDemoMode } from '@/lib/runtime'
import { BRANDING_DEFAULTS, getBrandCssVars, normalizeBranding, type OrgBranding } from '@/lib/branding'
import { BrandMark } from '@/components/branding/BrandMark'
import { BrandWordmark } from '@/components/branding/BrandWordmark'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [branding, setBranding] = useState<OrgBranding>(BRANDING_DEFAULTS)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/app'
  const errorParam = searchParams.get('error')
  const orgSlugParam = searchParams.get('org')

  // Check for dev demo mode
  const devDemoMode = isDevDemoMode()

  // Check for missing env vars (only if not in dev demo mode)
  const hasEnvVars = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const orgSlugForBranding = useMemo(() => {
    if (orgSlugParam && orgSlugParam.trim()) return orgSlugParam.trim()
    try {
      return localStorage.getItem('LAST_ORG_SLUG') || ''
    } catch {
      return ''
    }
  }, [orgSlugParam])

  useEffect(() => {
    let canceled = false
    const run = async () => {
      if (!orgSlugForBranding) return
      try {
        const res = await fetch(`/api/branding/public?slug=${encodeURIComponent(orgSlugForBranding)}`)
        const json = await res.json().catch(() => null)
        const normalized = normalizeBranding(json?.branding || null)
        if (!canceled) setBranding(normalized)
      } catch {
        // ignore
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [orgSlugForBranding])

  useEffect(() => {
    const vars = getBrandCssVars(branding)
    const el = document.documentElement
    for (const [key, value] of Object.entries(vars)) {
      el.style.setProperty(key, value)
    }
    return () => {
      for (const key of Object.keys(vars)) {
        el.style.removeProperty(key)
      }
    }
  }, [branding])

  function handleDevDemoMode() {
    // Set a cookie or localStorage flag to indicate dev demo mode
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev-demo-mode', 'true')
    }
    router.push('/app')
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    // Don't try to sign in if in dev demo mode
    if (devDemoMode) {
      toast.error('Please use "Continue in Dev Demo Mode" button instead')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const friendlyMessage = error.message || 'Unable to sign in'
        setErrorMessage(friendlyMessage)
        toast.error(friendlyMessage)
        setLoading(false)
        return
      }

      if (data.user) {
        if (data.session) {
          try {
            const res = await fetch('/api/auth/set-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session: data.session }),
            })
            if (!res.ok) {
              const { error: apiError } = await res.json().catch(() => ({}))
              const message = apiError || 'Failed to persist session'
              setErrorMessage(message)
              toast.error(message)
              setLoading(false)
              return
            }
          } catch (err: any) {
            const message = err?.message || 'Failed to persist session'
            setErrorMessage(message)
            toast.error(message)
            setLoading(false)
            return
          }
        }

        toast.success('Signed in successfully')
        router.push(redirect)
        router.refresh()
        if (typeof window !== 'undefined') {
          window.location.assign(redirect)
        }
      }
    } catch (error: any) {
      const friendlyMessage =
        error?.message || 'Failed to connect to Supabase. Please check your configuration.'
      setErrorMessage(friendlyMessage)
      toast.error(friendlyMessage)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BrandMark url={branding.mark_url} size={28} alt={branding.brand_name} />
            <div className="min-w-0">
              <CardTitle className="text-2xl">
                <BrandWordmark
                  brandName={branding.brand_name}
                  logoLightUrl={branding.logo_light_url}
                  logoDarkUrl={branding.logo_dark_url}
                  height={26}
                />
              </CardTitle>
              <CardDescription>
                {branding.tagline ? branding.tagline : 'Sign in to your account'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {devDemoMode && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Dev Demo Mode Available
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Supabase is not configured. You can continue in Dev Demo Mode with mock data (read-only).
              </p>
              <Button
                type="button"
                onClick={handleDevDemoMode}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue in Dev Demo Mode
              </Button>
            </div>
          )}
          {!devDemoMode && !hasEnvVars && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium mb-1">
                Configuration Error
              </p>
              <p className="text-xs text-destructive/80">
                Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and
                NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.
              </p>
            </div>
          )}
          {errorParam === 'missing_env_vars' && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium mb-1">
                Configuration Required
              </p>
              <p className="text-xs text-destructive/80">
                Please configure your Supabase credentials in .env.local to access the dashboard.
              </p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-semibold">Sign-in failed</p>
              <p className="text-xs text-destructive/80 break-words">{errorMessage}</p>
            </div>
          )}
          {!devDemoMode && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
