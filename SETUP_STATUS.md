# Supabase Setup Status

## ✅ Completed Steps

1. **Fixed /app routing** - Created `app/app/` directory structure with all required routes:
   - `app/app/layout.tsx`
   - `app/app/page.tsx`
   - `app/app/demo/page.tsx`
   - `app/app/roi/page.tsx`
   - `app/app/settings/setup/page.tsx`
   - `app/app/settings/export/page.tsx`
   - `app/app/settings/import/page.tsx`
   - `app/app/internal/script/page.tsx`

2. **Updated .env.local** with API keys from Supabase dashboard

3. **Created consolidated migrations file** at `db/migrations_consolidated.sql` (1167 lines)

## ⚠️ Current Status

### API Keys
- Keys have been updated in `.env.local`
- Keys may need verification - testing with seed script shows "Invalid API key" error
- This could be because:
  - Migrations haven't been applied yet (tables don't exist)
  - Keys need to be verified/re-copied from dashboard
  - Supabase SDK may handle keys differently than expected

### Migrations
- **Status**: Ready to apply
- **Location**: `db/migrations_consolidated.sql`
- **Contains**: All 5 migrations (001-005) consolidated
- **Action Required**: Apply via Supabase SQL Editor

## 📋 Next Steps

### 1. Apply Migrations (Required)
1. Go to: https://supabase.com/dashboard/project/kuctuimsdfhdmfizxxbj/sql/new
2. Open `db/migrations_consolidated.sql` in your editor
3. Copy ALL contents (1167 lines)
4. Paste into Supabase SQL Editor
5. Click "Run" to execute

### 2. Verify Migrations Applied
After running migrations, verify these tables exist:
- `organizations`
- `memberships`
- `org_invites`
- `org_settings`
- `metric_catalog`

### 3. Run Seed Script
```bash
npm run seed
```

This will create:
- Demo organization (slug: `demo`)
- Demo admin user: `demo.admin@example.com` / `demo-admin-123`
- Demo viewer user: `demo.viewer@example.com` / `demo-viewer-123`
- Sample data (accounts, contacts, opportunities, etc.)

### 4. Start Dev Server
```bash
npm run dev
```

### 5. Test Routes
After migrations and seed are complete:
- http://localhost:3000/login
- http://localhost:3000/app
- http://localhost:3000/app/demo
- http://localhost:3000/app/roi

### 6. Run Playwright Tests
```bash
npm run test:e2e
```

## 🔍 Troubleshooting

**If seed script fails with "Invalid API key":**
1. Verify keys are correctly copied from Supabase Dashboard → Settings → API
2. Ensure no extra spaces or newlines in `.env.local`
3. Try regenerating keys in Supabase dashboard if needed

**If migrations fail:**
- Check for syntax errors in SQL output
- Ensure you're applying all migrations in order (consolidated file handles this)
- Verify you have proper database permissions



