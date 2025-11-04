import { supabase } from './supabase'

/**
 * Fetch page metadata (title) from a URL
 * This is a simple implementation. For production, you might want to use a dedicated service.
 */
export async function fetchPageMetadata(url) {
  try {
    // For now, we'll just return the URL as title
    // In a real implementation, you would either:
    // 1. Use a backend proxy to fetch the page and extract metadata
    // 2. Use a third-party API like LinkPreview
    // 3. Use OpenGraph protocol

    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')

    return {
      title: domain,
      favicon_url: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return {
      title: url,
      favicon_url: null,
    }
  }
}

/**
 * Bookmark API functions
 */

export async function getBookmarks(userId) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createBookmark(bookmark) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([bookmark])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBookmark(id, updates) {
  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBookmark(id) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function deleteMultipleBookmarks(ids) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .in('id', ids)

  if (error) throw error
}

export async function updateBookmarkStatus(id, status) {
  const updates = { status }

  // If marking as completed, set completed_at timestamp
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  } else {
    updates.completed_at = null
  }

  return updateBookmark(id, updates)
}

/**
 * Subscribe to real-time changes for bookmarks
 */
export function subscribeToBookmarks(userId, callback) {
  const subscription = supabase
    .channel('bookmarks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()

  return subscription
}

/**
 * Unsubscribe from real-time changes
 */
export function unsubscribeFromBookmarks(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
}
