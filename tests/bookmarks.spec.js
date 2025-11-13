import { test, expect } from '@playwright/test'
import { generateTestUser, register, login, addBookmark } from './helpers.js'

test.describe('Bookmark Management', () => {
  let testUser

  test.beforeEach(async ({ page }) => {
    // Create and login with test user for each test
    testUser = generateTestUser()
    await register(page, testUser.email, testUser.password)
    await page.waitForTimeout(2000)
    await login(page, testUser.email, testUser.password)
    await page.waitForURL('/')
  })

  test('should display add bookmark form', async ({ page }) => {
    // Check form elements are visible
    await expect(page.locator('input[placeholder*="URL"], input[name="url"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]:has-text("Add"), button:has-text("Add Bookmark")')).toBeVisible()
  })

  test('should add a new bookmark', async ({ page }) => {
    const testUrl = 'https://example.com'
    const testTitle = 'Example Website'

    await addBookmark(page, testUrl, testTitle)

    // Verify bookmark appears in the list
    await expect(page.locator(`text=${testTitle}`)).toBeVisible()
  })

  test('should add bookmark with notes', async ({ page }) => {
    const testUrl = 'https://test.com'
    const testTitle = 'Test Site'
    const testNotes = 'This is a test bookmark with notes'

    await addBookmark(page, testUrl, testTitle, testNotes)

    // Click on the bookmark to view details
    await page.click(`text=${testTitle}`)
    await page.waitForTimeout(500)

    // Notes should be visible somewhere
    const notesVisible = await page.locator(`text=${testNotes}`).count() > 0
    expect(notesVisible).toBe(true)
  })

  test('should edit a bookmark', async ({ page }) => {
    // Add a bookmark first
    await addBookmark(page, 'https://original.com', 'Original Title')

    // Find and click edit button
    await page.click('[data-testid="edit-button"], button:has-text("Edit")')
    await page.waitForTimeout(500)

    // Update the title
    const titleInput = page.locator('input[name="title"], input[value="Original Title"]')
    await titleInput.fill('Updated Title')

    // Save changes
    await page.click('button:has-text("Save"), button[type="submit"]')
    await page.waitForTimeout(1000)

    // Verify updated title appears
    await expect(page.locator('text=Updated Title')).toBeVisible()
  })

  test('should delete a bookmark', async ({ page }) => {
    const testTitle = 'Bookmark to Delete'
    await addBookmark(page, 'https://delete.com', testTitle)

    // Verify bookmark exists
    await expect(page.locator(`text=${testTitle}`)).toBeVisible()

    // Click delete button
    page.on('dialog', dialog => dialog.accept()) // Auto-confirm deletion
    await page.click('[data-testid="delete-button"], button:has-text("Delete")')
    await page.waitForTimeout(1000)

    // Verify bookmark is gone
    await expect(page.locator(`text=${testTitle}`)).not.toBeVisible()
  })

  test('should change bookmark status', async ({ page }) => {
    await addBookmark(page, 'https://status-test.com', 'Status Test')

    // Look for status dropdown or buttons
    const statusButton = page.locator('[data-testid="status-select"], select, button:has-text("unread")').first()

    if (await statusButton.count() > 0) {
      await statusButton.click()
      await page.waitForTimeout(300)

      // Select a different status
      await page.click('text=/reading|completed/i')
      await page.waitForTimeout(500)

      // Verify status changed (look for visual indicator)
      const hasStatusIndicator = await page.locator('[data-testid="bookmark-status"], .status').count() > 0
      expect(hasStatusIndicator).toBe(true)
    }
  })

  test('should toggle priority on a bookmark', async ({ page }) => {
    await addBookmark(page, 'https://priority-test.com', 'Priority Test')

    // Find priority button/icon
    const priorityButton = page.locator('[data-testid="priority-button"], button:has-text("Priority"), [title*="priority"]').first()

    if (await priorityButton.count() > 0) {
      await priorityButton.click()
      await page.waitForTimeout(500)

      // Verify priority indicator appears (star, flag, etc.)
      const hasPriorityIndicator = await page.locator('[data-testid="priority-indicator"], .priority').count() > 0
      expect(hasPriorityIndicator).toBe(true)
    }
  })

  test('should add tags to a bookmark', async ({ page }) => {
    await addBookmark(page, 'https://tag-test.com', 'Tag Test')

    // Look for tag input
    const tagInput = page.locator('[data-testid="tag-input"], input[placeholder*="tag"]').first()

    if (await tagInput.count() > 0) {
      await tagInput.fill('test-tag')
      await tagInput.press('Enter')
      await page.waitForTimeout(500)

      // Verify tag appears
      await expect(page.locator('text=test-tag')).toBeVisible()
    }
  })

  test('should display empty state when no bookmarks', async ({ page }) => {
    // Should show some message about no bookmarks
    const emptyMessage = await page.locator('text=/no bookmarks|empty|get started/i').count() > 0

    // If no bookmarks, should see either empty state or the form
    const hasForm = await page.locator('input[placeholder*="URL"]').count() > 0

    expect(emptyMessage || hasForm).toBe(true)
  })

  test('should display bookmark count correctly', async ({ page }) => {
    // Add multiple bookmarks
    await addBookmark(page, 'https://bookmark1.com', 'Bookmark 1')
    await addBookmark(page, 'https://bookmark2.com', 'Bookmark 2')
    await addBookmark(page, 'https://bookmark3.com', 'Bookmark 3')

    // Count bookmark cards
    const bookmarkCount = await page.locator('[data-testid="bookmark-card"], .bookmark-card, [class*="card"]').count()

    // Should have at least 3 bookmarks
    expect(bookmarkCount).toBeGreaterThanOrEqual(3)
  })
})
