# OS Generator Verification Guide

## Prerequisites

1. **Migration Applied**: Ensure `db/migrations/010_os_generator.sql` has been run in Supabase SQL Editor
2. **Dev Server Running**: `npm run dev` (should be on port 3000 or 3005)
3. **Browser**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) after any code changes

---

## A) Database Verification

Run these queries in **Supabase SQL Editor** and capture outputs:

### 1. Tables Exist
```sql
select table_name
from information_schema.tables
where table_schema='public'
and table_name in ('os_templates','os_instances','alerts','os_tasks','cadence_items','exec_packets')
order by table_name;
```

**Expected**: 6 rows (one for each table)

### 2. RLS Enabled
```sql
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in ('os_templates','os_instances','alerts','os_tasks','cadence_items','exec_packets')
order by relname;
```

**Expected**: All tables should have `rls_enabled = true`

### 3. Templates Present
```sql
select key, name, version, created_at
from os_templates
order by key;
```

**Expected**: 3 rows (construction_ops, finance_ops, service_ops)

### 4. Demo Workspace Seeded
```sql
-- Instance status counts
select status, count(*) as instances
from os_instances
group by status;

-- Alert state counts
select state, count(*) as alerts
from alerts
group by state;

-- Task state counts
select state, count(*) as tasks
from os_tasks
group by state;
```

**Expected**: 
- At least 1 published instance
- At least 3 alerts (various states)
- At least 3 tasks (various states)

---

## B) Seed Scripts (Run These)

### 1. Seed Templates (Idempotent)
```bash
npx tsx scripts/seed-os-templates.ts
```

**Expected Output**:
```
✓ Seeded template: Construction Ops OS (construction_ops)
✓ Seeded template: Service Ops OS (service_ops)
✓ Seeded template: Finance OS (finance_ops)
✓ All OS templates seeded successfully
```

If templates already exist, you'll see:
```
Template construction_ops already exists (v1), skipping...
```

### 2. Seed Demo Workspace (Idempotent)
```bash
npx tsx scripts/seed-demo-os.ts
```

**Expected Output**:
```
Found demo org: <uuid>
Using template: Construction Ops OS
✓ Created OS instance: <uuid>
✓ Created/updated cadence items
✓ Created/updated sample alerts
✓ Created/updated sample tasks
✓ Demo OS workspace seeded successfully
```

---

## C) API Verification

### 1. Templates List (Should return 200 + 3 templates)
```bash
curl -sS -i http://localhost:3000/api/os/templates
```

**Expected**: HTTP 200, JSON with `templates` array containing 3 items

### 2. Demo Org Write Protection (Should return 403)

**Note**: You need to be authenticated as a demo org user. The API will check `context.isDemo`.

To test this properly:
1. Log in as demo org user (demo.admin@example.com / demo-admin-123)
2. Open browser DevTools → Network tab
3. Navigate to `/app/build/templates`
4. Click "Create OS" button
5. Check network request - should return 403 with `DEMO_READ_ONLY` code

Or use curl with proper auth (requires session cookie):
```bash
# This will fail without proper auth, but shows the endpoint structure
curl -sS -i -X POST http://localhost:3000/api/os/instances \
  -H "Content-Type: application/json" \
  -d '{"templateKey":"construction_ops"}'
```

**Expected**: HTTP 403 with `{"error":"Demo org is read-only","code":"DEMO_READ_ONLY"}`

---

## D) UI Page Verification

### 1. Templates Page
**URL**: `http://localhost:3000/app/build/templates`

**PASS Criteria**:
- ✅ Page loads (no blank screen)
- ✅ Shows 3 template cards (Construction, Service, Finance)
- ✅ Each card shows KPI count, alert count
- ✅ "Create OS" button visible
- ✅ Demo org: Button disabled with "Read-Only (Demo)" text

### 2. OS Instances Page
**URL**: `http://localhost:3000/app/build/instances`

**PASS Criteria**:
- ✅ Page loads (no blank screen)
- ✅ Shows list of instances (or empty state)
- ✅ Demo org: Shows published instance if seeded
- ✅ "Publish OS" button for draft instances
- ✅ "Open Operate Mode" button for published instances

### 3. Create Instance (Non-Demo Org Only)
**URL**: `http://localhost:3000/app/build/instances/create?template=construction_ops`

**PASS Criteria**:
- ✅ Page loads with template pre-selected
- ✅ Can enter optional name
- ✅ "Create OS Instance" button works
- ✅ Creates instance with status="draft"
- ✅ Redirects to instances list

### 4. Publish Instance (Non-Demo Org Only)
**Flow**: From instances page, click "Publish OS" on a draft instance

**PASS Criteria**:
- ✅ Instance status changes to "published"
- ✅ Alerts created (check `/app/execute/alerts`)
- ✅ Cadence items created (check database or meeting mode)

### 5. Alerts Page
**URL**: `http://localhost:3000/app/execute/alerts`

**PASS Criteria**:
- ✅ Page loads (no blank screen)
- ✅ Shows list of alerts with filters
- ✅ Can filter by state and severity
- ✅ Shows alert details (KPI key, owner, due date, state)
- ✅ Demo org: Buttons disabled
- ✅ Non-demo: Can assign owner, set due date, resolve

### 6. Tasks Page
**URL**: `http://localhost:3000/app/execute/tasks`

**PASS Criteria**:
- ✅ Page loads (no blank screen)
- ✅ Shows list of tasks
- ✅ Can create task (modal opens)
- ✅ Can mark task done with proof
- ✅ Proof JSON saved correctly

### 7. Meeting Mode (Cadence)
**URL**: `http://localhost:3000/app/cadence`

**PASS Criteria**:
- ✅ Page loads (no blank screen)
- ✅ Shows tabs: Daily / Weekly / Monthly
- ✅ Agenda populated from:
  - Open alerts (critical/high)
  - Overdue tasks
  - KPIs with negative trend (placeholder)
- ✅ "Export Exec Packet" button works

### 8. Founder Command Center (Operate)
**URL**: `http://localhost:3000/app/operate`

**PASS Criteria**:
- ✅ Page loads (no blank screen)
- ✅ Shows "Top Risks This Week" panel (alerts)
- ✅ Shows "Commitments" panel (tasks due in 7 days)
- ✅ Shows "Data Trust" panel (placeholder)
- ✅ "Export Exec Packet" button works

### 9. Exec Packet Export
**Flow**: Click "Export Exec Packet" from Operate or Meeting Mode page

**PASS Criteria**:
- ✅ Creates row in `exec_packets` table
- ✅ Downloads JSON file or shows printable view
- ✅ Packet contains: period, KPIs, top alerts, commitments

---

## E) Multi-Tenant Scoping

**Test**: Switch between orgs and verify data isolation

**PASS Criteria**:
- ✅ Switching orgs shows only that org's instances/alerts/tasks
- ✅ No cross-org data leakage

---

## F) Critical Fixes Applied

### 1. Seed Scripts Made Idempotent ✅
- `seed-os-templates.ts`: Checks for existing templates, updates if version newer
- `seed-demo-os.ts`: Uses upsert pattern, deletes and re-inserts for consistency

### 2. RLS Policies ✅
- All tables have RLS enabled
- Demo org write protection at DB level
- `os_templates` is globally readable (all authenticated users)

### 3. Publish Idempotency ✅
- Publish endpoint checks if already published before creating alerts/cadence
- No duplicate creation on double-click

---

## Final Verification Checklist

- [ ] Migration applied (6 tables exist)
- [ ] RLS enabled on all tables
- [ ] 3 templates seeded
- [ ] Demo workspace seeded (1+ published instance, alerts, tasks)
- [ ] Templates API returns 200 with 3 templates
- [ ] Demo org write protection returns 403
- [ ] All UI pages load without blank screens
- [ ] Can create and publish OS instance (non-demo)
- [ ] Alerts page shows generated alerts
- [ ] Tasks can be created and marked done
- [ ] Meeting Mode shows agenda
- [ ] Exec Packet export works
- [ ] Multi-tenant scoping verified

---

## Troubleshooting

### Migration Not Applied
**Error**: Tables don't exist
**Fix**: Run `db/migrations/010_os_generator.sql` in Supabase SQL Editor

### Templates Not Seeded
**Error**: `/api/os/templates` returns empty array
**Fix**: Run `npx tsx scripts/seed-os-templates.ts`

### Demo Workspace Not Seeded
**Error**: No instances/alerts/tasks in demo org
**Fix**: Run `npx tsx scripts/seed-demo-os.ts`

### Blank Screen on Pages
**Error**: White screen, console errors
**Fix**: 
1. Check browser console for errors
2. Verify dev server is running
3. Hard refresh (Cmd+Shift+R)
4. Check network tab for failed API calls

### API Returns 401/403
**Error**: Unauthorized or forbidden
**Fix**: 
1. Verify you're logged in
2. Check org context is set correctly
3. For demo org writes, this is expected (403 DEMO_READ_ONLY)

---

## Next Steps

Once all checks pass, provide a final report with:
1. PASS/FAIL summary for each item
2. SQL query outputs (tables, RLS, counts)
3. API response examples (200 and 403)
4. Screenshots or descriptions of UI pages loading
5. Any fixes made




