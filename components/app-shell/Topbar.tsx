'use client'

import { OrgSwitcher } from './OrgSwitcher'
import { DemoToggle } from './DemoToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Presentation, Sparkles, Plus, Building2, UserPlus, TrendingUp, CheckSquare, FileText, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRole } from '@/hooks/use-role'
import { usePathname } from 'next/navigation'
import { isDevDemoMode, getDevDemoUser } from '@/lib/runtime'
import { toast } from 'sonner'
import { useBranding } from '@/components/branding/BrandProvider'
import { BrandMark } from '@/components/branding/BrandMark'
import { getBuildId, getPort } from '@/lib/build-id'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>('')
  const [presentationMode, setPresentationMode] = useState(false)
  const [buildInfo, setBuildInfo] = useState<{ buildId: string; port: string; env: string } | null>(null)
  const { canWriteAdmin, isAdmin } = useRole()
  const { branding } = useBranding()

  useEffect(() => {
    loadUser()
    loadPresentationMode()
    loadBuildInfo()
  }, [])

  function loadBuildInfo() {
    const buildId = getBuildId()
    const port = getPort()
    const env = process.env.NODE_ENV || 'development'
    setBuildInfo({ buildId, port, env })
  }

  useEffect(() => {
    // Apply presentation mode class to body
    if (presentationMode) {
      document.documentElement.classList.add('presentation-mode')
    } else {
      document.documentElement.classList.remove('presentation-mode')
    }
  }, [presentationMode])

  function loadPresentationMode() {
    const saved = localStorage.getItem('presentation-mode')
    setPresentationMode(saved === 'true')
  }

  function togglePresentationMode() {
    const newValue = !presentationMode
    setPresentationMode(newValue)
    localStorage.setItem('presentation-mode', String(newValue))
  }

  function startDemoTour() {
    if (!isAdmin && process.env.NODE_ENV === 'production') {
      toast.error('Demo Tour is restricted to OWNER/ADMIN')
      return
    }
    try {
      localStorage.setItem('DEMO_TOUR_ACTIVE', '1')
      if (!localStorage.getItem('DEMO_TOUR_STEP')) {
        localStorage.setItem('DEMO_TOUR_STEP', '0')
      }
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('demo-tour-open'))
    toast.success('Demo Tour started')
  }

  async function loadUser() {
    if (isDevDemoMode()) {
      const demoUser = getDevDemoUser()
      setUserEmail(demoUser.email)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
      }
    } catch (error) {
      // Avoid noisy console errors in client-ready builds; user email is non-critical UI.
    }
  }

  async function handleSignOut() {
    if (isDevDemoMode()) {
      router.push('/login')
      return
    }
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      router.push('/login')
    }
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-border/50 bg-background px-6">
      <div className="flex items-center gap-3">
        <OrgSwitcher />
        <DemoToggle />
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={startDemoTour}
            className="gap-1.5 h-8 text-table-sm"
            title="Guided sales-ready walkthrough"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Start Demo Tour</span>
          </Button>
        )}
        {canWriteAdmin && pathname !== '/app/demo' && (
          <Button
            variant={presentationMode ? 'default' : 'outline'}
            size="sm"
            onClick={togglePresentationMode}
            className="gap-1.5 h-8 text-table-sm"
            aria-label={presentationMode ? 'Disable presentation mode' : 'Enable presentation mode'}
          >
            <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{presentationMode ? 'Presentation Mode' : 'Normal Mode'}</span>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {process.env.NODE_ENV === 'development' && buildInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1.5 text-xs font-mono cursor-help">
                  <Info className="h-3 w-3" />
                  <span>:{buildInfo.port}</span>
                  {buildInfo.port !== '3005' && <span className="text-destructive">⚠</span>}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <div className="space-y-1">
                  <div><strong>Port:</strong> {buildInfo.port}</div>
                  <div><strong>Path:</strong> {pathname}</div>
                  <div><strong>Env:</strong> {buildInfo.env}</div>
                  <div><strong>Build:</strong> {buildInfo.buildId}</div>
                  {buildInfo.port !== '3005' && (
                    <div className="text-destructive mt-2">⚠ Expected port 3005</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {canWriteAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-1.5 h-8 text-table-sm" aria-label="Create new item">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/app/crm/leads?create=true')} className="cursor-pointer">
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Lead</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/app/crm/accounts?create=true')} className="cursor-pointer">
                <Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/app/crm/opportunities?create=true')} className="cursor-pointer">
                <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Opportunity</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/app/crm/tasks?create=true')} className="cursor-pointer">
                <CheckSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/app/crm/quotes?create=true')} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Quote</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-8 text-table-sm" aria-label="User menu">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{userEmail || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
