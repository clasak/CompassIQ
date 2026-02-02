(()=>{var e={};e.id=130,e.ids=[130],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9942:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>r.a,__next_app__:()=>p,originalPathname:()=>h,pages:()=>d,routeModule:()=>m,tree:()=>c});var s=a(482),i=a(9108),n=a(2563),r=a.n(n),l=a(8300),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);a.d(t,o);let c=["",{children:["(dashboard)",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,4204)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/page.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,6048)),"/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,9361,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,2917)),"/home/clasak/Projects/CompassIQ/v2/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,9361,23)),"next/dist/client/components/not-found-error"]}],d=["/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/page.tsx"],h="/(dashboard)/page",p={require:a,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(dashboard)/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},2053:(e,t,a)=>{Promise.resolve().then(a.bind(a,752))},752:(e,t,a)=>{"use strict";a.r(t),a.d(t,{CommandCenter:()=>Z});var s=a(2295),i=a(7292),n=a(4447),r=a(9849),l=a(8422),o=a(1351),c=a(8100),d=a(1626);function h({data:e,columns:t,onRowClick:a,emptyMessage:n="No data available",className:r}){return 0===e.length?s.jsx("div",{className:"flex items-center justify-center h-32 text-text-tertiary text-sm",children:n}):s.jsx("div",{className:(0,d.cn)("overflow-x-auto",r),children:(0,s.jsxs)("table",{className:"w-full",children:[s.jsx("thead",{children:s.jsx("tr",{className:"border-b border-border-subtle",children:t.map(e=>s.jsx("th",{className:(0,d.cn)("text-xs uppercase tracking-wider text-text-tertiary font-medium py-3 px-4","right"===e.align?"text-right":"center"===e.align?"text-center":"text-left"),style:{width:e.width},children:e.label},e.key))})}),s.jsx("tbody",{children:e.map((e,n)=>s.jsx(i.E.tr,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.3,delay:.05*n},onClick:()=>a?.(e),className:(0,d.cn)("border-b border-border-subtle transition-colors",a&&"cursor-pointer hover:bg-surface-overlay"),children:t.map(t=>s.jsx("td",{className:(0,d.cn)("py-3 px-4 text-sm","right"===t.align?"text-right":"center"===t.align?"text-center":"text-left"),children:t.render?t.render(e):e[t.key]},t.key))},e.id))})]})})}function p({status:e,variant:t="default"}){return s.jsx("span",{className:(0,d.cn)("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",{success:"bg-revenue-muted text-revenue border-revenue/30",warning:"bg-warning-muted text-warning border-warning/30",danger:"bg-danger-muted text-danger border-danger/30",info:"bg-pipeline-muted text-pipeline border-pipeline/30",default:"bg-surface-subtle text-text-secondary border-border"}[t]),children:e})}function m({value:e}){return s.jsx("span",{className:"font-mono text-text-primary tabular-nums",children:(0,d.xG)(e)})}function u({value:e}){return s.jsx("span",{className:"text-text-secondary",children:(0,d.p6)(e)})}let x=["bg-pipeline","bg-blue-400","bg-blue-300","bg-revenue","bg-emerald-400"];function g({stages:e,className:t}){let a=Math.max(...e.map(e=>e.count));return s.jsx("div",{className:(0,d.cn)("space-y-3",t),children:e.map((t,n)=>{let r=a>0?t.count/a*100:0,l=n===e.length-1;return(0,s.jsxs)(i.E.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.4,delay:.1*n},className:"relative",children:[(0,s.jsxs)("div",{className:"flex items-center gap-4",children:[s.jsx("div",{className:"w-28 flex-shrink-0",children:s.jsx("span",{className:"text-sm font-medium text-text-primary",children:t.name})}),(0,s.jsxs)("div",{className:"flex-1 relative h-10",children:[s.jsx("div",{className:"absolute inset-0 bg-surface-subtle rounded-lg"}),(0,s.jsxs)(i.E.div,{initial:{width:0},animate:{width:`${r}%`},transition:{duration:.6,delay:.1*n+.2},className:(0,d.cn)("absolute inset-y-0 left-0 rounded-lg flex items-center justify-between px-4",x[n%x.length]),style:{minWidth:r>0?"80px":"0"},children:[s.jsx("span",{className:"font-mono text-sm font-semibold text-white tabular-nums",children:t.count}),s.jsx("span",{className:"font-mono text-xs text-white/80 tabular-nums",children:(0,d.xG)(t.value)})]})]}),!l&&void 0!==t.conversion&&s.jsx("div",{className:"w-16 flex-shrink-0 text-right",children:(0,s.jsxs)("span",{className:(0,d.cn)("text-xs font-medium tabular-nums",t.conversion>=30?"text-revenue":t.conversion>=15?"text-warning":"text-danger"),children:[t.conversion.toFixed(0),"%"]})})]}),!l&&(0,s.jsxs)("div",{className:"flex items-center gap-4 h-4",children:[s.jsx("div",{className:"w-28"}),s.jsx("div",{className:"flex-1 flex justify-center",children:s.jsx("svg",{className:"w-4 h-4 text-border-accent",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:s.jsx("path",{d:"M12 5v14M19 12l-7 7-7-7"})})}),s.jsx("div",{className:"w-16"})]})]},t.name)})})}let y={total:110,byStatus:{research:110,outreach:0,"call-scheduled":0,proposal:0,won:0,lost:0},byIndustry:{HVAC:14,Plumbing:9,"Pest Control":18,Electrical:6,"Multi-Service (HVAC/Plumbing/Electrical)":4,"Pool Service":4,"HVAC/Plumbing":11,"Plumbing/HVAC":3,"Multi-Service (Plumbing/HVAC/Electrical)":1,"Multi-Service (Plumbing/HVAC)":1,"Multi-Service (HVAC/Plumbing/Electrical/Roofing)":1,"Multi-Service (Pest/HVAC/Lawn)":1,Roofing:6,Landscaping:3,"Multi-Service":11,"HVAC/Electrical":1,"Commercial HVAC":3,"Mechanical/Electrical/Plumbing":1,"Multi-Service (HVAC/Plumbing)":1,"Plumbing/HVAC/Electrical":1,"HVAC/Plumbing/Electrical":3,"Plumbing/Electrical/HVAC":1,"HVAC/Electrical/Plumbing/Roofing":1,"HVAC/Electrical/Plumbing":1,"Pool Building":1,"Fiberglass Pools":1,"Pool Repair/Remodel":1,"Commercial Pest Control":1},totalValue:4017e3,avgValue:36518};var b=a(2755),f=a(6972),v=a(3729),j=a(9046),w=a(3733),N=a(9895),k=a(1206),C=a(8411),P=a(6064),S=a(5299),A=a(4290),E=a(3037);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let M=(0,a(9224).Z)("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);var T=a(9200),I=a(5904),O=a(783),R=a.n(O);function Z(){let{stats:e,isLoading:t,error:a,fetchStats:x}=(0,f.v)(),{stats:O,campaigns:Z,isLoading:Y}=function(){let[e,t]=(0,v.useState)([]),[a,s]=(0,v.useState)(null),[i,n]=(0,v.useState)(!0),[r,l]=(0,v.useState)(null),o=(0,v.useCallback)(async()=>{try{n(!0);let e=await fetch("/api/campaigns");if(!e.ok)throw Error("Failed to fetch campaigns");let a=await e.json();t(a.campaigns||[]);let i=a.campaigns||[];s({totalCampaigns:i.length,activeCampaigns:i.filter(e=>"active"===e.status).length,totalLeadsEnrolled:i.reduce((e,t)=>e+(t.leads_enrolled||0),0),totalEmailsSent:i.reduce((e,t)=>e+(t.emails_sent||0),0),totalOpens:i.reduce((e,t)=>e+(t.opens||0),0),totalReplies:i.reduce((e,t)=>e+(t.replies||0),0),totalMeetings:i.reduce((e,t)=>e+(t.meetings_booked||0),0)}),l(null)}catch(e){l(e instanceof Error?e.message:"Unknown error")}finally{n(!1)}},[]),c=(0,v.useCallback)(async(e,t)=>{let a=await fetch("/api/campaigns/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({campaignId:e,leadIds:t})});if(!a.ok)throw Error("Failed to start campaign");let s=await a.json();return await o(),s},[o]),d=(0,v.useCallback)(async e=>{let a=await fetch("/api/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok)throw Error("Failed to create campaign");let s=await a.json();return t(e=>[s.campaign,...e]),s.campaign},[]);return(0,v.useEffect)(()=>{o()},[o]),{campaigns:e,stats:a,isLoading:i,error:r,fetchCampaigns:o,startCampaign:c,createCampaign:d}}(),{deals:F,pipeline:_,isLoading:H}=function(){let[e,t]=(0,v.useState)([]),[a,s]=(0,v.useState)(null),[i,n]=(0,v.useState)(!0),[r,l]=(0,v.useState)(null),o=(0,v.useCallback)(async()=>{try{n(!0);let e=await fetch("/api/deals");if(!e.ok)throw Error("Failed to fetch deals");let a=await e.json();t(a.deals||[]);let i=a.deals||[];s({total:i.reduce((e,t)=>e+(t.value||0),0),weighted:i.reduce((e,t)=>e+(t.value||0)*(t.probability||0)/100,0),count:i.length,byStage:["discovery","qualification","proposal","negotiation","closed-won"].map(e=>({stage:e,count:i.filter(t=>t.stage===e).length,value:i.filter(t=>t.stage===e).reduce((e,t)=>e+(t.value||0),0)}))}),l(null)}catch(e){l(e instanceof Error?e.message:"Unknown error")}finally{n(!1)}},[]),c=(0,v.useCallback)(async e=>{let a=await fetch("/api/deals",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok)throw Error("Failed to create deal");let s=await a.json();return t(e=>[s.deal,...e]),s.deal},[]);return(0,v.useEffect)(()=>{o()},[o]),{deals:e,pipeline:a,isLoading:i,error:r,fetchDeals:o,createDeal:c}}(),{tasks:z,isLoading:V}=function(){let[e,t]=(0,v.useState)([]),[a,s]=(0,v.useState)(!0),[i,n]=(0,v.useState)(null),r=(0,v.useCallback)(async()=>{try{s(!0);let e=await fetch("/api/tasks");if(!e.ok)throw Error("Failed to fetch tasks");let a=await e.json();t(a.tasks||[]),n(null)}catch(e){n(e instanceof Error?e.message:"Unknown error")}finally{s(!1)}},[]),l=(0,v.useCallback)(async e=>{let a=await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok)throw Error("Failed to create task");let s=await a.json();return t(e=>[s.task,...e]),s.task},[]);return(0,v.useEffect)(()=>{r()},[r]),{tasks:e,isLoading:a,error:i,fetchTasks:r,createTask:l}}(),W=e||y,L=O||b.jE,D=!!e&&!a,$=_?.byStage?.map(e=>({name:e.stage.charAt(0).toUpperCase()+e.stage.slice(1).replace("-"," "),stage:e.stage.charAt(0).toUpperCase()+e.stage.slice(1).replace("-"," "),count:e.count,value:e.value}))||[],q=F.slice(0,5).map(e=>({id:e.id,name:e.name,account:e.company,value:e.value,stage:e.stage.charAt(0).toUpperCase()+e.stage.slice(1).replace("-"," "),probability:e.probability,closeDate:e.expected_close_date||"",owner:e.owner})),G=z.map(e=>({id:e.id,title:e.title,account:e.company||"",dueDate:e.due_date||"",priority:e.priority,assignee:e.assignee}));return(0,s.jsxs)("div",{className:"space-y-8",children:[s.jsx(n.m,{title:"Command Center",description:`🚀 Ready to execute with ${W.total}+ researched leads and ${L.totalCampaigns} proven campaigns`,actions:(0,s.jsxs)("div",{className:"flex items-center gap-4",children:[(0,s.jsxs)("div",{className:`flex items-center gap-2 text-sm ${D?"text-revenue":"text-warning"}`,children:[s.jsx(j.Z,{className:"w-4 h-4"}),s.jsx("span",{children:D?"Live Data":"Static Data"}),(t||Y||H||V)&&s.jsx(w.Z,{className:"w-3 h-3 animate-spin"})]}),(0,s.jsxs)("div",{className:"flex items-center gap-2 text-sm text-pipeline",children:[(0,s.jsxs)("span",{className:"relative flex h-2 w-2",children:[s.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-pipeline opacity-75"}),s.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-pipeline"})]}),"Active"]}),(0,s.jsxs)(c.z,{variant:"secondary",size:"sm",onClick:()=>x(),children:[s.jsx(w.Z,{className:"w-4 h-4 mr-2"}),"Refresh"]})]})}),(0,s.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",children:[s.jsx("div",{children:s.jsx(r.i,{label:"Revenue (Day 1)",value:(0,d.xG)(F.filter(e=>"closed-won"===e.stage).reduce((e,t)=>e+t.value,0)),trend:0,trendLabel:F.filter(e=>"closed-won"===e.stage).length>0?`${F.filter(e=>"closed-won"===e.stage).length} deals won`:"No closed deals yet",variant:"neutral",size:"lg",delay:0})}),s.jsx("div",{children:s.jsx(r.i,{label:`Pipeline Potential (${W.total} Leads)`,value:(0,d.xG)(_?.total||W.totalValue),trend:F.length,trendLabel:F.length>0?`${F.length} active deals`:`${W.total} leads ready`,variant:"pipeline",size:"lg",delay:.1})})]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[s.jsx(R(),{href:"/leads",className:"block",children:s.jsx(l.R,{label:"Researched Leads",value:`${W.total}+`,icon:N.Z,variant:"success",delay:.2})}),s.jsx(R(),{href:"/campaigns",className:"block",children:s.jsx(l.R,{label:"Ready Campaigns",value:`${L.totalCampaigns}`,icon:k.Z,variant:"success",delay:.25})}),s.jsx(l.R,{label:"Pipeline Value",value:(0,d.xG)(W.totalValue),icon:C.Z,variant:"success",delay:.3}),s.jsx(l.R,{label:"Avg Deal Size",value:(0,d.xG)(W.avgValue),icon:P.Z,variant:"default",delay:.35})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",children:[s.jsx(R(),{href:"/leads",children:(0,s.jsxs)(o.Zb,{className:"h-full hover:border-pipeline transition-all cursor-pointer group",children:[s.jsx(o.Ol,{children:(0,s.jsxs)("div",{className:"flex items-start justify-between",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)(o.ll,{className:"flex items-center gap-2 group-hover:text-pipeline transition-colors",children:[s.jsx(N.Z,{className:"w-5 h-5"}),W.total,"+ Researched Leads"]}),s.jsx(o.SZ,{className:"mt-2",children:"Texas field service companies ready for outreach"})]}),s.jsx(S.Z,{className:"w-5 h-5 text-text-tertiary group-hover:text-pipeline transition-all group-hover:translate-x-1"})]})}),(0,s.jsxs)(o.aY,{children:[(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 text-sm",children:[(0,s.jsxs)("div",{children:[s.jsx("div",{className:"text-2xl font-bold text-pipeline",children:(0,d.xG)(W.totalValue)}),s.jsx("div",{className:"text-text-secondary",children:"Total Value"})]}),(0,s.jsxs)("div",{children:[s.jsx("div",{className:"text-2xl font-bold text-revenue",children:(0,d.xG)(W.avgValue)}),s.jsx("div",{className:"text-text-secondary",children:"Avg Deal"})]})]}),s.jsx("div",{className:"mt-4 pt-4 border-t border-border-subtle",children:(0,s.jsxs)("div",{className:"flex items-center gap-2 text-sm text-text-secondary",children:[s.jsx("span",{className:"w-2 h-2 rounded-full bg-revenue"}),s.jsx("span",{children:"HVAC, Plumbing, Electrical, Pest Control"})]})})]})]})}),s.jsx(R(),{href:"/campaigns",children:(0,s.jsxs)(o.Zb,{className:"h-full hover:border-pipeline transition-all cursor-pointer group",children:[s.jsx(o.Ol,{children:(0,s.jsxs)("div",{className:"flex items-start justify-between",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)(o.ll,{className:"flex items-center gap-2 group-hover:text-pipeline transition-colors",children:[s.jsx(k.Z,{className:"w-5 h-5"}),L.totalCampaigns," Proven Outreach Campaigns"]}),s.jsx(o.SZ,{className:"mt-2",children:"Ready-to-use email sequences that convert"})]}),s.jsx(S.Z,{className:"w-5 h-5 text-text-tertiary group-hover:text-pipeline transition-all group-hover:translate-x-1"})]})}),(0,s.jsxs)(o.aY,{children:[(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 text-sm",children:[(0,s.jsxs)("div",{children:[s.jsx("div",{className:"text-2xl font-bold text-pipeline",children:L.totalEmailsSent||L.totalEmails||0}),s.jsx("div",{className:"text-text-secondary",children:"Emails Sent"})]}),(0,s.jsxs)("div",{children:[s.jsx("div",{className:"text-2xl font-bold text-revenue",children:"14 days"}),s.jsx("div",{className:"text-text-secondary",children:"Per Sequence"})]})]}),s.jsx("div",{className:"mt-4 pt-4 border-t border-border-subtle",children:(0,s.jsxs)("div",{className:"flex flex-col gap-2 text-xs text-text-secondary",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[s.jsx(A.Z,{className:"w-3.5 h-3.5 text-revenue"}),s.jsx("span",{children:"ServiceTitan complexity angle"})]}),(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[s.jsx(A.Z,{className:"w-3.5 h-3.5 text-revenue"}),s.jsx("span",{children:"Spreadsheet hell pain points"})]})]})})]})]})})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6",children:[(0,s.jsxs)(o.Zb,{className:"lg:col-span-2",children:[(0,s.jsxs)(o.Ol,{children:[(0,s.jsxs)("div",{children:[s.jsx(o.ll,{children:"Launch Readiness"}),(0,s.jsxs)(o.SZ,{children:[W.total," leads researched, ",L.totalCampaigns," campaigns ready - starting outreach this week"]})]}),s.jsx(R(),{href:"/leads",children:(0,s.jsxs)(c.z,{variant:"ghost",size:"sm",children:["View All Leads",s.jsx(S.Z,{className:"w-4 h-4 ml-1"})]})})]}),(0,s.jsxs)(o.aY,{children:[s.jsx(g,{stages:$}),s.jsx("div",{className:"mt-6 pt-4 border-t border-border-subtle",children:(0,s.jsxs)("p",{className:"text-sm text-text-secondary text-center",children:[s.jsx("strong",{className:"text-pipeline",children:"Day 1 Status:"})," Foundation built, campaigns loaded, ready to execute \uD83D\uDE80"]})})]})]}),(0,s.jsxs)(o.Zb,{children:[s.jsx(o.Ol,{children:(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[s.jsx(E.Z,{className:"w-5 h-5 text-warning"}),s.jsx(o.ll,{children:"Action Required"})]})}),(0,s.jsxs)(o.aY,{className:"space-y-4",children:[Z.filter(e=>"draft"===e.status).length>0&&s.jsx(i.E.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},className:"p-4 rounded-lg border bg-pipeline-muted border-pipeline/30",children:(0,s.jsxs)("div",{className:"flex items-start gap-3",children:[s.jsx(k.Z,{className:"w-4 h-4 mt-0.5 text-pipeline"}),(0,s.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,s.jsxs)("p",{className:"text-sm font-medium text-text-primary",children:[Z.filter(e=>"draft"===e.status).length," campaigns ready to launch"]}),s.jsx("p",{className:"text-xs text-text-secondary mt-1",children:"Start a campaign to begin outreach"})]})]})}),W.total>0&&0===F.length&&s.jsx(i.E.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},transition:{delay:.1},className:"p-4 rounded-lg border bg-warning-muted border-warning/30",children:(0,s.jsxs)("div",{className:"flex items-start gap-3",children:[s.jsx(M,{className:"w-4 h-4 mt-0.5 text-warning"}),(0,s.jsxs)("div",{className:"flex-1 min-w-0",children:[s.jsx("p",{className:"text-sm font-medium text-text-primary",children:"No active deals yet"}),(0,s.jsxs)("p",{className:"text-xs text-text-secondary mt-1",children:[W.total," leads ready — time to start outreach"]})]})]})}),0===z.length&&s.jsx(i.E.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},transition:{delay:.2},className:"p-4 rounded-lg border bg-surface-subtle border-border-subtle",children:(0,s.jsxs)("div",{className:"flex items-start gap-3",children:[s.jsx(A.Z,{className:"w-4 h-4 mt-0.5 text-revenue"}),(0,s.jsxs)("div",{className:"flex-1 min-w-0",children:[s.jsx("p",{className:"text-sm font-medium text-text-primary",children:"No pending tasks"}),s.jsx("p",{className:"text-xs text-text-secondary mt-1",children:"You're all caught up!"})]})]})})]}),s.jsx(o.eW,{children:s.jsx(R(),{href:"/leads",className:"w-full",children:(0,s.jsxs)(c.z,{variant:"ghost",size:"sm",className:"w-full",children:["View All Leads",s.jsx(S.Z,{className:"w-4 h-4 ml-1"})]})})})]})]}),(0,s.jsxs)(o.Zb,{children:[(0,s.jsxs)(o.Ol,{children:[(0,s.jsxs)("div",{children:[s.jsx(o.ll,{children:"Active Opportunities"}),s.jsx(o.SZ,{children:"Deals in progress - outreach starting this week!"})]}),s.jsx(R(),{href:"/leads",children:(0,s.jsxs)(c.z,{variant:"secondary",size:"sm",children:["View All Leads",s.jsx(S.Z,{className:"w-4 h-4 ml-1"})]})})]}),s.jsx(o.aY,{children:0===q.length?(0,s.jsxs)("div",{className:"py-12 text-center",children:[s.jsx("div",{className:"inline-flex items-center justify-center w-16 h-16 rounded-full bg-pipeline-muted mb-4",children:s.jsx(T.Z,{className:"w-8 h-8 text-pipeline"})}),s.jsx("h3",{className:"text-lg font-semibold text-text-primary mb-2",children:"Ready to Launch"}),(0,s.jsxs)("p",{className:"text-text-secondary mb-4 max-w-md mx-auto",children:[W.total," researched leads ready for outreach. First campaigns launching this week. Check back soon to see deals in motion!"]}),s.jsx(R(),{href:"/leads",children:(0,s.jsxs)(c.z,{variant:"secondary",children:[s.jsx(N.Z,{className:"w-4 h-4 mr-2"}),"View Researched Leads"]})})]}):s.jsx(h,{data:q,columns:[{key:"name",label:"Deal",render:e=>(0,s.jsxs)("div",{children:[s.jsx("span",{className:"font-medium text-text-primary",children:e.name}),s.jsx("span",{className:"block text-xs text-text-tertiary",children:e.account})]})},{key:"value",label:"Value",align:"right",render:e=>s.jsx(m,{value:e.value})},{key:"stage",label:"Stage",render:e=>s.jsx(p,{status:e.stage,variant:"Negotiation"===e.stage?"success":"Proposal"===e.stage?"info":"default"})},{key:"probability",label:"Probability",align:"center",render:e=>(0,s.jsxs)("span",{className:`font-mono text-sm tabular-nums ${e.probability>=70?"text-revenue":e.probability>=40?"text-warning":"text-text-secondary"}`,children:[e.probability,"%"]})},{key:"closeDate",label:"Expected Close",render:e=>s.jsx(u,{value:e.closeDate})},{key:"owner",label:"Owner",render:e=>s.jsx("span",{className:"text-text-secondary",children:e.owner})}]})})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",children:[(0,s.jsxs)(o.Zb,{children:[(0,s.jsxs)(o.Ol,{children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[s.jsx(T.Z,{className:"w-5 h-5 text-pipeline"}),s.jsx(o.ll,{children:"Priority Tasks"})]}),(0,s.jsxs)(c.z,{variant:"ghost",size:"sm",children:["View All",s.jsx(S.Z,{className:"w-4 h-4 ml-1"})]})]}),s.jsx(o.aY,{className:"space-y-3",children:G.map((e,t)=>(0,s.jsxs)(i.E.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.3,delay:.1*t},className:"flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle hover:border-border-accent transition-colors",children:[s.jsx("div",{className:`w-2 h-2 rounded-full mt-2 ${"urgent"===e.priority?"bg-danger":"high"===e.priority?"bg-warning":"bg-pipeline"}`}),(0,s.jsxs)("div",{className:"flex-1 min-w-0",children:[s.jsx("p",{className:"text-sm font-medium text-text-primary",children:e.title}),(0,s.jsxs)("div",{className:"flex items-center gap-2 mt-1",children:[s.jsx("span",{className:"text-xs text-text-tertiary",children:e.account}),s.jsx("span",{className:"text-text-tertiary",children:"\xb7"}),(0,s.jsxs)("span",{className:"text-xs text-text-tertiary",children:["Due ",new Date(e.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})]})]})]}),s.jsx("span",{className:"text-xs text-text-secondary",children:e.assignee.split(" ")[0]})]},e.id))})]}),(0,s.jsxs)(o.Zb,{children:[s.jsx(o.Ol,{children:(0,s.jsxs)("div",{children:[s.jsx(o.ll,{children:"Pipeline by Stage"}),s.jsx(o.SZ,{children:F.length>0?`${F.length} deals worth ${(0,d.xG)(_?.total||0)}`:"No deals yet — start outreach to build pipeline"})]})}),(0,s.jsxs)(o.aY,{children:[F.length>0?s.jsx("div",{className:"space-y-4",children:$.map((e,t)=>{let a=Math.max(...$.map(e=>e.value),1),n=e.value/a*100;return(0,s.jsxs)(i.E.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3,delay:.05*t},className:"space-y-2",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between text-sm",children:[s.jsx("span",{className:"text-text-secondary font-medium",children:e.stage}),(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsxs)("span",{className:"text-xs text-text-tertiary",children:[e.count," deal",1!==e.count?"s":""]}),s.jsx("span",{className:"font-mono text-text-primary tabular-nums",children:(0,d.xG)(e.value)})]})]}),s.jsx("div",{className:"relative h-2 bg-surface-subtle rounded-full overflow-hidden",children:s.jsx(i.E.div,{initial:{width:0},animate:{width:`${n}%`},transition:{duration:.6,delay:.05*t+.2},className:"absolute top-0 bottom-0 left-0 rounded-full bg-pipeline"})})]},e.stage)})}):(0,s.jsxs)("div",{className:"py-8 text-center",children:[s.jsx("div",{className:"inline-flex items-center justify-center w-12 h-12 rounded-full bg-pipeline-muted mb-3",children:s.jsx(I.Z,{className:"w-6 h-6 text-pipeline"})}),(0,s.jsxs)("p",{className:"text-sm text-text-secondary mb-3",children:["Pipeline empty — ",W.total," leads ready for outreach"]}),s.jsx(R(),{href:"/campaigns",children:s.jsx(c.z,{variant:"secondary",size:"sm",children:"Start Campaign"})})]}),s.jsx("div",{className:"mt-6 pt-4 border-t border-border-subtle",children:s.jsx("p",{className:"text-xs text-text-secondary text-center",children:F.length>0?`Weighted pipeline: ${(0,d.xG)(_?.weighted||0)}`:"\uD83D\uDE80 Ready to execute — campaigns and leads are set"})})]})]})]})]})}},9849:(e,t,a)=>{"use strict";a.d(t,{i:()=>d});var s=a(2295),i=a(1626),n=a(7292),r=a(9843),l=a(6407);let o={revenue:{text:"text-revenue",glow:"glow-revenue",bg:"bg-revenue-muted"},pipeline:{text:"text-pipeline",glow:"glow-pipeline",bg:"bg-pipeline-muted"},warning:{text:"text-warning",glow:"glow-warning",bg:"bg-warning-muted"},danger:{text:"text-danger",glow:"glow-danger",bg:"bg-danger-muted"},neutral:{text:"text-text-primary",glow:"",bg:"bg-surface-subtle"}},c={lg:"text-5xl md:text-6xl lg:text-7xl",md:"text-3xl md:text-4xl lg:text-5xl",sm:"text-2xl md:text-3xl"};function d({label:e,value:t,trend:a,trendLabel:d,variant:p="neutral",size:m="lg",sparkline:u,delay:x=0}){let g=o[p],y=void 0!==a&&a>=0;return(0,s.jsxs)(n.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:x},className:"relative group",children:[s.jsx("div",{className:(0,i.cn)("absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",g.bg)}),(0,s.jsxs)("div",{className:"relative bg-surface-raised border border-border rounded-2xl p-6 md:p-8 shadow-inner-glow",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[s.jsx("span",{className:"text-text-tertiary text-sm uppercase tracking-wider font-medium",children:e}),u&&s.jsx(h,{data:u,positive:y})]}),s.jsx(n.E.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},transition:{duration:.4,delay:x+.2},className:(0,i.cn)("font-mono font-bold tracking-tight tabular-nums",c[m],g.text),style:{textShadow:"neutral"!==p?"0 0 60px currentColor":void 0},children:t}),void 0!==a&&(0,s.jsxs)(n.E.div,{initial:{opacity:0,x:-10},animate:{opacity:1,x:0},transition:{duration:.3,delay:x+.4},className:"flex items-center gap-2 mt-4",children:[(0,s.jsxs)("span",{className:(0,i.cn)("inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",y?"bg-revenue-muted text-revenue":"bg-danger-muted text-danger"),children:[y?s.jsx(r.Z,{className:"w-3 h-3"}):s.jsx(l.Z,{className:"w-3 h-3"}),Math.abs(a).toFixed(1),"%"]}),d&&s.jsx("span",{className:"text-text-tertiary text-sm",children:d})]})]})]})}function h({data:e,positive:t}){let a=Math.min(...e),i=Math.max(...e)-a||1,n=e.map((t,s)=>{let n=s/(e.length-1)*100;return`${n},${100-(t-a)/i*100}`}).join(" ");return(0,s.jsxs)("svg",{className:"w-20 h-8",viewBox:"0 0 100 100",preserveAspectRatio:"none",children:[s.jsx("defs",{children:(0,s.jsxs)("linearGradient",{id:`sparkline-gradient-${t?"up":"down"}`,x1:"0%",y1:"0%",x2:"0%",y2:"100%",children:[s.jsx("stop",{offset:"0%",stopColor:t?"#10B981":"#EF4444",stopOpacity:"0.3"}),s.jsx("stop",{offset:"100%",stopColor:t?"#10B981":"#EF4444",stopOpacity:"0"})]})}),s.jsx("polygon",{points:`0,100 ${n} 100,100`,fill:`url(#sparkline-gradient-${t?"up":"down"})`}),s.jsx("polyline",{points:n,fill:"none",stroke:t?"#10B981":"#EF4444",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]})}},8422:(e,t,a)=>{"use strict";a.d(t,{R:()=>c});var s=a(2295),i=a(1626),n=a(7292),r=a(9843),l=a(6407);let o={default:{border:"border-border",icon:"text-text-tertiary"},success:{border:"border-revenue/30",icon:"text-revenue"},warning:{border:"border-warning/30",icon:"text-warning"},danger:{border:"border-danger/30",icon:"text-danger"}};function c({label:e,value:t,trend:a,icon:c,variant:d="default",onClick:h,delay:p=0}){let m=o[d],u=void 0!==a&&a>=0;return s.jsx(n.E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.4,delay:p},whileHover:{scale:h?1.02:1},onClick:h,className:(0,i.cn)("relative bg-surface-raised border rounded-xl p-5 transition-all duration-300",m.border,h&&"cursor-pointer hover:border-border-accent hover:bg-surface-overlay"),children:(0,s.jsxs)("div",{className:"flex items-start justify-between",children:[(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("span",{className:"text-text-tertiary text-xs uppercase tracking-wider font-medium block",children:e}),s.jsx("span",{className:"font-mono text-2xl md:text-3xl font-bold text-text-primary tabular-nums",children:t}),void 0!==a&&(0,s.jsxs)("span",{className:(0,i.cn)("inline-flex items-center gap-0.5 text-xs font-medium",u?"text-revenue":"text-danger"),children:[u?s.jsx(r.Z,{className:"w-3 h-3"}):s.jsx(l.Z,{className:"w-3 h-3"}),Math.abs(a).toFixed(1),"%"]})]}),c&&s.jsx("div",{className:(0,i.cn)("p-2 rounded-lg bg-surface-subtle",m.icon),children:s.jsx(c,{className:"w-5 h-5"})})]})})}},6972:(e,t,a)=>{"use strict";a.d(t,{v:()=>i});var s=a(3729);function i(){let[e,t]=(0,s.useState)([]),[a,i]=(0,s.useState)(null),[n,r]=(0,s.useState)(!0),[l,o]=(0,s.useState)(null),c=(0,s.useCallback)(async()=>{try{r(!0);let e=await fetch("/api/leads");if(!e.ok)throw Error("Failed to fetch leads");let a=await e.json();t(a.leads),o(null)}catch(e){o(e instanceof Error?e.message:"Unknown error")}finally{r(!1)}},[]),d=(0,s.useCallback)(async()=>{try{let e=await fetch("/api/leads/stats");if(!e.ok)throw Error("Failed to fetch stats");let t=await e.json();i(t)}catch(e){console.error("Failed to fetch stats:",e)}},[]),h=(0,s.useCallback)(async e=>{let a=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok)throw Error("Failed to create lead");let s=await a.json();return t(e=>[s.lead,...e]),d(),s.lead},[d]),p=(0,s.useCallback)(async(e,a)=>{let s=await fetch(`/api/leads/${e}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!s.ok)throw Error("Failed to update lead");let i=await s.json();return t(t=>t.map(t=>t.id===e?i.lead:t)),d(),i.lead},[d]),m=(0,s.useCallback)(async e=>{if(!(await fetch(`/api/leads/${e}`,{method:"DELETE"})).ok)throw Error("Failed to delete lead");t(t=>t.filter(t=>t.id!==e)),d()},[d]),u=(0,s.useCallback)(async()=>{let e=await fetch("/api/leads/seed",{method:"POST"});if(!e.ok)throw Error("Failed to seed leads");let t=await e.json();return await c(),await d(),t},[c,d]);return(0,s.useEffect)(()=>{c(),d()},[c,d]),{leads:e,stats:a,isLoading:n,error:l,fetchLeads:c,fetchStats:d,createLead:h,updateLead:p,deleteLead:m,seedLeads:u}}},2755:(e,t,a)=>{"use strict";a.d(t,{jE:()=>i,mi:()=>s});let s=[{id:"spreadsheet-to-dashboard",name:"Spreadsheet Hell → Dashboard Clarity",description:"Target companies tracking operations manually in Excel/Google Sheets",targetPersona:"Ops leaders at 10-50 tech field service companies using spreadsheets for visibility",hook:"Real-time visibility without enterprise complexity",emails:[{day:1,subject:"Still tracking {{COMPANY}}'s operations in spreadsheets?",body:`Hi {{FIRST_NAME}},

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

Cody`,personalizationTags:["FIRST_NAME","COMPANY"]}],stats:{sent:0,opened:0,replied:0,meetings:0}}],i={totalCampaigns:s.length,totalEmails:s.reduce((e,t)=>e+t.emails.length,0),avgEmailsPerCampaign:Math.round(s.reduce((e,t)=>e+t.emails.length,0)/s.length),totalSent:s.reduce((e,t)=>e+(t.stats?.sent||0),0),totalReplies:s.reduce((e,t)=>e+(t.stats?.replied||0),0),totalMeetings:s.reduce((e,t)=>e+(t.stats?.meetings||0),0)}},6407:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(9224).Z)("ArrowDownRight",[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]])},5299:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(9224).Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},9843:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(9224).Z)("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]])},4290:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(9224).Z)("CheckCircle2",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]])},9046:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(9224).Z)("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]])},3733:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(9224).Z)("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]])},4204:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>c});var s=a(5036),i=a(6843);let n=(0,i.createProxy)(String.raw`/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/command-center.tsx`),{__esModule:r,$$typeof:l}=n;n.default;let o=(0,i.createProxy)(String.raw`/home/clasak/Projects/CompassIQ/v2/app/(dashboard)/command-center.tsx#CommandCenter`);function c(){return s.jsx(o,{})}}};var t=require("../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[638,798,789,285],()=>a(9942));module.exports=s})();