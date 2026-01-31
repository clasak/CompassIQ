# CompassIQ v2 - Executive Dashboard Redesign

A competing dashboard design for CompassIQ built to beat the original using BI best practices.

## Design Philosophy

**Executive War Room** aesthetic - dark, data-dense, purposeful. Like a Bloomberg terminal met a luxury car dashboard. Not the typical "AI startup pastel" look.

### Key Design Principles Applied

1. **F-Pattern Layout** - Critical KPIs (Revenue, Pipeline) positioned top-left where executives look first
2. **Hero Metrics** - Large, glowing numbers with trend indicators and sparklines
3. **Progressive Disclosure** - Summary → Detail on drill-down
4. **Semantic Colors**:
   - 🟢 Green (`#10B981`) = Revenue, success, growth
   - 🔵 Blue (`#3B82F6`) = Pipeline, info, in-progress
   - 🟡 Amber (`#F59E0B`) = Warning, attention needed
   - 🔴 Red (`#EF4444`) = Danger, action required
5. **Professional Typography**:
   - Instrument Sans - Display/body text
   - JetBrains Mono - Numeric data (tabular figures)
6. **Purposeful Animation** - Staggered reveals, progress bars, status indicators
7. **Information Density** - Maximized without overwhelm

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS with custom design tokens
- **Animation:** Framer Motion
- **Charts:** Custom SVG components + Recharts
- **UI Components:** Custom built (not shadcn/ui for this design)

## Running the App

```bash
cd /home/clasak/Projects/CompassIQ/v2
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Command Center - Executive KPI dashboard with hero metrics |
| `/revenue` | Revenue Engine - Pipeline management and forecasting |
| `/ops` | Operations Hub - Work order tracking and SLA metrics |
| `/accounts` | Accounts - Customer portfolio and health management |
| `/analytics` | Analytics Suite - Custom reports (placeholder) |
| `/demo` | Presentation Mode - Guided demo walkthrough |
| `/alerts` | Alerts - System notifications |
| `/settings` | Settings - Configuration (placeholder) |

## What Makes This Design Win

1. **First Impression Impact** - Dark theme with glowing hero metrics creates immediate executive presence
2. **Data Hierarchy** - Clear visual hierarchy from hero → stats → tables
3. **Motion Design** - Subtle animations that communicate (not decorate)
4. **Color Psychology** - Every color has meaning, not just aesthetics
5. **Typography** - Distinct fonts for different data types
6. **Density Balance** - Information-rich without feeling cluttered

## Comparison to v1 (/app)

| Aspect | v1 (/app) | v2 |
|--------|-----------|-----|
| Theme | Light, standard | Dark, executive |
| Hero Metrics | Small KPI cards | Large glowing numbers |
| Animation | Minimal | Purposeful reveals |
| Typography | System fonts | Instrument Sans + JetBrains Mono |
| Color Usage | Functional | Semantic with meaning |
| First Impression | Professional | Commanding |

## File Structure

```
v2/
├── app/
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── page.tsx          # Command Center
│   │   ├── command-center.tsx
│   │   ├── revenue/
│   │   ├── ops/
│   │   ├── accounts/
│   │   ├── analytics/
│   │   ├── demo/
│   │   ├── alerts/
│   │   └── settings/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── page-header.tsx
│   └── ui/
│       ├── hero-metric.tsx
│       ├── stat-card.tsx
│       ├── funnel-chart.tsx
│       ├── data-table.tsx
│       ├── card.tsx
│       └── button.tsx
└── lib/
    ├── mock-data.ts
    └── utils.ts
```

---

Built with ❤️ to win the dashboard competition.
