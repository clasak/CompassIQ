# Mobile Testing Guide - CompassIQ v2

## Quick Test URL
**Production:** https://v2-dusky-pi.vercel.app

## How to Test Mobile Responsiveness

### Method 1: Chrome DevTools (Recommended)
1. Open https://v2-dusky-pi.vercel.app in Chrome
2. Press `F12` to open DevTools
3. Click the device toggle button (or press `Ctrl+Shift+M`)
4. Select a mobile device:
   - iPhone SE (375x667) - Small mobile
   - iPhone 12/13 Pro (390x844) - Standard mobile
   - iPad Air (820x1180) - Tablet
5. Test all pages listed below

### Method 2: Real Device
1. Open https://v2-dusky-pi.vercel.app on your mobile device
2. Test all pages and interactions

---

## Test Checklist

### 1. Navigation (All Pages)

**Hamburger Menu:**
- [ ] Hamburger icon visible in top-left corner (mobile only)
- [ ] Tapping hamburger opens sidebar from left
- [ ] Sidebar slides in smoothly
- [ ] Overlay backdrop appears behind sidebar
- [ ] Tapping overlay closes sidebar
- [ ] Tapping X button closes sidebar
- [ ] Sidebar closes when navigating to new page

**Desktop:**
- [ ] Hamburger menu hidden on desktop (≥1024px)
- [ ] Sidebar always visible on desktop
- [ ] No overlay on desktop

### 2. Homepage - Command Center (`/`)

**Layout:**
- [ ] Title "Command Center" readable without zooming
- [ ] "Live" indicator and button visible in header
- [ ] Hero metrics (Revenue MTD, Pipeline) stack vertically on mobile
- [ ] Secondary KPIs show 2 columns on mobile
- [ ] Sales engine cards (Leads, Campaigns) stack vertically
- [ ] Pipeline funnel card spans full width
- [ ] Alerts panel below funnel (not side-by-side)
- [ ] Recent deals table scrolls horizontally if needed
- [ ] Tasks and revenue cards stack vertically

**Spacing:**
- [ ] Proper padding around edges (16px on mobile)
- [ ] Cards have adequate spacing between them
- [ ] Text not cramped or overlapping

**Touch Targets:**
- [ ] All buttons easy to tap (≥44px)
- [ ] Card links respond to taps
- [ ] No accidental taps when scrolling

### 3. Leads Page (`/leads`)

**Layout:**
- [ ] Page header with "Prospect Pipeline" title
- [ ] "Start Campaign" button visible
- [ ] Stats show 2 columns on mobile (4 on desktop)
- [ ] Search bar full-width on mobile
- [ ] Filter buttons wrap to multiple rows
- [ ] Filter chips easy to tap
- [ ] Prospect cards show 1 column on mobile (2 on tablet, 3 on desktop)
- [ ] All card content visible without horizontal scroll

**Filters:**
- [ ] Industry filter buttons wrap properly
- [ ] Status filter buttons wrap properly
- [ ] Size filter buttons wrap properly
- [ ] Active filter highlighted clearly
- [ ] "Clear Filters" button visible and tappable

**Cards:**
- [ ] Company name visible
- [ ] Industry badge visible
- [ ] Stats (team size, location, value) readable
- [ ] Pain points list readable
- [ ] Status badge visible
- [ ] Action buttons ("Start Campaign", briefcase icon) tappable

### 4. Campaigns Page (`/campaigns`)

**Layout:**
- [ ] Page header with "Outreach Campaigns" title
- [ ] "Launch Campaign" button visible
- [ ] Stats show 2 columns on mobile (4 on desktop)
- [ ] Campaign selector cards show 1 column on mobile (3 on desktop)
- [ ] Selected campaign highlighted clearly
- [ ] Campaign details section full-width

**Email Sequence:**
- [ ] Email timeline vertical on mobile
- [ ] Day badges visible
- [ ] Subject lines readable (no wrapping issues)
- [ ] Email body text formatted properly
- [ ] "Copy" button visible and tappable
- [ ] Personalization tags visible
- [ ] Timing notes readable

**Campaign Insights:**
- [ ] Best Practices section stacks on mobile
- [ ] "Avoid" section stacks on mobile
- [ ] Personalization tips section stacks on mobile
- [ ] All bullet points readable

### 5. Pipeline Page (`/pipeline`)

**Layout:**
- [ ] Page header with "Pipeline Tracker" title
- [ ] Action buttons visible ("Send Follow-ups", "Add Prospect")
- [ ] Stats show 2 columns on small mobile, 3 on larger mobile, 5 on desktop
- [ ] Pipeline stages scrollable horizontally on mobile
- [ ] Stage cards show 2 columns on mobile (6 on desktop)
- [ ] Conversion funnel full-width
- [ ] Recent activity and action items stack vertically

**Pipeline Stages:**
- [ ] Can scroll horizontally through all 6 stages
- [ ] Each stage card readable
- [ ] Stage icons visible
- [ ] Prospect count visible
- [ ] Value amount readable
- [ ] Prospect names in each stage readable
- [ ] "X more" link visible when applicable

**Conversion Funnel:**
- [ ] All conversion steps visible
- [ ] Progress bars render correctly
- [ ] Percentages readable
- [ ] Labels not overlapping

**Activity Section:**
- [ ] Recent activity items readable
- [ ] Action items readable
- [ ] Time stamps visible
- [ ] Priority dots visible
- [ ] Chevron icons visible

### 6. General Mobile UX

**Scrolling:**
- [ ] Smooth vertical scrolling on all pages
- [ ] No horizontal scroll on main content (except pipeline stages)
- [ ] Tables scroll horizontally when needed
- [ ] Scroll position maintains when navigating back

**Performance:**
- [ ] Pages load quickly (<3 seconds)
- [ ] Animations smooth (no jank)
- [ ] Transitions feel native
- [ ] No layout shift during load

**Readability:**
- [ ] All text readable without zooming
- [ ] Font sizes appropriate for mobile
- [ ] Line heights comfortable
- [ ] Contrast sufficient for outdoor viewing

**Touch Interactions:**
- [ ] Buttons respond immediately to touch
- [ ] No accidental clicks
- [ ] Tap targets adequately sized
- [ ] Hover states work on touch (or replaced with tap)

## Viewport Sizes to Test

### Mobile Phones
- **iPhone SE:** 375 x 667 (Small)
- **iPhone 12/13:** 390 x 844 (Standard)
- **iPhone 12/13 Pro Max:** 428 x 926 (Large)
- **Samsung Galaxy S21:** 360 x 800 (Android Standard)
- **Pixel 5:** 393 x 851 (Android)

### Tablets
- **iPad Mini:** 768 x 1024
- **iPad Air:** 820 x 1180
- **iPad Pro 11":** 834 x 1194

### Breakpoints to Verify
- **320px:** Minimum mobile width
- **375px:** iPhone SE
- **390px:** iPhone 12/13
- **640px:** Tailwind `sm` breakpoint
- **768px:** Tailwind `md` breakpoint
- **1024px:** Tailwind `lg` breakpoint (sidebar appears)

## Common Issues to Watch For

### ❌ Bad Signs
- Content pushed off-screen horizontally
- Buttons too small to tap accurately
- Text too small to read comfortably
- Overlapping elements
- Broken layouts
- Excessive whitespace
- Slow animations or lag
- Horizontal scroll on main content

### ✅ Good Signs
- All content visible within viewport
- Comfortable tap targets (≥44px)
- Readable text without zooming
- Logical stacking of elements
- Appropriate spacing
- Smooth animations
- Fast load times
- Natural scrolling behavior

## Reporting Issues

If you find mobile responsiveness issues:

1. **Screenshot:** Take a screenshot showing the issue
2. **Device:** Note the device/viewport size
3. **Page:** Note which page (URL)
4. **Issue:** Describe what's wrong
5. **Expected:** Describe what should happen

## Quick Fix Commands

If changes are needed:

```bash
cd ~/Projects/CompassIQ/v2

# Make changes to files
nano components/layout/sidebar.tsx
# or
nano app/(dashboard)/page-name/page.tsx

# Test locally
npm run dev
# Visit http://localhost:3010

# Build
npm run build

# Deploy
vercel --prod
```

## Success Criteria

### ✅ All Tests Passing Means:
- Mobile users can access all features
- Navigation works seamlessly
- All content is readable
- Touch targets are comfortable
- Performance is acceptable
- No broken layouts
- No horizontal overflow
- Professional mobile experience

### Production Ready When:
- [x] All pages load successfully
- [x] Mobile menu works correctly
- [x] All grids responsive
- [x] All text readable
- [x] All buttons tappable
- [x] No layout issues
- [x] Fast performance
- [x] Smooth animations

## Automated Testing (Future)

For automated mobile testing, consider:
- Lighthouse mobile audit
- WebPageTest mobile simulation
- BrowserStack real device testing
- Playwright mobile viewport tests

---

**Last Updated:** February 2, 2025  
**Deployed Version:** https://v2-dusky-pi.vercel.app  
**Status:** ✅ All mobile responsive fixes implemented and deployed
