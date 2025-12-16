#!/usr/bin/env tsx
/**
 * Preflight checker for Supabase environment variables
 * Validates all required keys are present and working
 */

import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

interface ValidationResult {
  name: string
  passed: boolean
  httpCode?: number
  length?: number
  dbHost?: string
  message?: string
}

const results: ValidationResult[] = []
let allPassed = true

function validateAnonKey(): ValidationResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    allPassed = false
    return {
      name: 'ANON_KEY',
      passed: false,
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    }
  }

  // Make health check
  try {
    const response = fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }).then((r) => r.status)

    // For sync validation, we'll do it differently
    // Using a sync approach would require a library, so we'll do async
    return {
      name: 'ANON_KEY',
      passed: false,
      message: 'Will validate via HTTP check',
      length: key.length,
    }
  } catch {
    return {
      name: 'ANON_KEY',
      passed: false,
      message: 'Failed to validate',
      length: key.length,
    }
  }
}

async function validateAnonKeyAsync(): Promise<ValidationResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    allPassed = false
    return {
      name: 'ANON_KEY',
      passed: false,
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    }
  }

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    const httpCode = response.status
    const passed = httpCode === 200

    if (!passed) allPassed = false

    return {
      name: 'ANON_KEY',
      passed,
      httpCode,
      length: key.length,
    }
  } catch (error: any) {
    allPassed = false
    return {
      name: 'ANON_KEY',
      passed: false,
      length: key.length,
      message: error.message,
    }
  }
}

async function validateServiceRoleKey(): Promise<ValidationResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    allPassed = false
    return {
      name: 'SERVICE_ROLE_KEY',
      passed: false,
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    }
  }

  if (key.length <= 100) {
    allPassed = false
    return {
      name: 'SERVICE_ROLE_KEY',
      passed: false,
      length: key.length,
      message: 'Key too short (likely placeholder)',
    }
  }

  // Check for placeholder patterns
  if (key.includes('YOUR_SERVICE_ROLE_KEY') || key.includes('PLACEHOLDER')) {
    allPassed = false
    return {
      name: 'SERVICE_ROLE_KEY',
      passed: false,
      length: key.length,
      message: 'Contains placeholder text',
    }
  }

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    const httpCode = response.status
    const passed = httpCode !== 401

    if (!passed) allPassed = false

    return {
      name: 'SERVICE_ROLE_KEY',
      passed,
      httpCode,
      length: key.length,
    }
  } catch (error: any) {
    allPassed = false
    return {
      name: 'SERVICE_ROLE_KEY',
      passed: false,
      length: key.length,
      message: error.message,
    }
  }
}

function validateDbUrl(): ValidationResult {
  const dbUrl = process.env.SUPABASE_DB_URL

  if (!dbUrl) {
    allPassed = false
    return {
      name: 'DB_URL',
      passed: false,
      message: 'Missing SUPABASE_DB_URL',
    }
  }

  if (dbUrl.includes('YOUR_DB_PASSWORD')) {
    allPassed = false
    return {
      name: 'DB_URL',
      passed: false,
      message: 'Contains placeholder YOUR_DB_PASSWORD',
    }
  }

  // Extract hostname
  let dbHost = 'unknown'
  try {
    const urlObj = new URL(dbUrl.replace('postgresql://', 'https://'))
    dbHost = urlObj.hostname
  } catch {
    // Try regex fallback
    const match = dbUrl.match(/@([^:]+):/)
    if (match) dbHost = match[1]
  }

  return {
    name: 'DB_URL',
    passed: true,
    dbHost,
  }
}

async function main() {
  console.log('🔍 Preflight check for Supabase environment variables...\n')

  // Validate ANON key
  const anonResult = await validateAnonKeyAsync()
  results.push(anonResult)

  // Validate SERVICE_ROLE key
  const serviceRoleResult = await validateServiceRoleKey()
  results.push(serviceRoleResult)

  // Validate DB URL
  const dbUrlResult = validateDbUrl()
  results.push(dbUrlResult)

  // Print results (no secrets)
  console.log('Results:')
  console.log('--------')
  for (const result of results) {
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} ${result.name}:`)

    if (result.httpCode !== undefined) {
      console.log(`   HTTP code: ${result.httpCode}`)
    }
    if (result.length !== undefined) {
      console.log(`   Length: ${result.length}`)
    }
    if (result.dbHost) {
      console.log(`   DB host: ${result.dbHost}`)
    }
    if (result.name === 'DB_URL') {
      console.log(`   Present: yes`)
    }
    if (result.message) {
      console.log(`   Message: ${result.message}`)
    }
    console.log()
  }

  // Summary
  if (allPassed) {
    console.log('✅ All preflight checks passed')
    process.exit(0)
  } else {
    console.log('❌ Preflight checks failed')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

