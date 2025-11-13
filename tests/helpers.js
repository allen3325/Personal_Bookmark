/**
 * Test helpers for E2E tests
 */

/**
 * Generate a unique test user email
 */
export function generateTestEmail() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `test-${timestamp}-${random}@example.com`
}

/**
 * Generate test user credentials
 */
export function generateTestUser() {
  return {
    email: generateTestEmail(),
    password: 'TestPassword123!',
    name: 'Test User'
  }
}

/**
 * Login helper
 */
export async function login(page, email, password) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

/**
 * Register helper
 */
export async function register(page, email, password) {
  await page.goto('/register')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  // Wait for either redirect or error
  await page.waitForTimeout(2000)
}

/**
 * Logout helper
 */
export async function logout(page) {
  // Click user menu
  await page.click('[data-testid="user-menu"], button:has-text("User")')
  // Click logout button
  await page.click('button:has-text("Logout"), [data-testid="logout-button"]')
  await page.waitForURL('/login')
}

/**
 * Add a bookmark helper
 */
export async function addBookmark(page, url, title = '', notes = '') {
  await page.fill('input[placeholder*="URL"], input[name="url"]', url)

  if (title) {
    await page.fill('input[placeholder*="Title"], input[name="title"]', title)
  }

  if (notes) {
    await page.fill('textarea[placeholder*="Notes"], textarea[name="notes"]', notes)
  }

  // Click add button
  await page.click('button[type="submit"]:has-text("Add"), button:has-text("Add Bookmark")')

  // Wait for bookmark to appear
  await page.waitForTimeout(1000)
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page, text) {
  await page.waitForSelector(`text=${text}`, { timeout: 5000 })
}

/**
 * Get bookmark count
 */
export async function getBookmarkCount(page) {
  const bookmarks = await page.locator('[data-testid="bookmark-card"], .bookmark-card').count()
  return bookmarks
}

/**
 * Clear all test data (for cleanup)
 */
export async function clearTestData(page) {
  // This is a placeholder - implement based on your cleanup strategy
  // You might want to delete test bookmarks or users from the database
}
