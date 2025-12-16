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
import { createServiceRoleClient } from '../lib/supabase/service-role'

const supabase = createServiceRoleClient()

const DEMO_ORG_SLUG = 'demo'

export async function seedDemoOS() {
  console.log('Seeding demo OS workspace...')

  // Find demo org
  const { data: demoOrg, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', DEMO_ORG_SLUG)
    .eq('is_demo', true)
    .single()

  if (orgError || !demoOrg) {
    console.error('Demo org not found. Please run seed-demo.ts first.')
    process.exit(1)
  }

  const orgId = demoOrg.id
  console.log(`Found demo org: ${orgId}`)

  // Get a template (use construction_ops as default)
  const { data: template, error: templateError } = await supabase
    .from('os_templates')
    .select('*')
    .eq('key', 'construction_ops')
    .single()

  if (templateError || !template) {
    console.error('Template not found. Please run seed-os-templates.ts first.')
    process.exit(1)
  }

  console.log(`Using template: ${template.name}`)

  // Check if instance already exists
  const { data: existingInstance } = await supabase
    .from('os_instances')
    .select('id, status')
    .eq('org_id', orgId)
    .eq('template_id', template.id)
    .maybeSingle()

  let instanceId: string

  if (existingInstance) {
    console.log('OS instance already exists, using existing...')
    instanceId = existingInstance.id
    
    // Ensure it's published
    if (existingInstance.status !== 'published') {
      const { error: updateError } = await supabase
        .from('os_instances')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', instanceId)
      
      if (updateError) {
        console.error('Error updating instance status:', updateError)
      } else {
        console.log('✓ Updated instance to published status')
      }
    }
  } else {
    // Create OS instance
    const { data: instance, error: instanceError } = await supabase
      .from('os_instances')
      .insert({
        org_id: orgId,
        template_id: template.id,
        name: `${template.name} - Demo Workspace`,
        status: 'published',
        published_at: new Date().toISOString(),
        created_by: 'demo@example.com'
      })
      .select()
      .single()

    if (instanceError) {
      console.error('Error creating OS instance:', instanceError)
      throw instanceError
    }

    if (!instance) {
      throw new Error('Failed to create OS instance')
    }

    instanceId = instance.id
    console.log(`✓ Created OS instance: ${instanceId}`)
  }

  // Create cadence items (idempotent)
  if (template.template_json.cadence && Array.isArray(template.template_json.cadence)) {
    const cadenceInserts = template.template_json.cadence.map((cad: any) => ({
      org_id: orgId,
      os_instance_id: instanceId,
      cadence: cad.cadence,
      title: cad.title,
      rules_json: cad.rules
    }))

    // Delete existing and re-insert for idempotency
    await supabase
      .from('cadence_items')
      .delete()
      .eq('org_id', orgId)
      .eq('os_instance_id', instanceId)

    const { error: cadenceError } = await supabase
      .from('cadence_items')
      .insert(cadenceInserts)

    if (cadenceError) {
      console.error('Error creating cadence items:', cadenceError)
    } else {
      console.log('✓ Created/updated cadence items')
    }
  }

  // Seed alerts and tasks
  await seedAlertsAndTasks(orgId, instanceId, template.template_json)

  console.log('✓ Demo OS workspace seeded successfully')
}

async function seedAlertsAndTasks(orgId: string, osInstanceId: string, templateJson: any) {
  // Create sample alerts
  const sampleAlerts = [
    {
      org_id: orgId,
      os_instance_id: osInstanceId,
      kpi_key: 'project_margin',
      severity: 'high',
      type: 'threshold',
      title: 'Project Margin Below Target',
      description: 'Project margin has fallen below 15% threshold',
      state: 'open',
      owner: null,
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      org_id: orgId,
      os_instance_id: osInstanceId,
      kpi_key: 'safety_incidents',
      severity: 'critical',
      type: 'threshold',
      title: 'Safety Incident Detected',
      description: 'A safety incident has been reported',
      state: 'acknowledged',
      owner: 'demo@example.com',
      due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      org_id: orgId,
      os_instance_id: osInstanceId,
      kpi_key: 'on_time_completion',
      severity: 'medium',
      type: 'threshold',
      title: 'On-Time Completion Rate Declining',
      description: 'On-time completion rate is below 80%',
      state: 'in_progress',
      owner: 'demo@example.com',
      due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Delete existing alerts and re-insert for idempotency
  await supabase
    .from('alerts')
    .delete()
    .eq('org_id', orgId)
    .eq('os_instance_id', osInstanceId)

  const { error: alertsError } = await supabase
    .from('alerts')
    .insert(sampleAlerts)

  if (alertsError) {
    console.error('Error creating alerts:', alertsError)
  } else {
    console.log('✓ Created/updated sample alerts')
  }

  // Create sample tasks
  const sampleTasks = [
    {
      org_id: orgId,
      alert_id: null,
      title: 'Review Project Margin Analysis',
      description: 'Analyze root causes of margin decline and propose corrective actions',
      owner: 'demo@example.com',
      state: 'open',
      due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      org_id: orgId,
      alert_id: null,
      title: 'Implement Safety Protocol Updates',
      description: 'Update safety protocols based on recent incident review',
      owner: 'demo@example.com',
      state: 'in_progress',
      due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      org_id: orgId,
      alert_id: null,
      title: 'Schedule Team Training Session',
      description: 'Organize training session on new safety procedures',
      owner: 'demo@example.com',
      state: 'open',
      due_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Delete existing tasks for this org and re-insert for idempotency
  await supabase
    .from('os_tasks')
    .delete()
    .eq('org_id', orgId)

  const { error: tasksError } = await supabase
    .from('os_tasks')
    .insert(sampleTasks)

  if (tasksError) {
    console.error('Error creating tasks:', tasksError)
  } else {
    console.log('✓ Created/updated sample tasks')
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoOS()
    .then(() => {
      console.log('Done')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error:', error)
      process.exit(1)
    })
}

