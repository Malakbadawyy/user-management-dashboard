import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    // Check if login form elements are visible
    await expect(page.locator('h1')).toContainText('Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Submit form without filling fields
    await page.locator('button[type="submit"]').click()
    
    // Check for validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await page.locator('input[type="email"]').fill('wrong@example.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    
    // Submit form
    await page.locator('button[type="submit"]').click()
    
    // Check for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill form with valid credentials
    await page.locator('input[type="email"]').fill('admin@example.com')
    await page.locator('input[type="password"]').fill('password')
    
    // Submit form
    await page.locator('button[type="submit"]').click()
    
    // Check if redirected to dashboard
    await expect(page).toHaveURL('/')
    
    // Check if user is logged in
    await expect(page.locator('text=Admin')).toBeVisible()
  })

  test('should remember email when "Remember me" is checked', async ({ page }) => {
    // Fill email and check "Remember me"
    await page.locator('input[type="email"]').fill('admin@example.com')
    await page.locator('input[type="checkbox"]').check()
    
    // Submit form with wrong password to stay on login page
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()
    
    // Reload page
    await page.reload()
    
    // Check if email is remembered
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@example.com')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    // Click on forgot password link
    await page.locator('text=Forgot password?').click()
    
    // Check if navigated to forgot password page
    await expect(page).toHaveURL('/forgot-password')
    await expect(page.locator('h1')).toContainText('Reset Password')
  })
})