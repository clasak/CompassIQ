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
  Building2,
  AlertTriangle,
  CheckSquare,
  Calendar,
  Hammer,
} from 'lucide-react'

const navigation = [
  { name: 'Command Center', href: '/app', icon: LayoutDashboard },
  { name: 'Clients', href: '/app/clients', icon: Building2 },
  { name: 'Sales', href: '/app/sales', icon: TrendingUp },
  { name: 'Ops', href: '/app/ops', icon: Settings },
  { name: 'Finance', href: '/app/finance', icon: DollarSign },
  { name: 'Success', href: '/app/success', icon: Users },
  { name: 'Data', href: '/app/data/metrics', icon: Database },
  { name: 'Actions', href: '/app/actions', icon: Zap },
  { name: 'Construction', href: '/app/construction', icon: Hammer },
]

const operateNavigation = [
  { name: 'Operate', href: '/app/operate', icon: LayoutDashboard },
  { name: 'Alerts', href: '/app/execute/alerts', icon: AlertTriangle },
  { name: 'Tasks', href: '/app/execute/tasks', icon: CheckSquare },
  { name: 'Meeting Mode', href: '/app/cadence', icon: Calendar },
]

const buildNavigation = [
  { name: 'Templates', href: '/app/build/templates', icon: Building2 },
  { name: 'OS Instances', href: '/app/build/instances', icon: Settings },
]

const crmNavigation = [
  { name: 'Leads', href: '/app/crm/leads' },
  { name: 'Accounts', href: '/app/crm/accounts' },
  { name: 'Opportunities', href: '/app/crm/opportunities' },
  { name: 'Quotes', href: '/app/crm/quotes' },
]

const constructionNavigation = [
  { name: 'Command Center', href: '/app/construction' },
  { name: 'Projects', href: '/app/construction/projects' },
  { name: 'Cost', href: '/app/construction/cost' },
  { name: 'Schedule', href: '/app/construction/schedule' },
  { name: 'Change Orders', href: '/app/construction/changes' },
  { name: 'Labor', href: '/app/construction/labor' },
  { name: 'Equipment', href: '/app/construction/equipment' },
  { name: 'AR', href: '/app/construction/ar' },
  { name: 'Import', href: '/app/construction/import' },
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
  // #region agent log - disabled to prevent console errors when endpoint is unavailable
  // useEffect(() => {
  //   // Agent logging disabled - uncomment and configure endpoint if needed
  //   // fetch('http://127.0.0.1:7242/ingest/...', { ... })
  // }, [pathname, branding]);
  // #endregion

  useEffect(() => {
    const handle = window.setTimeout(() => {
      for (const item of navigation) {
        router.prefetch(item.href)
      }
    }, 0)
    return () => window.clearTimeout(handle)
  }, [router])

  useEffect(() => {
    if (loading) return
    if (!isAdmin) return
    router.prefetch('/app/settings/branding')
  }, [router, isAdmin, loading])

  return (
    <div className="flex h-full w-72 flex-col border-r border-border/50 bg-background">
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
        <BrandMark url={branding.mark_url} size={24} alt={branding.brand_name} />
        <div className="min-w-0 leading-tight flex-1">
          <BrandWordmark
            brandName={branding.brand_name}
            logoLightUrl={branding.logo_light_url}
            logoDarkUrl={branding.logo_dark_url}
            height={20}
            className="text-section-sm font-semibold"
          />
          {branding.tagline && (
            <div className="text-table-sm text-muted-foreground truncate mt-0.5" title={branding.tagline}>{branding.tagline}</div>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-table font-medium transition-all duration-200 min-w-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              )}
              title={item.name}
              onMouseEnter={() => router.prefetch(item.href)}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span data-sidebar-item className="truncate">{item.name}</span>
            </Link>
          )
        })}
        <div className="my-3 border-t border-border/50" />
        <div className="px-3 py-2">
          <div className="text-section-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Operate
          </div>
          <div className="space-y-0.5">
            {operateNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-table font-medium transition-colors min-w-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={() => router.prefetch(item.href)}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="my-3 border-t border-border/50" />
        <div className="px-3 py-2">
          <div className="text-section-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Build
          </div>
          <div className="space-y-0.5">
            {buildNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-table font-medium transition-colors min-w-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={() => router.prefetch(item.href)}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="my-3 border-t border-border/50" />
        <div className="px-3 py-2">
          <div className="text-section-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            CRM
          </div>
          <div className="space-y-0.5">
            {crmNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-table font-medium transition-colors min-w-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
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
        <div className="my-3 border-t border-border/50" />
        <div className="px-3 py-2">
          <div className="text-section-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Construction
          </div>
          <div className="space-y-0.5">
            {constructionNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-table font-medium transition-colors min-w-0',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
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
            <div className="my-3 border-t border-border/50" />
            <Link
              href="/app/settings/org"
              data-settings-link
              prefetch={true}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-table font-medium transition-colors min-w-0 mx-3',
                pathname.startsWith('/app/settings')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              )}
              title="Settings"
              onMouseEnter={() => {
                for (const href of settingsPrefetchRoutes) {
                  router.prefetch(href)
                }
              }}
            >
              <Cog className="h-4 w-4 flex-shrink-0" />
              <span data-sidebar-item className="truncate">Settings</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
