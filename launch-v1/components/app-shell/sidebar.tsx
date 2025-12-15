'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  Eye,
  FolderKanban,
  ClipboardList,
  ListTodo,
  BarChart3,
  Settings,
  Users2,
  Mail,
  Palette,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Command Center',
    href: '/app',
    icon: LayoutDashboard,
  },
  {
    title: 'Sales',
    href: '/app/sales',
    icon: Target,
    children: [
      { title: 'Companies', href: '/app/sales/companies', icon: Building2 },
      { title: 'Contacts', href: '/app/sales/contacts', icon: Users },
      { title: 'Opportunities', href: '/app/sales/opportunities', icon: Target },
      { title: 'Preview Generator', href: '/app/sales/preview', icon: Eye },
    ],
  },
  {
    title: 'Delivery',
    href: '/app/delivery',
    icon: FolderKanban,
    children: [
      { title: 'Projects', href: '/app/delivery/projects', icon: FolderKanban },
      { title: 'Weekly Review Packs', href: '/app/delivery/reviews', icon: ClipboardList },
      { title: 'Action Log', href: '/app/delivery/actions', icon: ListTodo },
    ],
  },
  {
    title: 'Data Quality',
    href: '/app/data',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
    children: [
      { title: 'Organization', href: '/app/settings/org', icon: Building2 },
      { title: 'Users', href: '/app/settings/users', icon: Users2 },
      { title: 'Invites', href: '/app/settings/invites', icon: Mail },
      { title: 'Branding', href: '/app/settings/branding', icon: Palette },
    ],
  },
]

interface SidebarProps {
  isDemo?: boolean
}

export function Sidebar({ isDemo }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Sales', 'Delivery', 'Settings'])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app'
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/app" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            C
          </div>
          <span className="font-semibold text-lg">CompassIQ</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive(child.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {isDemo && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <strong>Demo Mode</strong>
            <p className="mt-1">Changes will not be saved.</p>
          </div>
        </div>
      )}
    </aside>
  )
}

// Export navigation for audit scripts
export { navigation }
