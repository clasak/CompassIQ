'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  Presentation,
  Zap,
  Target,
  BarChart3,
  Bell,
  Calculator,
  Wand2,
  Mail,
  DollarSign,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Pipeline', href: '/pipeline', icon: TrendingUp },
  { name: 'Revenue Engine', href: '/revenue', icon: DollarSign },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const openMenu = useCallback(() => {
    setIsMobileMenuOpen(true)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Mobile Menu Button - only show when menu is closed */}
      {!isMobileMenuOpen && (
        <button
          type="button"
          onClick={openMenu}
          onTouchEnd={(e) => { e.preventDefault(); openMenu(); }}
          className="lg:hidden fixed top-4 left-4 z-40 p-3 rounded-lg bg-surface-raised border border-border shadow-lg active:bg-surface-overlay"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-text-primary pointer-events-none" />
        </button>
      )}

      {/* Mobile Overlay - click to close */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMenu}
          onTouchEnd={(e) => { e.preventDefault(); closeMenu(); }}
          className="lg:hidden fixed inset-0 bg-black/70 z-40 cursor-pointer"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-[280px] lg:w-64 h-screen bg-surface-raised border-r border-border flex flex-col fixed left-0 top-0 z-50',
          // Desktop: always visible
          'lg:translate-x-0',
          // Mobile: slide in/out
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ transition: 'transform 0.2s ease-out' }}
      >
        {/* Header with Logo and Close Button */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
              <Image 
                src="/compass-iq-logo.svg" 
                alt="CompassIQ Logo" 
                width={36} 
                height={36}
                className="w-9 h-9"
              />
              <div>
                <span className="font-display font-bold text-lg text-text-primary">
                  CompassIQ
                </span>
                <span className="block text-xs text-text-tertiary">Business OS</span>
              </div>
            </Link>
            
            {/* Close Button - prominent on mobile */}
            <button
              type="button"
              onClick={closeMenu}
              onTouchEnd={(e) => { e.preventDefault(); closeMenu(); }}
              className="lg:hidden p-3 rounded-lg bg-danger/20 hover:bg-danger/30 active:bg-danger/40"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-danger pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                  isActive
                    ? 'bg-pipeline/10 text-pipeline border border-pipeline/30'
                    : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary active:bg-surface-overlay'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pipeline" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-border space-y-1">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                  isActive
                    ? 'bg-pipeline/10 text-pipeline'
                    : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary active:bg-surface-overlay'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* User */}
        <div className="p-3 border-t border-border">
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
      </aside>
    </>
  )
}
