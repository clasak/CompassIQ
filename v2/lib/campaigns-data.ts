// Email campaign sequences from compassiq-cold-email-templates.md

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
    id: 'servicetitan-complex',
    name: 'ServiceTitan Too Complex',
    description: 'Target operations leaders struggling with platform complexity',
    targetPersona: 'COO/Ops Director at 10-50 tech companies using ServiceTitan',
    hook: 'Acknowledge the platform complexity pain',
    emails: [
      {
        day: 1,
        subject: 'Is {{COMPANY}}\'s field service software worth the complexity?',
        body: `Hi {{FIRST_NAME}},

Quick question: Are you getting $300/tech/month in value from your field service platform?

I ask because I keep hearing the same thing from operations leaders at companies your size:

"It's too big. My people are scared to dive in. We only use the bare features."

I help field service companies get the reporting and visibility they actually need — without replacing your existing tools or a 12-month implementation.

Worth a 15-minute call to see if it fits?

Cody

P.S. — I built dashboards for a 500+ branch operation. Happy to share what actually moved the needle.`,
        personalizationTags: ['COMPANY', 'FIRST_NAME']
      },
      {
        day: 3,
        subject: 'Re: Is {{COMPANY}}\'s field service software worth the complexity?',
        body: `Hi {{FIRST_NAME}},

Quick stat that might resonate:

The average field service company spends **30% of admin time** just reconciling data between systems.

That's not a software problem — it's a visibility problem.

Still curious if this is worth discussing?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 7,
        subject: 'How a 500-branch operation got real visibility',
        body: `Hi {{FIRST_NAME}},

One more thought, then I'll stop bugging you.

I recently helped a $6.9B field service company solve their lead traceability problem. They were losing track of 30-40% of leads between systems.

Within 60 days, we had dashboards that showed exactly where leads were dropping — no new platform, no 6-month implementation.

If {{COMPANY}} has a similar visibility gap, happy to share the approach.

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 14,
        subject: 'Closing the loop',
        body: `Hi {{FIRST_NAME}},

Wanted to follow up one last time.

If the timing isn't right, no worries — I'll close the loop on my end.

If things change and you want to explore getting better ops visibility without the platform overhead, I'm an email away.

Thanks for your time.

Cody`,
        personalizationTags: ['FIRST_NAME']
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
    id: 'spreadsheet-hell',
    name: 'Spreadsheet Hell',
    description: 'Target companies drowning in manual data reconciliation',
    targetPersona: 'Ops leaders exporting to Excel for real analysis',
    hook: '30% of admin time wasted on manual reporting',
    emails: [
      {
        day: 1,
        subject: 'How many hours does {{COMPANY}} spend reconciling data?',
        body: `Hi {{FIRST_NAME}},

Quick question: How much time does your operations team spend each week pulling data from different systems into spreadsheets?

I'm guessing it's more than you'd like.

Most field service companies I talk to have great tools — CRM, dispatch, accounting — but they're all disconnected. So every Monday morning starts with exports and vlookups.

I help operations leaders get a single source of truth without replacing what's working.

Worth 15 minutes to explore?

Cody

P.S. — One client cut their weekly reporting time from 12 hours to 20 minutes. Same insights, 97% less manual work.`,
        personalizationTags: ['COMPANY', 'FIRST_NAME']
      },
      {
        day: 3,
        subject: 'Re: How many hours does {{COMPANY}} spend reconciling data?',
        body: `Hi {{FIRST_NAME}},

Following up on my note about data reconciliation.

Here's what I've seen work:

Instead of replacing your existing systems (expensive, risky, time-consuming), we connect them. Your team keeps using what they know. You get the unified dashboards you've been building in Excel.

Most pilots show value within 60 days.

Interested in learning more?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 7,
        subject: 'The real cost of manual reporting',
        body: `Hi {{FIRST_NAME}},

One more thing to consider:

If your operations team spends 10 hours/week reconciling data, that's:
- 520 hours per year
- At a $75K ops manager salary: ~$37K in labor cost
- Plus the opportunity cost of not doing strategic work

What if you could redeploy that time to actually improving operations instead of just reporting on them?

That's what CompassIQ does for {{COMPANY}}-sized operations.

Happy to share a quick example if you're curious.

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 14,
        subject: 'Last note on data visibility',
        body: `Hi {{FIRST_NAME}},

I'll keep this short.

If manual reporting is eating your team's time and you want to explore alternatives, I'm here.

If not, no hard feelings — I'll close the loop.

Either way, hope {{COMPANY}} finds the right solution.

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
    id: 'post-growth-chaos',
    name: 'Post-Growth Chaos',
    description: 'Target companies that grew fast and lost operational visibility',
    targetPersona: 'COO/Owner at rapidly growing field service companies',
    hook: 'Growth exposed visibility gaps',
    emails: [
      {
        day: 1,
        subject: '{{COMPANY}}\'s growth is impressive. Can your ops keep up?',
        body: `Hi {{FIRST_NAME}},

Congrats on {{COMPANY}}'s growth — it's clear you're doing something right.

But I've noticed a pattern: Companies that grow from 10 to 30+ technicians often hit an operational wall.

What worked at smaller scale (tribal knowledge, spreadsheets, gut feel) breaks down. You lose visibility. Things slip through cracks.

I help operations leaders build the dashboards and alerts they need to scale without chaos.

Worth 15 minutes to compare notes?

Cody

P.S. — I built ops intelligence for a company that went from 20 to 500+ branches. Happy to share what worked.`,
        personalizationTags: ['COMPANY', 'FIRST_NAME']
      },
      {
        day: 3,
        subject: 'Re: {{COMPANY}}\'s growth is impressive',
        body: `Hi {{FIRST_NAME}},

Following up on scaling operations.

Three questions most growing field service companies struggle with:

1. Which technicians are actually profitable?
2. Where are leads dropping in our process?
3. Are we on track to hit our revenue targets?

If {{COMPANY}} doesn't have instant answers to these, you're not alone.

Most companies your size have the data — it's just trapped in different systems.

Want to fix that?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 7,
        subject: 'The hidden cost of scaling without visibility',
        body: `Hi {{FIRST_NAME}},

One last insight on operational scaling:

The companies that grow successfully share one trait — they can see problems BEFORE they become expensive mistakes.

Late payments? They get alerts.
Technician utilization dropping? Dashboard shows it.
Lead response time increasing? They know immediately.

If {{COMPANY}} is scaling, you need this level of visibility.

I can show you how we've built this for similar operations. Interested?

Cody`,
        personalizationTags: ['FIRST_NAME', 'COMPANY']
      },
      {
        day: 14,
        subject: 'Final follow-up',
        body: `Hi {{FIRST_NAME}},

Last note, promise.

If operational visibility is on your radar and you want to explore options, I'm available.

If timing isn't right, totally understand — scaling is busy.

Best of luck with {{COMPANY}}'s continued growth.

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
