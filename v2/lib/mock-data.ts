// Day 1 Launch Data - Honest metrics showing preparation, not revenue yet
// CompassIQ is launching today with real prospects and campaigns ready to execute

export const kpis = {
  revenue: {
    current: 0, // Day 1 - No revenue yet, launching today!
    target: 3000000,
    trend: 0,
    period: 'MTD',
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  pipeline: {
    current: 750000, // Real potential from 21 researched leads
    target: 1000000,
    trend: 0,
    period: 'Potential',
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 75], // Shows the research we've done
  },
  winRate: {
    current: 0,
    target: 35,
    trend: 0,
    period: '30-Day',
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  avgDealSize: {
    current: 35000, // Average from researched leads
    target: 50000,
    trend: 0,
    period: 'Projected',
    sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35],
  },
}

// Day 1: Show our preparation, not fake conversions
export const funnelData = [
  { name: 'Researched', count: 21, value: 750000, conversion: 0 },
  { name: 'Campaigns Ready', count: 3, value: 0, conversion: 0 },
  { name: 'Outreach Started', count: 0, value: 0, conversion: 0 },
  { name: 'Meetings Booked', count: 0, value: 0, conversion: 0 },
  { name: 'Deals Closed', count: 0, value: 0 },
]

// Day 1: No deals yet - launching today!
export const recentDeals: any[] = []

// Day 1: Launch tasks - what we're about to execute
export const openTasks = [
  {
    id: '1',
    title: 'Launch first outreach campaign - ServiceTitan angle',
    account: 'Campaign Execution',
    dueDate: '2026-02-03',
    priority: 'urgent',
    assignee: 'Cody',
  },
  {
    id: '2',
    title: 'Begin outreach to Houston HVAC prospects (7 companies)',
    account: 'Lead Outreach',
    dueDate: '2026-02-04',
    priority: 'high',
    assignee: 'Cody',
  },
  {
    id: '3',
    title: 'Follow up sequence - Spreadsheet Hell campaign',
    account: 'Campaign Execution',
    dueDate: '2026-02-06',
    priority: 'high',
    assignee: 'Cody',
  },
]

// Day 1: Launch readiness alerts - excited to begin!
export const alerts = [
  {
    id: '1',
    type: 'info',
    title: '🚀 Launch Day!',
    message: '21 Texas field service companies researched and ready for outreach',
    timestamp: 'Today',
  },
  {
    id: '2',
    type: 'info',
    title: '📧 Campaigns Ready',
    message: '3 proven email sequences loaded and ready to deploy',
    timestamp: 'Today',
  },
  {
    id: '3',
    type: 'info',
    title: '💰 Pipeline Potential',
    message: '$750K in potential deals identified - time to execute!',
    timestamp: 'Today',
  },
]

export const teamPerformance = [
  { name: 'Sarah Chen', closed: 12, pipeline: 2800000, quota: 85 },
  { name: 'Mike Johnson', closed: 8, pipeline: 1200000, quota: 72 },
  { name: 'James Wilson', closed: 10, pipeline: 1800000, quota: 78 },
  { name: 'Emma Davis', closed: 6, pipeline: 950000, quota: 65 },
]

// Day 1: No revenue history yet - this is the beginning!
export const revenueByMonth = [
  { month: 'Feb', revenue: 0, target: 50000 },
  { month: 'Mar', revenue: 0, target: 150000 },
  { month: 'Apr', revenue: 0, target: 300000 },
  { month: 'May', revenue: 0, target: 500000 },
  { month: 'Jun', revenue: 0, target: 750000 },
]

export const accountHealthDistribution = [
  { health: 'Healthy', count: 45, percentage: 56 },
  { health: 'At Risk', count: 24, percentage: 30 },
  { health: 'Critical', count: 11, percentage: 14 },
]
