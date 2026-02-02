"use strict";exports.id=949,exports.ids=[949],exports.modules={6212:(e,t,i)=>{i.d(t,{z:()=>d});var o=i(2295),n=i(1626),s=i(5877),a=i(9247),r=i(3729);let l=(0,a.j)("inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pipeline focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-pipeline text-white hover:bg-pipeline/90 shadow-sm shadow-pipeline/25",secondary:"bg-surface-overlay text-text-primary border border-border hover:bg-surface-subtle hover:border-border-accent",ghost:"text-text-secondary hover:bg-surface-overlay hover:text-text-primary",destructive:"bg-danger text-white hover:bg-danger/90 shadow-sm shadow-danger/25",success:"bg-revenue text-white hover:bg-revenue/90 shadow-sm shadow-revenue/25",link:"text-pipeline underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",xl:"h-12 rounded-lg px-10 text-base",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),d=(0,r.forwardRef)(({className:e,variant:t,size:i,asChild:a=!1,...r},d)=>{let h=a?s.g7:"button";return o.jsx(h,{className:(0,n.cn)(l({variant:t,size:i,className:e})),ref:d,...r})});d.displayName="Button"},8422:(e,t,i)=>{i.d(t,{R:()=>d});var o=i(2295),n=i(1626),s=i(7292),a=i(9843),r=i(6407);let l={default:{border:"border-border",icon:"text-text-tertiary"},success:{border:"border-revenue/30",icon:"text-revenue"},warning:{border:"border-warning/30",icon:"text-warning"},danger:{border:"border-danger/30",icon:"text-danger"}};function d({label:e,value:t,trend:i,icon:d,variant:h="default",onClick:c,delay:u=0}){let p=l[h],g=void 0!==i&&i>=0;return o.jsx(s.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.4,delay:u},whileHover:{scale:c?1.02:1},onClick:c,className:(0,n.cn)("relative bg-surface-raised border rounded-xl p-5 transition-all duration-300",p.border,c&&"cursor-pointer hover:border-border-accent hover:bg-surface-overlay"),children:(0,o.jsxs)("div",{className:"flex items-start justify-between",children:[(0,o.jsxs)("div",{className:"space-y-2",children:[o.jsx("span",{className:"text-text-tertiary text-xs uppercase tracking-wider font-medium block",children:e}),o.jsx("span",{className:"font-mono text-2xl md:text-3xl font-bold text-text-primary tabular-nums",children:t}),void 0!==i&&(0,o.jsxs)("span",{className:(0,n.cn)("inline-flex items-center gap-0.5 text-xs font-medium",g?"text-revenue":"text-danger"),children:[g?o.jsx(a.Z,{className:"w-3 h-3"}):o.jsx(r.Z,{className:"w-3 h-3"}),Math.abs(i).toFixed(1),"%"]})]}),d&&o.jsx("div",{className:(0,n.cn)("p-2 rounded-lg bg-surface-subtle",p.icon),children:o.jsx(d,{className:"w-5 h-5"})})]})})}},2755:(e,t,i)=>{i.d(t,{jE:()=>n,mi:()=>o});let o=[{id:"spreadsheet-to-dashboard",name:"Spreadsheet Hell → Dashboard Clarity",description:"Target companies tracking operations manually in Excel/Google Sheets",targetPersona:"Ops leaders at 10-50 tech field service companies using spreadsheets for visibility",hook:"Real-time visibility without enterprise complexity",emails:[{day:1,subject:"Still tracking {{COMPANY}}'s operations in spreadsheets?",body:`Hi {{FIRST_NAME}},

I've been talking to Texas field service companies lately, and I keep hearing the same pattern:

"We track jobs in one system, invoices in another, and pull everything into Excel at the end of the week to see how we're really doing."

Sound familiar?

Here's what I'm seeing: Companies like {{COMPANY}} aren't missing scheduling software. You're missing **real-time operational visibility**.

What if you could see — right now — which techs are profitable, which jobs are stalled, and whether you're on track for this month's revenue?

No enterprise platform. No 6-month implementation. Just the dashboard you've been building in Excel, but live.

Worth 15 minutes to see how this works?

Cody

P.S. — One of my clients (similar size to {{COMPANY}}) went from weekly Excel reconciliation to real-time ops dashboards in 60 days. Happy to share the approach.`,personalizationTags:["COMPANY","FIRST_NAME"]},{day:3,subject:"Re: Still tracking {{COMPANY}}'s operations in spreadsheets?",body:`Hi {{FIRST_NAME}},

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

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:7,subject:"The real cost of manual tracking",body:`Hi {{FIRST_NAME}},

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

P.S. — This isn't replacing your scheduling system. It's adding the intelligence layer on top.`,personalizationTags:["FIRST_NAME","COMPANY","INDUSTRY"]},{day:14,subject:"Last note on ops visibility",body:`Hi {{FIRST_NAME}},

I'll make this quick.

If {{COMPANY}} is still relying on end-of-week Excel reports for operational visibility, and you want to explore real-time dashboards without enterprise complexity, I'm here.

If you've got it handled or timing isn't right — no problem. I'll close the loop on my end.

Either way, hope you find the visibility you need.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}},{id:"scheduling-not-intelligence",name:"Scheduling ≠ Intelligence",description:"Target companies with online scheduling but blind operations",targetPersona:"Ops leaders using Jobber/Housecall Pro/basic scheduling but lacking ops dashboards",hook:"Your customers can book online. But can YOU see what's happening in your operations?",emails:[{day:1,subject:"Your customers can book online. Can you see your operations?",body:`Hi {{FIRST_NAME}},

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

P.S. — This doesn't replace what you're using. It connects to it and gives you the dashboard you wish your scheduling software had.`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:3,subject:"Re: Scheduling vs. Intelligence",body:`Hi {{FIRST_NAME}},

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

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:7,subject:"The ops blind spot most field service companies have",body:`Hi {{FIRST_NAME}},

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

P.S. — One client told me: "We went from flying blind to having a co-pilot." That's the shift I'm talking about.`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:14,subject:"Closing the loop",body:`Hi {{FIRST_NAME}},

Last follow-up, promise.

If {{COMPANY}} wants real-time operational visibility without replacing your existing scheduling system, I'm an email away.

If you've got it covered or the timing isn't right, totally understand — I'll close the loop on my end.

Thanks for your time.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}},{id:"growing-pains",name:"Growing Pains Solution",description:"Target expanding companies outgrowing spreadsheets but scared of enterprise complexity",targetPersona:"COO/Owner at rapidly growing field service companies (like Aegis, Power Plumbing)",hook:"Affordable ops intelligence that scales without enterprise overkill",emails:[{day:1,subject:"Outgrew spreadsheets. Scared of enterprise software?",body:`Hi {{FIRST_NAME}},

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

P.S. — I helped a company go from 20 to 500+ branches with this approach. Scaling doesn't require enterprise overkill.`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:3,subject:"Re: The gap between spreadsheets and enterprise",body:`Hi {{FIRST_NAME}},

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

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:7,subject:"How Aegis scaled without enterprise overkill",body:`Hi {{FIRST_NAME}},

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

P.S. — They told me: "We got the visibility we needed without betting the company on a massive platform change." That's the idea.`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:14,subject:"Final note on scaling ops",body:`Hi {{FIRST_NAME}},

Last follow-up, then I'll let you be.

If {{COMPANY}} is outgrowing manual tracking but not ready for enterprise complexity, I'd be happy to show you what the middle path looks like.

If timing isn't right or you've got it handled, no worries — I'll close the loop.

Best of luck scaling {{COMPANY}}.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}}],n={totalCampaigns:o.length,totalEmails:o.reduce((e,t)=>e+t.emails.length,0),avgEmailsPerCampaign:Math.round(o.reduce((e,t)=>e+t.emails.length,0)/o.length),totalSent:o.reduce((e,t)=>e+(t.stats?.sent||0),0),totalReplies:o.reduce((e,t)=>e+(t.stats?.replied||0),0),totalMeetings:o.reduce((e,t)=>e+(t.stats?.meetings||0),0)}},6407:(e,t,i)=>{i.d(t,{Z:()=>o});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,i(9224).Z)("ArrowDownRight",[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]])},9843:(e,t,i)=>{i.d(t,{Z:()=>o});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,i(9224).Z)("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]])},5877:(e,t,i)=>{i.d(t,{g7:()=>h});var o=i(3729),n=i.t(o,2);function s(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}var a=i(2295),r=Symbol.for("react.lazy"),l=n[" use ".trim().toString()];function d(e){var t;return null!=e&&"object"==typeof e&&"$$typeof"in e&&e.$$typeof===r&&"_payload"in e&&"object"==typeof(t=e._payload)&&null!==t&&"then"in t}var h=function(e){let t=function(e){let t=o.forwardRef((e,t)=>{let{children:i,...n}=e;if(d(i)&&"function"==typeof l&&(i=l(i._payload)),o.isValidElement(i)){var a;let e,r;let l=(a=i,(e=Object.getOwnPropertyDescriptor(a.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?a.ref:(e=Object.getOwnPropertyDescriptor(a,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?a.props.ref:a.props.ref||a.ref),d=function(e,t){let i={...t};for(let o in t){let n=e[o],s=t[o];/^on[A-Z]/.test(o)?n&&s?i[o]=(...e)=>{let t=s(...e);return n(...e),t}:n&&(i[o]=n):"style"===o?i[o]={...n,...s}:"className"===o&&(i[o]=[n,s].filter(Boolean).join(" "))}return{...e,...i}}(n,i.props);return i.type!==o.Fragment&&(d.ref=t?function(...e){return t=>{let i=!1,o=e.map(e=>{let o=s(e,t);return i||"function"!=typeof o||(i=!0),o});if(i)return()=>{for(let t=0;t<o.length;t++){let i=o[t];"function"==typeof i?i():s(e[t],null)}}}}(t,l):l),o.cloneElement(i,d)}return o.Children.count(i)>1?o.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}(e),i=o.forwardRef((e,i)=>{let{children:n,...s}=e;d(n)&&"function"==typeof l&&(n=l(n._payload));let r=o.Children.toArray(n),h=r.find(u);if(h){let e=h.props.children,n=r.map(t=>t!==h?t:o.Children.count(e)>1?o.Children.only(null):o.isValidElement(e)?e.props.children:null);return(0,a.jsx)(t,{...s,ref:i,children:o.isValidElement(e)?o.cloneElement(e,void 0,n):null})}return(0,a.jsx)(t,{...s,ref:i,children:n})});return i.displayName=`${e}.Slot`,i}("Slot"),c=Symbol("radix.slottable");function u(e){return o.isValidElement(e)&&"function"==typeof e.type&&"__radixId"in e.type&&e.type.__radixId===c}},9247:(e,t,i)=>{i.d(t,{j:()=>a});var o=i(6815);let n=e=>"boolean"==typeof e?`${e}`:0===e?"0":e,s=o.W,a=(e,t)=>i=>{var o;if((null==t?void 0:t.variants)==null)return s(e,null==i?void 0:i.class,null==i?void 0:i.className);let{variants:a,defaultVariants:r}=t,l=Object.keys(a).map(e=>{let t=null==i?void 0:i[e],o=null==r?void 0:r[e];if(null===t)return null;let s=n(t)||n(o);return a[e][s]}),d=i&&Object.entries(i).reduce((e,t)=>{let[i,o]=t;return void 0===o||(e[i]=o),e},{});return s(e,l,null==t?void 0:null===(o=t.compoundVariants)||void 0===o?void 0:o.reduce((e,t)=>{let{class:i,className:o,...n}=t;return Object.entries(n).every(e=>{let[t,i]=e;return Array.isArray(i)?i.includes({...r,...d}[t]):({...r,...d})[t]===i})?[...e,i,o]:e},[]),null==i?void 0:i.class,null==i?void 0:i.className)}}};