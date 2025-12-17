# Data Flow in CompassIQ

## Overview

This document explains how data enters the CompassIQ system and flows through to dashboards, KPIs, and alerts.

## Data Entry Points

### 1. Demo Seed Data

**When**: Initial demo organization setup  
**Source**: `scripts/seed-demo.ts`  
**What gets created**:
- 30 Accounts
- 50 Contacts
- 80 Opportunities
- 150 Activities
- 60 Work Orders
- Various Tasks

**Metadata**: Records created via seed scripts have `metadata.data_origin = 'seeded'` (or default to 'seeded' if not set)

**Used in**: Demo presentations, onboarding demonstrations

### 2. Intake Import

**When**: Sales team imports client data via `/app/sales/intake`  
**Source**: JSON intake pack files  
**What gets created** (when `mode: 'seed_preview_and_crm'`):
- Preview Workspace (always)
- Accounts (if provided in `optional_entities.accounts`)
- Opportunities (if provided, linked to accounts)
- Tasks (if provided, linked to accounts/opportunities)
- Quotes (if provided, linked to accounts/opportunities)
- Metric values for KPIs
- Preview alerts based on pains

**Metadata**: Records created via intake import have `metadata.data_origin = 'imported'`

**API**: `POST /api/intake/import`  
**Results**: Redirects to `/app/sales/intake/result` with links to all created records

### 3. Manual Entry (CRUD UI)

**When**: Users create records via the UI  
**Locations**:
- Topbar "Create" dropdown (Lead, Account, Opportunity, Task, Quote)
- Individual list pages (e.g., `/app/crm/leads`, `/app/crm/accounts`)

**What can be created**:
- **Leads**: `/app/crm/leads` → Create Lead dialog
- **Accounts**: `/app/crm/accounts` → Create Account dialog
- **Opportunities**: `/app/crm/opportunities` → Create Opportunity dialog (requires Account)
- **Tasks**: `/app/crm/tasks` → Create Task dialog (can link to Account or Opportunity)
- **Quotes**: `/app/crm/quotes` → Create Quote dialog (requires Account, optional Opportunity)

**Metadata**: Records created manually have `metadata.data_origin = 'manual'`

## Data Flow to Dashboards

### Command Center (`/app`)

The Command Center shows:
- Recent Accounts (latest 5)
- Recent Opportunities (latest 5)
- Open Tasks (due in next 7 days)
- Open Quotes (latest 5)

These are pulled directly from the CRM tables:
- `accounts` table → ordered by `created_at DESC`
- `opportunities` table → ordered by `created_at DESC`
- `tasks` table → filtered by `status IN ('OPEN', 'IN_PROGRESS')` and `due_date <= next_week`
- `quotes` table → ordered by `created_at DESC`

### KPI Cards

KPIs are stored in `metric_values` table and aggregated:
- Grouped by `metric_key`
- Filtered by `occurred_on` date range
- Can be scoped to `preview_workspace_id` for preview mode

**Note**: KPIs can be calculated from:
1. Direct metric values (from intake import or manual entry)
2. Aggregations from CRM tables (e.g., "Active Opportunities" = COUNT from `opportunities` table)
3. Calculated formulas (defined in `metric_catalog` table)

### Data Origin Indicators

Each list page shows a "Origin" column indicating where records came from:
- **"Manual"**: Created via UI forms
- **"Imported"**: Created via intake import
- **"Seeded (demo)"**: Created via seed scripts (default for demo org)

This helps users understand data lineage and trust.

## Relationships

### Account → Opportunities
- One Account can have many Opportunities
- Opportunities require an `account_id`

### Opportunity → Quotes
- One Opportunity can have many Quotes
- Quotes can link to both Account and Opportunity

### Account/Opportunity → Tasks
- Tasks use polymorphic relations (`related_type` + `related_id`)
- Can link to either Account (`related_type = 'account'`) or Opportunity (`related_type = 'opportunity'`)

### Account → Contacts
- One Account can have many Contacts
- Contacts belong to exactly one Account

## Demo Org Guardrails

The demo organization (`is_demo = true`) is read-only:
- All create/update/delete operations return `DEMO_READ_ONLY` error
- UI shows disabled buttons with "Demo org is read-only" tooltip
- RLS policies enforce this at the database level

## Preview Workspace Mode

When a preview workspace is active:
- Branding switches to preview workspace branding
- Metric values can be scoped to the preview workspace
- Preview alerts are shown
- Exit Preview restores org branding instantly

## Summary

```
┌─────────────────────────────────────────────────────────┐
│                   DATA ENTRY POINTS                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Demo Seed (seed-demo.ts)                            │
│     └─> Accounts, Opportunities, Tasks, etc.            │
│         metadata.data_origin = 'seeded'                 │
│                                                          │
│  2. Intake Import (/api/intake/import)                  │
│     └─> Preview Workspace + CRM entities                │
│         metadata.data_origin = 'imported'               │
│                                                          │
│  3. Manual Entry (CRUD UI)                              │
│     └─> Lead, Account, Opportunity, Task, Quote         │
│         metadata.data_origin = 'manual'                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA FLOW                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CRM Tables (accounts, opportunities, tasks, quotes)    │
│         │                                                │
│         ├─> Command Center (recent records)             │
│         ├─> List Pages (with origin indicators)         │
│         ├─> Detail Pages (linked relationships)         │
│         └─> KPI Calculations (aggregations)             │
│                                                          │
│  metric_values table                                    │
│         │                                                │
│         └─> KPI Cards (charts, trends)                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```


