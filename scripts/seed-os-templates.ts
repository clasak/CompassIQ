import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local BEFORE any other imports
const envPath = join(process.cwd(), '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')
        process.env[key.trim()] = cleanValue
      }
    }
  })
} catch (err: any) {
  console.warn('Warning: Could not load .env.local file:', err.message)
}

// Now import after env vars are loaded
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const templates = [
  {
    key: 'construction_ops',
    name: 'Construction Ops OS',
    description: 'Operating System template for construction companies with project tracking, safety metrics, and resource management.',
    version: 1,
    template_json: {
      kpis: [
        {
          key: 'project_margin',
          name: 'Project Margin %',
          description: 'Average margin across active projects',
          formula_hint: '(Revenue - Costs) / Revenue * 100',
          refresh: 'daily'
        },
        {
          key: 'on_time_completion',
          name: 'On-Time Completion Rate',
          description: 'Percentage of projects completed on or before deadline',
          formula_hint: 'Completed On Time / Total Completed * 100',
          refresh: 'daily'
        },
        {
          key: 'safety_incidents',
          name: 'Safety Incidents (30d)',
          description: 'Number of safety incidents in the last 30 days',
          formula_hint: 'COUNT(incidents WHERE date >= NOW() - 30 days)',
          refresh: 'daily'
        },
        {
          key: 'equipment_utilization',
          name: 'Equipment Utilization %',
          description: 'Percentage of time equipment is actively in use',
          formula_hint: 'Hours Used / Hours Available * 100',
          refresh: 'daily'
        },
        {
          key: 'labor_cost_variance',
          name: 'Labor Cost Variance',
          description: 'Difference between budgeted and actual labor costs',
          formula_hint: 'Actual Labor Cost - Budgeted Labor Cost',
          refresh: 'daily'
        }
      ],
      dashboards: [
        {
          name: 'Founder Command Center',
          layout: [
            { type: 'kpi', kpi_key: 'project_margin', position: { x: 0, y: 0, w: 4, h: 2 } },
            { type: 'kpi', kpi_key: 'on_time_completion', position: { x: 4, y: 0, w: 4, h: 2 } },
            { type: 'kpi', kpi_key: 'safety_incidents', position: { x: 8, y: 0, w: 4, h: 2 } },
            { type: 'chart', chart_type: 'line', metric: 'project_margin', position: { x: 0, y: 2, w: 6, h: 4 } },
            { type: 'chart', chart_type: 'bar', metric: 'equipment_utilization', position: { x: 6, y: 2, w: 6, h: 4 } }
          ]
        },
        {
          name: 'Data Trust / Ingestion Health',
          layout: [
            { type: 'data_quality', position: { x: 0, y: 0, w: 12, h: 6 } }
          ]
        },
        {
          name: 'Alerts & Tasks',
          layout: [
            { type: 'alerts_list', position: { x: 0, y: 0, w: 6, h: 8 } },
            { type: 'tasks_list', position: { x: 6, y: 0, w: 6, h: 8 } }
          ]
        },
        {
          name: 'Meeting Mode',
          layout: [
            { type: 'agenda', cadence: 'weekly', position: { x: 0, y: 0, w: 12, h: 10 } }
          ]
        }
      ],
      alerts: [
        {
          kpi_key: 'project_margin',
          severity: 'high',
          type: 'threshold',
          title: 'Project Margin Below Target',
          description: 'Project margin has fallen below 15% threshold',
          threshold: { operator: '<', value: 15 }
        },
        {
          kpi_key: 'on_time_completion',
          severity: 'medium',
          type: 'threshold',
          title: 'On-Time Completion Rate Declining',
          description: 'On-time completion rate is below 80%',
          threshold: { operator: '<', value: 80 }
        },
        {
          kpi_key: 'safety_incidents',
          severity: 'critical',
          type: 'threshold',
          title: 'Safety Incident Detected',
          description: 'A safety incident has been reported',
          threshold: { operator: '>', value: 0 }
        },
        {
          kpi_key: 'equipment_utilization',
          severity: 'low',
          type: 'threshold',
          title: 'Low Equipment Utilization',
          description: 'Equipment utilization is below 60%',
          threshold: { operator: '<', value: 60 }
        },
        {
          kpi_key: 'labor_cost_variance',
          severity: 'high',
          type: 'trend',
          title: 'Labor Cost Over Budget',
          description: 'Labor costs are trending above budget',
          threshold: { operator: '>', value: 0 }
        },
        {
          kpi_key: 'project_margin',
          severity: 'medium',
          type: 'trend',
          title: 'Project Margin Trend Negative',
          description: 'Project margin has declined for 3 consecutive periods',
          threshold: { operator: 'trend_down', periods: 3 }
        }
      ],
      cadence: [
        {
          cadence: 'daily',
          title: 'Daily Standup',
          rules: {
            include_alerts: { severity: ['critical', 'high'] },
            include_tasks: { state: ['open', 'in_progress'], due_within_days: 1 },
            include_kpis: { trend: 'negative' }
          }
        },
        {
          cadence: 'weekly',
          title: 'Weekly Operations Review',
          rules: {
            include_alerts: { severity: ['critical', 'high', 'medium'] },
            include_tasks: { state: ['open', 'in_progress'], due_within_days: 7 },
            include_kpis: { trend: 'negative' },
            include_variances: true
          }
        },
        {
          cadence: 'monthly',
          title: 'Monthly Business Review',
          rules: {
            include_alerts: { severity: ['critical', 'high'] },
            include_tasks: { state: ['open', 'in_progress'] },
            include_kpis: { all: true },
            include_variances: true
          }
        }
      ]
    }
  },
  {
    key: 'service_ops',
    name: 'Service Ops OS',
    description: 'Operating System template for service businesses with technician scheduling, customer satisfaction, and SLA tracking.',
    version: 1,
    template_json: {
      kpis: [
        {
          key: 'first_call_resolution',
          name: 'First Call Resolution %',
          description: 'Percentage of service calls resolved on first visit',
          formula_hint: 'Resolved First Visit / Total Calls * 100',
          refresh: 'daily'
        },
        {
          key: 'avg_response_time',
          name: 'Average Response Time (hours)',
          description: 'Average time from request to technician arrival',
          formula_hint: 'AVG(arrival_time - request_time)',
          refresh: 'daily'
        },
        {
          key: 'customer_satisfaction',
          name: 'Customer Satisfaction Score',
          description: 'Average customer satisfaction rating (1-5 scale)',
          formula_hint: 'AVG(satisfaction_rating)',
          refresh: 'daily'
        },
        {
          key: 'technician_utilization',
          name: 'Technician Utilization %',
          description: 'Percentage of technician time spent on billable work',
          formula_hint: 'Billable Hours / Total Hours * 100',
          refresh: 'daily'
        },
        {
          key: 'revenue_per_technician',
          name: 'Revenue per Technician',
          description: 'Average monthly revenue generated per technician',
          formula_hint: 'Total Revenue / Number of Technicians',
          refresh: 'daily'
        }
      ],
      dashboards: [
        {
          name: 'Founder Command Center',
          layout: [
            { type: 'kpi', kpi_key: 'first_call_resolution', position: { x: 0, y: 0, w: 4, h: 2 } },
            { type: 'kpi', kpi_key: 'avg_response_time', position: { x: 4, y: 0, w: 4, h: 2 } },
            { type: 'kpi', kpi_key: 'customer_satisfaction', position: { x: 8, y: 0, w: 4, h: 2 } },
            { type: 'chart', chart_type: 'line', metric: 'first_call_resolution', position: { x: 0, y: 2, w: 6, h: 4 } },
            { type: 'chart', chart_type: 'bar', metric: 'technician_utilization', position: { x: 6, y: 2, w: 6, h: 4 } }
          ]
        },
        {
          name: 'Data Trust / Ingestion Health',
          layout: [
            { type: 'data_quality', position: { x: 0, y: 0, w: 12, h: 6 } }
          ]
        },
        {
          name: 'Alerts & Tasks',
          layout: [
            { type: 'alerts_list', position: { x: 0, y: 0, w: 6, h: 8 } },
            { type: 'tasks_list', position: { x: 6, y: 0, w: 6, h: 8 } }
          ]
        },
        {
          name: 'Meeting Mode',
          layout: [
            { type: 'agenda', cadence: 'weekly', position: { x: 0, y: 0, w: 12, h: 10 } }
          ]
        }
      ],
      alerts: [
        {
          kpi_key: 'first_call_resolution',
          severity: 'high',
          type: 'threshold',
          title: 'First Call Resolution Below Target',
          description: 'First call resolution rate is below 70%',
          threshold: { operator: '<', value: 70 }
        },
        {
          kpi_key: 'avg_response_time',
          severity: 'critical',
          type: 'threshold',
          title: 'Response Time Exceeds SLA',
          description: 'Average response time exceeds 4 hours',
          threshold: { operator: '>', value: 4 }
        },
        {
          kpi_key: 'customer_satisfaction',
          severity: 'medium',
          type: 'threshold',
          title: 'Customer Satisfaction Declining',
          description: 'Customer satisfaction score is below 4.0',
          threshold: { operator: '<', value: 4.0 }
        },
        {
          kpi_key: 'technician_utilization',
          severity: 'low',
          type: 'threshold',
          title: 'Low Technician Utilization',
          description: 'Technician utilization is below 75%',
          threshold: { operator: '<', value: 75 }
        },
        {
          kpi_key: 'revenue_per_technician',
          severity: 'medium',
          type: 'trend',
          title: 'Revenue per Technician Declining',
          description: 'Revenue per technician has declined for 2 consecutive months',
          threshold: { operator: 'trend_down', periods: 2 }
        },
        {
          kpi_key: 'avg_response_time',
          severity: 'high',
          type: 'trend',
          title: 'Response Time Trending Up',
          description: 'Average response time has increased for 3 consecutive weeks',
          threshold: { operator: 'trend_up', periods: 3 }
        }
      ],
      cadence: [
        {
          cadence: 'daily',
          title: 'Daily Operations Huddle',
          rules: {
            include_alerts: { severity: ['critical', 'high'] },
            include_tasks: { state: ['open', 'in_progress'], due_within_days: 1 },
            include_kpis: { trend: 'negative' }
          }
        },
        {
          cadence: 'weekly',
          title: 'Weekly Service Review',
          rules: {
            include_alerts: { severity: ['critical', 'high', 'medium'] },
            include_tasks: { state: ['open', 'in_progress'], due_within_days: 7 },
            include_kpis: { trend: 'negative' },
            include_variances: true
          }
        },
        {
          cadence: 'monthly',
          title: 'Monthly Business Review',
          rules: {
            include_alerts: { severity: ['critical', 'high'] },
            include_tasks: { state: ['open', 'in_progress'] },
            include_kpis: { all: true },
            include_variances: true
          }
        }
      ]
    }
  },
  {
    key: 'finance_ops',
    name: 'Finance OS',
    description: 'Operating System template for financial operations with cash flow, AR/AP, and profitability tracking.',
    version: 1,
    template_json: {
      kpis: [
        {
          key: 'cash_flow',
          name: 'Monthly Cash Flow',
          description: 'Net cash flow for the current month',
          formula_hint: 'Cash Inflows - Cash Outflows',
          refresh: 'daily'
        },
        {
          key: 'days_sales_outstanding',
          name: 'Days Sales Outstanding (DSO)',
          description: 'Average number of days to collect receivables',
          formula_hint: '(Accounts Receivable / Revenue) * Days in Period',
          refresh: 'daily'
        },
        {
          key: 'gross_margin',
          name: 'Gross Margin %',
          description: 'Gross profit margin percentage',
          formula_hint: '(Revenue - COGS) / Revenue * 100',
          refresh: 'daily'
        },
        {
          key: 'ebitda',
          name: 'EBITDA',
          description: 'Earnings before interest, taxes, depreciation, and amortization',
          formula_hint: 'Revenue - Operating Expenses (excluding interest, taxes, D&A)',
          refresh: 'daily'
        },
        {
          key: 'burn_rate',
          name: 'Monthly Burn Rate',
          description: 'Monthly cash consumption rate',
          formula_hint: 'Monthly Operating Expenses',
          refresh: 'daily'
        }
      ],
      dashboards: [
        {
          name: 'Founder Command Center',
          layout: [
            { type: 'kpi', kpi_key: 'cash_flow', position: { x: 0, y: 0, w: 4, h: 2 } },
            { type: 'kpi', kpi_key: 'gross_margin', position: { x: 4, y: 0, w: 4, h: 2 } },
            { type: 'kpi', kpi_key: 'ebitda', position: { x: 8, y: 0, w: 4, h: 2 } },
            { type: 'chart', chart_type: 'line', metric: 'cash_flow', position: { x: 0, y: 2, w: 6, h: 4 } },
            { type: 'chart', chart_type: 'bar', metric: 'days_sales_outstanding', position: { x: 6, y: 2, w: 6, h: 4 } }
          ]
        },
        {
          name: 'Data Trust / Ingestion Health',
          layout: [
            { type: 'data_quality', position: { x: 0, y: 0, w: 12, h: 6 } }
          ]
        },
        {
          name: 'Alerts & Tasks',
          layout: [
            { type: 'alerts_list', position: { x: 0, y: 0, w: 6, h: 8 } },
            { type: 'tasks_list', position: { x: 6, y: 0, w: 6, h: 8 } }
          ]
        },
        {
          name: 'Meeting Mode',
          layout: [
            { type: 'agenda', cadence: 'weekly', position: { x: 0, y: 0, w: 12, h: 10 } }
          ]
        }
      ],
      alerts: [
        {
          kpi_key: 'cash_flow',
          severity: 'critical',
          type: 'threshold',
          title: 'Negative Cash Flow',
          description: 'Monthly cash flow is negative',
          threshold: { operator: '<', value: 0 }
        },
        {
          kpi_key: 'days_sales_outstanding',
          severity: 'high',
          type: 'threshold',
          title: 'DSO Above Target',
          description: 'Days sales outstanding exceeds 45 days',
          threshold: { operator: '>', value: 45 }
        },
        {
          kpi_key: 'gross_margin',
          severity: 'medium',
          type: 'threshold',
          title: 'Gross Margin Below Target',
          description: 'Gross margin is below 30%',
          threshold: { operator: '<', value: 30 }
        },
        {
          kpi_key: 'ebitda',
          severity: 'high',
          type: 'threshold',
          title: 'Negative EBITDA',
          description: 'EBITDA is negative',
          threshold: { operator: '<', value: 0 }
        },
        {
          kpi_key: 'burn_rate',
          severity: 'critical',
          type: 'trend',
          title: 'Burn Rate Increasing',
          description: 'Monthly burn rate has increased for 2 consecutive months',
          threshold: { operator: 'trend_up', periods: 2 }
        },
        {
          kpi_key: 'cash_flow',
          severity: 'high',
          type: 'trend',
          title: 'Cash Flow Trend Negative',
          description: 'Cash flow has declined for 3 consecutive months',
          threshold: { operator: 'trend_down', periods: 3 }
        }
      ],
      cadence: [
        {
          cadence: 'daily',
          title: 'Daily Cash Review',
          rules: {
            include_alerts: { severity: ['critical'] },
            include_tasks: { state: ['open', 'in_progress'], due_within_days: 1 },
            include_kpis: ['cash_flow']
          }
        },
        {
          cadence: 'weekly',
          title: 'Weekly Finance Review',
          rules: {
            include_alerts: { severity: ['critical', 'high', 'medium'] },
            include_tasks: { state: ['open', 'in_progress'], due_within_days: 7 },
            include_kpis: { trend: 'negative' },
            include_variances: true
          }
        },
        {
          cadence: 'monthly',
          title: 'Monthly Financial Review',
          rules: {
            include_alerts: { severity: ['critical', 'high'] },
            include_tasks: { state: ['open', 'in_progress'] },
            include_kpis: { all: true },
            include_variances: true
          }
        }
      ]
    }
  }
]

export async function seedOsTemplates() {
  const supabase = createServiceRoleClient()

  for (const template of templates) {
    // Check if template already exists
    const { data: existing } = await supabase
      .from('os_templates')
      .select('id, version')
      .eq('key', template.key)
      .maybeSingle()

    if (existing) {
      // Update if version is newer
      if (template.version > (existing.version || 0)) {
        const { error: updateError } = await supabase
          .from('os_templates')
          .update({
            name: template.name,
            description: template.description,
            version: template.version,
            template_json: template.template_json,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (updateError) {
          console.error(`Error updating template ${template.key}:`, updateError)
          throw updateError
        }
        console.log(`✓ Updated template: ${template.name} (${template.key})`)
      } else {
        console.log(`Template ${template.key} already exists (v${existing.version}), skipping...`)
      }
      continue
    }

    const { data, error } = await supabase
      .from('os_templates')
      .insert(template)
      .select()
      .single()

    if (error) {
      console.error(`Error seeding template ${template.key}:`, error)
      throw error
    }

    console.log(`✓ Seeded template: ${template.name} (${template.key})`)
  }

  console.log('✓ All OS templates seeded successfully')
}

// Run if called directly
if (require.main === module) {
  seedOsTemplates()
    .then(() => {
      console.log('Done')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error:', error)
      process.exit(1)
    })
}

