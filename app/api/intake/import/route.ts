import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/org'
import { getCurrentRole } from '@/lib/role'
import { IntakePackSchema, type IntakePack } from '@/lib/intake-schema'
import { setActivePreviewId } from '@/lib/preview'
import { extractColorsFromImage } from '@/lib/branding/extract-colors'
import { isDevDemoMode } from '@/lib/runtime'

/**
 * POST /api/intake/import
 * Imports an Intake Pack and generates a preview workspace
 * 
 * Requires: OWNER/ADMIN role, non-demo org
 * Returns: { ok: true, previewWorkspaceId, redirectTo: "/app" }
 */
export async function POST(request: NextRequest) {
  try {
    // Check auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get org context
    const orgId = await getActiveOrgId()
    if (!orgId) {
      return NextResponse.json({ ok: false, error: 'No organization context' }, { status: 400 })
    }

    // Check role
    const roleCheck = await getCurrentRole()
    if (!roleCheck.role || !['OWNER', 'ADMIN'].includes(roleCheck.role)) {
      return NextResponse.json({ ok: false, error: 'OWNER or ADMIN role required' }, { status: 403 })
    }

    // Check if demo org
    if (isDevDemoMode() || roleCheck.isDemo) {
      return NextResponse.json({ ok: false, error: 'DEMO_READ_ONLY', message: 'Demo org is read-only' }, { status: 403 })
    }

    // Parse and validate intake pack
    const body = await request.json()
    const validationResult = IntakePackSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json({
        ok: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 })
    }

    const intakePack: IntakePack = validationResult.data

    // Create preview workspace
    const { data: previewWorkspace, error: workspaceError } = await supabase
      .from('preview_workspaces')
      .insert({
        org_id: orgId,
        name: intakePack.company.name,
        industry: intakePack.company.industry || null,
        pains: intakePack.pains,
        kpis: intakePack.kpis.map(k => ({
          key: k.key,
          label: k.label,
          unit: k.unit,
          baseline_value: k.baseline_value,
          target_value: k.target_value,
          cadence: k.cadence,
        })),
        created_by: user.id,
      })
      .select()
      .single()

    if (workspaceError || !previewWorkspace) {
      console.error('Failed to create preview workspace:', workspaceError)
      return NextResponse.json({
        ok: false,
        error: 'Failed to create preview workspace',
        details: workspaceError?.message,
      }, { status: 500 })
    }

    const previewWorkspaceId = previewWorkspace.id

    // Handle branding if provided
    if (intakePack.branding) {
      const brandingData: any = {
        org_id: orgId,
        brand_name: intakePack.branding.name || intakePack.company.name,
        primary_color: intakePack.branding.primary_color || '#0A192F',
        accent_color: intakePack.branding.accent_color || '#007BFF',
        metadata: {
          preview_workspace_id: previewWorkspaceId,
        },
      }

      // Handle logo uploads (if base64, would need to upload to storage first)
      // For now, if URLs are provided, use them directly
      if (intakePack.branding.logo_light && intakePack.branding.logo_light.startsWith('http')) {
        brandingData.logo_light_url = intakePack.branding.logo_light
      }
      if (intakePack.branding.logo_dark && intakePack.branding.logo_dark.startsWith('http')) {
        brandingData.logo_dark_url = intakePack.branding.logo_dark
      }
      if (intakePack.branding.mark && intakePack.branding.mark.startsWith('http')) {
        brandingData.mark_url = intakePack.branding.mark
      }

      // Upsert branding
      await supabase
        .from('org_branding')
        .upsert(brandingData, {
          onConflict: 'org_id',
        })
    }

    // Create metric values for KPIs
    const now = new Date()
    const metricValues = intakePack.kpis.map(kpi => ({
      org_id: orgId,
      metric_key: kpi.key,
      value: kpi.baseline_value,
      occurred_on: now.toISOString().split('T')[0],
      preview_workspace_id: previewWorkspaceId,
    }))

    if (metricValues.length > 0) {
      const { error: metricError } = await supabase
        .from('metric_values')
        .insert(metricValues)

      if (metricError) {
        console.error('Failed to insert metric values:', metricError)
        // Continue anyway - workspace is created
      }
    }

    // Create preview alerts based on pains
    if (intakePack.pains.length > 0) {
      const alerts = intakePack.pains.map((pain, index) => ({
        org_id: orgId,
        preview_workspace_id: previewWorkspaceId,
        title: pain,
        description: `Identified during client intake`,
        severity: index === 0 ? 'high' : 'medium',
        rule: { type: 'intake_pain', pain_index: index },
      }))

      await supabase
        .from('preview_alerts')
        .insert(alerts)
    }

    // Seed CRM entities if mode includes it
    const createdIds: {
      accountIds?: string[]
      opportunityIds?: string[]
      taskIds?: string[]
      quoteIds?: string[]
      constructionProjectIds?: string[]
      constructionChangeOrderIds?: string[]
      constructionInvoiceIds?: string[]
    } = {}

    if (intakePack.mode === 'seed_preview_and_crm' && intakePack.optional_entities) {
      const entities = intakePack.optional_entities

      // Create accounts
      if (entities.accounts && entities.accounts.length > 0) {
        const accounts = entities.accounts.map(acc => ({
          org_id: orgId,
          name: acc.name,
          industry: intakePack.company.industry || null,
          status: 'ACTIVE',
          metadata: { data_origin: 'imported' },
        }))

        const { data: createdAccounts } = await supabase
          .from('accounts')
          .insert(accounts)
          .select()

        if (createdAccounts) {
          createdIds.accountIds = createdAccounts.map(a => a.id)
        }

        // Create opportunities if accounts were created
        if (createdAccounts && entities.opportunities && entities.opportunities.length > 0) {
          const accountMap = new Map(createdAccounts.map(a => [a.name.toLowerCase(), a.id]))
          const opportunities = entities.opportunities.map(opp => {
            const accountId = accountMap.get(intakePack.company.name.toLowerCase()) || createdAccounts[0]?.id
            return {
              org_id: orgId,
              account_id: accountId,
              name: opp.name,
              stage: opp.stage,
              amount: opp.amount || 0,
              close_date: opp.close_date || null,
              owner_user_id: user.id,
              metadata: { data_origin: 'imported' },
            }
          })

          const { data: createdOpps } = await supabase
            .from('opportunities')
            .insert(opportunities)
            .select()

          if (createdOpps) {
            createdIds.opportunityIds = createdOpps.map(o => o.id)
          }
        }

        // Create tasks
        if (entities.tasks && entities.tasks.length > 0) {
          const accountId = createdAccounts?.[0]?.id
          const tasks = entities.tasks.map(task => ({
            org_id: orgId,
            title: task.title,
            status: 'OPEN',
            priority: task.priority || 'MEDIUM',
            due_date: task.due_date || null,
            assigned_user_id: user.id,
            related_type: accountId ? 'account' : null,
            related_id: accountId || null,
            metadata: { data_origin: 'imported' },
          }))

          const { data: createdTasks } = await supabase
            .from('tasks')
            .insert(tasks)
            .select()

          if (createdTasks) {
            createdIds.taskIds = createdTasks.map(t => t.id)
          }
        }

        // Quotes creation is not part of intake schema yet
        // Can be added later if needed
      }
    }

    // Seed Construction entities if mode includes it and construction data is provided
    if (intakePack.mode === 'seed_preview_and_crm' && intakePack.optional_entities?.construction) {
      const construction = intakePack.optional_entities.construction

      // Create projects first (needed for foreign keys)
      if (construction.projects && construction.projects.length > 0) {
        const projects = construction.projects.map(proj => ({
          org_id: orgId,
          preview_workspace_id: previewWorkspaceId,
          name: proj.name,
          job_number: proj.job_number || null,
          customer_name: proj.customer_name || null,
          status: proj.status || 'ACTIVE',
          start_date: proj.start_date || null,
          end_date: proj.end_date || null,
          pm_name: proj.pm_name || null,
          superintendent: proj.superintendent || null,
          region: proj.region || null,
          metadata: {
            data_origin: 'imported',
            contract_value: proj.contract_value || null,
          },
        }))

        const { data: createdProjects } = await supabase
          .from('construction_projects')
          .insert(projects)
          .select()

        if (createdProjects) {
          createdIds.constructionProjectIds = createdProjects.map(p => p.id)
          const projectMap = new Map(createdProjects.map(p => [p.name, p.id]))

          // Create cost snapshots
          if (construction.costSnapshots && construction.costSnapshots.length > 0) {
            const costSnapshots = construction.costSnapshots
              .filter(snap => projectMap.has(snap.project_name))
              .map(snap => ({
                org_id: orgId,
                project_id: projectMap.get(snap.project_name)!,
                snapshot_date: snap.snapshot_date,
                cost_code_id: null, // Would need cost code lookup if provided
                budget: snap.budget || 0,
                committed: snap.committed || 0,
                actual_cost: snap.actual_cost || 0,
                percent_complete: snap.percent_complete || null,
                earned_value: snap.earned_value || null,
                metadata: { data_origin: 'imported', cost_code: snap.cost_code || null },
              }))

            if (costSnapshots.length > 0) {
              await supabase
                .from('construction_job_cost_snapshots')
                .insert(costSnapshots)
            }
          }

          // Create milestones
          if (construction.milestones && construction.milestones.length > 0) {
            const milestones = construction.milestones
              .filter(m => projectMap.has(m.project_name))
              .map(m => ({
                org_id: orgId,
                project_id: projectMap.get(m.project_name)!,
                name: m.name,
                baseline_date: m.baseline_date || null,
                forecast_date: m.forecast_date || null,
                actual_date: m.actual_date || null,
                status: m.status || 'PENDING',
                metadata: { data_origin: 'imported' },
              }))

            if (milestones.length > 0) {
              await supabase
                .from('construction_schedule_milestones')
                .insert(milestones)
            }
          }

          // Create change orders
          if (construction.changeOrders && construction.changeOrders.length > 0) {
            const changeOrders = construction.changeOrders
              .filter(co => projectMap.has(co.project_name))
              .map(co => ({
                org_id: orgId,
                project_id: projectMap.get(co.project_name)!,
                number: co.number,
                title: co.title,
                status: co.status || 'PENDING',
                amount: co.amount || 0,
                submitted_date: co.submitted_date || null,
                approved_date: co.approved_date || null,
                billed_date: co.billed_date || null,
                metadata: { data_origin: 'imported' },
              }))

            const { data: createdChangeOrders } = await supabase
              .from('construction_change_orders')
              .insert(changeOrders)
              .select()

            if (createdChangeOrders) {
              createdIds.constructionChangeOrderIds = createdChangeOrders.map(co => co.id)
            }
          }

          // Create labor entries
          if (construction.laborEntries && construction.laborEntries.length > 0) {
            const laborEntries = construction.laborEntries
              .filter(le => projectMap.has(le.project_name))
              .map(le => ({
                org_id: orgId,
                project_id: projectMap.get(le.project_name)!,
                work_date: le.work_date,
                crew: le.crew || null,
                trade: le.trade || null,
                hours: le.hours || 0,
                cost: le.cost || 0,
                units_completed: le.units_completed || null,
                cost_code_id: null, // Would need cost code lookup if provided
                metadata: { data_origin: 'imported', cost_code: le.cost_code || null },
              }))

            if (laborEntries.length > 0) {
              await supabase
                .from('construction_labor_entries')
                .insert(laborEntries)
            }
          }

          // Create equipment logs
          if (construction.equipmentLogs && construction.equipmentLogs.length > 0) {
            const equipmentLogs = construction.equipmentLogs
              .filter(el => projectMap.has(el.project_name))
              .map(el => ({
                org_id: orgId,
                project_id: projectMap.get(el.project_name)!,
                equipment_name: el.equipment_name,
                date: el.date,
                hours_used: el.hours_used || 0,
                idle_hours: el.idle_hours || 0,
                location: el.location || null,
                cost: el.cost || 0,
                metadata: { data_origin: 'imported' },
              }))

            if (equipmentLogs.length > 0) {
              await supabase
                .from('construction_equipment_logs')
                .insert(equipmentLogs)
            }
          }

          // Create invoices
          if (construction.invoices && construction.invoices.length > 0) {
            const invoices = construction.invoices.map(inv => ({
              org_id: orgId,
              project_id: inv.project_name ? projectMap.get(inv.project_name) || null : null,
              invoice_number: inv.invoice_number,
              customer: inv.customer,
              invoice_date: inv.invoice_date,
              due_date: inv.due_date,
              amount: inv.amount || 0,
              balance: inv.balance || inv.amount || 0,
              status: inv.status || 'SENT',
              metadata: { data_origin: 'imported' },
            }))

            const { data: createdInvoices } = await supabase
              .from('construction_invoices')
              .insert(invoices)
              .select()

            if (createdInvoices) {
              createdIds.constructionInvoiceIds = createdInvoices.map(inv => inv.id)
            }
          }
        }
      }
    }

    // Set active preview workspace
    await setActivePreviewId(previewWorkspaceId)

    // Build redirect URL with query params
    const params = new URLSearchParams()
    params.set('previewWorkspaceId', previewWorkspaceId)
    if (createdIds.accountIds?.length) {
      params.set('accountIds', createdIds.accountIds.join(','))
    }
    if (createdIds.opportunityIds?.length) {
      params.set('opportunityIds', createdIds.opportunityIds.join(','))
    }
    if (createdIds.taskIds?.length) {
      params.set('taskIds', createdIds.taskIds.join(','))
    }
    if (createdIds.quoteIds?.length) {
      params.set('quoteIds', createdIds.quoteIds.join(','))
    }
    if (createdIds.constructionProjectIds?.length) {
      params.set('constructionProjectIds', createdIds.constructionProjectIds.join(','))
    }
    if (createdIds.constructionChangeOrderIds?.length) {
      params.set('constructionChangeOrderIds', createdIds.constructionChangeOrderIds.join(','))
    }
    if (createdIds.constructionInvoiceIds?.length) {
      params.set('constructionInvoiceIds', createdIds.constructionInvoiceIds.join(','))
    }

    return NextResponse.json({
      ok: true,
      previewWorkspaceId,
      redirectTo: `/app/sales/intake/result?${params.toString()}`,
      createdIds,
    })
  } catch (error: any) {
    console.error('Intake import error:', error)
    return NextResponse.json({
      ok: false,
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
    }, { status: 500 })
  }
}


