import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 Starting seed...\n')

  // Create demo organization
  const { data: demoOrg, error: orgError } = await supabase
    .from('organizations')
    .upsert(
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Demo Organization',
        slug: 'demo',
        is_demo: true,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (orgError) {
    console.error('❌ Failed to create demo org:', orgError.message)
    process.exit(1)
  }

  console.log('✅ Demo organization created')
  console.log(`   ID: ${demoOrg.id}`)
  console.log(`   Name: ${demoOrg.name}`)
  console.log(`   Slug: ${demoOrg.slug}`)
  console.log(`   Is Demo: ${demoOrg.is_demo}`)

  // Create demo branding
  const { error: brandingError } = await supabase.from('org_branding').upsert(
    {
      org_id: demoOrg.id,
      company_name: 'Acme Construction',
      primary_color: '#1e40af',
      accent_color: '#f59e0b',
    },
    { onConflict: 'org_id' }
  )

  if (brandingError) {
    console.error('⚠️  Failed to create demo branding:', brandingError.message)
  } else {
    console.log('✅ Demo branding created')
  }

  // Create demo companies
  const demoCompanies = [
    {
      org_id: demoOrg.id,
      name: 'BuildRight General Contractors',
      industry: 'Construction',
      status: 'prospect' as const,
      employee_count: 150,
      annual_revenue: 45000000,
      city: 'Denver',
      state: 'CO',
    },
    {
      org_id: demoOrg.id,
      name: 'Summit Industrial Services',
      industry: 'Industrial Services',
      status: 'active' as const,
      employee_count: 85,
      annual_revenue: 22000000,
      city: 'Phoenix',
      state: 'AZ',
    },
    {
      org_id: demoOrg.id,
      name: 'Precision Mechanical Inc',
      industry: 'HVAC/Mechanical',
      status: 'prospect' as const,
      employee_count: 60,
      annual_revenue: 15000000,
      city: 'Dallas',
      state: 'TX',
    },
  ]

  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .upsert(demoCompanies, { onConflict: 'id' })
    .select()

  if (companiesError) {
    console.error('⚠️  Failed to create demo companies:', companiesError.message)
  } else {
    console.log(`✅ ${companies?.length || 0} demo companies created`)
  }

  // Create demo contacts
  if (companies && companies.length > 0) {
    const demoContacts = [
      {
        org_id: demoOrg.id,
        company_id: companies[0].id,
        first_name: 'Mike',
        last_name: 'Johnson',
        title: 'VP Operations',
        email: 'mike.johnson@example.com',
        is_primary: true,
      },
      {
        org_id: demoOrg.id,
        company_id: companies[0].id,
        first_name: 'Sarah',
        last_name: 'Chen',
        title: 'CFO',
        email: 'sarah.chen@example.com',
        is_primary: false,
      },
      {
        org_id: demoOrg.id,
        company_id: companies[1].id,
        first_name: 'Tom',
        last_name: 'Williams',
        title: 'COO',
        email: 'tom.williams@example.com',
        is_primary: true,
      },
      {
        org_id: demoOrg.id,
        company_id: companies[2].id,
        first_name: 'Lisa',
        last_name: 'Martinez',
        title: 'Director of Operations',
        email: 'lisa.martinez@example.com',
        is_primary: true,
      },
    ]

    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .upsert(demoContacts, { onConflict: 'id' })
      .select()

    if (contactsError) {
      console.error('⚠️  Failed to create demo contacts:', contactsError.message)
    } else {
      console.log(`✅ ${contacts?.length || 0} demo contacts created`)
    }

    // Create demo opportunities
    const demoOpportunities = [
      {
        org_id: demoOrg.id,
        company_id: companies[0].id,
        name: 'BuildRight Ops Dashboard',
        value: 75000,
        stage: 'discovery' as const,
        probability: 40,
        expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      {
        org_id: demoOrg.id,
        company_id: companies[1].id,
        name: 'Summit Full Implementation',
        value: 120000,
        stage: 'proposal' as const,
        probability: 60,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      {
        org_id: demoOrg.id,
        company_id: companies[2].id,
        name: 'Precision 60-Day Pilot',
        value: 35000,
        stage: 'qualified' as const,
        probability: 25,
        expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
    ]

    const { data: opportunities, error: oppsError } = await supabase
      .from('opportunities')
      .upsert(demoOpportunities, { onConflict: 'id' })
      .select()

    if (oppsError) {
      console.error('⚠️  Failed to create demo opportunities:', oppsError.message)
    } else {
      console.log(`✅ ${opportunities?.length || 0} demo opportunities created`)
    }

    // Create demo delivery project
    if (companies[1]) {
      const { data: project, error: projectError } = await supabase
        .from('delivery_projects')
        .upsert(
          {
            org_id: demoOrg.id,
            company_id: companies[1].id,
            name: 'Summit Phase 1 Implementation',
            status: 'in_progress' as const,
            start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            target_end_date: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (projectError) {
        console.error('⚠️  Failed to create demo project:', projectError.message)
      } else {
        console.log('✅ Demo delivery project created')

        // Create demo tasks
        const demoTasks = [
          {
            org_id: demoOrg.id,
            delivery_project_id: project.id,
            title: 'Connect ERP data source',
            status: 'done' as const,
            priority: 'high' as const,
            milestone: 'Week 1-2: Data Connection',
          },
          {
            org_id: demoOrg.id,
            delivery_project_id: project.id,
            title: 'Connect CRM data source',
            status: 'done' as const,
            priority: 'high' as const,
            milestone: 'Week 1-2: Data Connection',
          },
          {
            org_id: demoOrg.id,
            delivery_project_id: project.id,
            title: 'Build Executive Dashboard',
            status: 'in_progress' as const,
            priority: 'high' as const,
            milestone: 'Week 3-4: Dashboard Build',
          },
          {
            org_id: demoOrg.id,
            delivery_project_id: project.id,
            title: 'Build Ops Control Tower',
            status: 'todo' as const,
            priority: 'medium' as const,
            milestone: 'Week 3-4: Dashboard Build',
          },
          {
            org_id: demoOrg.id,
            delivery_project_id: project.id,
            title: 'Configure margin alerts',
            status: 'todo' as const,
            priority: 'high' as const,
            milestone: 'Week 5-6: Alerts',
          },
          {
            org_id: demoOrg.id,
            delivery_project_id: project.id,
            title: 'Configure AR aging alerts',
            status: 'todo' as const,
            priority: 'medium' as const,
            milestone: 'Week 5-6: Alerts',
          },
        ]

        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .upsert(demoTasks, { onConflict: 'id' })
          .select()

        if (tasksError) {
          console.error('⚠️  Failed to create demo tasks:', tasksError.message)
        } else {
          console.log(`✅ ${tasks?.length || 0} demo tasks created`)
        }
      }
    }
  }

  console.log('\n🎉 Seed completed!')
  console.log('\n📋 Summary:')
  console.log(`   Demo Org ID: ${demoOrg.id}`)
  console.log('   Add this to .env.local: DEMO_ORG_ID=' + demoOrg.id)
}

seed().catch(console.error)
