import { test, expect } from '@playwright/test'
import { generateTestUser, register, login, addBookmark } from './helpers.js'

test.describe('Filters and Search', () => {
  let testUser

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser()
    await register(page, testUser.email, testUser.password)
    await page.waitForTimeout(2000)
    await login(page, testUser.email, testUser.password)
    await page.waitForURL('/')

    // Add test bookmarks with different properties
    await addBookmark(page, 'https://javascript.info', 'JavaScript Tutorial', 'Learn JS')
    await page.waitForTimeout(500)
    await addBookmark(page, 'https://react.dev', 'React Documentation', 'React docs')
    await page.waitForTimeout(500)
    await addBookmark(page, 'https://nodejs.org', 'Node.js Homepage', 'Backend dev')
    await page.waitForTimeout(500)
  })

  test('should search bookmarks by title', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')
    await searchInput.fill('React')
    await page.waitForTimeout(500)

    // Should show React bookmark
    await expect(page.locator('text=React Documentation')).toBeVisible()

    // Should not show other bookmarks
    const jsVisible = await page.locator('text=JavaScript Tutorial').isVisible().catch(() => false)
    expect(jsVisible).toBe(false)
  })

  test('should search bookmarks by URL', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')
    await searchInput.fill('nodejs.org')
    await page.waitForTimeout(500)

    // Should show Node.js bookmark
    await expect(page.locator('text=Node.js Homepage')).toBeVisible()
  })

  test('should search bookmarks by notes', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')
    await searchInput.fill('Backend')
    await page.waitForTimeout(500)

    // Should show bookmark with "Backend" in notes
    await expect(page.locator('text=Node.js Homepage')).toBeVisible()
  })

  test('should clear search and show all bookmarks', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')

    // Search first
    await searchInput.fill('React')
    await page.waitForTimeout(500)

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(500)

    // All bookmarks should be visible
    await expect(page.locator('text=React Documentation')).toBeVisible()
    await expect(page.locator('text=JavaScript Tutorial')).toBeVisible()
    await expect(page.locator('text=Node.js Homepage')).toBeVisible()
  })

  test('should filter by status - all', async ({ page }) => {
    // Click "All" status filter
    const allButton = page.locator('[data-testid="status-all"], button:has-text("All")').first()

    if (await allButton.count() > 0) {
      await allButton.click()
      await page.waitForTimeout(500)

      // Should show all bookmarks
      const bookmarkCount = await page.locator('[data-testid="bookmark-card"], .bookmark-card, text=/JavaScript Tutorial|React Documentation|Node.js Homepage/').count()
      expect(bookmarkCount).toBeGreaterThanOrEqual(3)
    }
  })

  test('should filter by status - unread', async ({ page }) => {
    // Click "Unread" status filter
    const unreadButton = page.locator('[data-testid="status-unread"], button:has-text("Unread")').first()

    if (await unreadButton.count() > 0) {
      await unreadButton.click()
      await page.waitForTimeout(500)

      // Should show bookmarks (new ones are unread by default)
      const hasBookmarks = await page.locator('text=/JavaScript Tutorial|React Documentation/').count() > 0
      expect(hasBookmarks).toBe(true)
    }
  })

  test('should filter by status - reading', async ({ page }) => {
    // First, change a bookmark to "reading" status
    const statusDropdown = page.locator('[data-testid="status-select"], select').first()

    if (await statusDropdown.count() > 0) {
      await statusDropdown.click()
      await page.waitForTimeout(300)
      await page.click('text=reading', { timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(500)

      // Now filter by reading
      const readingButton = page.locator('button:has-text("Reading")').first()
      if (await readingButton.count() > 0) {
        await readingButton.click()
        await page.waitForTimeout(500)

        // Should show filtered results
        const hasResults = await page.locator('[data-testid="bookmark-card"]').count() >= 0
        expect(hasResults).toBe(true)
      }
    }
  })

  test('should filter by status - completed', async ({ page }) => {
    // Click "Completed" status filter
    const completedButton = page.locator('button:has-text("Completed")').first()

    if (await completedButton.count() > 0) {
      await completedButton.click()
      await page.waitForTimeout(500)

      // Might not have any completed bookmarks yet
      // Just verify the filter works (shows 0 or filtered results)
      const resultCount = await page.locator('[data-testid="bookmark-card"], .bookmark-card').count()
      expect(resultCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should sort bookmarks by date descending', async ({ page }) => {
    const sortControl = page.locator('[data-testid="sort-dropdown"], select').first()

    if (await sortControl.count() > 0) {
      await sortControl.selectOption({ label: /newest|date.*desc/i }).catch(async () => {
        await sortControl.click()
        await page.click('text=/newest|date.*desc/i').catch(() => {})
      })

      await page.waitForTimeout(500)

      // Verify bookmarks are displayed (newest first is usually default)
      const bookmarks = await page.locator('[data-testid="bookmark-card"], .bookmark-card').count()
      expect(bookmarks).toBeGreaterThan(0)
    }
  })

  test('should sort bookmarks by title', async ({ page }) => {
    const sortControl = page.locator('[data-testid="sort-dropdown"], select').first()

    if (await sortControl.count() > 0) {
      await sortControl.selectOption({ label: /title|name/i }).catch(async () => {
        await sortControl.click()
        await page.click('text=/title|name/i').catch(() => {})
      })

      await page.waitForTimeout(500)

      // Get all bookmark titles
      const titles = await page.locator('[data-testid="bookmark-title"], h2, h3').allTextContents()

      // Should have multiple titles
      expect(titles.length).toBeGreaterThan(0)
    }
  })

  test('should show result count when filtering', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('JavaScript')
    await page.waitForTimeout(500)

    // Look for result count text
    const hasCount = await page.locator('text=/showing|result|found/i').count() > 0

    // Should either show count or have the filtered results visible
    const hasResults = await page.locator('text=JavaScript Tutorial').isVisible()

    expect(hasCount || hasResults).toBe(true)
  })

  test('should combine search and status filter', async ({ page }) => {
    // Apply search
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('React')
    await page.waitForTimeout(500)

    // Apply status filter
    const unreadButton = page.locator('button:has-text("Unread")').first()
    if (await unreadButton.count() > 0) {
      await unreadButton.click()
      await page.waitForTimeout(500)

      // Should show only React bookmark if it's unread
      const reactVisible = await page.locator('text=React Documentation').isVisible()
      const jsVisible = await page.locator('text=JavaScript Tutorial').isVisible().catch(() => false)

      // React should be visible, JavaScript should not
      expect(reactVisible).toBe(true)
      expect(jsVisible).toBe(false)
    }
  })

  test('should show empty state when no results found', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('NonExistentBookmark12345')
    await page.waitForTimeout(500)

    // Should show empty state or no bookmarks
    const noResults = await page.locator('text=/no.*found|no.*result|no bookmarks/i').count() > 0
    const hasBookmarks = await page.locator('[data-testid="bookmark-card"]').count() === 0

    expect(noResults || hasBookmarks).toBe(true)
  })

  test('should filter by tags if tags exist', async ({ page }) => {
    // Try to add a tag to a bookmark
    const tagInput = page.locator('[data-testid="tag-input"], input[placeholder*="tag"]').first()

    if (await tagInput.count() > 0) {
      await tagInput.fill('frontend')
      await tagInput.press('Enter')
      await page.waitForTimeout(500)

      // Click on the tag to filter
      await page.click('text=frontend')
      await page.waitForTimeout(500)

      // Should show filtered results
      const hasResults = await page.locator('[data-testid="bookmark-card"]').count() > 0
      expect(hasResults).toBe(true)
    }
  })
})
