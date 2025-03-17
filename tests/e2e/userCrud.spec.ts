import { test, expect } from '@playwright/test'

test.describe('User CRUD Operations', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Login as admin
    await page.locator('input[type="email"]').fill('admin@example.com')
    await page.locator('input[type="password"]').fill('password')
    await page.locator('button[type="submit"]').click()
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/')
    
    // Navigate to users page
    await page.locator('text=Users').click()
    await expect(page).toHaveURL('/users')
  })

  test('should display user list', async ({ page }) => {
    // Check if user list is displayed
    await expect(page.locator('h1')).toContainText('User Management')
    
    // Check if table headers are visible
    await expect(page.locator('th:has-text("Name")')).toBeVisible()
    await expect(page.locator('th:has-text("Email")')).toBeVisible()
    await expect(page.locator('th:has-text("Role")')).toBeVisible()
    await expect(page.locator('th:has-text("Status")')).toBeVisible()
    
    // Check if at least one user is displayed
    await expect(page.locator('tbody tr')).toHaveCount({ min: 1 })
  })

  test('should search for users', async ({ page }) => {
    // Get initial user count
    const initialCount = await page.locator('tbody tr').count()
    
    // Search for a specific user
    await page.locator('[data-test="search-input"]').fill('admin')
    
    // Wait for search results
    await page.waitForTimeout(500) // Wait for debounce
    
    // Check if search results are filtered
    const filteredCount = await page.locator('tbody tr').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
    
    // Check if search term is found in results
    await expect(page.locator('tbody')).toContainText('admin')
  })

  test('should filter users by role', async ({ page }) => {
    // Select admin role filter
    await page.locator('select[data-test="role-filter"]').selectOption('admin')
    
    // Wait for filter to apply
    await page.waitForTimeout(300)
    
    // Check if all displayed users have admin role
    const rows = await page.locator('tbody tr').all()
    for (const row of rows) {
      await expect(row.locator('td:nth-child(3)')).toContainText('Admin')
    }
  })

  test('should create a new user', async ({ page }) => {
    // Click add user button
    await page.locator('[data-test="add-user-button"]').click()
    
    // Wait for modal to appear
    await expect(page.locator('h2:has-text("Create User")')).toBeVisible()
    
    // Fill the form
    await page.locator('input[name="name"]').fill('E2E Test User')
    await page.locator('input[name="email"]').fill(`e2e-test-${Date.now()}@example.com`)
    await page.locator('select[name="role"]').selectOption('user')
    await page.locator('select[name="status"]').selectOption('active')
    
    // Submit the form
    await page.locator('button[type="submit"]').click()
    
    // Wait for modal to close
    await expect(page.locator('h2:has-text("Create User")')).not.toBeVisible()
    
    // Check if new user appears in the list
    await expect(page.locator('tbody')).toContainText('E2E Test User')
  })

  test('should view user details', async ({ page }) => {
    // Click view button for the first user
    await page.locator('tbody tr:first-child [data-test^="view-user-"]').click()
    
    // Check if navigated to user detail page
    await expect(page.url()).toMatch(/\/users\/\w+/)
    
    // Check if user details are displayed
    await expect(page.locator('h1')).toContainText('User Details')
    await expect(page.locator('[data-test="user-email"]')).toBeVisible()
    await expect(page.locator('[data-test="user-role"]')).toBeVisible()
  })

  test('should edit a user', async ({ page }) => {
    // Click view button for the first user
    await page.locator('tbody tr:first-child [data-test^="view-user-"]').click()
    
    // Wait for user details page
    await expect(page.locator('h1')).toContainText('User Details')
    
    // Click edit button
    await page.locator('[data-test="edit-user-button"]').click()
    
    // Wait for modal to appear
    await expect(page.locator('h2:has-text("Edit User")')).toBeVisible()
    
    // Update user name
    const newName = `Updated User ${Date.now()}`
    await page.locator('input[name="name"]').fill(newName)
    
    // Submit the form
    await page.locator('button[type="submit"]').click()
    
    // Wait for modal to close
    await expect(page.locator('h2:has-text("Edit User")')).not.toBeVisible()
    
    // Check if user name is updated
    await expect(page.locator('[data-test="user-name"]')).toContainText(newName)
  })

  test('should delete a user', async ({ page }) => {
    // Get the text of the first user to be deleted
    const userText = await page.locator('tbody tr:first-child').textContent()
    
    // Click delete button for the first user
    await page.locator('tbody tr:first-child [data-test^="delete-user-"]').click()
    
    // Wait for confirmation dialog
    await expect(page.locator('.confirmation-dialog')).toBeVisible()
    
    // Confirm deletion
    await page.locator('.confirmation-dialog-actions button:last-child').click()
    
    // Wait for confirmation dialog to close
    await expect(page.locator('.confirmation-dialog')).not.toBeVisible()
    
    // Check if user is removed from the list
    if (userText) {
      // Extract the user's name from the row text
      const userName = userText.split('\n')[0].trim()
      
      // If the name is not empty, check that it's no longer in the first row
      if (userName) {
        await expect(page.locator('tbody tr:first-child')).not.toContainText(userName)
      }
    }
  })

  test('should perform bulk operations', async ({ page }) => {
    // Select the first two users
    await page.locator('tbody tr:nth-child(1) input[type="checkbox"]').check()
    await page.locator('tbody tr:nth-child(2) input[type="checkbox"]').check()
    
    // Check if bulk actions become visible
    await expect(page.locator('[data-test="bulk-actions"]')).toBeVisible()
    
    // Click bulk delete button
    await page.locator('[data-test="bulk-delete-button"]').click()
    
    // Wait for confirmation dialog
    await expect(page.locator('.confirmation-dialog')).toBeVisible()
    
    // Confirm deletion
    await page.locator('.confirmation-dialog-actions button:last-child').click()
    
    // Wait for confirmation dialog to close
    await expect(page.locator('.confirmation-dialog')).not.toBeVisible()
    
    // Check if bulk actions are hidden after operation
    await expect(page.locator('[data-test="bulk-actions"]')).not.toBeVisible()
  })

  test('should export users to CSV', async ({ page }) => {
    // Start waiting for download before clicking the button
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.locator('[data-test="export-button"]').click()
    
    // Wait for download to start
    const download = await downloadPromise
    
    // Verify download started
    expect(download.suggestedFilename()).toContain('users')
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('should paginate through users', async ({ page }) => {
    // Get text from first page
    const firstPageText = await page.locator('tbody').textContent()
    
    // Go to next page
    await page.locator('[data-test="next-page"]').click()
    
    // Wait for page to load
    await page.waitForTimeout(300)
    
    // Get text from second page
    const secondPageText = await page.locator('tbody').textContent()
    
    // Check if content is different
    expect(firstPageText).not.toEqual(secondPageText)
    
    // Go back to first page
    await page.locator('[data-test="prev-page"]').click()
    
    // Wait for page to load
    await page.waitForTimeout(300)
    
    // Get text again
    const backToFirstText = await page.locator('tbody').textContent()
    
    // Check if we're back to the first page content
    expect(backToFirstText).toEqual(firstPageText)
  })
})