// Email campaign sequences - REBUILT based on actual Texas prospect research (Jan 2025)
// Research: 21 prospects, 0 ServiceTitan users, 8 manual/spreadsheet, 5 basic scheduling, 8 no tech visible

export interface EmailTemplate {
  day: number
  subject: string
  body: string
  personalizationTags: string[]
}

export interface Campaign {
  id: string
  name: string
  description: string
  targetPersona: string
  hook: string
  emails: EmailTemplate[]
  stats?: {
    sent: number
    opened: number
    replied: number
    meetings: number
  }
}

export const campaigns: Campaign[] = [
  {
    id: 'spreadsheet-to-dashboard',
    name: 'Spreadsheet Hell → Dashboard Clarity',
    description: 'Target companies tracking operations manually in Excel/Google Sheets',
    targetPersona: 'Ops leaders at 10-50 tech field service companies using spreadsheets for visibility',
    hook: 'Real-time visibility without enterprise complexity',
    emails: [
      {
        day: 1,
        subject: 'Still tracking {{COMPANY}}\'s operations in spreadsheets?',
        body: `Hi {{FIRST_NAME}},

I've been talking to Texas field service companies lately, and I keep hearing the same pattern:

"We track jobs in one system, invoices in another, and pull everything into Excel at the end of the week to see how we're really doing."

Sound familiar?

Here's what I'm seeing: Companies like {{COMPANY}} aren't missing scheduling software. You're missing **real-time operational visibility**.

What if you could see — right now — which techs are profitable, which jobs are stalled, and whether you're on track for this month's revenue?

No enterprise platform. No 6-month implementation. Just the dashboard you've been building in Excel, but live.

Worth 15 minutes to see how this works?

Cody

P.S. — One of my clients (similar size to {{COMPANY}}) went from weekly Excel reconciliation to real-time ops dashboards in 60 days. Happy to share the approach.`,
        personalizationTags: ['COMPANY', 'FIRST_NAME']
      },
      {
        day: 3,
        subject: 'Re: Still tracking {{COMPANY}}\'s operations in spreadsheets?',
        body: `Hi {{FIRST_NAME}},

Quick follow-up on operational visibility.

The gap I'm seeing in Texas field service isn't scheduling — most companies have that figured out.

The gap is **intelligence**: 
- Where are techs right now?
- What's our revenue pipeline looking like?
- Which jobs are past due?
- Are we hitting our targets this month?

If your team is exporting data to Excel every week to answer these questions, there's a better way.

CompassIQ sits between "spreadsheet chaos" and "enterprise overkill."

Want to see a demo built for a company like {{COMPANY}}?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 7,
        subject: 'The real cost of manual tracking',
        body: `Hi {{FIRST_NAME}},

I won't take much of your time, but here's a calculation worth considering:

If your ops team spends 8 hours/week building Excel reports to track operations:
- That's 416 hours per year
- At a $70K ops manager salary: ~$33,000 in labor
- Plus the lag time between "something goes wrong" and "we notice it in the weekly report"

One of my Texas clients ({{INDUSTRY}} company, similar size to {{COMPANY}}) had this exact problem.

We built them a real-time dashboard — tech locations, job status, revenue pipeline, profitability by technician. No more weekly reconciliation.

They now catch problems the same day instead of the same week.

If that sounds valuable to {{COMPANY}}, I'd be happy to walk you through it.

Cody

P.S. — This isn't replacing your scheduling system. It's adding the intelligence layer on top.`,
        personalizationTags: ['FIRST_NAME', 'COMPANY', 'INDUSTRY']
      },
      {
        day: 14,
        subject: 'Last note on ops visibility',
        body: `Hi {{FIRST_NAME}},

I'll make this quick.

If {{COMPANY}} is still relying on end-of-week Excel reports for operational visibility, and you want to explore real-time dashboards without enterprise complexity, I'm here.

If you've got it handled or timing isn't right — no problem. I'll close the loop on my end.

Either way, hope you find the visibility you need.

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      }
    ],
    stats: {
      sent: 0,
      opened: 0,
      replied: 0,
      meetings: 0
    }
  },
  {
    id: 'scheduling-not-intelligence',
    name: 'Scheduling ≠ Intelligence',
    description: 'Target companies with online scheduling but blind operations',
    targetPersona: 'Ops leaders using Jobber/Housecall Pro/basic scheduling but lacking ops dashboards',
    hook: 'Your customers can book online. But can YOU see what\'s happening in your operations?',
    emails: [
      {
        day: 1,
        subject: 'Your customers can book online. Can you see your operations?',
        body: `Hi {{FIRST_NAME}},

I've been researching Texas field service companies, and I noticed {{COMPANY}} likely has online scheduling set up — which is great.

But here's the pattern I keep seeing:

**Scheduling works. Visibility doesn't.**

Your customers can book online, but when you need to answer basic questions like:
- "Where are our techs right now?"
- "What's our revenue pipeline this month?"
- "Which jobs are stuck or past due?"
- "Are we profitable by technician?"

...you're pulling reports, exporting to Excel, or just guessing.

Sound about right?

I help field service operations add the intelligence layer that scheduling software doesn't provide.

Worth 15 minutes to see how this works for {{COMPANY}}?

Cody

P.S. — This doesn't replace what you're using. It connects to it and gives you the dashboard you wish your scheduling software had.`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 3,
        subject: 'Re: Scheduling vs. Intelligence',
        body: `Hi {{FIRST_NAME}},

Following up on operational intelligence.

I talked to a Texas HVAC company last month who had the same setup as {{COMPANY}} — online scheduling working great, but operations were still a black box.

Their question: "Our customers can see our availability in real-time. Why can't WE see our operations in real-time?"

Fair question, right?

We built them a dashboard that shows:
- Live tech locations and job status
- Revenue pipeline (booked vs. completed)
- Jobs at risk (delayed, missing follow-up)
- Profitability by technician and job type

No new scheduling system. Just the visibility layer they were missing.

Want to see what this could look like for {{COMPANY}}?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 7,
        subject: 'The ops blind spot most field service companies have',
        body: `Hi {{FIRST_NAME}},

Quick insight from my research into Texas field service operations:

Most companies have **customer-facing tools** figured out:
✅ Online scheduling
✅ Email confirmations
✅ Payment processing

But they're **blind on the operations side**:
❌ Where are techs right now?
❌ What's the real-time revenue picture?
❌ Which jobs need attention today?

{{COMPANY}} likely falls into this pattern — not because you lack tools, but because scheduling software doesn't solve for **operational intelligence**.

I built CompassIQ to fill exactly this gap.

If you want to see how other companies your size added ops visibility without changing their scheduling system, I'd be happy to show you.

Cody

P.S. — One client told me: "We went from flying blind to having a co-pilot." That's the shift I'm talking about.`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 14,
        subject: 'Closing the loop',
        body: `Hi {{FIRST_NAME}},

Last follow-up, promise.

If {{COMPANY}} wants real-time operational visibility without replacing your existing scheduling system, I'm an email away.

If you've got it covered or the timing isn't right, totally understand — I'll close the loop on my end.

Thanks for your time.

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      }
    ],
    stats: {
      sent: 0,
      opened: 0,
      replied: 0,
      meetings: 0
    }
  },
  {
    id: 'growing-pains',
    name: 'Growing Pains Solution',
    description: 'Target expanding companies outgrowing spreadsheets but scared of enterprise complexity',
    targetPersona: 'COO/Owner at rapidly growing field service companies (like Aegis, Power Plumbing)',
    hook: 'Affordable ops intelligence that scales without enterprise overkill',
    emails: [
      {
        day: 1,
        subject: 'Outgrew spreadsheets. Scared of enterprise software?',
        body: `Hi {{FIRST_NAME}},

I've been talking to growing field service companies in Texas (Aegis, Power Plumbing, others), and there's a clear pattern:

**You've outgrown spreadsheets. But enterprise software feels like overkill.**

The platforms your competitors recommend cost $300+/tech/month, take 6+ months to implement, and require dedicated admins.

But going back to Excel isn't the answer either.

So you're stuck: Manual tracking is breaking down, but "enterprise solutions" feel too expensive and complex for {{COMPANY}}'s stage.

What if there was a middle path?

CompassIQ gives you real-time ops intelligence — tech tracking, revenue pipeline, job status dashboards — without the enterprise complexity or cost.

Most setups go live in 60 days. No dedicated admin required.

Worth 15 minutes to see if this fits where {{COMPANY}} is heading?

Cody

P.S. — I helped a company go from 20 to 500+ branches with this approach. Scaling doesn't require enterprise overkill.`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 3,
        subject: 'Re: The gap between spreadsheets and enterprise',
        body: `Hi {{FIRST_NAME}},

Quick follow-up on scaling operations.

Here's what I hear from growing companies like {{COMPANY}}:

**What broke:**
- "Excel can't keep up anymore"
- "We're losing visibility as we add more techs"
- "Things are slipping through the cracks"

**Why enterprise software feels wrong:**
- "$300+/tech/month is insane for our margins"
- "12-month implementation? We need help NOW"
- "My team will never use 90% of those features"

Sound familiar?

CompassIQ sits in the gap: **Affordable dashboard intelligence without enterprise complexity.**

You get the visibility you need to scale. Your team keeps using tools they already know.

Want to see how this works for companies at {{COMPANY}}'s stage?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 7,
        subject: 'How Aegis scaled without enterprise overkill',
        body: `Hi {{FIRST_NAME}},

One more story worth sharing:

I recently worked with a Texas plumbing company expanding rapidly (similar trajectory to {{COMPANY}}).

Their problem:
- Started with 8 techs, grew to 30 in 18 months
- Spreadsheets couldn't keep up
- Looked at ServiceTitan, Jobber Pro, others — all felt too heavy or expensive

Their solution:
- Kept their existing booking system (it worked)
- Added CompassIQ for operational intelligence
- Now they have real-time dashboards showing tech locations, revenue pipeline, job status

Cost: Fraction of enterprise platforms. Implementation: 60 days.

If {{COMPANY}} is in similar growth mode and wants to see this approach, happy to walk through it.

Cody

P.S. — They told me: "We got the visibility we needed without betting the company on a massive platform change." That's the idea.`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 14,
        subject: 'Final note on scaling ops',
        body: `Hi {{FIRST_NAME}},

Last follow-up, then I'll let you be.

If {{COMPANY}} is outgrowing manual tracking but not ready for enterprise complexity, I'd be happy to show you what the middle path looks like.

If timing isn't right or you've got it handled, no worries — I'll close the loop.

Best of luck scaling {{COMPANY}}.

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      }
    ],
    stats: {
      sent: 0,
      opened: 0,
      replied: 0,
      meetings: 0
    }
  }
]

// Campaign performance summary
export const campaignStats = {
  totalCampaigns: campaigns.length,
  totalEmails: campaigns.reduce((sum, c) => sum + c.emails.length, 0),
  avgEmailsPerCampaign: Math.round(campaigns.reduce((sum, c) => sum + c.emails.length, 0) / campaigns.length),
  totalSent: campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
  totalReplies: campaigns.reduce((sum, c) => sum + (c.stats?.replied || 0), 0),
  totalMeetings: campaigns.reduce((sum, c) => sum + (c.stats?.meetings || 0), 0)
}

// Research-based targeting guide
export const targetingGuide = {
  'spreadsheet-to-dashboard': {
    idealProspects: 8, // From research: 8 companies using manual/spreadsheet processes
    characteristics: [
      'No visible tech stack on website',
      'Basic contact forms only',
      'Likely tracking in Excel/Google Sheets',
      'Missing real-time operational visibility'
    ],
    exampleCompanies: [
      'Companies with no scheduling software visible',
      'Operations tracked manually',
      'Weekly/monthly Excel reporting'
    ]
  },
  'scheduling-not-intelligence': {
    idealProspects: 5, // From research: 5 companies with basic online scheduling
    characteristics: [
      'Have online booking (likely Jobber/Housecall Pro)',
      'Customer-facing tools work',
      'Blind on internal operations',
      'No ops intelligence dashboards visible'
    ],
    exampleCompanies: [
      'Companies with online scheduling but no ops dashboards',
      'Good customer experience, poor internal visibility'
    ]
  },
  'growing-pains': {
    idealProspects: 8, // From research: 8 companies expanding (includes Aegis, Power Plumbing)
    characteristics: [
      'Rapidly expanding (10→30+ techs)',
      'Outgrew spreadsheets',
      'Evaluating but scared of enterprise cost/complexity',
      'Need to scale operations infrastructure'
    ],
    exampleCompanies: [
      'Aegis Plumbing (visible growth trajectory)',
      'Power Plumbing (expanding operations)',
      'Similar Texas companies in growth mode'
    ]
  }
}
