/**
 * Utility functions for the application
 */

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Truncate text to a specific length
 */
export function truncate(text, length = 100) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Format a date to a readable string
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return d.toLocaleDateString()
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

/**
 * Get favicon URL from a website URL
 */
export function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
  } catch {
    return null
  }
}

/**
 * Extract domain from URL
 */
export function getDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return ''
  }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate a random color for tags
 */
export function getTagColor(tag) {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  ]

  // Generate a consistent color based on the tag string
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Export bookmarks to JSON
 */
export function exportToJson(bookmarks, filename = 'bookmarks.json') {
  const dataStr = JSON.stringify(bookmarks, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const exportFileDefaultName = filename

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

/**
 * Export bookmarks to CSV
 */
export function exportToCsv(bookmarks, filename = 'bookmarks.csv') {
  const headers = ['Title', 'URL', 'Status', 'Tags', 'Notes', 'Created At']
  const rows = bookmarks.map(b => [
    b.title,
    b.url,
    b.status,
    (b.tags || []).join('; '),
    b.notes || '',
    new Date(b.created_at).toLocaleDateString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', filename)
  linkElement.click()
}

/**
 * Parse imported bookmarks from HTML (browser export format)
 */
export function parseHtmlBookmarks(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const links = doc.querySelectorAll('a')

  const bookmarks = []
  links.forEach(link => {
    const url = link.getAttribute('href')
    const title = link.textContent

    if (url && isValidUrl(url)) {
      bookmarks.push({
        url,
        title: title || url,
        status: 'unread',
        priority: 0,
        tags: [],
      })
    }
  })

  return bookmarks
}
