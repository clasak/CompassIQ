'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/use-role'
import { useBranding } from '@/components/branding/BrandProvider'
import { BrandMark } from '@/components/branding/BrandMark'
import { BrandWordmark } from '@/components/branding/BrandWordmark'
import { useEffect, memo, useCallback } from 'react'
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
  { name: 'Overview', href: '/app/construction', icon: Hammer },
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

export const Sidebar = memo(function Sidebar() {
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

  const handlePrefetch = useCallback((href: string) => () => {
    router.prefetch(href)
  }, [router])

  const handleSettingsPrefetch = useCallback(() => {
    for (const href of settingsPrefetchRoutes) {
      router.prefetch(href)
    }
  }, [router])

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/30 bg-background">
      <div className="flex h-48 items-center justify-center border-b border-border/30 px-4 py-6 bg-background">
        <BrandMark url={branding.mark_url} size={180} alt={branding.brand_name} />
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto bg-background">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 min-w-0',
                isActive
                  ? 'bg-gradient-to-r from-[#00A4A9] to-[#A2EE1F] text-white shadow-lg shadow-[#00A4A9]/20'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              )}
              title={item.name}
              onMouseEnter={handlePrefetch(item.href)}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span data-sidebar-item className="truncate">{item.name}</span>
            </Link>
          )
        })}
        <div className="my-2 mx-2 border-t border-border/30" />
        <div className="py-1">
          <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5 px-3">
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
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 min-w-0',
                    isActive
                      ? 'bg-gradient-to-r from-[#00A4A9] to-[#A2EE1F] text-white shadow-lg shadow-[#00A4A9]/20'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={handlePrefetch(item.href)}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="my-2 mx-2 border-t border-border/30" />
        <div className="py-1">
          <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5 px-3">
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
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 min-w-0',
                    isActive
                      ? 'bg-gradient-to-r from-[#00A4A9] to-[#A2EE1F] text-white shadow-lg shadow-[#00A4A9]/20'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={handlePrefetch(item.href)}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="my-2 mx-2 border-t border-border/30" />
        <div className="py-1">
          <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5 px-3">
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
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 min-w-0',
                    isActive
                      ? 'bg-gradient-to-r from-[#00A4A9] to-[#A2EE1F] text-white shadow-lg shadow-[#00A4A9]/20'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={handlePrefetch(item.href)}
                >
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="my-2 mx-2 border-t border-border/30" />
        <div className="py-1">
          <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5 px-3">
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
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 min-w-0',
                    isActive
                      ? 'bg-gradient-to-r from-[#00A4A9] to-[#A2EE1F] text-white shadow-lg shadow-[#00A4A9]/20'
                      : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                  )}
                  title={item.name}
                  onMouseEnter={handlePrefetch(item.href)}
                >
                  {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                  <span data-sidebar-item className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        {!loading && isAdmin && (
          <>
            <div className="my-2 mx-2 border-t border-border/30" />
            <Link
              href="/app/settings/org"
              data-settings-link
              prefetch={true}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 min-w-0 mx-2',
                pathname.startsWith('/app/settings')
                  ? 'bg-gradient-to-r from-primary/90 via-primary to-accent/80 text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              )}
              title="Settings"
              onMouseEnter={handleSettingsPrefetch}
            >
              <Cog className="h-4 w-4 flex-shrink-0" />
              <span data-sidebar-item className="truncate">Settings</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
})
