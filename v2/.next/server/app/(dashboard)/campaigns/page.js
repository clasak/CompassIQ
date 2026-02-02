(()=>{var e={};e.id=762,e.ids=[762],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},707:(e,s,t)=>{"use strict";t.r(s),t.d(s,{GlobalError:()=>r.a,__next_app__:()=>m,originalPathname:()=>p,pages:()=>d,routeModule:()=>h,tree:()=>c});var a=t(482),i=t(9108),n=t(2563),r=t.n(n),l=t(8300),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);t.d(s,o);let c=["",{children:["(dashboard)",{children:["campaigns",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(t.bind(t,3067)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/campaigns/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(t.bind(t,6048)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,9361,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(t.bind(t,2917)),"/home/clasak/Projects/CompassIQ/v2/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(t.t.bind(t,9361,23)),"next/dist/client/components/not-found-error"]}],d=["/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/campaigns/page.tsx"],p="/(dashboard)/campaigns/page",m={require:t,loadChunk:()=>Promise.resolve()},h=new a.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(dashboard)/campaigns/page",pathname:"/campaigns",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},4967:(e,s,t)=>{Promise.resolve().then(t.bind(t,524))},524:(e,s,t)=>{"use strict";t.r(s),t.d(s,{default:()=>N});var a=t(2295),i=t(3729),n=t(7292),r=t(4447),l=t(1351),o=t(8100),c=t(8422),d=t(2755),p=t(9224);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let m=(0,p.Z)("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);var h=t(5904),x=t(1206),g=t(5794);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let u=(0,p.Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);var y=t(9895),f=t(9200),j=t(5545);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let b=(0,p.Z)("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);var v=t(340);function N(){let[e,s]=(0,i.useState)(d.m[0].id),[t,p]=(0,i.useState)(null),N=d.m.find(s=>s.id===e),w=(e,s)=>{navigator.clipboard.writeText(e),p(s),setTimeout(()=>p(null),2e3)},k=(e,s={COMPANY:"Acme HVAC",FIRST_NAME:"Sarah"})=>{let t=e;return Object.entries(s).forEach(([e,s])=>{t=t.replace(RegExp(`{{${e}}}`,"g"),s)}),t};return(0,a.jsxs)("div",{className:"space-y-8",children:[a.jsx(r.m,{title:"Outreach Campaigns",description:"Ready-to-use email sequences for field service operations leaders",actions:(0,a.jsxs)(o.z,{variant:"default",children:[a.jsx(m,{className:"w-4 h-4 mr-2"}),"Launch Campaign"]})}),(0,a.jsxs)("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[a.jsx(c.R,{label:"Active Campaigns",value:d.j.totalCampaigns.toString(),icon:h.Z,variant:"default",delay:0}),a.jsx(c.R,{label:"Total Emails",value:d.j.totalEmails.toString(),icon:x.Z,variant:"success",delay:.1}),a.jsx(c.R,{label:"Emails Sent",value:d.j.totalSent.toString(),icon:m,variant:"success",delay:.2}),a.jsx(c.R,{label:"Meetings Booked",value:d.j.totalMeetings.toString(),icon:g.Z,variant:"success",delay:.3})]}),a.jsx("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4",children:d.m.map((t,i)=>a.jsx(n.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.3,delay:.1*i},children:(0,a.jsxs)(l.Zb,{className:`cursor-pointer transition-all ${e===t.id?"border-pipeline bg-pipeline/5 ring-2 ring-pipeline/30":"hover:border-pipeline/30"}`,onClick:()=>s(t.id),children:[a.jsx(l.Ol,{children:(0,a.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,a.jsxs)("div",{className:"flex-1 min-w-0",children:[a.jsx(l.ll,{className:"text-base",children:t.name}),a.jsx(l.SZ,{className:"mt-1 text-xs",children:t.description})]}),e===t.id&&a.jsx(u,{className:"w-5 h-5 text-pipeline flex-shrink-0"})]})}),a.jsx(l.aY,{children:(0,a.jsxs)("div",{className:"space-y-3",children:[(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-2 text-xs",children:[(0,a.jsxs)("div",{className:"flex items-center gap-1.5 text-text-secondary",children:[a.jsx(x.Z,{className:"w-3.5 h-3.5"}),(0,a.jsxs)("span",{children:[t.emails.length," emails"]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-1.5 text-text-secondary",children:[a.jsx(g.Z,{className:"w-3.5 h-3.5"}),a.jsx("span",{children:"14-day sequence"})]})]}),a.jsx("div",{className:"pt-3 border-t border-border-subtle",children:(0,a.jsxs)("p",{className:"text-xs text-text-tertiary",children:[a.jsx("span",{className:"font-semibold text-text-secondary",children:"Hook:"})," ",t.hook]})}),(0,a.jsxs)("div",{className:"flex items-start gap-2",children:[a.jsx(y.Z,{className:"w-3.5 h-3.5 text-pipeline mt-0.5 flex-shrink-0"}),a.jsx("p",{className:"text-xs text-text-secondary leading-relaxed",children:t.targetPersona})]})]})})]})},t.id))}),N&&(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between",children:[(0,a.jsxs)("div",{children:[a.jsx("h2",{className:"text-2xl font-bold text-text-primary",children:N.name}),a.jsx("p",{className:"text-text-secondary mt-1",children:N.description})]}),(0,a.jsxs)(o.z,{variant:"default",children:[a.jsx(f.Z,{className:"w-4 h-4 mr-2"}),"Use This Campaign"]})]}),a.jsx("div",{className:"space-y-4",children:N.emails.map((e,s)=>{let i=`${N.id}-${s}`,r=t===i,c=k(e.subject),d=k(e.body);return a.jsx(n.E.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3,delay:.1*s},children:(0,a.jsxs)(l.Zb,{children:[a.jsx(l.Ol,{children:(0,a.jsxs)("div",{className:"flex items-start justify-between gap-4",children:[(0,a.jsxs)("div",{className:"flex gap-4",children:[(0,a.jsxs)("div",{className:"flex flex-col items-center",children:[a.jsx("div",{className:"w-12 h-12 rounded-full bg-pipeline/10 border-2 border-pipeline flex items-center justify-center",children:(0,a.jsxs)("span",{className:"text-sm font-bold text-pipeline",children:["D",e.day]})}),s<N.emails.length-1&&a.jsx("div",{className:"w-0.5 h-16 bg-border-subtle mt-2"})]}),(0,a.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2 mb-2",children:[a.jsx(j.Z,{className:"w-4 h-4 text-text-tertiary"}),(0,a.jsxs)("span",{className:"text-sm text-text-secondary",children:["Day ",e.day," ",0===s?"(Initial Outreach)":s===N.emails.length-1?"(Break-up)":"(Follow-up)"]})]}),(0,a.jsxs)(l.ll,{className:"text-base",children:["Subject: ",c]})]})]}),a.jsx(o.z,{variant:"secondary",size:"sm",onClick:()=>w(d,i),children:r?(0,a.jsxs)(a.Fragment,{children:[a.jsx(u,{className:"w-4 h-4 mr-1.5"}),"Copied!"]}):(0,a.jsxs)(a.Fragment,{children:[a.jsx(b,{className:"w-4 h-4 mr-1.5"}),"Copy"]})})]})}),(0,a.jsxs)(l.aY,{children:[a.jsx("div",{className:"bg-surface-subtle rounded-lg p-4 border border-border-subtle",children:a.jsx("pre",{className:"text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed",children:d})}),e.personalizationTags.length>0&&(0,a.jsxs)("div",{className:"mt-4 flex items-center gap-2 flex-wrap",children:[a.jsx("span",{className:"text-xs font-semibold text-text-secondary",children:"Personalization tags:"}),e.personalizationTags.map(e=>a.jsx("span",{className:"inline-flex items-center px-2 py-1 rounded-md bg-pipeline/10 text-pipeline text-xs font-mono",children:`{{${e}}}`},e))]}),a.jsx("div",{className:"mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg",children:(0,a.jsxs)("div",{className:"flex items-start gap-2",children:[a.jsx(g.Z,{className:"w-4 h-4 text-warning mt-0.5 flex-shrink-0"}),(0,a.jsxs)("div",{className:"text-xs",children:[a.jsx("p",{className:"font-semibold text-warning mb-1",children:"Timing"}),a.jsx("p",{className:"text-text-secondary",children:0===s?"Send immediately after qualifying prospect":`Send ${e.day} days after initial outreach${14===e.day?" (final follow-up)":""}`})]})]})})]})]})},s)})}),(0,a.jsxs)(l.Zb,{children:[a.jsx(l.Ol,{children:(0,a.jsxs)(l.ll,{className:"flex items-center gap-2",children:[a.jsx(v.Z,{className:"w-5 h-5 text-pipeline"}),"Campaign Insights"]})}),a.jsx(l.aY,{children:(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6",children:[(0,a.jsxs)("div",{children:[a.jsx("h4",{className:"text-sm font-semibold text-text-primary mb-3",children:"✅ Best Practices"}),(0,a.jsxs)("ul",{className:"space-y-2 text-sm text-text-secondary",children:[(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),a.jsx("span",{children:"Keep emails under 120 words"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),a.jsx("span",{children:"Single clear CTA per email"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),a.jsx("span",{children:"Reference specific pain points"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-revenue mt-0.5",children:"•"}),a.jsx("span",{children:"Show credibility briefly"})]})]})]}),(0,a.jsxs)("div",{children:[a.jsx("h4",{className:"text-sm font-semibold text-text-primary mb-3",children:"❌ Avoid"}),(0,a.jsxs)("ul",{className:"space-y-2 text-sm text-text-secondary",children:[(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-danger mt-0.5",children:"•"}),a.jsx("span",{children:"“Hope this email finds you well”"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-danger mt-0.5",children:"•"}),a.jsx("span",{children:"Wall of text paragraphs"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-danger mt-0.5",children:"•"}),a.jsx("span",{children:"Multiple competing CTAs"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-danger mt-0.5",children:"•"}),a.jsx("span",{children:"Generic “one-size-fits-all” pitch"})]})]})]}),(0,a.jsxs)("div",{children:[a.jsx("h4",{className:"text-sm font-semibold text-text-primary mb-3",children:"\uD83D\uDCA1 Personalization"}),(0,a.jsxs)("ul",{className:"space-y-2 text-sm text-text-secondary",children:[(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),a.jsx("span",{children:"Research LinkedIn before sending"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),a.jsx("span",{children:"Reference company growth or news"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),a.jsx("span",{children:"Adjust pain points to industry"})]}),(0,a.jsxs)("li",{className:"flex items-start gap-2",children:[a.jsx("span",{className:"text-pipeline mt-0.5",children:"•"}),a.jsx("span",{children:"Match tone to recipient seniority"})]})]})]})]})})]})]})]})}},8422:(e,s,t)=>{"use strict";t.d(s,{R:()=>c});var a=t(2295),i=t(1626),n=t(7292),r=t(9843),l=t(6407);let o={default:{border:"border-border",icon:"text-text-tertiary"},success:{border:"border-revenue/30",icon:"text-revenue"},warning:{border:"border-warning/30",icon:"text-warning"},danger:{border:"border-danger/30",icon:"text-danger"}};function c({label:e,value:s,trend:t,icon:c,variant:d="default",onClick:p,delay:m=0}){let h=o[d],x=void 0!==t&&t>=0;return a.jsx(n.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.4,delay:m},whileHover:{scale:p?1.02:1},onClick:p,className:(0,i.cn)("relative bg-surface-raised border rounded-xl p-5 transition-all duration-300",h.border,p&&"cursor-pointer hover:border-border-accent hover:bg-surface-overlay"),children:(0,a.jsxs)("div",{className:"flex items-start justify-between",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[a.jsx("span",{className:"text-text-tertiary text-xs uppercase tracking-wider font-medium block",children:e}),a.jsx("span",{className:"font-mono text-2xl md:text-3xl font-bold text-text-primary tabular-nums",children:s}),void 0!==t&&(0,a.jsxs)("span",{className:(0,i.cn)("inline-flex items-center gap-0.5 text-xs font-medium",x?"text-revenue":"text-danger"),children:[x?a.jsx(r.Z,{className:"w-3 h-3"}):a.jsx(l.Z,{className:"w-3 h-3"}),Math.abs(t).toFixed(1),"%"]})]}),c&&a.jsx("div",{className:(0,i.cn)("p-2 rounded-lg bg-surface-subtle",h.icon),children:a.jsx(c,{className:"w-5 h-5"})})]})})}},2755:(e,s,t)=>{"use strict";t.d(s,{j:()=>i,m:()=>a});let a=[{id:"servicetitan-complex",name:"ServiceTitan Too Complex",description:"Target operations leaders struggling with platform complexity",targetPersona:"COO/Ops Director at 10-50 tech companies using ServiceTitan",hook:"Acknowledge the platform complexity pain",emails:[{day:1,subject:"Is {{COMPANY}}'s field service software worth the complexity?",body:`Hi {{FIRST_NAME}},

Quick question: Are you getting $300/tech/month in value from your field service platform?

I ask because I keep hearing the same thing from operations leaders at companies your size:

"It's too big. My people are scared to dive in. We only use the bare features."

I help field service companies get the reporting and visibility they actually need — without replacing your existing tools or a 12-month implementation.

Worth a 15-minute call to see if it fits?

Cody

P.S. — I built dashboards for a 500+ branch operation. Happy to share what actually moved the needle.`,personalizationTags:["COMPANY","FIRST_NAME"]},{day:3,subject:"Re: Is {{COMPANY}}'s field service software worth the complexity?",body:`Hi {{FIRST_NAME}},

Quick stat that might resonate:

The average field service company spends **30% of admin time** just reconciling data between systems.

That's not a software problem — it's a visibility problem.

Still curious if this is worth discussing?

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:7,subject:"How a 500-branch operation got real visibility",body:`Hi {{FIRST_NAME}},

One more thought, then I'll stop bugging you.

I recently helped a $6.9B field service company solve their lead traceability problem. They were losing track of 30-40% of leads between systems.

Within 60 days, we had dashboards that showed exactly where leads were dropping — no new platform, no 6-month implementation.

If {{COMPANY}} has a similar visibility gap, happy to share the approach.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:14,subject:"Closing the loop",body:`Hi {{FIRST_NAME}},

Wanted to follow up one last time.

If the timing isn't right, no worries — I'll close the loop on my end.

If things change and you want to explore getting better ops visibility without the platform overhead, I'm an email away.

Thanks for your time.

Cody`,personalizationTags:["FIRST_NAME"]}],stats:{sent:0,opened:0,replied:0,meetings:0}},{id:"spreadsheet-hell",name:"Spreadsheet Hell",description:"Target companies drowning in manual data reconciliation",targetPersona:"Ops leaders exporting to Excel for real analysis",hook:"30% of admin time wasted on manual reporting",emails:[{day:1,subject:"How many hours does {{COMPANY}} spend reconciling data?",body:`Hi {{FIRST_NAME}},

Quick question: How much time does your operations team spend each week pulling data from different systems into spreadsheets?

I'm guessing it's more than you'd like.

Most field service companies I talk to have great tools — CRM, dispatch, accounting — but they're all disconnected. So every Monday morning starts with exports and vlookups.

I help operations leaders get a single source of truth without replacing what's working.

Worth 15 minutes to explore?

Cody

P.S. — One client cut their weekly reporting time from 12 hours to 20 minutes. Same insights, 97% less manual work.`,personalizationTags:["COMPANY","FIRST_NAME"]},{day:3,subject:"Re: How many hours does {{COMPANY}} spend reconciling data?",body:`Hi {{FIRST_NAME}},

Following up on my note about data reconciliation.

Here's what I've seen work:

Instead of replacing your existing systems (expensive, risky, time-consuming), we connect them. Your team keeps using what they know. You get the unified dashboards you've been building in Excel.

Most pilots show value within 60 days.

Interested in learning more?

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:7,subject:"The real cost of manual reporting",body:`Hi {{FIRST_NAME}},

One more thing to consider:

If your operations team spends 10 hours/week reconciling data, that's:
- 520 hours per year
- At a $75K ops manager salary: ~$37K in labor cost
- Plus the opportunity cost of not doing strategic work

What if you could redeploy that time to actually improving operations instead of just reporting on them?

That's what CompassIQ does for {{COMPANY}}-sized operations.

Happy to share a quick example if you're curious.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:14,subject:"Last note on data visibility",body:`Hi {{FIRST_NAME}},

I'll keep this short.

If manual reporting is eating your team's time and you want to explore alternatives, I'm here.

If not, no hard feelings — I'll close the loop.

Either way, hope {{COMPANY}} finds the right solution.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}},{id:"post-growth-chaos",name:"Post-Growth Chaos",description:"Target companies that grew fast and lost operational visibility",targetPersona:"COO/Owner at rapidly growing field service companies",hook:"Growth exposed visibility gaps",emails:[{day:1,subject:"{{COMPANY}}'s growth is impressive. Can your ops keep up?",body:`Hi {{FIRST_NAME}},

Congrats on {{COMPANY}}'s growth — it's clear you're doing something right.

But I've noticed a pattern: Companies that grow from 10 to 30+ technicians often hit an operational wall.

What worked at smaller scale (tribal knowledge, spreadsheets, gut feel) breaks down. You lose visibility. Things slip through cracks.

I help operations leaders build the dashboards and alerts they need to scale without chaos.

Worth 15 minutes to compare notes?

Cody

P.S. — I built ops intelligence for a company that went from 20 to 500+ branches. Happy to share what worked.`,personalizationTags:["COMPANY","FIRST_NAME"]},{day:3,subject:"Re: {{COMPANY}}'s growth is impressive",body:`Hi {{FIRST_NAME}},

Following up on scaling operations.

Three questions most growing field service companies struggle with:

1. Which technicians are actually profitable?
2. Where are leads dropping in our process?
3. Are we on track to hit our revenue targets?

If {{COMPANY}} doesn't have instant answers to these, you're not alone.

Most companies your size have the data — it's just trapped in different systems.

Want to fix that?

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:7,subject:"The hidden cost of scaling without visibility",body:`Hi {{FIRST_NAME}},

One last insight on operational scaling:

The companies that grow successfully share one trait — they can see problems BEFORE they become expensive mistakes.

Late payments? They get alerts.
Technician utilization dropping? Dashboard shows it.
Lead response time increasing? They know immediately.

If {{COMPANY}} is scaling, you need this level of visibility.

I can show you how we've built this for similar operations. Interested?

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]},{day:14,subject:"Final follow-up",body:`Hi {{FIRST_NAME}},

Last note, promise.

If operational visibility is on your radar and you want to explore options, I'm available.

If timing isn't right, totally understand — scaling is busy.

Best of luck with {{COMPANY}}'s continued growth.

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}}],i={totalCampaigns:a.length,totalEmails:a.reduce((e,s)=>e+s.emails.length,0),avgEmailsPerCampaign:Math.round(a.reduce((e,s)=>e+s.emails.length,0)/a.length),totalSent:a.reduce((e,s)=>e+(s.stats?.sent||0),0),totalReplies:a.reduce((e,s)=>e+(s.stats?.replied||0),0),totalMeetings:a.reduce((e,s)=>e+(s.stats?.meetings||0),0)}},6407:(e,s,t)=>{"use strict";t.d(s,{Z:()=>a});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,t(9224).Z)("ArrowDownRight",[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]])},9843:(e,s,t)=>{"use strict";t.d(s,{Z:()=>a});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,t(9224).Z)("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]])},5794:(e,s,t)=>{"use strict";t.d(s,{Z:()=>a});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,t(9224).Z)("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]])},5545:(e,s,t)=>{"use strict";t.d(s,{Z:()=>a});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,t(9224).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},3067:(e,s,t)=>{"use strict";t.r(s),t.d(s,{$$typeof:()=>n,__esModule:()=>i,default:()=>r});let a=(0,t(6843).createProxy)(String.raw`/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/campaigns/page.tsx`),{__esModule:i,$$typeof:n}=a,r=a.default}};var s=require("../../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),a=s.X(0,[84,742,285],()=>t(707));module.exports=a})();