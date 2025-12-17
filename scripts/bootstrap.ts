#!/usr/bin/env tsx
/**
 * Bootstrap script: preflight → migrate → seed → start
 * Idempotent: can be run multiple times safely
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const isProd = process.argv.includes('--prod') || process.argv.includes('--production')

function runCommand(cmd: string, description: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📦 ${description}`)
  console.log(`${'='.repeat(60)}`)
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() })
    console.log(`✅ ${description} completed`)
  } catch (error: any) {
    console.error(`❌ ${description} failed`)
    if (error.stdout) console.error(error.stdout.toString())
    if (error.stderr) console.error(error.stderr.toString())
    process.exit(1)
  }
}

function checkEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found')
    console.error('   Please create .env.local with required Supabase credentials')
    process.exit(1)
  }
  console.log('✅ .env.local exists')
}

async function main() {
  console.log('\n🚀 CompassIQ Bootstrap')
  console.log('='.repeat(60))
  
  // Check prerequisites
  checkEnvFile()
  
  // Step 1: Preflight check
  runCommand(
    'npm run preflight:supabase',
    'Preflight check (validating Supabase credentials)'
  )
  
  // Step 2: Apply migrations
  runCommand(
    'npm run migrate:supabase',
    'Applying database migrations'
  )
  
  // Step 3: Seed demo data (idempotent)
  console.log(`\n${'='.repeat(60)}`)
  console.log('📦 Seeding demo data (idempotent)')
  console.log(`${'='.repeat(60)}`)
  try {
    // Seed script handles idempotency internally
    execSync('npm run seed', { stdio: 'inherit', cwd: process.cwd() })
    console.log('✅ Seeding completed')
  } catch (error: any) {
    // Seed errors are non-fatal if demo org already exists
    if (error.stdout?.toString().includes('already exists') || 
        error.stdout?.toString().includes('exists')) {
      console.log('ℹ️  Demo org already exists, skipping seed')
    } else {
      console.error('⚠️  Seeding had issues (may be non-fatal if demo org exists)')
      if (error.stdout) console.error(error.stdout.toString())
    }
  }
  
  // Step 4: Start server
  if (isProd) {
    runCommand(
      'npm run build',
      'Building production bundle'
    )
    console.log(`\n${'='.repeat(60)}`)
    console.log('🚀 Starting production server on PORT=3005')
    console.log(`${'='.repeat(60)}`)
    console.log('   Visit: http://localhost:3005')
    console.log('   Press Ctrl+C to stop\n')
    execSync('PORT=3005 npm start', { stdio: 'inherit', cwd: process.cwd() })
  } else {
    console.log(`\n${'='.repeat(60)}`)
    console.log('🚀 Starting development server on PORT=3005')
    console.log(`${'='.repeat(60)}`)
    console.log('   Visit: http://localhost:3005')
    console.log('   Press Ctrl+C to stop\n')
    execSync('npm run dev', { stdio: 'inherit', cwd: process.cwd() })
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})


