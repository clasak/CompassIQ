# Supabase Setup Instructions

## ✅ Completed Steps

1. ✅ Environment variables configured in `.env.local`
2. ✅ Consolidated migrations file created at `db/migrations_consolidated.sql`

## ⚠️ Required Steps

### Step 1: Apply Migrations via Supabase SQL Editor

1. Navigate to: https://supabase.com/dashboard/project/kuctuimsdfhdmfizxxbj/sql/new
2. Open the file `db/migrations_consolidated.sql` in this project
3. Copy ALL contents from `db/migrations_consolidated.sql`
4. Paste into the Supabase SQL Editor
5. Click "Run" to execute all migrations (001-005)

The consolidated file includes:
- 001_init.sql - Creates all tables, enums, indexes, and triggers
- 002_rls.sql - Sets up Row Level Security policies
- 003_seed_metric_catalog.sql - Placeholder (handled by seed script)
- 004_invites_and_org_admin.sql - Invites table and admin functions
- 005_org_settings_and_roi.sql - Organization settings table

### Step 2: Verify API Keys

⚠️ **Note**: The API keys in `.env.local` appear to have duplicate content. Please verify:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` should be a single JWT token
- `SUPABASE_SERVICE_ROLE_KEY` should be a single JWT token

If the keys are incorrect, update `.env.local` with the correct values from your Supabase dashboard:
- Project Settings → API → anon/public key
- Project Settings → API → service_role key (secret)

### Step 3: Run Seed Script

After migrations are applied, run:
```bash
npm run seed
```

This will create:
- Demo organization
- Demo admin user (demo.admin@example.com / demo-admin-123)
- Demo viewer user (demo.viewer@example.com / demo-viewer-123)
- Sample data (accounts, contacts, opportunities, etc.)

### Step 4: Start Dev Server

```bash
npm run dev
```

### Step 5: Validate Routes and Run Tests

1. Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Navigate through all routes to ensure they work
3. Run Playwright tests:
   ```bash
   npm run test:e2e
   ```

## Troubleshooting

- **"Invalid API key" error**: Check that API keys in `.env.local` are correct and not duplicated
- **"relation does not exist" error**: Migrations haven't been applied yet - complete Step 1
- **Connection errors**: Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
