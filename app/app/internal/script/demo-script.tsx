'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const DEMO_SCRIPT = {
  intro: {
    title: 'Introduction & Opening',
    content: `Welcome! Today I'm going to show you CompassIQ, a business operating system that gives you real-time visibility into every part of your business.

The problem we solve: Most companies spend hours every week pulling data from multiple systems, creating reports, and trying to understand what's happening. By the time you have the data, it's often stale, and you're making decisions based on yesterday's information.

CompassIQ solves this by:
1. Connecting all your business data in one place
2. Providing real-time KPIs and dashboards
3. Automating alerts so you focus on what matters
4. Enabling action directly from insights

Let's dive in and I'll show you exactly how this works with your data.`,
  },
  step1: {
    title: 'Step 1: Command Center - Executive Dashboard',
    content: `This is your Command Center - the single source of truth for all your key metrics.

[Point to KPI cards]
- Revenue MTD: See your current month's revenue at a glance
- Pipeline: Understand what's coming in the next 30, 60, 90 days
- AR Outstanding: Know exactly how much is owed to you
- On-Time Delivery: Track operational performance
- Churn Risk: Identify at-risk accounts before they churn

Each of these KPIs is clickable - you can drill down to see the underlying data, filter, and export.

The Value Narrative here shows your estimated annual impact based on the ROI calculator we configured - we'll come back to that.

Key message: Instead of spending hours gathering this data, it's here in seconds, updated in real-time.`,
  },
  step2: {
    title: 'Step 2: Sales Funnel & Pipeline',
    content: `Let's look at your sales process. The funnel chart shows conversion rates at each stage.

[Point to funnel]
- You can see where deals are getting stuck
- Identify bottlenecks in your sales process
- The forecast table shows your 30/60/90 day pipeline

Value: By identifying bottlenecks, you can improve win rates. If you go from 25% to 35% win rate, that's significant incremental revenue - we calculate that in the ROI tool.

The pipeline view shows all opportunities with amounts, close dates, and stages. You can filter, sort, and drill into any account.`,
  },
  step3: {
    title: 'Step 3: Operations & SLA Tracking',
    content: `Operations dashboard shows work orders and tasks. Notice we highlight exceptions - things that need attention.

[Point to work orders]
- Blocked items are highlighted
- On-time delivery metrics show operational performance
- Tasks are organized by priority and due date

Value: Exception-based management means you only look at what needs action. This saves time and improves customer satisfaction through better on-time delivery.`,
  },
  step4: {
    title: 'Step 4: Finance & AR Management',
    content: `AR aging chart shows how long invoices have been outstanding. Overdue items are prioritized.

[Point to AR aging]
- See exactly what's overdue and by how long
- Prioritize collections efforts
- Track payment trends

Value: Reducing days sales outstanding (DSO) improves cash flow. Even a 10-day reduction can significantly accelerate cash. We show this impact in the ROI calculator.`,
  },
  step5: {
    title: 'Step 5: Customer Health & Renewals',
    content: `Account health scores help you prioritize customer success efforts.

[Point to account health]
- Health scores indicate at-risk accounts
- Renewal dates drive proactive outreach
- Health trends show if accounts are improving or declining

Value: Reducing churn by even 2% can have huge impact. Early identification of at-risk accounts lets you intervene before it's too late.`,
  },
  step6: {
    title: 'Step 6: Data Quality & Credibility',
    content: `Data quality dashboard shows freshness, completeness, duplicates, and orphans.

[Point to data quality metrics]
- Know when data is stale
- Identify incomplete records
- Trust your metrics because you know the data quality

The metric catalog documents every KPI - what it means, how it's calculated, where the data comes from, and update frequency.

Value: Build confidence in your reporting. When executives ask "can I trust this number?", you can show them the data quality score and formula.`,
  },
  step7: {
    title: 'Step 7: Action Center & Writeback',
    content: `Finally, the Action Center brings it all together - tasks from across the business in one place.

[Point to Action Center]
- Unified task list
- Writeback capabilities (update status, assign, add notes)
- Integration points for external systems

Value: Close the loop. See an insight, take action, all in one place. Reduces context switching and speeds up execution.`,
  },
  roi: {
    title: 'ROI Calculator',
    content: `The ROI calculator lets us quantify the value. Based on your metrics, we input:

- Average deal size
- Win rate improvements
- Time savings from automated reporting
- AR days reduction
- Churn reduction

The calculator shows estimated annual impact. For example, if you improve win rate from 25% to 35%, that's [X] incremental revenue per year. Plus time savings, plus cash acceleration, plus churn reduction.

Total annual impact: [Y]. This pays for itself many times over.`,
  },
  objections: {
    title: 'Objection Handling',
    content: `**Data Trust & Security:**
- All data is encrypted in transit and at rest
- Row-level security ensures data isolation
- We can host on-premise or in your cloud
- SOC 2 compliant infrastructure

**ROI & Value:**
- ROI calculator shows clear financial impact
- Time savings alone often pay for the system
- Focus on highest-impact metrics first
- Phased rollout minimizes risk

**Implementation Time:**
- Quick setup: Can be running in days, not months
- Start with existing data sources
- No-code configuration
- We handle integrations

**Data Integration:**
- We integrate with common systems (CRM, ERP, etc.)
- API-first architecture
- Can export/import configurations
- Flexible data models

**Change Management:**
- Familiar dashboard interface
- Gradual rollout (start with one department)
- Training and support included
- Self-service capability reduces dependency`,
  },
  discovery: {
    title: 'Discovery Questions',
    content: `**Pain Points:**
- How much time do you spend on reporting each week?
- How fresh is your data when you make decisions?
- How many systems do you pull data from?
- What's your biggest blind spot right now?

**Goals:**
- What metrics matter most to leadership?
- What would a 10% improvement in win rate mean to you?
- How important is reducing days sales outstanding?
- What's your customer churn rate, and what's the cost?

**Process:**
- Who creates reports today, and how long does it take?
- How do you currently track pipeline and forecast?
- What happens when data is inconsistent?
- How do you prioritize which accounts need attention?

**Technical:**
- What systems do you use (CRM, ERP, etc.)?
- Do you have API access to your data?
- What's your data refresh frequency requirement?
- Any compliance or security requirements?`,
  },
}

export function DemoScript() {
  const [copied, setCopied] = useState<string | null>(null)

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {Object.entries(DEMO_SCRIPT).map(([key, section]) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{section.title}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(section.content, key)}
                className="gap-2"
              >
                {copied === key ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

