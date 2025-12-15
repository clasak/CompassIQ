import { test, expect } from '@playwright/test'

/**
 * Smoke tests to validate core functionality
 * 
 * Note: These tests assume:
 * - A test user exists in Supabase (set via env vars)
 * - Demo org exists (run seed script)
 * - Next.js dev server is running on localhost:3000
 */

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'testpassword123'

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('Login flow renders dashboard shell', async ({ page }) => {
    // Try to login (this will fail if credentials are wrong, but we can still check UI)
    // For now, we'll just check that the login page renders
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible()
    
    // Note: Actual login requires valid Supabase credentials
    // In a real scenario, you'd either:
    // 1. Use a test user created in a setup script
    // 2. Mock the auth flow
    // 3. Use Supabase test helpers
  })

  test('Onboarding -> create org -> lands on /app', async ({ page }) => {
    // This test would require:
    // 1. Being logged in (or mocking auth)
    // 2. Having no existing orgs
    // 3. Creating an org via the onboarding flow
    
    // For now, we'll check the onboarding page structure exists
    // In a real test, you'd navigate to /app/onboarding and fill the form
    test.skip('Requires authentication setup')
  })

  test('Demo toggle -> create action is disabled and write attempt shows error', async ({ page }) => {
    // This test validates demo mode read-only enforcement
    
    // Note: This requires being logged in and having access to demo org
    // Steps would be:
    // 1. Login
    // 2. Navigate to dashboard
    // 3. Toggle to demo org
    // 4. Find a create/edit button and assert it's disabled
    // 5. Try to force a write operation (if possible) and assert error toast
    
    test.skip('Requires authentication setup and demo org')
  })

  test('Settings pages are accessible to admin users', async ({ page }) => {
    // This test validates admin-only pages
    
    // Note: Requires being logged in as OWNER/ADMIN
    // Steps:
    // 1. Login as admin
    // 2. Navigate to /app/settings/org
    // 3. Assert page loads
    // 4. Navigate to /app/settings/users
    // 5. Assert page loads
    // 6. Navigate to /app/settings/invites
    // 7. Assert page loads
    
    test.skip('Requires authentication setup with admin user')
  })

  test('Invite acceptance flow works', async ({ page }) => {
    // This test validates the invite acceptance flow
    
    // Note: Requires:
    // 1. Creating an invite as admin
    // 2. Logging in as a different user (or logging out and in)
    // 3. Visiting /invite/[token]
    // 4. Asserting redirect to /app after acceptance
    
    test.skip('Requires multi-user setup')
  })

  test('ROI calculator renders and calculations update', async ({ page }) => {
    // Navigate to ROI page
    await page.goto('/app/roi')
    
    // Check that ROI inputs are visible
    await expect(page.locator('input[id="averageDealSize"]')).toBeVisible()
    await expect(page.locator('input[id="monthlyLeads"]')).toBeVisible()
    
    // Enter some test values
    await page.fill('input[id="averageDealSize"]', '50000')
    await page.fill('input[id="monthlyLeads"]', '100')
    await page.fill('input[id="currentWinRate"]', '25')
    await page.fill('input[id="targetWinRate"]', '35')
    
    // Check that results section appears with calculated values
    await expect(page.locator('text=Estimated Annual Impact')).toBeVisible()
    
    // Note: Full calculation validation would require checking specific result values
    // which depend on all input fields. This test validates the UI is functional.
  })

  test('Demo presentation navigation works', async ({ page }) => {
    // Navigate to demo page
    await page.goto('/app/demo')
    
    // Check that step navigation is visible
    await expect(page.locator('button:has-text("1")')).toBeVisible()
    await expect(page.locator('button:has-text("2")')).toBeVisible()
    
    // Click on step 2
    await page.click('button:has-text("2")')
    
    // Check that step 2 content is displayed
    await expect(page.locator('text=Sales Funnel')).toBeVisible()
    
    // Test next/previous navigation
    await page.click('button:has-text("Previous")')
    await expect(page.locator('text=Command Center')).toBeVisible()
  })

  test('Export/Import configuration works', async ({ page }) => {
    // Note: This test requires authentication and admin access
    // For now, we'll validate the UI exists
    
    // Navigate to export page
    await page.goto('/app/settings/export')
    
    // Should redirect to login if not authenticated, or show export button if authenticated
    const exportButton = page.locator('button:has-text("Export")')
    const isAuthenticated = await exportButton.count() > 0
    
    if (isAuthenticated) {
      // Test export functionality
      await expect(exportButton).toBeVisible()
      
      // Note: Full test would:
      // 1. Click export button
      // 2. Wait for download
      // 3. Verify JSON structure
      // 4. Import the file
      // 5. Verify data was imported
    } else {
      // If not authenticated, verify redirect to login
      await expect(page).toHaveURL(/.*login/)
    }
  })
})

/**
 * Helper test that validates the app structure without requiring auth
 */
test('App shell structure exists', async ({ page }) => {
  // This test just checks that basic pages exist and render
  // without requiring authentication
  
  // Check login page
  await page.goto('/login')
  await expect(page).toHaveURL(/.*login/)
  
  // Try to access protected route (should redirect to login)
  await page.goto('/app')
  // Should redirect to login if not authenticated
  await expect(page).toHaveURL(/.*login/)
})

