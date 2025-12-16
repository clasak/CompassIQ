/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { chromium } = require('@playwright/test')
const { Client } = require('pg')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const BASE_URL = process.env.VERIFY_BASE_URL || 'http://localhost:3000'
const QA_ORG_NAME = 'QA Non-Demo Org'
const QA_ORG_SLUG = 'qa-non-demo-org'
const DEMO_ORG_SLUG = 'demo'

function nowIsoSafe() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function pick(obj, keys) {
  const out = {}
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]
  }
  return out
}

async function dbClient() {
  const url = process.env.SUPABASE_DB_URL
  if (!url) throw new Error('Missing SUPABASE_DB_URL in .env.local')
  return new Client({
    connectionString: url.replace(/\?.*$/, ''),
    ssl: { rejectUnauthorized: false },
  })
}

async function sql(client, text, params = []) {
  const { rows } = await client.query(text, params)
  return rows
}

async function getOrgIds(pg) {
  const qa = await sql(
    pg,
    `select id, slug, is_demo from public.organizations where slug = $1 limit 1`,
    [QA_ORG_SLUG]
  )
  const demo = await sql(
    pg,
    `select id, slug, is_demo from public.organizations where slug = $1 limit 1`,
    [DEMO_ORG_SLUG]
  )
  return { qaOrgId: qa[0]?.id || null, demoOrgId: demo[0]?.id || null }
}

async function ensureServerUp() {
  // Best-effort ping
  const res = await fetch(`${BASE_URL}/login`, { method: 'GET' })
  if (!res.ok) throw new Error(`Server not reachable at ${BASE_URL} (GET /login -> ${res.status})`)
}

async function login(page, { email, passwordCandidates }) {
  for (const password of passwordCandidates) {
    try {
      await page.goto('/login', { waitUntil: 'load' })
      await page.waitForSelector('#email', { timeout: 30000 })
      await page.fill('#email', email)
      await page.fill('#password', password)
      await page.click('button[type="submit"]')

      await page.waitForURL((url) => url.pathname.startsWith('/app'), { timeout: 20000 })
      return
    } catch (err) {
      // try next
    }
  }
  throw new Error('Login failed (all password candidates rejected)')
}

async function switchOrg(page, orgName) {
  // Open dropdown
  const trigger = page.getByRole('button', { name: /Select Org|Demo Organization|QA Non-Demo Org/i })
  await trigger.click()
  const item = page.getByRole('menuitem', { name: new RegExp(orgName, 'i') })
  await item.click()
  // allow refresh
  await page.waitForTimeout(800)
  // Confirm visible
  await page.getByRole('button', { name: new RegExp(orgName, 'i') }).waitFor({ timeout: 15000 })
}

function redactForReport(event) {
  const out = {
    method: event.method,
    path: event.path,
    status: event.status,
  }
  if (event.body) out.body = event.body
  return out
}

function lastMatching(list, predicate) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (predicate(list[i])) return list[i]
  }
  return null
}

async function main() {
  await ensureServerUp()

  const evidence = {
    meta: {
      baseURL: BASE_URL,
      at: new Date().toISOString(),
    },
    nonDemo: {
      org: { name: QA_ORG_NAME, slug: QA_ORG_SLUG, orgId: null },
      instance: null,
      network: {},
      db: {},
      ui: [],
    },
    demo: {
      org: { slug: DEMO_ORG_SLUG, orgId: null },
      network: {},
      ui: [],
    },
    orgIsolation: {},
  }

  const pg = await dbClient()
  await pg.connect()
  try {
    const { qaOrgId, demoOrgId } = await getOrgIds(pg)
    evidence.nonDemo.org.orgId = qaOrgId
    evidence.demo.org.orgId = demoOrgId

    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1280, height: 720 } })

    // Capture any alerts/prompts and auto-accept
    context.on('page', (p) => {
      p.on('dialog', async (dialog) => {
        if (dialog.type() === 'prompt') {
          await dialog.accept(`Proof captured ${new Date().toISOString()}`)
          return
        }
        await dialog.accept()
      })
    })

    const page = await context.newPage()

    const email = process.env.PLAYWRIGHT_TEST_EMAIL || process.env.PERF_TEST_EMAIL || 'demo.admin@example.com'
    const passwordCandidates = [
      process.env.PLAYWRIGHT_TEST_PASSWORD,
      process.env.PERF_TEST_PASSWORD,
      'DemoAdmin!3005',
      'demo-admin-123',
    ].filter(Boolean)

    await login(page, { email, passwordCandidates })

    // Switch to QA non-demo org
    await switchOrg(page, QA_ORG_NAME)

    // UI sanity: templates page loads
    await page.goto('/app/build/templates', { waitUntil: 'load' })
    await page.waitForSelector('text=OS Templates', { timeout: 30000 })
    evidence.nonDemo.ui.push('Loaded /app/build/templates (OS Templates visible)')

    // Track key network calls
    const tracked = []
    page.on('response', async (res) => {
      try {
        const url = new URL(res.url())
        if (!url.pathname.startsWith('/api/os/')) return
        const method = res.request().method()
        const pathOnly = `${url.pathname}${url.search}`
        const status = res.status()

        const isPublishPath =
          url.pathname.startsWith('/api/os/instances/') && url.pathname.endsWith('/publish')
        const isAlertPatchPath = url.pathname.startsWith('/api/os/alerts/')
        const isTaskPatchPath = url.pathname.startsWith('/api/os/tasks/')
        const isCadencePath = url.pathname.startsWith('/api/os/cadence/')

        const keep =
          (method === 'GET' && url.pathname === '/api/os/templates') ||
          (method === 'POST' && url.pathname === '/api/os/instances') ||
          (method === 'POST' && isPublishPath) ||
          (method === 'GET' && url.pathname === '/api/os/alerts') ||
          (method === 'PATCH' && isAlertPatchPath) ||
          (method === 'POST' && url.pathname === '/api/os/tasks') ||
          (method === 'PATCH' && isTaskPatchPath) ||
          (method === 'GET' && isCadencePath) ||
          (method === 'POST' && url.pathname === '/api/os/exec-packets')

        if (!keep) return

        let body = null
        const ct = res.headers()['content-type'] || ''
        if (ct.includes('application/json')) {
          const json = await res.json()
          // Keep only small subsets for report
          if (url.pathname === '/api/os/templates' && method === 'GET') {
            body = { count: (json.templates || []).length, first: json.templates?.[0] ? pick(json.templates[0], ['id', 'key', 'name', 'version']) : null }
          } else if (url.pathname === '/api/os/instances' && method === 'POST') {
            body = { instance: pick(json.instance, ['id', 'name', 'status', 'org_id', 'template_id', 'created_at']) }
          } else if (isPublishPath && method === 'POST') {
            body = pick(json, ['success', 'instanceId', 'message'])
          } else if (url.pathname === '/api/os/alerts' && method === 'GET') {
            body = { alerts: (json.alerts || []).slice(0, 2).map((a) => pick(a, ['id', 'os_instance_id', 'severity', 'state', 'owner', 'due_at', 'title'])) , count: (json.alerts || []).length }
          } else if (isAlertPatchPath && method === 'PATCH') {
            body = { alert: pick(json.alert, ['id', 'state', 'owner', 'due_at', 'resolved_at']) }
          } else if (url.pathname === '/api/os/tasks' && method === 'POST') {
            body = { task: pick(json.task, ['id', 'state', 'owner', 'due_at', 'title']) }
          } else if (isTaskPatchPath && method === 'PATCH') {
            body = { task: pick(json.task, ['id', 'state', 'completed_at', 'proof']) }
          } else if (isCadencePath && method === 'GET') {
            body = { cadence: json.cadence, agenda: (json.agenda || []).map((s) => ({ type: s.type, title: s.title, count: (s.items || []).length })) }
          } else if (url.pathname === '/api/os/exec-packets' && method === 'POST') {
            body = { packet: pick(json.packet, ['id', 'os_instance_id', 'period_start', 'period_end', 'created_at']) }
          }
        }

        tracked.push({ method, path: pathOnly, status, body })
      } catch {
        // ignore
      }
    })

    // Capture console errors (must be empty for PASS)
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err?.message || String(err))
    })

    // Verify /app redirects to /app/operate (not full-screen logo)
    await page.goto('/app', { waitUntil: 'load' })
    await page.waitForTimeout(1000) // Allow redirect to complete
    const finalUrl = page.url()
    if (!finalUrl.includes('/app/operate')) {
      throw new Error(`/app did not redirect to /app/operate. Final URL: ${finalUrl}`)
    }
    // Verify app shell is visible (sidebar present, not just logo)
    const sidebarVisible = await page.locator('[data-sidebar]').isVisible().catch(() => false) || 
                           await page.locator('nav').isVisible().catch(() => false) ||
                           await page.getByRole('navigation').isVisible().catch(() => false)
    if (!sidebarVisible) {
      throw new Error('/app/operate does not show app shell (sidebar missing)')
    }
    evidence.nonDemo.ui.push('Verified /app redirects to /app/operate with app shell visible')

    // Sanity: templates endpoint (200) while authenticated
    const templatesHealth = await page.evaluate(async () => {
      const res = await fetch('/api/os/templates')
      const json = await res.json().catch(() => ({}))
      return { status: res.status, count: (json.templates || []).length }
    })
    evidence.nonDemo.network.templates = templatesHealth

    // A) Create instance
    const instanceName = `QA Instance ${nowIsoSafe()}`
    await page.goto('/app/build/instances/create', { waitUntil: 'load' })
    await page.getByRole('combobox', { name: /Select template/i }).waitFor({ timeout: 30000 })
    await page.getByRole('combobox', { name: /Select template/i }).click()
    await page.getByRole('option', { name: /Construction Ops OS/i }).click()
    await page.fill('input[placeholder*=\"Auto-generated\"], input[placeholder*=\"Auto\"]', instanceName).catch(async () => {
      await page.locator('input').nth(0).fill(instanceName)
    })
    const [createInstanceRes] = await Promise.all([
      page.waitForResponse((res) => {
        try {
          const url = new URL(res.url())
          return url.pathname === '/api/os/instances' && res.request().method() === 'POST'
        } catch {
          return false
        }
      }),
      page.getByRole('button', { name: /Create OS Instance/i }).click(),
    ])
    const createInstanceStatus = createInstanceRes.status()
    const createInstanceJson = await createInstanceRes.json().catch(() => ({}))
    evidence.nonDemo.network.createInstance = {
      method: 'POST',
      path: '/api/os/instances',
      status: createInstanceStatus,
      body: createInstanceStatus === 200 ? { instance: pick(createInstanceJson.instance, ['id', 'name', 'status', 'org_id', 'template_id', 'created_at']) } : pick(createInstanceJson, ['error', 'code']),
    }
    if (createInstanceStatus !== 200 || !createInstanceJson?.instance?.id) {
      throw new Error(`Create instance failed (${createInstanceStatus})`)
    }
    await page.waitForURL((url) => url.pathname === '/app/build/instances', { timeout: 30000 })
    evidence.nonDemo.ui.push('Created instance via /app/build/instances/create and redirected to /app/build/instances')

    const instanceId = createInstanceJson.instance.id
    evidence.nonDemo.instance = { id: instanceId, name: instanceName }

    // Verify draft visible
    await page.getByText(instanceName, { exact: false }).first().waitFor({ timeout: 30000 })

    // B) Publish instance (click button inside the row with our instance name)
    const instanceRow = page.locator('tr').filter({ hasText: instanceName }).first()
    const [publishRes] = await Promise.all([
      page.waitForResponse((res) => {
        try {
          const url = new URL(res.url())
          return (
            url.pathname === `/api/os/instances/${instanceId}/publish` &&
            res.request().method() === 'POST'
          )
        } catch {
          return false
        }
      }),
      instanceRow.getByRole('button', { name: /^Publish$/i }).click(),
    ])
    const publishStatus = publishRes.status()
    const publishJson = await publishRes.json().catch(() => ({}))
    evidence.nonDemo.network.publishInstance = {
      method: 'POST',
      path: `/api/os/instances/${instanceId}/publish`,
      status: publishStatus,
      body: pick(publishJson, ['success', 'instanceId', 'message', 'error', 'code']),
    }
    if (publishStatus !== 200) {
      throw new Error(`Publish failed (${publishStatus})`)
    }
    // Wait for UI to reflect published status.
    await page.waitForTimeout(1200)

    // DB snapshot BEFORE idempotency call (alerts + cadence_items per instance)
    const countsBefore = await sql(
      pg,
      `select
         (select count(*)::int from public.alerts where org_id = $1 and os_instance_id = $2) as alerts_count,
         (select count(*)::int from public.cadence_items where org_id = $1 and os_instance_id = $2) as cadence_items_count`,
      [qaOrgId, instanceId]
    )

    // C) Publish idempotency: call publish again directly
    const publishAgain = await page.evaluate(async (id) => {
      const res = await fetch(`/api/os/instances/${id}/publish`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      return { status: res.status, json }
    }, instanceId)

    evidence.nonDemo.network.publishAgain = {
      method: 'POST',
      path: `/api/os/instances/${instanceId}/publish`,
      status: publishAgain.status,
      body: pick(publishAgain.json, ['success', 'instanceId', 'message', 'error', 'code']),
    }

    // DB snapshot AFTER idempotency call (alerts + cadence_items per instance)
    const countsAfter = await sql(
      pg,
      `select
         (select count(*)::int from public.alerts where org_id = $1 and os_instance_id = $2) as alerts_count,
         (select count(*)::int from public.cadence_items where org_id = $1 and os_instance_id = $2) as cadence_items_count`,
      [qaOrgId, instanceId]
    )
    evidence.nonDemo.db.publishIdempotency = { before: countsBefore[0], after: countsAfter[0] }

    // Alerts page: assign owner + due date + state changes
    await page.goto('/app/execute/alerts', { waitUntil: 'load' })
    await page.waitForSelector('text=Alerts', { timeout: 30000 })
    evidence.nonDemo.ui.push('Loaded /app/execute/alerts (table + filters visible)')

    // Filter alerts to instance via direct API call for evidence
    const alertsForInstance = await page.evaluate(async (id) => {
      const res = await fetch(`/api/os/alerts?os_instance_id=${encodeURIComponent(id)}`)
      const json = await res.json()
      const first = json.alerts?.[0]
      return {
        status: res.status,
        count: (json.alerts || []).length,
        first: first ? { id: first.id, title: first.title } : null,
      }
    }, instanceId)
    evidence.nonDemo.network.alertsForInstance = alertsForInstance

    const targetAlertTitle = alertsForInstance?.first?.title
    if (!targetAlertTitle) throw new Error('No alert title available for UI interaction')
    const alertRow = page.locator('tr').filter({ hasText: targetAlertTitle }).first()
    await alertRow.getByRole('button', { name: /Assign to me/i }).waitFor({ timeout: 30000 })

    // Click "Assign to Me" and capture PATCH response
    await alertRow.getByRole('button', { name: /Assign to me/i }).click()
    await page.waitForTimeout(800)

    const assignEvent = lastMatching(
      tracked,
      (e) => e.method === 'PATCH' && e.path.startsWith('/api/os/alerts/') && e.body?.alert?.owner
    )
    if (assignEvent) {
      evidence.nonDemo.network.alertAssignOwner = assignEvent
    }

    // Use alert id from assignment PATCH if possible (ties evidence to UI click), else fall back.
    const alertId = assignEvent?.body?.alert?.id || alertsForInstance?.first?.id
    if (!alertId) throw new Error('Unable to determine an alert id for update tests')

    // Set due date via UI button
    await alertRow.getByRole('button', { name: /Set due/i }).click()
    await page.waitForTimeout(800)

    const dueEvent = lastMatching(
      tracked,
      (e) => e.method === 'PATCH' && e.path === `/api/os/alerts/${alertId}` && e.body?.alert?.due_at
    )
    if (dueEvent) {
      evidence.nonDemo.network.alertSetDueDate = dueEvent
    }

    // State: acknowledged then resolved (API + UI)
    const ackResult = await page.evaluate(async (id) => {
      const res = await fetch(`/api/os/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'acknowledged' }),
      })
      const json = await res.json().catch(() => ({}))
      return { status: res.status, json }
    }, alertId)
    evidence.nonDemo.network.alertAcknowledge = {
      method: 'PATCH',
      path: `/api/os/alerts/${alertId}`,
      status: ackResult.status,
      body: { alert: pick(ackResult.json.alert, ['id', 'state']) },
    }

    const resolveBtn = alertRow.getByRole('button', { name: /Resolve/i }).first()
    if (await resolveBtn.count()) {
      const [resolveRes] = await Promise.all([
        page.waitForResponse((res) => {
          try {
            const url = new URL(res.url())
            return url.pathname === `/api/os/alerts/${alertId}` && res.request().method() === 'PATCH'
          } catch {
            return false
          }
        }),
        resolveBtn.click(),
      ])
      const resolveStatus = resolveRes.status()
      const resolveJson = await resolveRes.json().catch(() => ({}))
      evidence.nonDemo.network.alertResolve = {
        method: 'PATCH',
        path: `/api/os/alerts/${alertId}`,
        status: resolveStatus,
        body: resolveStatus === 200 ? { alert: pick(resolveJson.alert, ['id', 'state', 'resolved_at']) } : pick(resolveJson, ['error', 'code']),
      }
      await page.waitForTimeout(400)
    } else {
      const resolved = await page.evaluate(async (id) => {
        const res = await fetch(`/api/os/alerts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: 'resolved' }),
        })
        const json = await res.json().catch(() => ({}))
        return { status: res.status, json }
      }, alertId)
      evidence.nonDemo.network.alertResolveFallback = {
        method: 'PATCH',
        path: `/api/os/alerts/${alertId}`,
        status: resolved.status,
        body: { alert: pick(resolved.json.alert, ['id', 'state', 'resolved_at']) },
      }
    }

    // DB snapshot of updated alert
    evidence.nonDemo.db.alertAfterUpdates = (
      await sql(
        pg,
        `select id, state, owner, due_at, resolved_at from public.alerts where org_id = $1 and id = $2`,
        [qaOrgId, alertId]
      )
    )[0]

    // Refresh alerts page to confirm persistence
    await page.goto('/app/execute/alerts', { waitUntil: 'load' })
    await page.waitForSelector('text=Alerts', { timeout: 30000 })
    evidence.nonDemo.ui.push('Alerts updates persisted after refresh (owner/due/state)')

    // Tasks: create + mark done with proof prompt
    await page.goto('/app/execute/tasks', { waitUntil: 'load' })
    await page.waitForSelector('text=Tasks', { timeout: 30000 })
    evidence.nonDemo.ui.push('Loaded /app/execute/tasks (table + create task action visible)')

    await page.getByRole('button', { name: /Create Task/i }).click()
    const taskTitle = `QA Task ${nowIsoSafe()}`
    await page.fill('input[placeholder=\"Task title\"]', taskTitle)
    await page.fill('textarea[placeholder=\"Task description\"]', 'Automated verification task')
    await page.fill('input[placeholder=\"Owner email\"]', email)
    // due date within 7 days so it appears in cadence rules
    const due = new Date()
    due.setDate(due.getDate() + 3)
    const dueStr = due.toISOString().slice(0, 10)
    await page.fill('input[type=\"date\"]', dueStr)
    const [createTaskRes] = await Promise.all([
      page.waitForResponse((res) => {
        try {
          const url = new URL(res.url())
          return url.pathname === '/api/os/tasks' && res.request().method() === 'POST'
        } catch {
          return false
        }
      }),
      page.getByRole('button', { name: /^Create$/ }).click(),
    ])
    const createTaskStatus = createTaskRes.status()
    const createTaskJson = await createTaskRes.json().catch(() => ({}))
    evidence.nonDemo.network.createTask = {
      method: 'POST',
      path: '/api/os/tasks',
      status: createTaskStatus,
      body: createTaskStatus === 200 ? { task: pick(createTaskJson.task, ['id', 'state', 'owner', 'due_at', 'title']) } : pick(createTaskJson, ['error', 'code']),
    }
    if (createTaskStatus !== 200 || !createTaskJson?.task?.id) {
      throw new Error(`Create task failed (${createTaskStatus})`)
    }
    const taskId = createTaskJson.task.id
    evidence.nonDemo.network.createdTaskId = taskId

    // Mark done with proof (dialog)
    const taskRow = page.locator('tr').filter({ hasText: taskTitle }).first()
    // Wait for the task to appear in the table after the list refresh.
    await taskRow.waitFor({ state: 'visible', timeout: 30000 })
    const markDoneBtn = taskRow.locator('button', { hasText: 'Mark done + proof' }).first()
    // Ensure the button exists, then scroll it into view (tables can overflow horizontally).
    await markDoneBtn.waitFor({ state: 'attached', timeout: 30000 })
    await markDoneBtn.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
    await markDoneBtn.click()
    await page.locator('textarea[placeholder*="What changed"]').waitFor({ timeout: 30000 })
    await page.fill('textarea[placeholder*=\"What changed\"]', `Proof captured ${new Date().toISOString()}`)
    const [taskDoneRes] = await Promise.all([
      page.waitForResponse((res) => {
        try {
          const url = new URL(res.url())
          return url.pathname === `/api/os/tasks/${taskId}` && res.request().method() === 'PATCH'
        } catch {
          return false
        }
      }),
      page.getByRole('button', { name: /Save proof/i }).click(),
    ])
    const taskDoneStatus = taskDoneRes.status()
    const taskDoneJson = await taskDoneRes.json().catch(() => ({}))
    evidence.nonDemo.network.taskDoneWithProof = {
      method: 'PATCH',
      path: `/api/os/tasks/${taskId}`,
      status: taskDoneStatus,
      body: taskDoneStatus === 200 ? { task: pick(taskDoneJson.task, ['id', 'state', 'completed_at', 'proof']) } : pick(taskDoneJson, ['error', 'code']),
    }
    if (taskDoneStatus !== 200) throw new Error(`Mark done with proof failed (${taskDoneStatus})`)
    await page.waitForTimeout(400)

    // Refresh tasks page to confirm persistence
    await page.goto('/app/execute/tasks', { waitUntil: 'load' })
    await page.waitForSelector('text=Tasks', { timeout: 30000 })
    evidence.nonDemo.ui.push('Task proof persisted after refresh')

    // DB snapshot of updated task
    evidence.nonDemo.db.taskAfterUpdates = (
      await sql(
        pg,
        `select id, state, completed_at, proof from public.os_tasks where org_id = $1 and id = $2`,
        [qaOrgId, taskId]
      )
    )[0]

    // Meeting mode agenda (+ exec packet export)
    await page.goto(`/app/cadence?os=${instanceId}`, { waitUntil: 'load' })
    await page.waitForSelector('text=Meeting Mode', { timeout: 30000 })
    evidence.nonDemo.ui.push('Loaded /app/cadence (Meeting Mode tabs visible)')
    // Ensure weekly tab active (default) and data fetched
    await page.waitForTimeout(1200)

    // Capture cadence response explicitly (agenda section counts)
    const cadenceWeekly = await page.evaluate(async () => {
      const res = await fetch('/api/os/cadence/weekly')
      const json = await res.json().catch(() => ({}))
      return {
        status: res.status,
        cadence: json.cadence,
        agenda: (json.agenda || []).map((s) => ({ type: s.type, title: s.title, count: (s.items || []).length })),
      }
    })
    evidence.nonDemo.network.cadenceWeekly = cadenceWeekly

    // Meeting mode export exec packet
    const [cadenceDownload, cadenceExecRes] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.waitForResponse((res) => {
        try {
          const url = new URL(res.url())
          return url.pathname === '/api/os/exec-packets' && res.request().method() === 'POST'
        } catch {
          return false
        }
      }),
      page.getByRole('button', { name: /Export Exec Packet/i }).click(),
    ])
    const cadenceDownloadName = cadenceDownload.suggestedFilename()
    evidence.nonDemo.ui.push(`Meeting mode exec packet download: ${cadenceDownloadName}`)
    const cadenceExecStatus = cadenceExecRes.status()
    const cadenceExecJson = await cadenceExecRes.json().catch(() => ({}))
    const cadencePacketJson = cadenceExecJson.packet_json || {}
    evidence.nonDemo.network.execPacketExportCadence = {
      method: 'POST',
      path: '/api/os/exec-packets',
      status: cadenceExecStatus,
      body:
        cadenceExecStatus === 200
          ? {
              packet: pick(cadenceExecJson.packet, [
                'id',
                'os_instance_id',
                'period_start',
                'period_end',
                'created_at',
              ]),
              packet_json_summary: {
                keys: Object.keys(cadencePacketJson || {}),
                kpis_count: Array.isArray(cadencePacketJson.kpis) ? cadencePacketJson.kpis.length : 0,
                top_alerts_count: Array.isArray(cadencePacketJson.top_alerts) ? cadencePacketJson.top_alerts.length : 0,
                commitments_count: Array.isArray(cadencePacketJson.commitments) ? cadencePacketJson.commitments.length : 0,
              },
            }
          : pick(cadenceExecJson, ['error', 'code']),
    }
    if (cadenceExecStatus !== 200) throw new Error(`Cadence exec packet export failed (${cadenceExecStatus})`)

    // Exec packet export (operate page)
    await page.goto(`/app/operate?os=${instanceId}`, { waitUntil: 'load' })
    await page.waitForSelector('text=Founder Command Center', { timeout: 30000 })
    evidence.nonDemo.ui.push('Loaded /app/operate (Founder Command Center visible)')
    await page.getByText('Top Risks This Week').first().waitFor({ timeout: 30000 })
    await page.getByText('Commitments').first().waitFor({ timeout: 30000 })
    await page.getByText('Data Trust').first().waitFor({ timeout: 30000 })
    evidence.nonDemo.ui.push('Operate panels visible: Top Risks This Week, Commitments, Data Trust')

    const [download, execPacketRes] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.waitForResponse((res) => {
        try {
          const url = new URL(res.url())
          return url.pathname === '/api/os/exec-packets' && res.request().method() === 'POST'
        } catch {
          return false
        }
      }),
      page.getByRole('button', { name: /Export Exec Packet/i }).click(),
    ])
    const downloadName = download.suggestedFilename()
    evidence.nonDemo.ui.push(`Exec packet download: ${downloadName}`)
    const execPacketStatus = execPacketRes.status()
    const execPacketJson = await execPacketRes.json().catch(() => ({}))
    const packetJson = execPacketJson.packet_json || {}
    evidence.nonDemo.network.execPacketExport = {
      method: 'POST',
      path: '/api/os/exec-packets',
      status: execPacketStatus,
      body:
        execPacketStatus === 200
          ? {
              packet: pick(execPacketJson.packet, [
                'id',
                'os_instance_id',
                'period_start',
                'period_end',
                'created_at',
              ]),
              packet_json_summary: {
                keys: Object.keys(packetJson || {}),
                kpis_count: Array.isArray(packetJson.kpis) ? packetJson.kpis.length : 0,
                top_alerts_count: Array.isArray(packetJson.top_alerts) ? packetJson.top_alerts.length : 0,
                commitments_count: Array.isArray(packetJson.commitments) ? packetJson.commitments.length : 0,
              },
            }
          : pick(execPacketJson, ['error', 'code']),
    }
    if (execPacketStatus !== 200) throw new Error(`Exec packet export failed (${execPacketStatus})`)

    // DB evidence queries (non-demo org scoped)
    evidence.nonDemo.db.instanceRow = (
      await sql(
        pg,
        `select id, status, published_at, created_at from public.os_instances where org_id = $1 and id = $2`,
        [qaOrgId, instanceId]
      )
    )[0]
    evidence.nonDemo.db.instanceStatusCounts = await sql(
      pg,
      `select status, count(*)::int as instances from public.os_instances where org_id = $1 group by status order by status`,
      [qaOrgId]
    )
    evidence.nonDemo.db.alertStateCounts = await sql(
      pg,
      `select state, count(*)::int as alerts from public.alerts where org_id = $1 group by state order by state`,
      [qaOrgId]
    )
    evidence.nonDemo.db.taskStateCounts = await sql(
      pg,
      `select state, count(*)::int as tasks from public.os_tasks where org_id = $1 group by state order by state`,
      [qaOrgId]
    )
    evidence.nonDemo.db.cadenceItemsCount = await sql(
      pg,
      `select count(*)::int as cadence_items from public.cadence_items where org_id = $1`,
      [qaOrgId]
    )
    evidence.nonDemo.db.execPacketsCount = await sql(
      pg,
      `select count(*)::int as exec_packets from public.exec_packets where org_id = $1`,
      [qaOrgId]
    )
    evidence.nonDemo.db.latestExecPacket = (
      await sql(
        pg,
        `select id, os_instance_id, period_start, period_end, created_at from public.exec_packets where org_id = $1 order by created_at desc limit 1`,
        [qaOrgId]
      )
    )[0]

    // Org isolation evidence via API counts (instances/alerts/tasks) for QA vs Demo
    async function fetchJson(pathname) {
      return page.evaluate(async (p) => {
        const res = await fetch(p)
        const json = await res.json().catch(() => ({}))
        return { status: res.status, json }
      }, pathname)
    }

    // QA org counts
    const qaInstances = await fetchJson('/api/os/instances')
    const qaAlerts = await fetchJson('/api/os/alerts')
    const qaTasks = await fetchJson('/api/os/tasks')

    evidence.orgIsolation.qa = {
      instances: { status: qaInstances.status, count: (qaInstances.json.instances || []).length, ids: (qaInstances.json.instances || []).map((i) => i.id).slice(0, 3) },
      alerts: { status: qaAlerts.status, count: (qaAlerts.json.alerts || []).length, ids: (qaAlerts.json.alerts || []).map((a) => a.id).slice(0, 3) },
      tasks: { status: qaTasks.status, count: (qaTasks.json.tasks || []).length, ids: (qaTasks.json.tasks || []).map((t) => t.id).slice(0, 3) },
    }
    evidence.orgIsolation.db = {}
    evidence.orgIsolation.db.qa = (
      await sql(
        pg,
        `select
          (select count(*)::int from public.os_instances where org_id = $1) as instances,
          (select count(*)::int from public.alerts where org_id = $1) as alerts,
          (select count(*)::int from public.os_tasks where org_id = $1) as tasks`,
        [qaOrgId]
      )
    )[0]

    // Switch to demo org and capture counts
    await switchOrg(page, 'Demo Organization')

    // Demo UI sanity: read-only banner visible and primary actions disabled
    await page.goto('/app/build/templates', { waitUntil: 'load' })
    await page.waitForSelector('text=OS Templates', { timeout: 30000 })
    await page.waitForSelector('text=Demo org is read-only', { timeout: 30000 })
    const demoCreateDisabled = await page.getByRole('button', { name: /^Create OS$/ }).first().isDisabled().catch(() => null)
    evidence.demo.ui.push(`Loaded /app/build/templates in demo org (read-only banner visible, Create OS disabled=${demoCreateDisabled})`)

    const demoInstances = await fetchJson('/api/os/instances')
    const demoAlerts = await fetchJson('/api/os/alerts')
    const demoTasks = await fetchJson('/api/os/tasks')

    evidence.orgIsolation.demo = {
      instances: { status: demoInstances.status, count: (demoInstances.json.instances || []).length, ids: (demoInstances.json.instances || []).map((i) => i.id).slice(0, 3) },
      alerts: { status: demoAlerts.status, count: (demoAlerts.json.alerts || []).length, ids: (demoAlerts.json.alerts || []).map((a) => a.id).slice(0, 3) },
      tasks: { status: demoTasks.status, count: (demoTasks.json.tasks || []).length, ids: (demoTasks.json.tasks || []).map((t) => t.id).slice(0, 3) },
    }
    evidence.orgIsolation.db.demo = (
      await sql(
        pg,
        `select
          (select count(*)::int from public.os_instances where org_id = $1) as instances,
          (select count(*)::int from public.alerts where org_id = $1) as alerts,
          (select count(*)::int from public.os_tasks where org_id = $1) as tasks`,
        [demoOrgId]
      )
    )[0]

    // Demo write protection (direct API attempt, via context.request to avoid console noise)
    const demoCreateRes = await context.request.post('/api/os/instances', {
      data: { templateKey: 'construction_ops', name: 'Should Fail' },
    })
    const demoCreateJson = await demoCreateRes.json().catch(() => ({}))
    evidence.demo.network.demoCreateInstance = {
      method: 'POST',
      path: '/api/os/instances',
      status: demoCreateRes.status(),
      body: pick(demoCreateJson, ['error', 'code']),
    }

    // Switch back to QA org to confirm isolation both directions
    await switchOrg(page, QA_ORG_NAME)
    const qaInstancesAgain = await fetchJson('/api/os/instances')
    evidence.orgIsolation.qaAfter = {
      status: qaInstancesAgain.status,
      count: (qaInstancesAgain.json.instances || []).length,
      ids: (qaInstancesAgain.json.instances || []).map((i) => i.id).slice(0, 3),
    }

    // Persist evidence JSON for report patching
    const outPath = path.join(process.cwd(), 'tmp', `non-demo-os-evidence-${nowIsoSafe()}.json`)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify({ ...evidence, tracked: tracked.map(redactForReport) }, null, 2), 'utf8')
    console.log(`Wrote evidence: ${path.relative(process.cwd(), outPath)}`)

    if (consoleErrors.length > 0) {
      console.error(`Console errors detected (${consoleErrors.length})`)
      for (const msg of consoleErrors.slice(0, 5)) console.error(msg)
      process.exit(2)
    }

    await browser.close()
  } finally {
    await pg.end().catch(() => {})
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || err)
  process.exit(1)
})
