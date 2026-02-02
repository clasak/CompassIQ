'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-surface-raised border border-border shadow-lg hover:bg-surface-overlay transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-text-primary" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ 
          x: 0,
          opacity: 1 
        }}
        transition={{ duration: 0.3, type: 'tween' }}
        className={cn(
          'w-full sm:w-80 lg:w-64 h-screen bg-surface-raised border-r border-border flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300',
          'lg:translate-x-0',
          !isMobileMenuOpen && 'max-lg:-translate-x-full'
        )}
      >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/compass-iq-logo.svg" 
              alt="CompassIQ Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <div>
              <span className="font-display font-bold text-lg text-text-primary">
                CompassIQ
              </span>
              <span className="block text-xs text-text-tertiary">Business OS</span>
            </div>
          </Link>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-overlay transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
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
    </>
  )
}
