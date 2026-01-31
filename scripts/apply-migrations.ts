import { readFileSync } from 'fs'
import { join } from 'path'
import { createServiceRoleClient } from '../lib/supabase/service-role'

const supabase = createServiceRoleClient()

async function applyMigration(sql: string, migrationName: string) {
  console.log(`\n📝 Applying ${migrationName}...`)
  
  // Supabase doesn't have a direct SQL execution endpoint via REST API
  // We need to use the Postgres connection. However, for this to work,
  // we would need to use a Postgres client library directly.
  
  // For now, this script will validate the connection and prepare the SQL
  // The actual migration needs to be applied via Supabase SQL Editor or
  // using a Postgres client library like 'pg'
  
  console.log(`✅ ${migrationName} SQL prepared`)
  return sql
}

async function applyAllMigrations() {
  console.log('🚀 Starting migration process...\n')
  
  const migrationsDir = join(process.cwd(), 'db', 'migrations')
  const migrations = [
    '001_init.sql',
    '002_rls.sql',
    '003_seed_metric_catalog.sql',
    '004_invites_and_org_admin.sql',
    '005_org_settings_and_roi.sql',
    '006_branding.sql',
    '007_ingestion.sql',
    '008_crm_core.sql',
    '009_preview_workspaces.sql',
    '010_os_generator.sql',
    '011_add_data_origin_metadata.sql',
    '012_construction_vertical.sql',
    '013_construction_data_model.sql',
    '014_construction_rls.sql'
  ]
  
  let allSQL = ''
  
  for (const migrationFile of migrations) {
    const filePath = join(migrationsDir, migrationFile)
    const sql = readFileSync(filePath, 'utf-8')
    await applyMigration(sql, migrationFile)
    allSQL += `\n-- ============================================================\n`
    allSQL += `-- ${migrationFile}\n`
    allSQL += `-- ============================================================\n\n`
    allSQL += sql + '\n\n'
  }
  
  // Write consolidated SQL to a file
  const outputPath = join(process.cwd(), 'db', 'migrations_consolidated.sql')
  const fs = require('fs')
  fs.writeFileSync(outputPath, allSQL)
  
  console.log(`\n✅ All migrations consolidated into: ${outputPath}`)
  console.log('\n⚠️  Note: Migrations must be applied via Supabase SQL Editor')
  console.log('   Copy the contents of migrations_consolidated.sql into the SQL Editor')
  console.log('   and execute it.\n')
  
  // Test connection
  console.log('🔍 Testing Supabase connection...')
  try {
    const { data, error } = await supabase.from('organizations').select('count').limit(1)
    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('✅ Connection successful (tables not yet created - migrations needed)')
    } else if (error) {
      console.log('⚠️  Connection test:', error.message)
    } else {
      console.log('✅ Connection successful')
    }
  } catch (err: any) {
    console.log('⚠️  Connection test error:', err.message)
  }
}

applyAllMigrations().catch(console.error)

