// Mock data for the v2 dashboard
// This simulates real business data for demo/presentation purposes

export const kpis = {
  revenue: {
    current: 2847000,
    target: 3000000,
    trend: 12.4,
    period: 'MTD',
    sparkline: [45, 52, 49, 58, 63, 67, 72, 68, 75, 82, 78, 85],
  },
  pipeline: {
    current: 8420000,
    target: 10000000,
    trend: 8.2,
    period: '90-Day',
    sparkline: [60, 55, 62, 58, 65, 70, 68, 72, 75, 80, 84, 82],
  },
  winRate: {
    current: 34.2,
    target: 35,
    trend: 2.1,
    period: '30-Day',
    sparkline: [28, 30, 32, 29, 31, 33, 32, 34, 33, 35, 34, 34],
  },
  avgDealSize: {
    current: 47500,
    target: 50000,
    trend: -1.8,
    period: 'Trailing',
    sparkline: [52, 48, 50, 46, 49, 45, 48, 44, 47, 46, 48, 47],
  },
}

export const funnelData = [
  { name: 'Leads', count: 847, value: 21175000, conversion: 42 },
  { name: 'Qualified', count: 356, value: 12460000, conversion: 38 },
  { name: 'Proposal', count: 135, value: 6075000, conversion: 52 },
  { name: 'Negotiation', count: 70, value: 3850000, conversion: 49 },
  { name: 'Closed Won', count: 34, value: 2847000 },
]

export const recentDeals = [
  {
    id: '1',
    name: 'Acme Corp - Enterprise License',
    account: 'Acme Corporation',
    value: 125000,
    stage: 'Negotiation',
    probability: 75,
    closeDate: '2026-02-15',
    owner: 'Sarah Chen',
  },
  {
    id: '2',
    name: 'TechStart - Annual Subscription',
    account: 'TechStart Inc',
    value: 48000,
    stage: 'Proposal',
    probability: 50,
    closeDate: '2026-02-28',
    owner: 'Mike Johnson',
  },
  {
    id: '3',
    name: 'Global Systems - Multi-year',
    account: 'Global Systems Ltd',
    value: 380000,
    stage: 'Qualified',
    probability: 30,
    closeDate: '2026-03-31',
    owner: 'Sarah Chen',
  },
  {
    id: '4',
    name: 'DataFlow - Expansion',
    account: 'DataFlow Analytics',
    value: 85000,
    stage: 'Negotiation',
    probability: 80,
    closeDate: '2026-02-10',
    owner: 'James Wilson',
  },
  {
    id: '5',
    name: 'CloudNine - New Business',
    account: 'CloudNine Solutions',
    value: 62000,
    stage: 'Proposal',
    probability: 45,
    closeDate: '2026-03-15',
    owner: 'Emma Davis',
  },
]

export const openTasks = [
  {
    id: '1',
    title: 'Follow up with Acme Corp decision maker',
    account: 'Acme Corporation',
    dueDate: '2026-02-01',
    priority: 'high',
    assignee: 'Sarah Chen',
  },
  {
    id: '2',
    title: 'Send revised proposal to TechStart',
    account: 'TechStart Inc',
    dueDate: '2026-02-02',
    priority: 'medium',
    assignee: 'Mike Johnson',
  },
  {
    id: '3',
    title: 'Schedule demo for Global Systems',
    account: 'Global Systems Ltd',
    dueDate: '2026-02-03',
    priority: 'high',
    assignee: 'Sarah Chen',
  },
  {
    id: '4',
    title: 'Prepare contract for DataFlow',
    account: 'DataFlow Analytics',
    dueDate: '2026-02-05',
    priority: 'urgent',
    assignee: 'James Wilson',
  },
]

export const alerts = [
  {
    id: '1',
    type: 'danger',
    title: 'Overdue Invoice',
    message: 'Acme Corp invoice #4521 is 15 days overdue ($45,000)',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'warning',
    title: 'At-Risk Account',
    message: 'DataFlow Analytics health score dropped to 45%',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    type: 'info',
    title: 'Deal Stalled',
    message: 'CloudNine Solutions has been in Proposal stage for 21 days',
    timestamp: '1 day ago',
  },
]

export const teamPerformance = [
  { name: 'Sarah Chen', closed: 12, pipeline: 2800000, quota: 85 },
  { name: 'Mike Johnson', closed: 8, pipeline: 1200000, quota: 72 },
  { name: 'James Wilson', closed: 10, pipeline: 1800000, quota: 78 },
  { name: 'Emma Davis', closed: 6, pipeline: 950000, quota: 65 },
]

export const revenueByMonth = [
  { month: 'Aug', revenue: 1850000, target: 2000000 },
  { month: 'Sep', revenue: 2100000, target: 2200000 },
  { month: 'Oct', revenue: 2450000, target: 2400000 },
  { month: 'Nov', revenue: 2280000, target: 2600000 },
  { month: 'Dec', revenue: 2750000, target: 2800000 },
  { month: 'Jan', revenue: 2847000, target: 3000000 },
]

export const accountHealthDistribution = [
  { health: 'Healthy', count: 45, percentage: 56 },
  { health: 'At Risk', count: 24, percentage: 30 },
  { health: 'Critical', count: 11, percentage: 14 },
]
