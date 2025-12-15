/**
 * Navigation Audit Script
 * Verifies that all sidebar navigation links resolve to actual routes
 */

import { readdirSync, existsSync, statSync } from 'fs'
import { join, relative } from 'path'

// Navigation items from sidebar
const navigation = [
  { title: 'Command Center', href: '/app' },
  { title: 'Companies', href: '/app/sales/companies' },
  { title: 'Contacts', href: '/app/sales/contacts' },
  { title: 'Opportunities', href: '/app/sales/opportunities' },
  { title: 'Preview Generator', href: '/app/sales/preview' },
  { title: 'Projects', href: '/app/delivery/projects' },
  { title: 'Weekly Review Packs', href: '/app/delivery/reviews' },
  { title: 'Action Log', href: '/app/delivery/actions' },
  { title: 'Data Quality', href: '/app/data' },
  { title: 'Organization', href: '/app/settings/org' },
  { title: 'Users', href: '/app/settings/users' },
  { title: 'Invites', href: '/app/settings/invites' },
  { title: 'Branding', href: '/app/settings/branding' },
]

// Convert route to file path
function routeToPath(route: string): string[] {
  // Handle dynamic routes and check multiple possibilities
  const basePath = route.replace(/^\//, '')
  const appDir = join(process.cwd(), 'app')

  // Special case for /app root route
  if (route === '/app') {
    return [join(appDir, '(app)', 'page.tsx')]
  }

  const subPath = basePath.replace('app/', '')
  const possibilities = [
    join(appDir, basePath, 'page.tsx'),
    join(appDir, '(app)', subPath, 'page.tsx'),
  ]

  return possibilities
}

function checkRoute(route: string): { exists: boolean; path: string | null } {
  const paths = routeToPath(route)

  for (const path of paths) {
    if (existsSync(path)) {
      return { exists: true, path: relative(process.cwd(), path) }
    }
  }

  return { exists: false, path: null }
}

async function auditNavigation() {
  console.log('🔍 CompassIQ Navigation Audit\n')
  console.log('=' .repeat(60))

  let passed = 0
  let failed = 0
  const results: { route: string; title: string; status: string; path: string | null }[] = []

  for (const item of navigation) {
    const result = checkRoute(item.href)

    if (result.exists) {
      passed++
      results.push({
        route: item.href,
        title: item.title,
        status: 'PASS',
        path: result.path,
      })
    } else {
      failed++
      results.push({
        route: item.href,
        title: item.title,
        status: 'FAIL',
        path: null,
      })
    }
  }

  // Print results
  for (const r of results) {
    const statusIcon = r.status === 'PASS' ? '✅' : '❌'
    console.log(`${statusIcon} ${r.status} | ${r.title}`)
    console.log(`   Route: ${r.route}`)
    if (r.path) {
      console.log(`   File:  ${r.path}`)
    } else {
      console.log(`   File:  NOT FOUND`)
    }
    console.log('')
  }

  console.log('=' .repeat(60))
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${navigation.length} routes`)

  if (failed === 0) {
    console.log('\n✅ AUDIT PASSED - All navigation routes resolve to pages\n')
    process.exit(0)
  } else {
    console.log('\n❌ AUDIT FAILED - Some navigation routes are missing pages\n')
    process.exit(1)
  }
}

auditNavigation().catch((err) => {
  console.error('Audit error:', err)
  process.exit(1)
})
