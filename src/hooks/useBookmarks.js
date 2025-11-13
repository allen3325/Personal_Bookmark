import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  deleteMultipleBookmarks,
  updateBookmarkStatus,
  subscribeToBookmarks,
  unsubscribeFromBookmarks,
} from '../lib/api'
import { fetchPageMetadata } from '../lib/api'

export function useBookmarks() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch bookmarks on mount
  useEffect(() => {
    if (user) {
      loadBookmarks()
    } else {
      setBookmarks([])
      setLoading(false)
    }
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const subscription = subscribeToBookmarks(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setBookmarks(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setBookmarks(prev =>
          prev.map(bookmark =>
            bookmark.id === payload.new.id ? payload.new : bookmark
          )
        )
      } else if (payload.eventType === 'DELETE') {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== payload.old.id))
      }
    })

    return () => {
      unsubscribeFromBookmarks(subscription)
    }
  }, [user])

  const loadBookmarks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBookmarks(user.id)
      setBookmarks(data)
    } catch (err) {
      setError(err.message)
      console.error('Error loading bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }

  const addBookmark = useCallback(async (url, customTitle = null, customNotes = null) => {
    // Generate a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`

    try {
      // Fetch metadata if no custom title provided
      const metadata = customTitle ? { title: customTitle } : await fetchPageMetadata(url)

      // Temporary bookmark for optimistic update (with temp ID)
      const tempBookmark = {
        id: tempId, // Temporary ID for optimistic update
        user_id: user.id,
        url,
        title: customTitle || metadata.title || url,
        favicon_url: metadata.favicon_url,
        notes: customNotes,
        status: 'unread',
        priority: 0,
        tags: [],
        created_at: new Date().toISOString(),
        completed_at: null,
      }

      // Optimistic update: Add bookmark immediately to UI
      setBookmarks(prev => [tempBookmark, ...prev])

      // Create bookmark in database (without the temp ID)
      const { id, created_at, ...bookmarkData } = tempBookmark
      const created = await createBookmark(bookmarkData)

      // Replace temporary bookmark with the real one
      setBookmarks(prev =>
        prev.map(bookmark =>
          bookmark.id === tempId ? created : bookmark
        )
      )

      return created
    } catch (err) {
      // Revert on error: Remove temporary bookmark
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== tempId))
      throw new Error('Failed to add bookmark: ' + err.message)
    }
  }, [user.id])

  const editBookmark = useCallback(async (id, updates) => {
    // Optimistic update: Update UI immediately
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    )

    try {
      const updated = await updateBookmark(id, updates)
      return updated
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to update bookmark: ' + err.message)
    }
  }, [user.id])

  const removeBookmark = useCallback(async (id) => {
    // Optimistic update: Remove from UI immediately
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id))

    try {
      await deleteBookmark(id)
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to delete bookmark: ' + err.message)
    }
  }, [user.id])

  const removeMultipleBookmarks = useCallback(async (ids) => {
    // Optimistic update: Remove from UI immediately
    setBookmarks(prev => prev.filter(bookmark => !ids.includes(bookmark.id)))

    try {
      await deleteMultipleBookmarks(ids)
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to delete bookmarks: ' + err.message)
    }
  }, [user.id])

  const changeStatus = useCallback(async (id, status) => {
    // Optimistic update: Update UI immediately
    setBookmarks(prev =>
      prev.map(bookmark => {
        if (bookmark.id === id) {
          return {
            ...bookmark,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          }
        }
        return bookmark
      })
    )

    try {
      const updated = await updateBookmarkStatus(id, status)
      return updated
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to change status: ' + err.message)
    }
  }, [user.id])

  const togglePriority = useCallback(async (id, currentPriority) => {
    const newPriority = currentPriority === 1 ? 0 : 1

    // Optimistic update: Update UI immediately
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.id === id ? { ...bookmark, priority: newPriority } : bookmark
      )
    )

    try {
      const updated = await updateBookmark(id, { priority: newPriority })
      return updated
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to toggle priority: ' + err.message)
    }
  }, [user.id])

  const addTag = useCallback(async (id, tag) => {
    const bookmark = bookmarks.find(b => b.id === id)
    if (!bookmark) throw new Error('Bookmark not found')

    const tags = bookmark.tags || []
    if (tags.includes(tag)) return bookmark

    // Optimistic update: Update UI immediately
    setBookmarks(prev =>
      prev.map(b =>
        b.id === id ? { ...b, tags: [...tags, tag] } : b
      )
    )

    try {
      const updated = await updateBookmark(id, { tags: [...tags, tag] })
      return updated
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to add tag: ' + err.message)
    }
  }, [bookmarks, user.id])

  const removeTag = useCallback(async (id, tag) => {
    const bookmark = bookmarks.find(b => b.id === id)
    if (!bookmark) throw new Error('Bookmark not found')

    const tags = (bookmark.tags || []).filter(t => t !== tag)

    // Optimistic update: Update UI immediately
    setBookmarks(prev =>
      prev.map(b =>
        b.id === id ? { ...b, tags } : b
      )
    )

    try {
      const updated = await updateBookmark(id, { tags })
      return updated
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to remove tag: ' + err.message)
    }
  }, [bookmarks, user.id])

  const markAllAsRead = useCallback(async () => {
    const unreadBookmarks = bookmarks.filter(b => b.status === 'unread' || b.status === 'reading')

    // Optimistic update: Update all unread to completed
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.status === 'unread' || bookmark.status === 'reading'
          ? { ...bookmark, status: 'completed', completed_at: new Date().toISOString() }
          : bookmark
      )
    )

    try {
      await Promise.all(
        unreadBookmarks.map(b => updateBookmarkStatus(b.id, 'completed'))
      )
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to mark all as read: ' + err.message)
    }
  }, [bookmarks, user.id])

  const clearCompleted = useCallback(async () => {
    const completedIds = bookmarks
      .filter(b => b.status === 'completed')
      .map(b => b.id)

    if (completedIds.length === 0) return

    // Optimistic update: Remove completed bookmarks immediately
    setBookmarks(prev => prev.filter(b => b.status !== 'completed'))

    try {
      await deleteMultipleBookmarks(completedIds)
    } catch (err) {
      // Revert on error - fetch fresh data
      const data = await getBookmarks(user.id)
      setBookmarks(data)
      throw new Error('Failed to clear completed: ' + err.message)
    }
  }, [bookmarks, user.id])

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    editBookmark,
    removeBookmark,
    removeMultipleBookmarks,
    changeStatus,
    togglePriority,
    addTag,
    removeTag,
    markAllAsRead,
    clearCompleted,
    refresh: loadBookmarks,
  }
}
