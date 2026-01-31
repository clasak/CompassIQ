'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

const LINKS = [
  { name: 'Org', href: '/app/settings/org' },
  { name: 'Branding', href: '/app/settings/branding' },
  { name: 'Connections', href: '/app/settings/connections' },
  { name: 'Mappings', href: '/app/settings/mappings' },
  { name: 'Users', href: '/app/settings/users' },
  { name: 'Invites', href: '/app/settings/invites' },
  { name: 'Export', href: '/app/settings/export' },
  { name: 'Import', href: '/app/settings/import' },
  { name: 'Setup', href: '/app/settings/setup' },
]

export function SettingsNav() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    for (const link of LINKS) {
      router.prefetch(link.href)
    }
  }, [router])

  return (
    <div className="flex flex-wrap gap-2">
      {LINKS.map((l) => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            title={l.name}
          >
            {l.name}
          </Link>
        )
      })}
    </div>
  )
}
