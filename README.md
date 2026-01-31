# CompassIQ - Business Operating System Dashboard

A production-ready, multi-tenant Business Operating System Dashboard built with Next.js, TypeScript, and Supabase.

## Features

- **Multi-tenant Architecture**: Complete org isolation with RLS (Row Level Security)
- **Demo Mode**: Read-only demo org for client presentations
- **Role-Based Access Control**: OWNER, ADMIN, SALES, OPS, FINANCE, VIEWER roles
- **Comprehensive Dashboards**:
  - Command Center (Executive Overview)
  - Revenue Engine (Sales Pipeline)
  - Ops Control Tower (Work Orders)
  - Finance (Invoices & AR)
  - Customer Success (Account Health)
  - Data Quality & Metric Catalog
  - Action Center (Tasks)
- **KPI Drilldowns**: Every KPI card links to detailed table views
- **Data Quality Monitoring**: Freshness, completeness, duplicates, orphans
- **Real-time Charts**: Funnel, trend, and bar charts using Recharts
- **Sales Demo Mode**: Guided presentation walkthrough with 7-step demo flow
- **ROI Calculator**: Quantify value with live KPI integration and annual impact estimates
- **Client Instance Setup**: One-click wizard to create new client orgs with baseline configuration
- **Export/Import Configuration**: Replicate metric catalogs and settings across client instances
- **Value Narrative**: Live value storytelling on Command Center based on ROI calculations
- **Presentation Mode**: Clean presentation UI with simplified navigation for client demos
- **Demo Script**: Private OWNER-only page with talk tracks and objection handling

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (Postgres, Auth, RLS, Storage)
- **Data Grid**: TanStack Table
- **Charts**: Recharts
- **Forms**: react-hook-form + zod
- **Deployment**: Vercel (Next.js) + Supabase (Hosted)

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Vercel account (for deployment)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API
3. Get your service role key from Settings > API (keep this secret!)

### 2. Run Database Migrations

You have two options:

#### Option A: Using Supabase SQL Editor (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - Copy and paste contents of `db/migrations/001_init.sql` → Run
   - Copy and paste contents of `db/migrations/002_rls.sql` → Run
   - Copy and paste contents of `db/migrations/004_invites_and_org_admin.sql` → Run
   - Copy and paste contents of `db/migrations/005_org_settings_and_roi.sql` → Run
   - `db/migrations/003_seed_metric_catalog.sql` is optional (seed script handles this)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   APP_BASE_URL=http://localhost:3000
   ```

### 6. Install Dependencies

```bash
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### 7. Seed Demo Data

Run the seed script to create a demo org with sample data:

```bash
npm run seed
```

This will:
- Create a demo organization (slug: `demo`)
- Create two demo users:
  - `demo.admin@example.com` / `demo-admin-123` (ADMIN role)
  - `demo.viewer@example.com` / `demo-viewer-123` (VIEWER role)
- Generate 30 accounts, 50 contacts, 80 opportunities, 150 activities, 60 work orders, 120 tasks, 40 invoices, 45 tickets, and data sources

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 9. Create Your First Production Org

1. Log in with one of the demo users or create a new user
2. The app will prompt you to create/select an organization
3. For production use, create a new org (not the demo org)

## Organization Management

### Creating Organizations

Organizations are created using the RPC function `create_organization_with_owner` (defined in `002_rls.sql`). This function:
- Creates the organization record
- Automatically creates an OWNER membership for the authenticated user
- Returns the new organization ID

**Why RPC?** Direct inserts to `organizations` are blocked by RLS for security. The RPC function runs with `SECURITY DEFINER` privileges, allowing it to create the org and membership atomically.

### Org Context & Cookie Storage

The active organization ID is stored in an HTTP-only cookie named `compass-org-id`:
- **Server-side**: Accessed via `getActiveOrgId()` from `@/lib/org`
- **Client-side**: Set via API route `/api/org/set` which calls `switchOrganization()` server action
- **Automatic fallback**: If no org cookie is set, the app tries to use the user's first org membership
- **Onboarding**: If user has no memberships, they're redirected to `/app/onboarding` to create their first org

### Org Switcher

The org switcher in the top bar:
- Lists all organizations the user belongs to
- Shows a "Demo" badge for demo organizations
- Allows switching active org context
- Includes "Create New Org" option for OWNER/ADMIN users

### Demo Toggle

The demo toggle button:
- Switches between production and demo org context
- When demo org is active:
  - UI becomes read-only (all create/edit buttons disabled)
  - RLS policies block all writes
  - Tooltips show "Demo data is read-only"
- If demo org doesn't exist, toggle is disabled with tooltip "Run seed script to create demo org"

### Organization Settings & Admin Center

OWNER and ADMIN users have access to organization settings via the Settings link in the sidebar:

- **Organization Settings** (`/app/settings/org`): View and update organization name, view organization details
- **User Management** (`/app/settings/users`): View all members, change roles, remove members
- **Invitations** (`/app/settings/invites`): Create invitation links, view invitation status, revoke invitations

All settings pages are read-only for demo organizations.

## How RLS Works

Row Level Security (RLS) is enabled on all org-scoped tables. Policies enforce:

1. **Org Isolation**: Users can only see data from organizations they're members of
2. **Role-Based Permissions**:
   - **VIEWER**: Read-only access
   - **SALES**: Can write opportunities, activities, tasks; read others
   - **OPS**: Can write work_orders, tasks; read others
   - **FINANCE**: Can write invoices, payments; read others
   - **OWNER/ADMIN**: Full access (except demo org)
3. **Demo Org Protection**: All INSERT/UPDATE/DELETE operations are blocked for demo org, even for OWNER/ADMIN

### Helper Functions

The RLS policies use these SQL functions:
- `is_member(org_id)`: Checks if current user is a member of the org
- `current_role(org_id)`: Returns user's role in the org
- `is_demo_org(org_id)`: Checks if org is a demo org
- `create_organization_with_owner(p_name, p_slug)`: Creates org and OWNER membership (SECURITY DEFINER)
- `create_invite(p_org_id, p_email, p_role)`: Creates organization invitation (SECURITY DEFINER)
- `accept_invite(p_token)`: Accepts invitation and creates membership (SECURITY DEFINER)
- `update_member_role(p_org_id, p_user_id, p_role)`: Updates member role with validation (SECURITY DEFINER)

## Organization Invitations

### Creating Invitations

OWNER and ADMIN users can create invitations from the Invitations page (`/app/settings/invites`):

1. Enter the invitee's email address
2. Select their role (VIEWER, SALES, OPS, FINANCE, ADMIN, or OWNER)
   - **Note**: Only OWNER can assign OWNER role
3. Click "Create Invitation"
4. Copy the generated invitation link to share with the invitee

Invitations expire after 7 days and can be revoked by OWNER/ADMIN users.

### Accepting Invitations

Users accept invitations by visiting `/invite/[token]`:

1. If not logged in, user is redirected to login, then back to the invite acceptance page
2. If logged in, the invitation is automatically accepted
3. User is added as a member with the specified role
4. Active org cookie is set to the organization
5. User is redirected to `/app` dashboard

**Important**: If the user already has a membership in the organization, accepting an invite will update their role to the invitation's role.

### Invitation Status

Invitations can have three statuses:
- **Pending**: Not yet accepted and not expired
- **Accepted**: Successfully accepted by a user
- **Expired**: Past the expiration date (7 days after creation)

## User Management

### Viewing Members

All organization members can view the members list on the User Management page (`/app/settings/users`). The list shows:
- User ID (truncated for display)
- Email (if available)
- Role
- Join date

### Changing Roles

OWNER and ADMIN users can change member roles using the role dropdown:
- **OWNER**: Only existing OWNER users can assign OWNER role
- **ADMIN**: OWNER or ADMIN can assign ADMIN role
- **Other roles**: OWNER or ADMIN can assign any non-OWNER role
- **Demo org**: Role changes are disabled for demo organizations

### Removing Members

OWNER and ADMIN users can remove members with these protections:
- Cannot remove the last OWNER (prevents org lockout)
- Demo organizations cannot have members removed
- Removing a member immediately revokes their access

## Role Rules

### Role Hierarchy

1. **OWNER**: Full control, can assign any role including OWNER
2. **ADMIN**: Full control except cannot assign OWNER role
3. **SALES**: Can write sales-related data (opportunities, activities)
4. **OPS**: Can write ops-related data (work orders, tasks)
5. **FINANCE**: Can write finance-related data (invoices, payments)
6. **VIEWER**: Read-only access

### OWNER Promotion Rules

- **Only OWNER can promote to OWNER**: ADMIN users cannot assign OWNER role
- **Must have at least one OWNER**: Cannot remove the last OWNER from an organization
- **OWNER promotion via invitation**: Only OWNER users can create invitations with OWNER role

These rules prevent privilege escalation and ensure organizations always have at least one owner.

## Sales Demo Mode

CompassIQ includes a built-in sales demonstration mode designed for client presentations.

### Guided Demo Presentation (`/app/demo`)

The demo presentation page provides a structured 7-step walkthrough:

1. **Command Center** - Executive KPIs and drilldowns
2. **Sales Funnel** - Pipeline forecasting and conversion metrics
3. **Ops Exceptions** - SLA tracking and work order management
4. **Finance AR** - Accounts receivable aging and collections
5. **Customer Health** - Account health scores and renewals
6. **Data Quality** - Metric catalog and credibility dashboard
7. **Action Center** - Unified task management and writeback

Each step includes:
- **What This Means**: Explanation of the feature
- **Value to Client**: Business value propositions
- **Proof**: Specific UI elements and capabilities demonstrated

### Presentation Mode

Enable Presentation Mode from the topbar (OWNER/ADMIN only):
- Hides sidebar labels (icons only)
- Increases KPI card sizes for better visibility
- Hides admin/settings links
- Creates a cleaner, more focused presentation experience

Presentation mode preference is stored in localStorage and persists across sessions.

### Using Demo Mode

1. Navigate to `/app/demo`
2. Use step navigation to move through the demo
3. Click "View in App" to deep-link to each section
4. Use Next/Previous buttons or click step numbers
5. Enable Presentation Mode from topbar for cleaner UI

## ROI Calculator

The ROI Calculator (`/app/roi`) quantifies the financial impact of CompassIQ based on your organization's metrics.

### Inputs

**Sales Metrics:**
- Average deal size
- Monthly leads
- Current and target win rates
- Current and target sales cycle (days)

**Operational Metrics:**
- Reporting hours per week
- Hourly fully-loaded cost
- AR days reduction target
- Churn reduction target (optional)

### Live KPI Integration

The calculator can pull live values from your data:
- Average deal size from won opportunities
- Win rate from opportunity stages
- Average sales cycle from closed deals
- AR days from invoice/payment data

Click "Use Live" buttons to populate inputs automatically.

### Outputs

The calculator computes:
- **Incremental Revenue**: From improved win rates
- **Time Savings**: From reduced reporting overhead
- **Cash Acceleration**: From AR days reduction
- **Churn Reduction Value**: From improved retention
- **Total Annual Impact**: Combined estimated value

### Value Narrative

The Command Center includes a Value Narrative component that displays:
- Summary of potential value based on ROI settings
- Total estimated annual impact
- Tooltip explaining calculation methodology

This provides instant context for stakeholders viewing the dashboard.

### Persistence

ROI defaults are saved per organization in `org_settings.roi_defaults` and persist across sessions.

## Client Instance Setup

The Client Instance Setup wizard (`/app/settings/setup`) streamlines onboarding new clients.

### Wizard Steps

1. **Organization Details**: Enter client name and slug
2. **Seed Metrics**: Baseline metric catalog is automatically added (12 standard KPIs)
3. **Create Admin Invite**: Generate invite for client administrator
4. **Complete**: Receive invite link and next steps checklist

### What Gets Created

- New organization with specified name and slug
- Baseline metric catalog (12 standard KPIs)
- Admin invitation with unique token
- Organization marked as "client" in metadata

### Baseline Metric Catalog

The setup wizard seeds these standard metrics:
- Revenue MTD
- Pipeline (30/60/90 days)
- AR Outstanding & DSO
- Win Rate & Sales Cycle
- On-Time Delivery
- Churn Risk Accounts
- Active Opportunities
- Blocked Work Orders

These can be customized after setup.

### Client Checklist

After setup, you receive a checklist:
- Share invite link with client admin
- Client admin accepts invite and logs in
- Client configures data integrations
- Client reviews and customizes metric catalog
- Client sets up additional users and roles

## Export/Import Configuration

Export and import configurations to replicate setups across client instances.

### Export (`/app/settings/export`)

Exports a JSON file containing:
- All metric catalog entries (keys, names, formulas, sources, cadence)
- ROI defaults
- Alert thresholds

### Import (`/app/settings/import`)

Import configuration JSON to:
- Upsert metric catalog entries (update if exists, add if new)
- Merge ROI defaults and alert thresholds
- Automatically set org-specific fields

### Use Cases

- Replicate your proven metric catalog across clients
- Standardize alert thresholds
- Share ROI defaults as starting points
- Version control your configurations

## Demo Script

The Demo Script page (`/app/internal/script`) is a private resource for OWNER users only.

### Contents

- **Introduction & Opening**: Pitch opening and value proposition
- **Step-by-Step Talk Tracks**: Script for each of the 7 demo steps
- **ROI Calculator Script**: How to present ROI calculations
- **Objection Handling**: Responses to common concerns:
  - Data trust & security
  - ROI & value justification
  - Implementation time
  - Data integration
  - Change management
- **Discovery Questions**: Questions to ask prospects:
  - Pain points
  - Goals and metrics
  - Current processes
  - Technical requirements

### Copy to Clipboard

Each section has a "Copy" button to quickly copy talk tracks to clipboard for use in presentations or notes.

## First-Run Flow

When a new user logs in:

1. **No Memberships**: User is redirected to `/app/onboarding`
   - User enters organization name and slug
   - Slug is auto-generated from name (kebab-case), but can be edited
   - On submit, calls `create_organization_with_owner` RPC
   - On success, sets active org cookie and redirects to `/app`

2. **Has Memberships**: User sees their first org automatically
   - App layout automatically sets org cookie if missing
   - User can switch orgs via org switcher

3. **Error Handling**:
   - Duplicate slug: Shows friendly error message
   - Not authenticated: Redirects to login
   - RLS violations: Shows "Demo data is read-only" or permission error

## Project Structure

```
├── app/
│   ├── (app)/              # Protected app routes
│   │   ├── page.tsx        # Command Center
│   │   ├── onboarding/     # First org creation page
│   │   ├── sales/           # Revenue Engine
│   │   ├── ops/             # Ops Control Tower
│   │   ├── finance/         # Finance
│   │   ├── success/         # Customer Success
│   │   ├── data/            # Data Quality & Metrics
│   │   ├── actions/         # Action Center + org actions
│   │   ├── settings/        # Settings pages (org, users, invites, setup, export, import)
│   │   ├── demo/            # Sales demo presentation
│   │   ├── roi/             # ROI calculator
│   │   ├── internal/        # Internal tools (demo script - OWNER only)
│   │   ├── actions.ts       # Server actions (KPIs, alerts)
│   │   └── layout.tsx      # App layout with guardrails + error boundary
│   ├── invite/              # Invite acceptance route
│   │   └── [token]/         # Dynamic invite token route
│   ├── api/
│   │   └── org/
│   │       └── set/         # API route for setting org cookie
│   ├── login/               # Login page
│   └── layout.tsx           # Root layout
├── components/
│   ├── app-shell/           # Sidebar, Topbar, OrgSwitcher, DemoToggle, ErrorBoundary
│   ├── charts/              # Recharts components
│   ├── data/                # DataTable component
│   ├── kpi/                 # KPIStatCard
│   ├── alerts/              # AlertsPanel
│   ├── value-narrative/     # Value Narrative component
│   └── ui/                  # shadcn/ui components + ActionButton
├── hooks/
│   └── use-role.ts          # Client-side role hook
├── db/
│   └── migrations/          # SQL migration files
│       ├── 001_init.sql     # Initial schema
│       ├── 002_rls.sql      # RLS policies
│       ├── 003_seed_metric_catalog.sql  # Optional metric catalog seed
│       ├── 004_invites_and_org_admin.sql  # Invites table + admin functions
│       └── 005_org_settings_and_roi.sql  # Org settings + ROI defaults
├── lib/
│   ├── supabase/            # Supabase clients (server, client, service-role)
│   ├── org.ts               # Org context helpers (server)
│   ├── org-context.ts       # Centralized org context utility
│   ├── role.ts              # Role checking utilities (server)
│   ├── roi.ts               # ROI calculation utilities
│   ├── metric-catalog-template.ts  # Baseline metric catalog template
│   ├── errors.ts            # Error normalization
│   └── utils.ts            # Utility functions
├── tests/
│   └── e2e/                 # Playwright E2E tests
│       └── smoke.spec.ts    # Smoke tests
├── scripts/
│   └── seed-demo.ts         # Demo data seed script
└── playwright.config.ts     # Playwright configuration
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for seed script only, not exposed to client)
   - `APP_BASE_URL` (your Vercel URL)
4. Deploy!

### Run Seed Script After Deployment

After deploying, you'll need to run the seed script once to create demo data. You can do this locally with the production env vars, or use Supabase's SQL editor to manually insert demo org.

## Testing

### Playwright E2E Tests

The project includes Playwright for end-to-end testing. To run tests:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

#### Test Configuration

Tests are configured in `playwright.config.ts`:
- Test files are in `tests/e2e/`
- Base URL defaults to `http://localhost:3000` (set via `PLAYWRIGHT_TEST_BASE_URL` env var)
- Dev server is automatically started before tests (unless `CI=true`)
- Tests run in Chromium by default (can be configured for other browsers)

#### Smoke Tests

The current smoke test suite (`tests/e2e/smoke.spec.ts`) includes placeholder tests for:
1. Login flow validation
2. Onboarding and org creation
3. Demo mode read-only enforcement
4. Settings pages accessibility
5. Invite acceptance flow

**Note**: To make these tests fully functional, you'll need to:
- Set up test user credentials in environment variables (`PLAYWRIGHT_TEST_EMAIL`, `PLAYWRIGHT_TEST_PASSWORD`)
- Implement authentication helpers or mocks
- Ensure demo org exists (run seed script)

For now, tests include a basic structure test that validates the app shell without requiring authentication.

## Manual QA Checklist

- [ ] Can log in with demo admin user
- [ ] Can log in with demo viewer user
- [ ] Org switcher shows demo org
- [ ] Demo mode toggle shows "Demo Mode" when viewing demo org
- [ ] All main pages load (Command Center, Sales, Ops, Finance, Success, Data, Actions)
- [ ] KPI cards show numbers and are clickable
- [ ] KPI drilldowns show filtered table data
- [ ] Tables have search, sort, pagination, CSV export
- [ ] Charts render (funnel, trend, bar charts)
- [ ] Demo org is read-only (create/edit buttons disabled)
- [ ] Production org allows writes (for users with appropriate roles)
- [ ] VIEWER role cannot create/edit in production org
- [ ] RLS prevents cross-org data access
- [ ] Data Quality page shows freshness, completeness, duplicates
- [ ] Alerts panel shows attention-required items
- [ ] Action Center shows "My Tasks" filtered by assigned user
- [ ] Settings link appears in sidebar for OWNER/ADMIN users
- [ ] Organization settings page loads and allows updating org name
- [ ] User management page shows all members
- [ ] Role changes work correctly (with OWNER promotion rules enforced)
- [ ] Members can be removed (except last OWNER)
- [ ] Invitations can be created and invitation link copied
- [ ] Invitation acceptance flow works (`/invite/[token]`)
- [ ] Demo org settings are read-only
- [ ] Error boundary catches and displays errors gracefully
- [ ] Demo presentation page loads and step navigation works
- [ ] ROI calculator displays and calculations update with inputs
- [ ] Presentation mode toggle works (hides labels, increases KPI sizes)
- [ ] Client setup wizard creates org, seeds metrics, generates invite
- [ ] Export configuration downloads valid JSON
- [ ] Import configuration accepts and imports JSON file
- [ ] Value narrative displays on Command Center when ROI is configured
- [ ] Demo script page is accessible to OWNER only

## Role-Based UI

The app includes role-aware UI components:

- **`useRole()` hook**: Client-side hook that provides:
  - Current user role
  - Demo mode status
  - Permission flags (`canWrite`, `canWriteSales`, `canWriteOps`, etc.)

- **`ActionButton` component**: Automatically disables based on:
  - Demo mode (always disabled in demo org)
  - User role (respects RLS permissions)
  - Shows tooltip explaining why button is disabled

Usage:
```tsx
import { ActionButton } from '@/components/ui/action-button'

<ActionButton actionType="sales" onClick={handleCreate}>
  Create Opportunity
</ActionButton>
```

## Error Handling

The app includes comprehensive error handling:

- **`normalizeError()`**: Converts Supabase/Postgres error codes to user-friendly messages
  - `23505`: Unique violation → "This record already exists"
  - `23503`: Foreign key violation → "Cannot delete referenced record"
  - `42501`: Insufficient privilege → "You do not have permission"
  - `P0001`: Custom exception → Shows custom message

- **`isDemoOrgError()`**: Detects demo org write attempts

- **Server Actions**: All server actions catch errors and return user-friendly messages

## Troubleshooting

### "No org context" errors
- Ensure you've selected an org in the org switcher
- Check that you have a membership record in the `memberships` table
- Verify org cookie is set (check browser dev tools → Application → Cookies)

### "Not authenticated" errors
- Check that Supabase auth session is valid
- Try logging out and back in
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### RLS blocking queries
- Verify RLS policies are applied (run `002_rls.sql` migration)
- Check that user has a membership record
- Ensure org_id is being passed correctly in queries
- Verify user's role allows the operation

### Org creation fails
- Check that slug is unique (error code 23505)
- Verify user is authenticated
- Ensure RPC function `create_organization_with_owner` exists in database

### Seed script fails
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that migrations have been run
- Ensure service role key has admin access

### Charts not rendering
- Check browser console for errors
- Verify Recharts is installed: `npm install recharts`

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

