/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const http = require('http')

const repoRoot = process.cwd()

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

function mustExist(relPaths) {
  const missing = []
  for (const rel of relPaths) {
    const abs = path.join(repoRoot, rel)
    if (!fileExists(abs)) missing.push(rel)
  }
  return missing
}

function tryHttpHead(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD', timeout: 1500 }, (res) => {
      resolve({ ok: true, status: res.statusCode })
    })
    req.on('timeout', () => {
      req.destroy()
      resolve({ ok: false, error: 'timeout' })
    })
    req.on('error', (e) => resolve({ ok: false, error: e.message }))
    req.end()
  })
}

async function main() {
  const requiredRoutes = [
    'app/app/settings/connections/page.tsx',
    'app/app/settings/mappings/page.tsx',
  ]

  const requiredApi = [
    'app/api/ingest/csv/route.ts',
    'app/api/ingest/webhook/route.ts',
  ]

  const missingRoutes = mustExist(requiredRoutes)
  const missingApi = mustExist(requiredApi)

  if (missingRoutes.length || missingApi.length) {
    console.error('FAIL audit:ingestion')
    if (missingRoutes.length) {
      console.error('\nMissing routes:')
      missingRoutes.forEach((p) => console.error(`- ${p}`))
    }
    if (missingApi.length) {
      console.error('\nMissing API routes:')
      missingApi.forEach((p) => console.error(`- ${p}`))
    }
    process.exit(1)
  }

  // Optional smoke if server is running
  const base = 'http://localhost:3005'
  const login = await tryHttpHead(`${base}/login`)
  const app = await tryHttpHead(`${base}/app`)

  console.log('PASS audit:ingestion')
  console.log(`Checked routes: ${requiredRoutes.length}`)
  console.log(`Checked api routes: ${requiredApi.length}`)
  if (login.ok) console.log(`Smoke /login HEAD: ${login.status}`)
  if (app.ok) console.log(`Smoke /app HEAD: ${app.status}`)
}

main().catch((e) => {
  console.error('FAIL audit:ingestion')
  console.error(e?.message || e)
  process.exit(1)
})

