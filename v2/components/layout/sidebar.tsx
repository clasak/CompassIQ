'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Presentation,
  Zap,
  Target,
  BarChart3,
  Bell,
  Calculator,
  Wand2,
} from 'lucide-react'

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Revenue Engine', href: '/revenue', icon: TrendingUp },
  { name: 'Operations', href: '/ops', icon: Zap },
  { name: 'Accounts', href: '/accounts', icon: Users },
  { name: 'ROI Calculator', href: '/roi', icon: Calculator },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Presentation', href: '/demo', icon: Presentation },
]

const bottomNav = [
  { name: 'Client Setup', href: '/setup', icon: Wand2 },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 h-screen bg-surface-raised border-r border-border flex flex-col fixed left-0 top-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pipeline to-revenue flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-text-primary">
              CompassIQ
            </span>
            <span className="block text-xs text-text-tertiary">Business OS</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-pipeline/10 text-pipeline border border-pipeline/30'
                  : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-pipeline"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-pipeline/10 text-pipeline'
                  : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pipeline to-revenue flex items-center justify-center text-white text-sm font-semibold">
            CC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              Cody Clasak
            </div>
            <div className="text-xs text-text-tertiary">Admin</div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
