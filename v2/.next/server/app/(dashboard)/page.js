(()=>{var e={};e.id=130,e.ids=[130],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9942:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>r.a,__next_app__:()=>p,originalPathname:()=>m,pages:()=>d,routeModule:()=>h,tree:()=>c});var a=s(482),i=s(9108),n=s(2563),r=s.n(n),o=s(8300),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);s.d(t,l);let c=["",{children:["(dashboard)",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,4204)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/page.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,6048)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,9361,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,2917)),"/home/clasak/Projects/CompassIQ/v2/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,9361,23)),"next/dist/client/components/not-found-error"]}],d=["/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/page.tsx"],m="/(dashboard)/page",p={require:s,loadChunk:()=>Promise.resolve()},h=new a.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(dashboard)/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},2053:(e,t,s)=>{Promise.resolve().then(s.bind(s,2156))},2156:(e,t,s)=>{"use strict";s.r(t),s.d(t,{CommandCenter:()=>k});var a=s(2295),i=s(7292),n=s(4447),r=s(9849),o=s(8422),l=s(1351),c=s(8100),d=s(763),m=s(5622),p=s(1626),h=s(181),u=s(4433),g=s(2755),x=s(9200),y=s(9895),v=s(1206),b=s(8411),j=s(6064),f=s(5299),w=s(4290),N=s(3037),C=s(5961),P=s(783),T=s.n(P);function k(){return(0,a.jsxs)("div",{className:"space-y-8",children:[a.jsx(n.m,{title:"Command Center",description:"\uD83D\uDE80 Launch Day - Ready to execute with 21 researched leads and 3 proven campaigns",actions:(0,a.jsxs)("div",{className:"flex items-center gap-4",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2 text-sm text-pipeline",children:[(0,a.jsxs)("span",{className:"relative flex h-2 w-2",children:[a.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-pipeline opacity-75"}),a.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-pipeline"})]}),"Launch Day"]}),(0,a.jsxs)(c.z,{variant:"secondary",size:"sm",children:[a.jsx(x.Z,{className:"w-4 h-4 mr-2"}),"Ready to Execute"]})]})}),(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",children:[a.jsx("div",{children:a.jsx(r.i,{label:"Revenue (Day 1)",value:(0,p.xG)(h.su.revenue.current),trend:h.su.revenue.trend,trendLabel:"Launching today!",variant:"neutral",size:"lg",sparkline:h.su.revenue.sparkline,delay:0})}),a.jsx("div",{children:a.jsx(r.i,{label:"Pipeline Potential (21 Leads)",value:(0,p.xG)(h.su.pipeline.current),trend:h.su.pipeline.trend,trendLabel:"Researched & ready",variant:"pipeline",size:"lg",sparkline:h.su.pipeline.sparkline,delay:.1})})]}),(0,a.jsxs)("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[a.jsx(T(),{href:"/leads",className:"block",children:a.jsx(o.R,{label:"Researched Leads",value:`${u.Z.total}+`,icon:y.Z,variant:"success",delay:.2})}),a.jsx(T(),{href:"/campaigns",className:"block",children:a.jsx(o.R,{label:"Ready Campaigns",value:`${g.j.totalCampaigns}`,icon:v.Z,variant:"success",delay:.25})}),a.jsx(o.R,{label:"Pipeline Value",value:`$${(u.Z.totalValue/1e3).toFixed(0)}K`,icon:b.Z,variant:"success",delay:.3}),a.jsx(o.R,{label:"Avg Deal Size",value:`$${(u.Z.avgValue/1e3).toFixed(0)}K`,icon:j.Z,variant:"default",delay:.35})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",children:[a.jsx(T(),{href:"/leads",children:(0,a.jsxs)(l.Zb,{className:"h-full hover:border-pipeline transition-all cursor-pointer group",children:[a.jsx(l.Ol,{children:(0,a.jsxs)("div",{className:"flex items-start justify-between",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)(l.ll,{className:"flex items-center gap-2 group-hover:text-pipeline transition-colors",children:[a.jsx(y.Z,{className:"w-5 h-5"}),u.Z.total,"+ Researched Leads"]}),a.jsx(l.SZ,{className:"mt-2",children:"Texas field service companies ready for outreach"})]}),a.jsx(f.Z,{className:"w-5 h-5 text-text-tertiary group-hover:text-pipeline transition-all group-hover:translate-x-1"})]})}),(0,a.jsxs)(l.aY,{children:[(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4 text-sm",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"text-2xl font-bold text-pipeline",children:["$",(u.Z.totalValue/1e3).toFixed(0),"K"]}),a.jsx("div",{className:"text-text-secondary",children:"Total Value"})]}),(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"text-2xl font-bold text-revenue",children:["$",(u.Z.avgValue/1e3).toFixed(0),"K"]}),a.jsx("div",{className:"text-text-secondary",children:"Avg Deal"})]})]}),a.jsx("div",{className:"mt-4 pt-4 border-t border-border-subtle",children:(0,a.jsxs)("div",{className:"flex items-center gap-2 text-sm text-text-secondary",children:[a.jsx("span",{className:"w-2 h-2 rounded-full bg-revenue"}),a.jsx("span",{children:"HVAC, Plumbing, Electrical, Pest Control"})]})})]})]})}),a.jsx(T(),{href:"/campaigns",children:(0,a.jsxs)(l.Zb,{className:"h-full hover:border-pipeline transition-all cursor-pointer group",children:[a.jsx(l.Ol,{children:(0,a.jsxs)("div",{className:"flex items-start justify-between",children:[(0,a.jsxs)("div",{children:[(0,a.jsxs)(l.ll,{className:"flex items-center gap-2 group-hover:text-pipeline transition-colors",children:[a.jsx(v.Z,{className:"w-5 h-5"}),g.j.totalCampaigns," Proven Outreach Campaigns"]}),a.jsx(l.SZ,{className:"mt-2",children:"Ready-to-use email sequences that convert"})]}),a.jsx(f.Z,{className:"w-5 h-5 text-text-tertiary group-hover:text-pipeline transition-all group-hover:translate-x-1"})]})}),(0,a.jsxs)(l.aY,{children:[(0,a.jsxs)("div",{className:"grid grid-cols-2 gap-4 text-sm",children:[(0,a.jsxs)("div",{children:[a.jsx("div",{className:"text-2xl font-bold text-pipeline",children:g.j.totalEmails}),a.jsx("div",{className:"text-text-secondary",children:"Total Emails"})]}),(0,a.jsxs)("div",{children:[a.jsx("div",{className:"text-2xl font-bold text-revenue",children:"14 days"}),a.jsx("div",{className:"text-text-secondary",children:"Per Sequence"})]})]}),a.jsx("div",{className:"mt-4 pt-4 border-t border-border-subtle",children:(0,a.jsxs)("div",{className:"flex flex-col gap-2 text-xs text-text-secondary",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[a.jsx(w.Z,{className:"w-3.5 h-3.5 text-revenue"}),a.jsx("span",{children:"ServiceTitan complexity angle"})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[a.jsx(w.Z,{className:"w-3.5 h-3.5 text-revenue"}),a.jsx("span",{children:"Spreadsheet hell pain points"})]})]})})]})]})})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6",children:[(0,a.jsxs)(l.Zb,{className:"lg:col-span-2",children:[(0,a.jsxs)(l.Ol,{children:[(0,a.jsxs)("div",{children:[a.jsx(l.ll,{children:"Launch Readiness"}),a.jsx(l.SZ,{children:"21 leads researched, 3 campaigns ready - starting outreach this week"})]}),a.jsx(T(),{href:"/leads",children:(0,a.jsxs)(c.z,{variant:"ghost",size:"sm",children:["View All Leads",a.jsx(f.Z,{className:"w-4 h-4 ml-1"})]})})]}),(0,a.jsxs)(l.aY,{children:[a.jsx(m.G,{stages:h.ci}),a.jsx("div",{className:"mt-6 pt-4 border-t border-border-subtle",children:(0,a.jsxs)("p",{className:"text-sm text-text-secondary text-center",children:[a.jsx("strong",{className:"text-pipeline",children:"Day 1 Status:"})," Foundation built, campaigns loaded, ready to execute \uD83D\uDE80"]})})]})]}),(0,a.jsxs)(l.Zb,{children:[a.jsx(l.Ol,{children:(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[a.jsx(N.Z,{className:"w-5 h-5 text-warning"}),a.jsx(l.ll,{children:"Action Required"})]})}),a.jsx(l.aY,{className:"space-y-4",children:h.$u.map((e,t)=>a.jsx(i.E.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},transition:{duration:.3,delay:.1*t},className:`p-4 rounded-lg border ${"danger"===e.type?"bg-danger-muted border-danger/30":"warning"===e.type?"bg-warning-muted border-warning/30":"bg-pipeline-muted border-pipeline/30"}`,children:(0,a.jsxs)("div",{className:"flex items-start gap-3",children:[a.jsx(C.Z,{className:`w-4 h-4 mt-0.5 ${"danger"===e.type?"text-danger":"warning"===e.type?"text-warning":"text-pipeline"}`}),(0,a.jsxs)("div",{className:"flex-1 min-w-0",children:[a.jsx("p",{className:"text-sm font-medium text-text-primary",children:e.title}),a.jsx("p",{className:"text-xs text-text-secondary mt-1",children:e.message}),a.jsx("p",{className:"text-xs text-text-tertiary mt-2",children:e.timestamp})]})]})},e.id))}),a.jsx(l.eW,{children:(0,a.jsxs)(c.z,{variant:"ghost",size:"sm",className:"w-full",children:["View All Alerts",a.jsx(f.Z,{className:"w-4 h-4 ml-1"})]})})]})]}),(0,a.jsxs)(l.Zb,{children:[(0,a.jsxs)(l.Ol,{children:[(0,a.jsxs)("div",{children:[a.jsx(l.ll,{children:"Active Opportunities"}),a.jsx(l.SZ,{children:"Deals in progress - outreach starting this week!"})]}),a.jsx(T(),{href:"/leads",children:(0,a.jsxs)(c.z,{variant:"secondary",size:"sm",children:["View All Leads",a.jsx(f.Z,{className:"w-4 h-4 ml-1"})]})})]}),a.jsx(l.aY,{children:0===h.Kp.length?(0,a.jsxs)("div",{className:"py-12 text-center",children:[a.jsx("div",{className:"inline-flex items-center justify-center w-16 h-16 rounded-full bg-pipeline-muted mb-4",children:a.jsx(x.Z,{className:"w-8 h-8 text-pipeline"})}),a.jsx("h3",{className:"text-lg font-semibold text-text-primary mb-2",children:"Ready to Launch"}),a.jsx("p",{className:"text-text-secondary mb-4 max-w-md mx-auto",children:"21 researched leads ready for outreach. First campaigns launching this week. Check back soon to see deals in motion!"}),a.jsx(T(),{href:"/leads",children:(0,a.jsxs)(c.z,{variant:"secondary",children:[a.jsx(y.Z,{className:"w-4 h-4 mr-2"}),"View Researched Leads"]})})]}):a.jsx(d.wQ,{data:h.Kp,columns:[{key:"name",label:"Deal",render:e=>(0,a.jsxs)("div",{children:[a.jsx("span",{className:"font-medium text-text-primary",children:e.name}),a.jsx("span",{className:"block text-xs text-text-tertiary",children:e.account})]})},{key:"value",label:"Value",align:"right",render:e=>a.jsx(d.Az,{value:e.value})},{key:"stage",label:"Stage",render:e=>a.jsx(d.OE,{status:e.stage,variant:"Negotiation"===e.stage?"success":"Proposal"===e.stage?"info":"default"})},{key:"probability",label:"Probability",align:"center",render:e=>(0,a.jsxs)("span",{className:`font-mono text-sm tabular-nums ${e.probability>=70?"text-revenue":e.probability>=40?"text-warning":"text-text-secondary"}`,children:[e.probability,"%"]})},{key:"closeDate",label:"Expected Close",render:e=>a.jsx(d.TX,{value:e.closeDate})},{key:"owner",label:"Owner",render:e=>a.jsx("span",{className:"text-text-secondary",children:e.owner})}]})})]}),(0,a.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",children:[(0,a.jsxs)(l.Zb,{children:[(0,a.jsxs)(l.Ol,{children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[a.jsx(x.Z,{className:"w-5 h-5 text-pipeline"}),a.jsx(l.ll,{children:"Priority Tasks"})]}),(0,a.jsxs)(c.z,{variant:"ghost",size:"sm",children:["View All",a.jsx(f.Z,{className:"w-4 h-4 ml-1"})]})]}),a.jsx(l.aY,{className:"space-y-3",children:h.Mr.map((e,t)=>(0,a.jsxs)(i.E.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.3,delay:.1*t},className:"flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle hover:border-border-accent transition-colors",children:[a.jsx("div",{className:`w-2 h-2 rounded-full mt-2 ${"urgent"===e.priority?"bg-danger":"high"===e.priority?"bg-warning":"bg-pipeline"}`}),(0,a.jsxs)("div",{className:"flex-1 min-w-0",children:[a.jsx("p",{className:"text-sm font-medium text-text-primary",children:e.title}),(0,a.jsxs)("div",{className:"flex items-center gap-2 mt-1",children:[a.jsx("span",{className:"text-xs text-text-tertiary",children:e.account}),a.jsx("span",{className:"text-text-tertiary",children:"\xb7"}),(0,a.jsxs)("span",{className:"text-xs text-text-tertiary",children:["Due ",new Date(e.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})]})]})]}),a.jsx("span",{className:"text-xs text-text-secondary",children:e.assignee.split(" ")[0]})]},e.id))})]}),(0,a.jsxs)(l.Zb,{children:[a.jsx(l.Ol,{children:(0,a.jsxs)("div",{children:[a.jsx(l.ll,{children:"Revenue Targets"}),a.jsx(l.SZ,{children:"Projected growth trajectory (Day 1 - targets only)"})]})}),(0,a.jsxs)(l.aY,{children:[a.jsx("div",{className:"space-y-4",children:h.kN.map((e,t)=>{let s=e.revenue>0?e.revenue/e.target*100:0,n=e.revenue>=e.target;return(0,a.jsxs)(i.E.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3,delay:.05*t},className:"space-y-2",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between text-sm",children:[a.jsx("span",{className:"text-text-secondary font-medium",children:e.month}),(0,a.jsxs)("div",{className:"flex items-center gap-3",children:[(0,a.jsxs)("span",{className:"font-mono text-text-tertiary tabular-nums text-xs",children:["Target: ",(0,p.xG)(e.target)]}),e.revenue>0&&a.jsx("span",{className:"font-mono text-text-primary tabular-nums",children:(0,p.xG)(e.revenue)})]})]}),(0,a.jsxs)("div",{className:"relative h-2 bg-surface-subtle rounded-full overflow-hidden",children:[a.jsx("div",{className:"absolute top-0 bottom-0 w-0.5 bg-text-tertiary z-10",style:{left:"100%"}}),e.revenue>0&&a.jsx(i.E.div,{initial:{width:0},animate:{width:`${Math.min(s,120)}%`},transition:{duration:.6,delay:.05*t+.2},className:`absolute top-0 bottom-0 left-0 rounded-full ${n?"bg-revenue":"bg-pipeline"}`})]})]},e.month)})}),a.jsx("div",{className:"mt-6 pt-4 border-t border-border-subtle",children:a.jsx("p",{className:"text-xs text-text-secondary text-center",children:"\uD83D\uDE80 Launch Day - Targets set, execution begins this week"})})]})]})]})]})}},2755:(e,t,s)=>{"use strict";s.d(t,{j:()=>i,m:()=>a});let a=[{id:"servicetitan-complex",name:"ServiceTitan Too Complex",description:"Target operations leaders struggling with platform complexity",targetPersona:"COO/Ops Director at 10-50 tech companies using ServiceTitan",hook:"Acknowledge the platform complexity pain",emails:[{day:1,subject:"Is {{COMPANY}}'s field service software worth the complexity?",body:`Hi {{FIRST_NAME}},

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

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}}],i={totalCampaigns:a.length,totalEmails:a.reduce((e,t)=>e+t.emails.length,0),avgEmailsPerCampaign:Math.round(a.reduce((e,t)=>e+t.emails.length,0)/a.length),totalSent:a.reduce((e,t)=>e+(t.stats?.sent||0),0),totalReplies:a.reduce((e,t)=>e+(t.stats?.replied||0),0),totalMeetings:a.reduce((e,t)=>e+(t.stats?.meetings||0),0)}},4433:(e,t,s)=>{"use strict";s.d(t,{Z:()=>i,p:()=>a});let a=[{id:"hts-texas",company:"HTS Texas",industry:"HVAC - Commercial",size:"50+ technicians",location:"Houston, TX",painPoints:["Complex multi-location operations","Commercial service coordination","Data scattered across systems"],status:"research",estimatedValue:45e3,priority:"high",notes:"Large commercial HVAC leader in Houston. Strong operations team."},{id:"malek-service",company:"Malek Service Company",industry:"HVAC - Commercial",size:"30-40 technicians",location:"Houston, TX",painPoints:["Commercial project tracking","Technician efficiency metrics","Manual reporting processes"],status:"research",estimatedValue:35e3,priority:"high",notes:"Medium-sized commercial HVAC with growth potential."},{id:"one-hour-heating",company:"One Hour Heating & Air",industry:"HVAC - Residential",size:"25-35 technicians",location:"Houston, TX",painPoints:["Franchise coordination","Multiple location visibility","ServiceTitan complexity concerns"],status:"research",estimatedValue:3e4,priority:"medium",notes:"Franchise operation with multiple Houston locations."},{id:"68-degrees",company:"68 Degrees HVAC",industry:"HVAC - Residential",size:"15-25 technicians",location:"Houston, TX",painPoints:["Growing team needs","Dispatch efficiency","Revenue visibility gaps"],status:"research",estimatedValue:25e3,priority:"medium",notes:"Growing residential HVAC company mentioned in Houston Chronicle."},{id:"air-specialist",company:"Air Specialist",industry:"HVAC - Residential",size:"20-30 technicians",location:"Houston, TX",painPoints:["Seasonal demand fluctuations","Capacity planning","Customer follow-up tracking"],status:"research",estimatedValue:28e3,priority:"medium"},{id:"affordable-comfort",company:"Affordable Comfort Heating & Air",industry:"HVAC - Residential",size:"15-20 technicians",location:"Dallas, TX",painPoints:["Job costing accuracy","Technician productivity","Parts inventory management"],status:"research",estimatedValue:22e3,priority:"medium"},{id:"power-plumbing",company:"Power Plumbing",industry:"Plumbing",size:"30-40 technicians",location:"Houston, TX",painPoints:["Operations team coordination","Multi-service line tracking","Lead conversion optimization"],status:"research",estimatedValue:38e3,priority:"high",notes:"Has dedicated operations leadership team - good fit for CompassIQ."},{id:"abacus-plumbing",company:"Abacus Plumbing",industry:"Plumbing",size:"40+ technicians",location:"Houston, TX",painPoints:["Large fleet management","Call center efficiency","Revenue per technician metrics"],status:"research",estimatedValue:42e3,priority:"high",notes:"Large Houston area plumbing company. Strong brand presence."},{id:"rooter-plus",company:"Rooter Plus Plumbing",industry:"Plumbing",size:"20-25 technicians",location:"Dallas, TX",painPoints:["Emergency service coordination","After-hours dispatch","Customer satisfaction tracking"],status:"research",estimatedValue:26e3,priority:"medium"},{id:"metro-flow-plumbing",company:"Metro Flow Plumbing",industry:"Plumbing",size:"25-30 technicians",location:"Dallas, TX",painPoints:["Commercial/residential split tracking","Maintenance contract management","Technician route optimization"],status:"research",estimatedValue:29e3,priority:"medium"},{id:"john-moore-electric",company:"John Moore Services (Electrical)",industry:"Electrical",size:"35+ technicians",location:"Houston, TX",painPoints:["Multi-trade coordination","Large team management","Project vs service tracking"],status:"research",estimatedValue:4e4,priority:"high",notes:"Part of larger multi-trade operation. Strong operations focus."},{id:"electric-today",company:"Electric Today",industry:"Electrical",size:"20-30 technicians",location:"Houston, TX",painPoints:["Commercial project bidding","Material cost tracking","Job profitability analysis"],status:"research",estimatedValue:32e3,priority:"medium"},{id:"bates-electric",company:"Bates Electric",industry:"Electrical",size:"25-35 technicians",location:"Austin, TX",painPoints:["Rapid growth management","Quality control processes","Customer communication gaps"],status:"research",estimatedValue:34e3,priority:"medium"},{id:"abc-pest-control",company:"ABC Home & Commercial Services",industry:"Pest Control",size:"100+ technicians",location:"Austin, TX",painPoints:["Recurring service optimization","Route density analytics","Customer retention tracking"],status:"research",estimatedValue:55e3,priority:"high",notes:"Large multi-service operation. High volume, recurring revenue model."},{id:"orkin-houston",company:"Orkin (Houston Franchise)",industry:"Pest Control",size:"40-50 technicians",location:"Houston, TX",painPoints:["Franchise reporting to corporate","Territory management","Seasonal demand planning"],status:"research",estimatedValue:38e3,priority:"medium"},{id:"bulwark-pest",company:"Bulwark Pest Control",industry:"Pest Control",size:"30-40 technicians",location:"Dallas, TX",painPoints:["Monthly service tracking","Customer lifecycle management","Technician productivity metrics"],status:"research",estimatedValue:33e3,priority:"medium"},{id:"trugreen-houston",company:"TruGreen (Houston)",industry:"Lawn Care",size:"35-45 technicians",location:"Houston, TX",painPoints:["Seasonal crew management","Service completion tracking","Weather impact analysis"],status:"research",estimatedValue:36e3,priority:"medium"},{id:"massey-services",company:"Massey Services",industry:"Lawn Care",size:"50+ technicians",location:"Dallas, TX",painPoints:["Multi-service bundling","Territory coverage optimization","Customer acquisition costs"],status:"research",estimatedValue:42e3,priority:"high"},{id:"us-lawns",company:"U.S. Lawns",industry:"Lawn Care - Commercial",size:"25-35 technicians",location:"Austin, TX",painPoints:["Commercial contract management","Crew efficiency tracking","Equipment utilization"],status:"research",estimatedValue:31e3,priority:"medium"},{id:"service-experts",company:"Service Experts",industry:"Multi-Trade (HVAC + Plumbing)",size:"60+ technicians",location:"Houston, TX",painPoints:["Cross-service coordination","Unified reporting needs","Complex dispatch logistics"],status:"research",estimatedValue:52e3,priority:"high",notes:"Large multi-trade operation. National brand with local ops challenges."},{id:"reliable-home-services",company:"Reliable Home Services",industry:"Multi-Trade",size:"30-40 technicians",location:"San Antonio, TX",painPoints:["Service type profitability","Cross-sell tracking","Technician specialization management"],status:"research",estimatedValue:37e3,priority:"medium"}],i={total:a.length,byStatus:{research:a.filter(e=>"research"===e.status).length,outreach:a.filter(e=>"outreach"===e.status).length,"call-scheduled":a.filter(e=>"call-scheduled"===e.status).length,proposal:a.filter(e=>"proposal"===e.status).length,won:a.filter(e=>"won"===e.status).length,lost:a.filter(e=>"lost"===e.status).length},byIndustry:a.reduce((e,t)=>(e[t.industry]=(e[t.industry]||0)+1,e),{}),totalValue:a.reduce((e,t)=>e+t.estimatedValue,0),avgValue:Math.round(a.reduce((e,t)=>e+t.estimatedValue,0)/a.length)}},5961:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(9224).Z)("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]])},4290:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,s(9224).Z)("CheckCircle2",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},4204:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>c});var a=s(5036),i=s(6843);let n=(0,i.createProxy)(String.raw`/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/command-center.tsx`),{__esModule:r,$$typeof:o}=n;n.default;let l=(0,i.createProxy)(String.raw`/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/command-center.tsx#CommandCenter`);function c(){return a.jsx(l,{})}}};var t=require("../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[84,742,285,413],()=>s(9942));module.exports=a})();