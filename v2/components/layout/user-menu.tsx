'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { LogOut, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-surface-overlay" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-24 bg-surface-overlay rounded mb-1" />
          <div className="h-3 w-16 bg-surface-overlay rounded" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Get initials from email
  const email = user.email || ''
  const initials = email
    .split('@')[0]
    .split('.')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pipeline to-revenue flex items-center justify-center text-white text-sm font-semibold">
          {initials || <User className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-text-primary truncate">
            {email}
          </div>
          <div className="text-xs text-text-tertiary">Admin</div>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-overlay hover:text-text-primary rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )
}
