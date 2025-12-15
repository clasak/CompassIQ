import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const requiredTables = [
  'organizations',
  'memberships',
  'org_invites',
  'org_settings',
  'metric_catalog',
  'org_branding',
  'source_connections',
  'source_runs',
  'raw_events',
  'field_mappings',
  'metric_values',
]

const requiredFunctions = [
  'create_organization_with_owner',
  'create_invite',
  'accept_invite',
  'update_member_role',
  'get_public_branding',
]

const connectionString = process.env.SUPABASE_DB_URL

function getSqlContext(sql: string, positionValue?: string | number, radius = 80) {
  const position = typeof positionValue === 'string' ? parseInt(positionValue, 10) : positionValue
  if (!position || Number.isNaN(position)) return null
  const start = Math.max(0, position - radius)
  const end = Math.min(sql.length, position + radius)
  const snippet = sql.slice(start, end).replace(/\s+/g, ' ').trim()
  return snippet.length ? snippet : null
}

async function ensureSchemaMigrations(client: Client) {
  await client.query(`
    create table if not exists public.schema_migrations (
      id bigserial primary key,
      filename text not null unique,
      applied_at timestamptz not null default now()
    )
  `)
}

async function getAppliedMigrations(client: Client) {
  const { rows } = await client.query<{ filename: string }>(
    `select filename from public.schema_migrations order by filename asc`,
  )
  return new Set(rows.map((r) => r.filename))
}

async function tableExists(client: Client, table: string) {
  const { rows } = await client.query<{ exists: boolean }>(
    `select to_regclass($1) is not null as exists`,
    [`public.${table}`],
  )
  return Boolean(rows[0]?.exists)
}

async function bootstrapExistingMigrations(client: Client, migrationFiles: string[]) {
  const applied = await getAppliedMigrations(client)
  if (applied.size) return

  const hasOrganizations = await tableExists(client, 'organizations')
  const hasMemberships = await tableExists(client, 'memberships')
  const hasMetricCatalog = await tableExists(client, 'metric_catalog')
  const hasOrgSettings = await tableExists(client, 'org_settings')

  // If core schema exists, assume initial consolidated migrations were applied before
  // we tracked them in schema_migrations, and mark them as applied.
  if (!(hasOrganizations && hasMemberships && hasMetricCatalog && hasOrgSettings)) return

  const baseline = new Set([
    '001_init.sql',
    '002_rls.sql',
    '003_seed_metric_catalog.sql',
    '004_invites_and_org_admin.sql',
    '005_org_settings_and_roi.sql',
  ])

  const toInsert = migrationFiles.filter((f) => baseline.has(f))
  if (!toInsert.length) return

  await client.query(
    `
      insert into public.schema_migrations (filename)
      select unnest($1::text[])
      on conflict (filename) do nothing
    `,
    [toInsert],
  )
}

async function applyMigrationFile(client: Client, filePath: string) {
  const filename = path.basename(filePath)
  const sql = fs.readFileSync(filePath, 'utf8')
  await client.query('begin')
  try {
    await client.query(sql)
    await client.query(`insert into public.schema_migrations (filename) values ($1)`, [filename])
    await client.query('commit')
  } catch (err) {
    await client.query('rollback')
    throw { err, sql, filename }
  }
}

async function verifyTables(client: Client) {
  const { rows } = await client.query<{ table_name: string }>(
    `
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name = any($1::text[])
    `,
    [requiredTables],
  )
  const existing = new Set(rows.map((row) => row.table_name))
  return requiredTables.filter((table) => !existing.has(table))
}

async function verifyFunctions(client: Client) {
  const { rows } = await client.query<{ name: string }>(
    `
      select p.proname as name
      from pg_proc p
      join pg_namespace n on p.pronamespace = n.oid
      where n.nspname = 'public'
        and p.proname = any($1::text[])
    `,
    [requiredFunctions],
  )
  const existing = new Set(rows.map((row) => row.name))
  return requiredFunctions.filter((fn) => !existing.has(fn))
}

async function main() {
  if (!connectionString) {
    console.error('❌ Missing SUPABASE_DB_URL in .env.local')
    process.exit(1)
  }

  console.log('SUPABASE_DB_URL present: yes')
  try {
    const { hostname } = new URL(connectionString)
    console.log(`Supabase host: ${hostname}`)
  } catch {
    console.log('Supabase host: unknown (invalid URL format)')
  }

  const client = new Client({
    connectionString: connectionString.replace(/\?.*$/, ''),
    ssl: { 
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ Connected')

    await ensureSchemaMigrations(client)

    const migrationsDir = path.join(process.cwd(), 'db', 'migrations')
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => /^\d+_.*\.sql$/.test(f))
      .sort()

    await bootstrapExistingMigrations(client, migrationFiles)

    const applied = await getAppliedMigrations(client)
    const pending = migrationFiles.filter((f) => !applied.has(f))

    if (!pending.length) {
      console.log('📝 No pending migrations')
    } else {
      console.log(`📝 Applying ${pending.length} pending migration(s)...`)
      for (const filename of pending) {
        console.log(`- Applying ${filename}...`)
        await applyMigrationFile(client, path.join(migrationsDir, filename))
      }
      console.log('✅ Migrations applied successfully')
    }

    console.log('🔍 Verifying tables...')
    const missingTables = await verifyTables(client)
    if (missingTables.length) {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`)
      process.exit(1)
    }

    console.log('🔍 Verifying functions...')
    const missingFunctions = await verifyFunctions(client)
    if (missingFunctions.length) {
      console.error(`❌ Missing functions: ${missingFunctions.join(', ')}`)
      process.exit(1)
    }

    console.log('✅ Verification complete — required tables and functions are present')
  } catch (wrapped: any) {
    console.error('❌ Migration failed')
    if (wrapped?.filename) console.error(`While applying: ${wrapped.filename}`)
    const err = wrapped?.err || wrapped
    if (err?.message) console.error(err.message)
    const sql = wrapped?.sql
    const context = sql ? getSqlContext(sql, err?.position) : null
    if (context) console.error(`Context near failure: ${context}`)
    process.exit(1)
  } finally {
    await client.end().catch(() => {
      // ignore disconnect errors
    })
  }
}

main()
