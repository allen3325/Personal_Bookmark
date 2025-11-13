import { test, expect } from '@playwright/test'
import { generateTestUser, login, register, logout } from './helpers.js'

test.describe('Authentication', () => {
  let testUser

  test.beforeEach(() => {
    testUser = generateTestUser()
  })

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login')

    // Check page title and form elements
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check link to register page
    await expect(page.locator('a[href="/register"]')).toBeVisible()
  })

  test('should display register page correctly', async ({ page }) => {
    await page.goto('/register')

    // Check page title and form elements
    await expect(page.locator('h1, h2')).toContainText(/register|sign up|create account/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check link to login page
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Check for error message (either browser validation or custom)
    const emailInput = page.locator('input[type="email"]')
    const validationMessage = await emailInput.evaluate((el) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('should show error for wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForTimeout(2000)

    // Check for error notification
    const hasError = await page.locator('text=/invalid|error|wrong|incorrect/i').count() > 0
    expect(hasError).toBe(true)
  })

  test('should successfully register new user', async ({ page }) => {
    await register(page, testUser.email, testUser.password)

    // After registration, should be redirected or see success message
    await page.waitForTimeout(2000)

    // Check if redirected to home or login
    const url = page.url()
    expect(url).toMatch(/\/(login)?$/)
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')

    // Click register link
    await page.click('a[href="/register"]')
    await page.waitForURL('/register')
    expect(page.url()).toContain('/register')

    // Click login link
    await page.click('a[href="/login"]')
    await page.waitForURL('/login')
    expect(page.url()).toContain('/login')
  })

  test('should display password field as type password', async ({ page }) => {
    await page.goto('/login')

    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
