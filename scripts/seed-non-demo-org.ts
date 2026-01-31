import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local BEFORE any other imports
const envPath = join(process.cwd(), '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        const cleanValue = value.replace(/^["']|["']$/g, '')
        process.env[key.trim()] = cleanValue
      }
    }
  })
} catch (err: any) {
  console.warn('Warning: Could not load .env.local file:', err.message)
}

import { createServiceRoleClient } from '../lib/supabase/service-role'

const supabase = createServiceRoleClient()

const ORG_NAME = 'QA Non-Demo Org'
const ORG_SLUG = 'qa-non-demo-org'

async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error
  const match = (data.users || []).find((u) => (u.email || '').toLowerCase() === email.toLowerCase())
  return match?.id || null
}

export async function seedNonDemoOrg() {
  const email =
    process.env.QA_USER_EMAIL ||
    process.env.PLAYWRIGHT_TEST_EMAIL ||
    process.env.PERF_TEST_EMAIL ||
    'demo.admin@example.com'

  console.log(`QA_USER_EMAIL present: ${email ? 'yes' : 'no'}`)

  const userId = await findUserIdByEmail(email)
  if (!userId) {
    console.error(`User not found for email: ${email}`)
    process.exit(1)
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .upsert(
      {
        name: ORG_NAME,
        slug: ORG_SLUG,
        is_demo: false,
      },
      { onConflict: 'slug' }
    )
    .select('id, name, slug, is_demo')
    .single()

  if (orgError || !org) {
    console.error('Failed to upsert org')
    console.error(orgError)
    process.exit(1)
  }

  const orgId = org.id

  // Ensure membership (OWNER)
  const { data: existingMembership, error: membershipCheckError } = await supabase
    .from('memberships')
    .select('org_id, user_id, role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle()

  if (membershipCheckError) {
    console.error('Failed to check membership')
    console.error(membershipCheckError)
    process.exit(1)
  }

  if (existingMembership) {
    if (existingMembership.role !== 'OWNER') {
      const { error: updateError } = await supabase
        .from('memberships')
        .update({ role: 'OWNER' })
        .eq('org_id', orgId)
        .eq('user_id', userId)
      if (updateError) {
        console.error('Failed to update membership role')
        console.error(updateError)
        process.exit(1)
      }
    }
  } else {
    const { error: insertError } = await supabase
      .from('memberships')
      .insert({ org_id: orgId, user_id: userId, role: 'OWNER' })
    if (insertError) {
      console.error('Failed to create membership')
      console.error(insertError)
      process.exit(1)
    }
  }

  console.log(`QA org ready: ${org.name} (${org.slug})`)
  console.log(`org_id: ${orgId}`)
  console.log('membership: ensured (OWNER)')
}

seedNonDemoOrg().catch((err) => {
  console.error('seed-non-demo-org failed')
  console.error(err?.message || err)
  process.exit(1)
})

