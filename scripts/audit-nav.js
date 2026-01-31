/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')

const repoRoot = process.cwd()

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

function walkFiles(dirPath) {
  const out = []
  if (!fileExists(dirPath)) return out
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkFiles(full))
    } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js'))) {
      out.push(full)
    }
  }
  return out
}

function normalizeRoute(route) {
  const noQuery = route.split('?')[0].split('#')[0]
  if (noQuery.length > 1 && noQuery.endsWith('/')) return noQuery.slice(0, -1)
  return noQuery
}

function appRouteToPageFile(route) {
  const normalized = normalizeRoute(route)
  if (!normalized.startsWith('/app')) return null

  const subPath = normalized === '/app' ? '' : normalized.slice('/app'.length)
  const pagePath = path.join(repoRoot, 'app', 'app', subPath, 'page.tsx')
  return pagePath
}

function extractStrings(filePath, patterns) {
  const code = fs.readFileSync(filePath, 'utf8')
  const out = []
  for (const re of patterns) {
    let match
    while ((match = re.exec(code)) !== null) {
      out.push(match[1])
    }
  }
  return out
}

function uniqueSorted(arr) {
  return Array.from(new Set(arr)).sort()
}

function auditRoutes() {
  const scanRoots = [
    path.join(repoRoot, 'components', 'app-shell'),
    path.join(repoRoot, 'app', 'app'),
    path.join(repoRoot, 'app', 'login'),
  ]

  const files = uniqueSorted(scanRoots.flatMap(walkFiles))

  const routePatterns = [
    /href\s*[:=]\s*\{?\s*['"]([^'"]+)['"]/g,
    /router\.push\(\s*['"]([^'"]+)['"]/g,
    /window\.location\.assign\(\s*['"]([^'"]+)['"]/g,
  ]

  const routes = []
  for (const filePath of files) {
    for (const value of extractStrings(filePath, routePatterns)) {
      if (typeof value !== 'string') continue
      if (!value.startsWith('/app')) continue
      routes.push(normalizeRoute(value))
    }
  }

  const uniqueRoutes = uniqueSorted(routes)
  const missing = []

  for (const route of uniqueRoutes) {
    const pageFile = appRouteToPageFile(route)
    if (!pageFile) continue
    if (!fileExists(pageFile)) {
      missing.push({ route, expected: path.relative(repoRoot, pageFile) })
    }
  }

  return { uniqueRoutes, missing }
}

function auditApiRoutes() {
  const scanRoots = [path.join(repoRoot, 'app'), path.join(repoRoot, 'components'), path.join(repoRoot, 'lib')]
  const files = uniqueSorted(scanRoots.flatMap(walkFiles))

  const apiPatterns = [/fetch\(\s*['"]((?:\/api\/)[^'"]+)['"]/g]
  const apiCalls = []
  for (const filePath of files) {
    for (const value of extractStrings(filePath, apiPatterns)) {
      if (typeof value !== 'string') continue
      apiCalls.push(normalizeRoute(value))
    }
  }

  const uniqueApiCalls = uniqueSorted(apiCalls)
  const missing = []
  for (const apiPath of uniqueApiCalls) {
    if (!apiPath.startsWith('/api/')) continue
    const rel = path.join('app', apiPath, 'route.ts')
    const abs = path.join(repoRoot, rel)
    if (!fileExists(abs)) {
      missing.push({ api: apiPath, expected: rel })
    }
  }

  return { uniqueApiCalls, missing }
}

function auditServerActions() {
  const required = [
    {
      file: 'lib/actions/org-actions.ts',
      exports: ['createOrganization', 'switchOrganization', 'getActiveOrgIdForClient', 'getCurrentUserRole'],
    },
    {
      file: 'lib/actions/roi-actions.ts',
      exports: ['getROIDefaultsAction', 'saveROIDefaultsAction'],
    },
    {
      file: 'lib/actions/config-actions.ts',
      exports: ['exportConfiguration', 'importConfiguration'],
    },
    {
      file: 'lib/actions/settings-actions.ts',
      exports: [
        'updateOrgName',
        'getOrgMembers',
        'updateMemberRole',
        'removeMember',
        'createInvite',
        'getOrgInvites',
        'revokeInvite',
        'acceptInvite',
      ],
    },
    {
      file: 'lib/actions/client-setup-actions.ts',
      exports: ['setupClientInstance'],
    },
  ]

  const missing = []
  for (const entry of required) {
    const abs = path.join(repoRoot, entry.file)
    if (!fileExists(abs)) {
      missing.push({ file: entry.file, export: '(file missing)' })
      continue
    }
    const code = fs.readFileSync(abs, 'utf8')
    for (const name of entry.exports) {
      const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}\\b`)
      if (!re.test(code)) {
        missing.push({ file: entry.file, export: name })
      }
    }
  }

  return { required, missing }
}

function main() {
  const routeAudit = auditRoutes()
  const apiAudit = auditApiRoutes()
  const actionsAudit = auditServerActions()

  const failures = []
  if (routeAudit.missing.length) failures.push('routes')
  if (apiAudit.missing.length) failures.push('api')
  if (actionsAudit.missing.length) failures.push('actions')

  if (failures.length) {
    console.error('FAIL audit:nav')

    if (routeAudit.missing.length) {
      console.error('\\nMissing /app routes:')
      for (const m of routeAudit.missing) {
        console.error(`- ${m.route} -> expected ${m.expected}`)
      }
    }

    if (apiAudit.missing.length) {
      console.error('\\nMissing /api routes:')
      for (const m of apiAudit.missing) {
        console.error(`- ${m.api} -> expected ${m.expected}`)
      }
    }

    if (actionsAudit.missing.length) {
      console.error('\\nMissing server action exports:')
      for (const m of actionsAudit.missing) {
        console.error(`- ${m.file}: ${m.export}`)
      }
    }

    process.exit(1)
  }

  console.log('PASS audit:nav')
  console.log(`Checked /app routes: ${routeAudit.uniqueRoutes.length}`)
  console.log(`Checked /api calls: ${apiAudit.uniqueApiCalls.length}`)
  console.log(`Checked action files: ${actionsAudit.required.length}`)
}

main()
