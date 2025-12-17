/**
 * Template metric catalog for new client setups
 */
export const METRIC_CATALOG_TEMPLATE = [
  {
    key: 'revenue_mtd',
    name: 'Revenue Month-to-Date',
    description: 'Total revenue recognized in the current month',
    formula: 'SUM(invoices.total) WHERE status IN (SENT, PAID, OVERDUE) AND issue_date IN current_month',
    source: 'Invoices',
    cadence: 'Daily',
  },
  {
    key: 'pipeline_30',
    name: 'Pipeline 30 Days',
    description: 'Total pipeline value closing in the next 30 days',
    formula: 'SUM(opportunities.amount) WHERE stage NOT IN (WON, LOST) AND close_date <= 30_days',
    source: 'Opportunities',
    cadence: 'Daily',
  },
  {
    key: 'pipeline_60',
    name: 'Pipeline 60 Days',
    description: 'Total pipeline value closing in the next 60 days',
    formula: 'SUM(opportunities.amount) WHERE stage NOT IN (WON, LOST) AND close_date <= 60_days',
    source: 'Opportunities',
    cadence: 'Daily',
  },
  {
    key: 'pipeline_90',
    name: 'Pipeline 90 Days',
    description: 'Total pipeline value closing in the next 90 days',
    formula: 'SUM(opportunities.amount) WHERE stage NOT IN (WON, LOST) AND close_date <= 90_days',
    source: 'Opportunities',
    cadence: 'Daily',
  },
  {
    key: 'ar_outstanding',
    name: 'Accounts Receivable Outstanding',
    description: 'Total unpaid invoice balance',
    formula: 'SUM(invoices.total - COALESCE(SUM(payments.amount), 0)) WHERE status NOT IN (PAID, VOID)',
    source: 'Invoices, Payments',
    cadence: 'Daily',
  },
  {
    key: 'ar_days',
    name: 'Days Sales Outstanding (DSO)',
    description: 'Average number of days to collect payment on invoices',
    formula: 'AVG(DATEDIFF(payments.paid_at, invoices.issue_date)) WHERE payments.paid_at IS NOT NULL',
    source: 'Invoices, Payments',
    cadence: 'Weekly',
  },
  {
    key: 'win_rate',
    name: 'Win Rate',
    description: 'Percentage of opportunities that close as won',
    formula: 'COUNT(*) WHERE stage = WON / COUNT(*) WHERE stage IN (WON, LOST)',
    source: 'Opportunities',
    cadence: 'Monthly',
  },
  {
    key: 'sales_cycle',
    name: 'Average Sales Cycle',
    description: 'Average days from opportunity creation to close',
    formula: 'AVG(DATEDIFF(close_date, created_at)) WHERE stage = WON',
    source: 'Opportunities',
    cadence: 'Monthly',
  },
  {
    key: 'on_time_delivery',
    name: 'On-Time Delivery Rate',
    description: 'Percentage of work orders completed on or before due date',
    formula: 'COUNT(*) WHERE status = DONE AND completed_at <= due_date / COUNT(*) WHERE status = DONE',
    source: 'Work Orders',
    cadence: 'Daily',
  },
  {
    key: 'churn_risk',
    name: 'Churn Risk Accounts',
    description: 'Number of accounts with upcoming renewals or low health scores',
    formula: 'COUNT(*) WHERE renewal_date <= 60_days OR health_override = LOW',
    source: 'Accounts',
    cadence: 'Daily',
  },
  {
    key: 'active_opportunities',
    name: 'Active Opportunities',
    description: 'Total number of open opportunities',
    formula: 'COUNT(*) WHERE stage NOT IN (WON, LOST)',
    source: 'Opportunities',
    cadence: 'Daily',
  },
  {
    key: 'blocked_work_orders',
    name: 'Blocked Work Orders',
    description: 'Number of work orders with blockers',
    formula: 'COUNT(*) WHERE blocker_reason IS NOT NULL',
    source: 'Work Orders',
    cadence: 'Daily',
  },
]




