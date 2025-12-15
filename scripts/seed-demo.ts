import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local BEFORE any other imports
const envPath = join(process.cwd(), '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')
        process.env[key.trim()] = cleanValue
      }
    }
  })
} catch (err: any) {
  console.warn('Warning: Could not load .env.local file:', err.message)
}

// Now import after env vars are loaded
import { createServiceRoleClient } from '../lib/supabase/service-role'

const supabase = createServiceRoleClient()

const DEMO_ORG_SLUG = 'demo'
const DEMO_ADMIN_EMAIL = 'demo.admin@example.com'
const DEMO_ADMIN_PASSWORD = 'demo-admin-123'
const DEMO_VIEWER_EMAIL = 'demo.viewer@example.com'
const DEMO_VIEWER_PASSWORD = 'demo-viewer-123'

// Sample data generators
const companyNames = [
  'Acme Corp', 'TechStart Inc', 'Global Solutions', 'Digital Dynamics', 'Cloud Ventures',
  'Innovation Labs', 'Future Systems', 'Smart Solutions', 'NextGen Tech', 'Prime Industries',
  'Elite Services', 'Apex Corporation', 'Summit Enterprises', 'Pinnacle Group', 'Vertex Systems',
  'Nexus Technologies', 'Catalyst Corp', 'Momentum Inc', 'Velocity Solutions', 'Quantum Industries',
  'Stellar Services', 'Nova Systems', 'Aurora Corp', 'Zenith Group', 'Eclipse Technologies',
  'Phoenix Industries', 'Titan Corp', 'Atlas Systems', 'Orion Group', 'Mercury Solutions',
]

const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Amy']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore']
const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Real Estate']
const segments = ['Enterprise', 'Mid-Market', 'SMB', 'Startup']
const sources = ['Website', 'Referral', 'Partner', 'Trade Show', 'Cold Call', 'Social Media']
const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const activityTypes = ['CALL', 'EMAIL', 'MEETING', 'SITE_VISIT', 'NOTE']
const paymentMethods = ['ACH', 'CARD', 'CHECK', 'WIRE']

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomDateString(start: Date, end: Date): string {
  return randomDate(start, end).toISOString().split('T')[0]
}

async function seedDemo() {
  console.log('Starting demo seed...')

  // 1. Create or get demo org
  let { data: demoOrg, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', DEMO_ORG_SLUG)
    .single()

  if (orgError || !demoOrg) {
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: 'Demo Organization',
        slug: DEMO_ORG_SLUG,
        is_demo: true,
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating demo org:', createError)
      return
    }
    demoOrg = newOrg
  }

  const orgId = demoOrg.id
  console.log('Demo org ID:', orgId)

  // 1b. Ensure baseline branding exists (demo is read-only for app users)
  await supabase.from('org_branding').upsert(
    {
      org_id: orgId,
      brand_name: 'CompassIQ',
      tagline: 'Business Operating System Dashboard',
      primary_color: '#0A192F',
      accent_color: '#007BFF',
    },
    { onConflict: 'org_id' },
  )

  // 2. Create demo users
  let adminUser
  let viewerUser

  // Admin user
  const { data: existingAdmin } = await supabase.auth.admin.listUsers()
  const adminExists = existingAdmin?.users.find((u) => u.email === DEMO_ADMIN_EMAIL)

  if (!adminExists) {
    const { data: newAdmin, error: adminError } = await supabase.auth.admin.createUser({
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (adminError) {
      console.error('Error creating admin user:', adminError)
    } else {
      adminUser = newAdmin.user
      console.log('Created admin user:', adminUser.id)
    }
  } else {
    adminUser = adminExists
    console.log('Admin user exists:', adminUser.id)
    // Keep seed idempotent and ensure local dev login works.
    // Do not log the password.
    const { error: resetError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: DEMO_ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (resetError) {
      console.warn('Warning: Could not reset demo admin password:', resetError.message || resetError)
    }
  }

  // Viewer user
  const viewerExists = existingAdmin?.users.find((u) => u.email === DEMO_VIEWER_EMAIL)

  if (!viewerExists) {
    const { data: newViewer, error: viewerError } = await supabase.auth.admin.createUser({
      email: DEMO_VIEWER_EMAIL,
      password: DEMO_VIEWER_PASSWORD,
      email_confirm: true,
    })
    if (viewerError) {
      console.error('Error creating viewer user:', viewerError)
    } else {
      viewerUser = newViewer.user
      console.log('Created viewer user:', viewerUser.id)
    }
  } else {
    viewerUser = viewerExists
    console.log('Viewer user exists:', viewerUser.id)
    // Keep seed idempotent and ensure local dev login works.
    // Do not log the password.
    const { error: resetError } = await supabase.auth.admin.updateUserById(viewerUser.id, {
      password: DEMO_VIEWER_PASSWORD,
      email_confirm: true,
    })
    if (resetError) {
      console.warn('Warning: Could not reset demo viewer password:', resetError.message || resetError)
    }
  }

  // 3. Create memberships
  if (adminUser) {
    await supabase.from('memberships').upsert({
      org_id: orgId,
      user_id: adminUser.id,
      role: 'ADMIN',
    })
  }

  if (viewerUser) {
    await supabase.from('memberships').upsert({
      org_id: orgId,
      user_id: viewerUser.id,
      role: 'VIEWER',
    })
  }

  // 4. Create accounts (30)
  const accountIds: string[] = []
  for (let i = 0; i < 30; i++) {
    const renewalDate = randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        org_id: orgId,
        name: companyNames[i] || `Company ${i + 1}`,
        segment: randomElement(segments),
        industry: randomElement(industries),
        status: 'ACTIVE',
        renewal_date: renewalDate.toISOString().split('T')[0],
        health_override: randomInt(30, 100),
      })
      .select('id')
      .single()

    if (!error && account) {
      accountIds.push(account.id)
    }
  }
  console.log(`Created ${accountIds.length} accounts`)

  // 5. Create contacts (50)
  for (let i = 0; i < 50; i++) {
    await supabase.from('contacts').insert({
      org_id: orgId,
      account_id: randomElement(accountIds),
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      email: `contact${i}@example.com`,
      phone: `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      title: randomElement(['CEO', 'CTO', 'CFO', 'VP Sales', 'Director', 'Manager']),
    })
  }
  console.log('Created 50 contacts')

  // 6. Create opportunities (80)
  const opportunityIds: string[] = []
  const now = new Date()
  const past90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const future90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  for (let i = 0; i < 80; i++) {
    const stage = randomElement(stages)
    const closeDate = stage === 'WON' || stage === 'LOST'
      ? randomDateString(past90Days, now)
      : randomDateString(now, future90Days)

    const { data: opp, error } = await supabase
      .from('opportunities')
      .insert({
        org_id: orgId,
        account_id: randomElement(accountIds),
        name: `Opportunity ${i + 1}`,
        stage,
        amount: randomInt(5000, 500000),
        close_date: closeDate,
        source: randomElement(sources),
      })
      .select('id')
      .single()

    if (!error && opp) {
      opportunityIds.push(opp.id)
    }
  }
  console.log(`Created ${opportunityIds.length} opportunities`)

  // 7. Create activities (150)
  const activityStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  for (let i = 0; i < 150; i++) {
    await supabase.from('activities').insert({
      org_id: orgId,
      account_id: Math.random() > 0.1 ? randomElement(accountIds) : null,
      opportunity_id: Math.random() > 0.3 ? randomElement(opportunityIds) : null,
      type: randomElement(activityTypes),
      occurred_at: randomDate(activityStart, now).toISOString(),
      notes: `Activity note ${i + 1}`,
    })
  }
  console.log('Created 150 activities')

  // 8. Create work orders (60)
  const workOrderIds: string[] = []
  for (let i = 0; i < 60; i++) {
    const status = randomElement(['PLANNED', 'IN_PROGRESS', 'BLOCKED', 'DONE'])
    const dueDate = randomDateString(now, new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000))
    const completedAt = status === 'DONE' ? randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now).toISOString() : null

    const { data: wo, error } = await supabase
      .from('work_orders')
      .insert({
        org_id: orgId,
        account_id: randomElement(accountIds),
        title: `Work Order ${i + 1}`,
        status,
        priority: randomElement(priorities),
        due_date: dueDate,
        blocker_reason: status === 'BLOCKED' ? 'Waiting on customer' : null,
        completed_at: completedAt,
      })
      .select('id')
      .single()

    if (!error && wo) {
      workOrderIds.push(wo.id)
    }
  }
  console.log(`Created ${workOrderIds.length} work orders`)

  // 9. Create tasks (120)
  const userIds = adminUser ? [adminUser.id] : []
  for (let i = 0; i < 120; i++) {
    const status = randomElement(['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
    const dueDate = randomDateString(now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
    const relatedType = Math.random() > 0.5 ? randomElement(['account', 'opportunity', 'work_order', 'invoice', 'ticket']) : null
    const relatedId = relatedType === 'account' ? randomElement(accountIds)
      : relatedType === 'opportunity' ? randomElement(opportunityIds)
      : relatedType === 'work_order' ? randomElement(workOrderIds)
      : null

    await supabase.from('tasks').insert({
      org_id: orgId,
      title: `Task ${i + 1}`,
      status,
      priority: randomElement(priorities),
      due_date: dueDate,
      assigned_user_id: userIds.length > 0 && Math.random() > 0.3 ? randomElement(userIds) : null,
      related_type: relatedType,
      related_id: relatedId,
    })
  }
  console.log('Created 120 tasks')

  // 10. Create invoices (40)
  const invoiceIds: string[] = []
  for (let i = 0; i < 40; i++) {
    const issueDate = randomDateString(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), now)
    const dueDate = randomDateString(new Date(issueDate), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
    const subtotal = randomInt(1000, 50000)
    const tax = Math.round(subtotal * 0.08)
    const total = subtotal + tax
    const status = randomElement(['DRAFT', 'SENT', 'OVERDUE', 'PAID'])

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        org_id: orgId,
        account_id: randomElement(accountIds),
        invoice_number: `INV-${String(i + 1).padStart(5, '0')}`,
        issue_date: issueDate,
        due_date: dueDate,
        subtotal,
        tax,
        total,
        status,
      })
      .select('id')
      .single()

    if (!error && invoice) {
      invoiceIds.push(invoice.id)

      // Create payments for PAID invoices
      if (status === 'PAID') {
        const paidAmount = total
        await supabase.from('payments').insert({
          org_id: orgId,
          invoice_id: invoice.id,
          amount: paidAmount,
          paid_at: randomDate(new Date(issueDate), now).toISOString(),
          method: randomElement(paymentMethods),
          reference: `PAY-${i + 1}`,
        })
      } else if (status === 'SENT' || status === 'OVERDUE') {
        // Partial payments for some
        if (Math.random() > 0.5) {
          const partialAmount = Math.round(total * randomInt(20, 80) / 100)
          await supabase.from('payments').insert({
            org_id: orgId,
            invoice_id: invoice.id,
            amount: partialAmount,
            paid_at: randomDate(new Date(issueDate), now).toISOString(),
            method: randomElement(paymentMethods),
            reference: `PAY-${i + 1}-PARTIAL`,
          })
        }
      }
    }
  }
  console.log(`Created ${invoiceIds.length} invoices with payments`)

  // 11. Create tickets (45)
  for (let i = 0; i < 45; i++) {
    const openedAt = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now)
    const status = randomElement(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    const firstResponseAt = status !== 'OPEN' ? randomDate(openedAt, new Date(openedAt.getTime() + 2 * 24 * 60 * 60 * 1000)).toISOString() : null
    const resolvedAt = status === 'RESOLVED' || status === 'CLOSED' ? randomDate(new Date(openedAt.getTime() + 1 * 24 * 60 * 60 * 1000), now).toISOString() : null

    await supabase.from('tickets').insert({
      org_id: orgId,
      account_id: randomElement(accountIds),
      title: `Ticket ${i + 1}`,
      status,
      priority: randomElement(priorities),
      opened_at: openedAt.toISOString(),
      first_response_at: firstResponseAt,
      resolved_at: resolvedAt,
    })
  }
  console.log('Created 45 tickets')

  // 12. Create data sources
  const dataSources = [
    { name: 'CRM Sync', cadence: '24', last_sync_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), status: 'ACTIVE' },
    { name: 'ERP Integration', cadence: '12', last_sync_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), status: 'ACTIVE' },
    { name: 'Support System', cadence: '6', last_sync_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), status: 'ACTIVE' },
    { name: 'Billing System', cadence: '24', last_sync_at: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(), status: 'STALE' },
  ]

  for (const ds of dataSources) {
    await supabase.from('data_sources').upsert({
      org_id: orgId,
      name: ds.name,
      cadence: ds.cadence,
      last_sync_at: ds.last_sync_at,
      status: ds.status,
    })
  }
  console.log('Created data sources')

  // 13. Create metric catalog entries
  const metrics = [
    { key: 'revenue_mtd', name: 'Revenue MTD', description: 'Monthly revenue to date', formula: 'SUM(invoices.total WHERE status IN (SENT, PAID, OVERDUE))', source: 'Invoices', cadence: 'Daily' },
    { key: 'pipeline_30d', name: 'Pipeline 30 Days', description: 'Opportunities closing in next 30 days', formula: 'SUM(opportunities.amount WHERE close_date <= 30 days)', source: 'Opportunities', cadence: 'Daily' },
    { key: 'ar_outstanding', name: 'AR Outstanding', description: 'Total accounts receivable', formula: 'SUM(invoices.total - payments.amount)', source: 'Invoices/Payments', cadence: 'Daily' },
    { key: 'on_time_delivery', name: 'On-Time Delivery %', description: 'Percentage of work orders completed on time', formula: 'COUNT(work_orders WHERE completed_at <= due_date) / COUNT(work_orders WHERE status = DONE)', source: 'Work Orders', cadence: 'Daily' },
  ]

  for (const metric of metrics) {
    await supabase.from('metric_catalog').upsert({
      org_id: orgId,
      key: metric.key,
      name: metric.name,
      description: metric.description,
      formula: metric.formula,
      source: metric.source,
      cadence: metric.cadence,
    })
  }
  console.log('Created metric catalog entries')

  console.log('\n✅ Demo seed completed successfully!')
  console.log(`\nDemo users:`)
  console.log(`Admin email: ${DEMO_ADMIN_EMAIL}`)
  console.log(`Viewer email: ${DEMO_VIEWER_EMAIL}`)
  console.log('Passwords were set/reset by the seed (not printed).')
}

seedDemo().catch(console.error)
