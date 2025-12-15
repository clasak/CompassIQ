import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

async function applyMigrations() {
  const dbUrl = process.env.SUPABASE_DB_URL

  if (!dbUrl) {
    console.error('❌ SUPABASE_DB_URL not set')
    console.log('\nTo apply migrations:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of db/migrations/001_init.sql')
    console.log('4. Run the query')
    process.exit(1)
  }

  const migrationsDir = join(process.cwd(), 'db', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  console.log('📦 Migration files found:')
  files.forEach((f) => console.log(`   - ${f}`))

  console.log('\n⚠️  Automatic migration via direct DB connection requires pg package.')
  console.log('   For now, please apply migrations manually via Supabase SQL Editor.\n')
  console.log('Instructions:')
  console.log('1. Go to your Supabase project: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Paste the contents of each migration file and run')
  console.log('\nMigration files location:')
  files.forEach((f) => {
    console.log(`   ${join(migrationsDir, f)}`)
  })
}

applyMigrations().catch(console.error)
