import { z } from 'zod'

/**
 * Intake Pack JSON Schema
 * Defines the structure for client intake data that generates preview workspaces
 */

// Company information
const CompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  locations: z.array(z.object({
    name: z.string().optional(),
    address1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal: z.string().optional(),
    country: z.string().optional(),
  })).optional(),
  primary_contact: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
  }).optional(),
})

// Branding information
const BrandingSchema = z.object({
  name: z.string().optional(),
  logo_light: z.string().optional(), // URL or base64
  logo_dark: z.string().optional(), // URL or base64
  mark: z.string().optional(), // URL or base64
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color like #0A192F').optional(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color like #007BFF').optional(),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

// KPI definition
const KPISchema = z.object({
  key: z.string().min(1, 'KPI key is required'),
  label: z.string().min(1, 'KPI label is required'),
  unit: z.string().optional(),
  baseline_value: z.number(),
  target_value: z.number().optional(),
  cadence: z.enum(['Daily', 'Weekly', 'Monthly']).optional().default('Daily'),
})

// Optional entities
const OptionalEntitiesSchema = z.object({
  accounts: z.array(z.object({
    name: z.string().min(1),
    site_count: z.number().optional(),
    region: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).optional(),
  opportunities: z.array(z.object({
    name: z.string().min(1),
    stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).default('LEAD'),
    amount: z.number().optional().default(0),
    close_date: z.string().optional(), // ISO date string
    notes: z.string().optional(),
  })).optional(),
  tasks: z.array(z.object({
    title: z.string().min(1),
    owner_email: z.string().email().optional(),
    due_date: z.string().optional(), // ISO date string
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  })).optional(),
  construction: z.object({
    projects: z.array(z.object({
      name: z.string().min(1),
      job_number: z.string().optional(),
      customer_name: z.string().optional(),
      status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETE', 'CANCELLED']).optional().default('ACTIVE'),
      start_date: z.string().optional(), // ISO date string
      end_date: z.string().optional(), // ISO date string
      pm_name: z.string().optional(),
      superintendent: z.string().optional(),
      region: z.string().optional(),
      contract_value: z.number().optional(),
    })).optional(),
    costSnapshots: z.array(z.object({
      project_name: z.string().min(1), // Reference by name
      snapshot_date: z.string(), // ISO date string
      cost_code: z.string().optional(),
      budget: z.number().default(0),
      committed: z.number().default(0),
      actual_cost: z.number().default(0),
      percent_complete: z.number().optional(),
      earned_value: z.number().optional(),
    })).optional(),
    milestones: z.array(z.object({
      project_name: z.string().min(1), // Reference by name
      name: z.string().min(1),
      baseline_date: z.string().optional(), // ISO date string
      forecast_date: z.string().optional(), // ISO date string
      actual_date: z.string().optional(), // ISO date string
      status: z.string().optional().default('PENDING'),
    })).optional(),
    changeOrders: z.array(z.object({
      project_name: z.string().min(1), // Reference by name
      number: z.string().min(1),
      title: z.string().min(1),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'BILLED']).optional().default('PENDING'),
      amount: z.number().default(0),
      submitted_date: z.string().optional(), // ISO date string
      approved_date: z.string().optional(), // ISO date string
      billed_date: z.string().optional(), // ISO date string
    })).optional(),
    laborEntries: z.array(z.object({
      project_name: z.string().min(1), // Reference by name
      work_date: z.string(), // ISO date string
      crew: z.string().optional(),
      trade: z.string().optional(),
      hours: z.number().default(0),
      cost: z.number().default(0),
      units_completed: z.number().optional(),
      cost_code: z.string().optional(),
    })).optional(),
    equipmentLogs: z.array(z.object({
      project_name: z.string().min(1), // Reference by name
      equipment_name: z.string().min(1),
      date: z.string(), // ISO date string
      hours_used: z.number().default(0),
      idle_hours: z.number().default(0),
      location: z.string().optional(),
      cost: z.number().default(0),
    })).optional(),
    invoices: z.array(z.object({
      project_name: z.string().optional(), // Reference by name (optional)
      invoice_number: z.string().min(1),
      customer: z.string().min(1),
      invoice_date: z.string(), // ISO date string
      due_date: z.string(), // ISO date string
      amount: z.number().default(0),
      balance: z.number().default(0),
      status: z.enum(['DRAFT', 'SENT', 'OVERDUE', 'PAID', 'VOID']).optional().default('SENT'),
    })).optional(),
  }).optional(),
})

// Main Intake Pack schema
export const IntakePackSchema = z.object({
  company: CompanySchema,
  branding: BrandingSchema.optional(),
  pains: z.array(z.string()).default([]),
  kpis: z.array(KPISchema).min(1, 'At least one KPI is required'),
  optional_entities: OptionalEntitiesSchema.optional(),
  mode: z.enum(['preview_only', 'seed_preview_and_crm']).default('preview_only'),
})

export type IntakePack = z.infer<typeof IntakePackSchema>
export type Company = z.infer<typeof CompanySchema>
export type Branding = z.infer<typeof BrandingSchema>
export type KPI = z.infer<typeof KPISchema>
export type OptionalEntities = z.infer<typeof OptionalEntitiesSchema>
