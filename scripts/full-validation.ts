#!/usr/bin/env tsx
/**
 * Full end-to-end validation script
 * Runs once Supabase credentials are detected
 */

import { createServiceRoleClient } from '../lib/supabase/service-role'
import { createClient } from '@supabase/supabase-js'

async function checkCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || url.length < 10) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing or empty')
    process.exit(1)
  }
  if (!anonKey || anonKey.length < 10) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty')
    process.exit(1)
  }
  if (!serviceKey || serviceKey.length < 10) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing or empty')
    process.exit(1)
  }

  console.log('✅ All credentials present')
  return { url, anonKey, serviceKey }
}

async function testConnection() {
  console.log('\n📡 Testing Supabase connection...')
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      throw error
    }
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (err: any) {
    console.error('❌ Connection error:', err.message)
    throw err
  }
}

async function checkMigrations() {
  console.log('\n📋 Checking database migrations...')
  const supabase = createServiceRoleClient()
  
  const checks = [
    { name: 'organizations table', query: () => supabase.from('organizations').select('id').limit(1) },
    { name: 'org_invites table', query: () => supabase.from('org_invites').select('id').limit(1) },
    { name: 'org_settings table', query: () => supabase.from('org_settings').select('id').limit(1) },
  ]

  for (const check of checks) {
    try {
      const { error } = await check.query()
      if (error) {
        console.error(`❌ ${check.name}: Missing or error - ${error.message}`)
        return false
      }
      console.log(`✅ ${check.name}: Exists`)
    } catch (err: any) {
      console.error(`❌ ${check.name}: ${err.message}`)
      return false
    }
  }

  // Check RPC functions by attempting to call them (they'll error with wrong params, but that means they exist)
  const rpcChecks = [
    'create_organization_with_owner',
    'create_invite',
    'accept_invite',
    'update_member_role',
  ]

  for (const rpc of rpcChecks) {
    try {
      // Call with invalid params - if function doesn't exist, we get a different error
      const { error } = await supabase.rpc(rpc as any, {})
      if (error && !error.message.includes('not enough') && !error.message.includes('missing') && !error.message.includes('invalid input')) {
        // Function might not exist
        console.warn(`⚠️  ${rpc}: May not exist (error: ${error.message})`)
      } else {
        console.log(`✅ ${rpc}: Exists`)
      }
    } catch (err: any) {
      console.warn(`⚠️  ${rpc}: Check manually - ${err.message}`)
    }
  }

  return true
}

async function checkDemoOrg() {
  console.log('\n🎭 Checking demo org...')
  const supabase = createServiceRoleClient()
  
  const { data: demoOrg, error } = await supabase
    .from('organizations')
    .select('id, slug, is_demo')
    .eq('slug', 'demo')
    .eq('is_demo', true)
    .single()

  if (error || !demoOrg) {
    console.log('⚠️  Demo org not found - will need to run seed script')
    return false
  }

  console.log(`✅ Demo org exists (id: ${demoOrg.id})`)
  return true
}

async function main() {
  console.log('🚀 Starting full validation...\n')
  
  try {
    await checkCredentials()
    await testConnection()
    await checkMigrations()
    const hasDemo = await checkDemoOrg()
    
    console.log('\n✅ Validation checks complete!')
    if (!hasDemo) {
      console.log('\n📝 Next steps:')
      console.log('   1. Run: npm run seed')
      console.log('   2. Continue with app validation')
    }
  } catch (err: any) {
    console.error('\n❌ Validation failed:', err.message)
    process.exit(1)
  }
}

main()




