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
import { User, LogOut, Presentation, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRole } from '@/hooks/use-role'
import { usePathname } from 'next/navigation'
import { isDevDemoMode, getDevDemoUser } from '@/lib/runtime'
import { toast } from 'sonner'
import { useBranding } from '@/components/branding/BrandProvider'
import { BrandMark } from '@/components/branding/BrandMark'

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string>('')
  const [presentationMode, setPresentationMode] = useState(false)
  const { canWriteAdmin, isAdmin } = useRole()
  const { branding } = useBranding()

  useEffect(() => {
    loadUser()
    loadPresentationMode()
  }, [])

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
      console.error('Failed to load user:', error)
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
      console.error('Failed to sign out:', error)
      router.push('/login')
    }
  }

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <BrandMark url={branding.mark_url} size={20} alt={branding.brand_name} />
          <span className="text-sm font-semibold hidden sm:inline">{branding.brand_name}</span>
        </div>
        <OrgSwitcher />
        <DemoToggle />
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={startDemoTour}
            className="gap-2"
            title="Guided sales-ready walkthrough"
          >
            <Sparkles className="h-4 w-4" />
            Start Demo Tour
          </Button>
        )}
        {canWriteAdmin && pathname !== '/app/demo' && (
          <Button
            variant={presentationMode ? 'default' : 'outline'}
            size="sm"
            onClick={togglePresentationMode}
            className="gap-2"
            aria-label={presentationMode ? 'Disable presentation mode' : 'Enable presentation mode'}
          >
            <Presentation className="h-4 w-4" aria-hidden="true" />
            {presentationMode ? 'Presentation Mode' : 'Normal Mode'}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2" aria-label="User menu">
              <User className="h-4 w-4" aria-hidden="true" />
              {userEmail || 'User'}
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
