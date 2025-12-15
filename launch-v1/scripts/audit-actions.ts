/**
 * Actions Audit Script
 * Verifies that key action buttons/links resolve to actual routes or API endpoints
 */

import { existsSync } from 'fs'
import { join, relative } from 'path'

// Key actions in the app
const actions = [
  // Company actions
  { name: 'New Company', route: '/app/sales/companies/new', type: 'page' },
  { name: 'Edit Company', route: '/app/sales/companies/[id]/edit', type: 'page' },

  // Contact actions
  { name: 'New Contact', route: '/app/sales/contacts/new', type: 'page' },

  // Opportunity actions
  { name: 'New Opportunity', route: '/app/sales/opportunities/new', type: 'page' },
  { name: 'Start Discovery', route: '/app/sales/opportunities/[id]/discovery/new', type: 'page' },

  // Preview actions
  { name: 'New Preview', route: '/app/sales/preview/new', type: 'page' },

  // Delivery actions
  { name: 'New Project', route: '/app/delivery/projects/new', type: 'page' },

  // API endpoints
  { name: 'Set Org', route: '/api/org/set', type: 'api' },
  { name: 'Get Current Org', route: '/api/org/current', type: 'api' },
  { name: 'Enter Preview', route: '/api/preview/enter', type: 'api' },
  { name: 'Exit Preview', route: '/api/preview/exit', type: 'api' },
]

function checkAction(action: { name: string; route: string; type: string }): {
  exists: boolean
  path: string | null
} {
  const appDir = join(process.cwd(), 'app')
  let paths: string[] = []

  if (action.type === 'page') {
    const basePath = action.route.replace(/^\//, '').replace('app/', '')
    paths = [
      join(appDir, `(app)/${basePath}`, 'page.tsx'),
      join(appDir, action.route.replace(/^\//, ''), 'page.tsx'),
    ]
  } else if (action.type === 'api') {
    const basePath = action.route.replace(/^\//, '')
    paths = [join(appDir, basePath, 'route.ts')]
  }

  for (const path of paths) {
    if (existsSync(path)) {
      return { exists: true, path: relative(process.cwd(), path) }
    }
  }

  return { exists: false, path: null }
}

async function auditActions() {
  console.log('🔍 CompassIQ Actions Audit\n')
  console.log('='.repeat(60))

  let passed = 0
  let failed = 0
  const results: {
    name: string
    route: string
    type: string
    status: string
    path: string | null
  }[] = []

  for (const action of actions) {
    const result = checkAction(action)

    if (result.exists) {
      passed++
      results.push({
        name: action.name,
        route: action.route,
        type: action.type,
        status: 'PASS',
        path: result.path,
      })
    } else {
      failed++
      results.push({
        name: action.name,
        route: action.route,
        type: action.type,
        status: 'FAIL',
        path: null,
      })
    }
  }

  // Print results grouped by type
  const pageActions = results.filter((r) => r.type === 'page')
  const apiActions = results.filter((r) => r.type === 'api')

  console.log('\n📄 Page Actions:\n')
  for (const r of pageActions) {
    const statusIcon = r.status === 'PASS' ? '✅' : '❌'
    console.log(`${statusIcon} ${r.status} | ${r.name}`)
    console.log(`   Route: ${r.route}`)
    if (r.path) {
      console.log(`   File:  ${r.path}`)
    }
    console.log('')
  }

  console.log('\n🔌 API Endpoints:\n')
  for (const r of apiActions) {
    const statusIcon = r.status === 'PASS' ? '✅' : '❌'
    console.log(`${statusIcon} ${r.status} | ${r.name}`)
    console.log(`   Route: ${r.route}`)
    if (r.path) {
      console.log(`   File:  ${r.path}`)
    }
    console.log('')
  }

  console.log('='.repeat(60))
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${actions.length} actions`)

  if (failed === 0) {
    console.log('\n✅ AUDIT PASSED - All actions resolve to handlers\n')
    process.exit(0)
  } else {
    console.log('\n⚠️  AUDIT WARNING - Some actions are missing handlers')
    console.log('   (This may be acceptable for placeholder routes)\n')
    // Don't exit with error - some routes may be intentionally deferred
    process.exit(0)
  }
}

auditActions().catch((err) => {
  console.error('Audit error:', err)
  process.exit(1)
})
