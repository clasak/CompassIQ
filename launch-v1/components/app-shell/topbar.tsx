'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Building2, ChevronDown, LogOut, User, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/database.types'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/role'

interface Organization {
  id: string
  name: string
  is_demo: boolean
}

interface TopbarProps {
  user: {
    id: string
    email: string
  } | null
  currentOrg: Organization | null
  organizations: Organization[]
  role: Role | null
  previewMode?: {
    id: string
    name: string
  } | null
}

export function Topbar({
  user,
  currentOrg,
  organizations,
  role,
  previewMode,
}: TopbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSwitchOrg = async (orgId: string) => {
    await fetch('/api/org/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId }),
    })
    router.refresh()
  }

  const handleExitPreview = async () => {
    await fetch('/api/preview/exit', { method: 'POST' })
    router.refresh()
  }

  const userInitials = user?.email
    ? user.email
        .split('@')[0]
        .split('.')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <>
      {previewMode && (
        <div className="preview-banner flex items-center justify-between">
          <span>
            Preview Mode: <strong>{previewMode.name}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitPreview}
            className="h-6 text-black hover:bg-amber-600"
          >
            <X className="h-4 w-4 mr-1" />
            Exit Preview
          </Button>
        </div>
      )}
      <header className="flex h-16 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-4">
          {/* Org Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="max-w-[200px] truncate">
                  {currentOrg?.name || 'Select Organization'}
                </span>
                {currentOrg?.is_demo && (
                  <Badge variant="secondary" className="ml-1">
                    Demo
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleSwitchOrg(org.id)}
                  className={org.id === currentOrg?.id ? 'bg-secondary' : ''}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="flex-1 truncate">{org.name}</span>
                  {org.is_demo && (
                    <Badge variant="secondary" className="ml-2">
                      Demo
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {role && (
            <Badge className={getRoleBadgeColor(role)}>{getRoleLabel(role)}</Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="max-w-[150px] truncate text-sm">
                  {user?.email}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}
