(()=>{var e={};e.id=762,e.ids=[762],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},707:(e,s,t)=>{"use strict";t.r(s),t.d(s,{GlobalError:()=>r.a,__next_app__:()=>p,originalPathname:()=>h,pages:()=>d,routeModule:()=>m,tree:()=>c});var i=t(482),a=t(9108),n=t(2563),r=t.n(n),o=t(8300),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);t.d(s,l);let c=["",{children:["(dashboard)",{children:["campaigns",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,3067)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/campaigns/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,6048)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,9361,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,2917)),"/home/clasak/Projects/CompassIQ/v2/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,9361,23)),"next/dist/client/components/not-found-error"]}],d=["/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/campaigns/page.tsx"],h="/(dashboard)/campaigns/page",p={require:t,loadChunk:()=>Promise.resolve()},m=new i.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/(dashboard)/campaigns/page",pathname:"/campaigns",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},4967:(e,s,t)=>{Promise.resolve().then(t.bind(t,8231))},8231:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>v});var i=t(2295),a=t(3729),n=t(7292),r=t(4447),o=t(1351),l=t(8100),c=t(8422),d=t(2755),h=t(9224);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let p=(0,h.Z)("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);var m=t(5904),x=t(1206);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let u=(0,h.Z)("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]]),g=(0,h.Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);var y=t(9895),b=t(9200),f=t(7189);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let j=(0,h.Z)("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);var w=t(340);function v(){let[e,s]=(0,a.useState)(d.mi[0].id),[t,h]=(0,a.useState)(null),v=d.mi.find(s=>s.id===e),N=(e,s)=>{navigator.clipboard.writeText(e),h(s),setTimeout(()=>h(null),2e3)},k=(e,s={COMPANY:"Acme HVAC",FIRST_NAME:"Sarah"})=>{let t=e;return Object.entries(s).forEach(([e,s])=>{t=t.replace(RegExp(`{{${e}}}`,"g"),s)}),t};return(0,i.jsxs)("div",{className:"space-y-8",children:[i.jsx(r.m,{title:"Outreach Campaigns",description:"Ready-to-use email sequences for field service operations leaders",actions:(0,i.jsxs)(l.z,{variant:"default",children:[i.jsx(p,{className:"w-4 h-4 mr-2"}),"Launch Campaign"]})}),(0,i.jsxs)("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[i.jsx(c.R,{label:"Active Campaigns",value:d.jE.totalCampaigns.toString(),icon:m.Z,variant:"default",delay:0}),i.jsx(c.R,{label:"Total Emails",value:d.jE.totalEmails.toString(),icon:x.Z,variant:"success",delay:.1}),i.jsx(c.R,{label:"Emails Sent",value:d.jE.totalSent.toString(),icon:p,variant:"success",delay:.2}),i.jsx(c.R,{label:"Meetings Booked",value:d.jE.totalMeetings.toString(),icon:u,variant:"success",delay:.3})]}),i.jsx("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4",children:d.mi.map((t,a)=>i.jsx(n.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.3,delay:.1*a},children:(0,i.jsxs)(o.Zb,{className:`cursor-pointer transition-all ${e===t.id?"border-pipeline bg-pipeline/5 ring-2 ring-pipeline/30":"hover:border-pipeline/30"}`,onClick:()=>s(t.id),children:[i.jsx(o.Ol,{children:(0,i.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,i.jsxs)("div",{className:"flex-1 min-w-0",children:[i.jsx(o.ll,{className:"text-base",children:t.name}),i.jsx(o.SZ,{className:"mt-1 text-xs",children:t.description})]}),e===t.id&&i.jsx(g,{className:"w-5 h-5 text-pipeline flex-shrink-0"})]})}),i.jsx(o.aY,{children:(0,i.jsxs)("div",{className:"space-y-3",children:[(0,i.jsxs)("div",{className:"grid grid-cols-2 gap-2 text-xs",children:[(0,i.jsxs)("div",{className:"flex items-center gap-1.5 text-text-secondary",children:[i.jsx(x.Z,{className:"w-3.5 h-3.5"}),(0,i.jsxs)("span",{children:[t.emails.length," emails"]})]}),(0,i.jsxs)("div",{className:"flex items-center gap-1.5 text-text-secondary",children:[i.jsx(u,{className:"w-3.5 h-3.5"}),i.jsx("span",{children:"14-day sequence"})]})]}),i.jsx("div",{className:"pt-3 border-t border-border-subtle",children:(0,i.jsxs)("p",{className:"text-xs text-text-tertiary",children:[i.jsx("span",{className:"font-semibold text-text-secondary",children:"Hook:"})," ",t.hook]})}),(0,i.jsxs)("div",{className:"flex items-start gap-2",children:[i.jsx(y.Z,{className:"w-3.5 h-3.5 text-pipeline mt-0.5 flex-shrink-0"}),i.jsx("p",{className:"text-xs text-text-secondary leading-relaxed",children:t.targetPersona})]})]})})]})},t.id))}),v&&(0,i.jsxs)("div",{className:"space-y-6",children:[(0,i.jsxs)("div",{className:"flex items-center justify-between",children:[(0,i.jsxs)("div",{children:[i.jsx("h2",{className:"text-2xl font-bold text-text-primary",children:v.name}),i.jsx("p",{className:"text-text-secondary mt-1",children:v.description})]}),(0,i.jsxs)(l.z,{variant:"default",children:[i.jsx(b.Z,{className:"w-4 h-4 mr-2"}),"Use This Campaign"]})]}),i.jsx("div",{className:"space-y-4",children:v.emails.map((e,s)=>{let a=`${v.id}-${s}`,r=t===a,c=k(e.subject),d=k(e.body);return i.jsx(n.E.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3,delay:.1*s},children:(0,i.jsxs)(o.Zb,{children:[i.jsx(o.Ol,{children:(0,i.jsxs)("div",{className:"flex items-start justify-between gap-4",children:[(0,i.jsxs)("div",{className:"flex gap-4",children:[(0,i.jsxs)("div",{className:"flex flex-col items-center",children:[i.jsx("div",{className:"w-12 h-12 rounded-full bg-pipeline/10 border-2 border-pipeline flex items-center justify-center",children:(0,i.jsxs)("span",{className:"text-sm font-bold text-pipeline",children:["D",e.day]})}),s<v.emails.length-1&&i.jsx("div",{className:"w-0.5 h-16 bg-border-subtle mt-2"})]}),(0,i.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,i.jsxs)("div",{className:"flex items-center gap-2 mb-2",children:[i.jsx(f.Z,{className:"w-4 h-4 text-text-tertiary"}),(0,i.jsxs)("span",{className:"text-sm text-text-secondary",children:["Day ",e.day," ",0===s?"(Initial Outreach)":s===v.emails.length-1?"(Break-up)":"(Follow-up)"]})]}),(0,i.jsxs)(o.ll,{className:"text-base",children:["Subject: ",c]})]})]}),i.jsx(l.z,{variant:"secondary",size:"sm",onClick:()=>N(d,a),children:r?(0,i.jsxs)(i.Fragment,{children:[i.jsx(g,{className:"w-4 h-4 mr-1.5"}),"Copied!"]}):(0,i.jsxs)(i.Fragment,{children:[i.jsx(j,{className:"w-4 h-4 mr-1.5"}),"Copy"]})})]})}),(0,i.jsxs)(o.aY,{children:[i.jsx("div",{className:"bg-surface-subtle rounded-lg p-4 border border-border-subtle",children:i.jsx("pre",{className:"text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed",children:d})}),e.personalizationTags.length>0&&(0,i.jsxs)("div",{className:"mt-4 flex items-center gap-2 flex-wrap",children:[i.jsx("span",{className:"text-xs font-semibold text-text-secondary",children:"Personalization tags:"}),e.personalizationTags.map(e=>i.jsx("span",{className:"inline-flex items-center px-2 py-1 rounded-md bg-pipeline/10 text-pipeline text-xs font-mono",children:`{{${e}}}`},e))]}),i.jsx("div",{className:"mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg",children:(0,i.jsxs)("div",{className:"flex items-start gap-2",children:[i.jsx(u,{className:"w-4 h-4 text-warning mt-0.5 flex-shrink-0"}),(0,i.jsxs)("div",{className:"text-xs",children:[i.jsx("p",{className:"font-semibold text-warning mb-1",children:"Timing"}),i.jsx("p",{className:"text-text-secondary",children:0===s?"Send immediately after qualifying prospect":`Send ${e.day} days after initial outreach${14===e.day?" (final follow-up)":""}`})]})]})})]})]})},s)})}),(0,i.jsxs)(o.Zb,{children:[i.jsx(o.Ol,{children:(0,i.jsxs)(o.ll,{className:"flex items-center gap-2",children:[i.jsx(w.Z,{className:"w-5 h-5 text-pipeline"}),"Campaign Insights"]})}),i.jsx(o.aY,{children:(0,i.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6",children:[(0,i.jsxs)("div",{children:[i.jsx("h4",{className:"text-sm font-semibold text-text-primary mb-3",children:"✅ Best Practices"}),(0,i.jsxs)("ul",{className:"space-y-2 text-sm text-text-secondary",children:[(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),i.jsx("span",{children:"Keep emails under 120 words"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),i.jsx("span",{children:"Single clear CTA per email"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),i.jsx("span",{children:"Reference specific pain points"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),i.jsx("span",{children:"Show credibility briefly"})]})]})]}),(0,i.jsxs)("div",{children:[i.jsx("h4",{className:"text-sm font-semibold text-text-primary mb-3",children:"❌ Avoid"}),(0,i.jsxs)("ul",{className:"space-y-2 text-sm text-text-secondary",children:[(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-danger mt-0.5",children:"•"}),i.jsx("span",{children:"“Hope this email finds you well”"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-danger mt-0.5",children:"•"}),i.jsx("span",{children:"Wall of text paragraphs"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-danger mt-0.5",children:"•"}),i.jsx("span",{children:"Multiple competing CTAs"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-danger mt-0.5",children:"•"}),i.jsx("span",{children:"Generic “one-size-fits-all” pitch"})]})]})]}),(0,i.jsxs)("div",{children:[i.jsx("h4",{className:"text-sm font-semibold text-text-primary mb-3",children:"\uD83D\uDCA1 Personalization"}),(0,i.jsxs)("ul",{className:"space-y-2 text-sm text-text-secondary",children:[(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),i.jsx("span",{children:"Research LinkedIn before sending"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),i.jsx("span",{children:"Reference company growth or news"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),i.jsx("span",{children:"Adjust pain points to industry"})]}),(0,i.jsxs)("li",{className:"flex items-start gap-2",children:[i.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),i.jsx("span",{children:"Match tone to recipient seniority"})]})]})]})]})})]})]})]})}},8422:(e,s,t)=>{"use strict";t.d(s,{R:()=>c});var i=t(2295),a=t(1626),n=t(7292),r=t(9843),o=t(6407);let l={default:{border:"border-border",icon:"text-text-tertiary"},success:{border:"border-revenue/30",icon:"text-revenue"},warning:{border:"border-warning/30",icon:"text-warning"},danger:{border:"border-danger/30",icon:"text-danger"}};function c({label:e,value:s,trend:t,icon:c,variant:d="default",onClick:h,delay:p=0}){let m=l[d],x=void 0!==t&&t>=0;return i.jsx(n.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.4,delay:p},whileHover:{scale:h?1.02:1},onClick:h,className:(0,a.cn)("relative bg-surface-raised border rounded-xl p-5 transition-all duration-300",m.border,h&&"cursor-pointer hover:border-border-accent hover:bg-surface-overlay"),children:(0,i.jsxs)("div",{className:"flex items-start justify-between",children:[(0,i.jsxs)("div",{className:"space-y-2",children:[i.jsx("span",{className:"text-text-tertiary text-xs uppercase tracking-wider font-medium block",children:e}),i.jsx("span",{className:"font-mono text-2xl md:text-3xl font-bold text-text-primary tabular-nums",children:s}),void 0!==t&&(0,i.jsxs)("span",{className:(0,a.cn)("inline-flex items-center gap-0.5 text-xs font-medium",x?"text-revenue":"text-danger"),children:[x?i.jsx(r.Z,{className:"w-3 h-3"}):i.jsx(o.Z,{className:"w-3 h-3"}),Math.abs(t).toFixed(1),"%"]})]}),c&&i.jsx("div",{className:(0,a.cn)("p-2 rounded-lg bg-surface-subtle",m.icon),children:i.jsx(c,{className:"w-5 h-5"})})]})})}},2755:(e,s,t)=>{"use strict";t.d(s,{jE:()=>a,mi:()=>i});let i=[{id:"spreadsheet-to-dashboard",name:"Spreadsheet Hell → Dashboard Clarity",description:"Target companies tracking operations manually in Excel/Google Sheets",targetPersona:"Ops leaders at 10-50 tech field service companies using spreadsheets for visibility",hook:"Real-time visibility without enterprise complexity",emails:[{day:1,subject:"Still tracking {{COMPANY}}'s operations in spreadsheets?",body:`Hi {{FIRST_NAME}},

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

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}}],a={totalCampaigns:i.length,totalEmails:i.reduce((e,s)=>e+s.emails.length,0),avgEmailsPerCampaign:Math.round(i.reduce((e,s)=>e+s.emails.length,0)/i.length),totalSent:i.reduce((e,s)=>e+(s.stats?.sent||0),0),totalReplies:i.reduce((e,s)=>e+(s.stats?.replied||0),0),totalMeetings:i.reduce((e,s)=>e+(s.stats?.meetings||0),0)}},6407:(e,s,t)=>{"use strict";t.d(s,{Z:()=>i});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,t(9224).Z)("ArrowDownRight",[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]])},9843:(e,s,t)=>{"use strict";t.d(s,{Z:()=>i});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,t(9224).Z)("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]])},7189:(e,s,t)=>{"use strict";t.d(s,{Z:()=>i});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,t(9224).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},3067:(e,s,t)=>{"use strict";t.r(s),t.d(s,{$$typeof:()=>n,__esModule:()=>a,default:()=>r});let i=(0,t(6843).createProxy)(String.raw`/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/campaigns/page.tsx`),{__esModule:a,$$typeof:n}=i,r=i.default}};var s=require("../../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),i=s.X(0,[638,798,789,285],()=>t(707));module.exports=i})();