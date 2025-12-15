'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/use-role'
import { useBranding } from '@/components/branding/BrandProvider'
import { BrandMark } from '@/components/branding/BrandMark'
import { BrandWordmark } from '@/components/branding/BrandWordmark'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  DollarSign,
  Users,
  Database,
  Zap,
  Cog,
} from 'lucide-react'

const navigation = [
  { name: 'Command Center', href: '/app', icon: LayoutDashboard },
  { name: 'Sales', href: '/app/sales', icon: TrendingUp },
  { name: 'Ops', href: '/app/ops', icon: Settings },
  { name: 'Finance', href: '/app/finance', icon: DollarSign },
  { name: 'Success', href: '/app/success', icon: Users },
  { name: 'Data', href: '/app/data/metrics', icon: Database },
  { name: 'Actions', href: '/app/actions', icon: Zap },
]

const crmNavigation = [
  { name: 'Leads', href: '/app/crm/leads' },
  { name: 'Accounts', href: '/app/crm/accounts' },
  { name: 'Opportunities', href: '/app/crm/opportunities' },
  { name: 'Quotes', href: '/app/crm/quotes' },
]

const settingsPrefetchRoutes = [
  '/app/settings/org',
  '/app/settings/branding',
  '/app/settings/connections',
  '/app/settings/mappings',
  '/app/settings/users',
  '/app/settings/invites',
  '/app/settings/export',
  '/app/settings/import',
  '/app/settings/setup',
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, loading } = useRole()
  const { branding } = useBranding()

  useEffect(() => {
    for (const href of settingsPrefetchRoutes) {
      router.prefetch(href)
    }
  }, [router])

  return (
    <div className="flex h-full w-72 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <BrandMark url={branding.mark_url} size={26} alt={branding.brand_name} />
        <div className="min-w-0 leading-tight flex-1">
          <BrandWordmark
            brandName={branding.brand_name}
            logoLightUrl={branding.logo_light_url}
            logoDarkUrl={branding.logo_dark_url}
            height={22}
            className="text-base"
          />
          {branding.tagline && (
            <div className="text-[11px] text-muted-foreground truncate" title={branding.tagline}>{branding.tagline}</div>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title={item.name}
              onMouseEnter={() => router.prefetch(item.href)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span data-sidebar-item className="truncate">{item.name}</span>
            </Link>
          )
        })}
        <div className="my-2 border-t" />
        <div className="px-3 py-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            CRM
          </div>
          <div className="space-y-1">
            {crmNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={() => router.prefetch(item.href)}
                >
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        {!loading && isAdmin && (
          <>
            <div className="my-2 border-t" />
            <Link
              href="/app/settings/org"
              data-settings-link
              prefetch={true}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-0',
                pathname.startsWith('/app/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title="Settings"
              onMouseEnter={() => router.prefetch('/app/settings/org')}
            >
              <Cog className="h-5 w-5 flex-shrink-0" />
              <span data-sidebar-item className="truncate">Settings</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
