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

  const addBookmark = async (url, customTitle = null, customNotes = null) => {
    try {
      // Fetch metadata if no custom title provided
      const metadata = customTitle ? { title: customTitle } : await fetchPageMetadata(url)

      const newBookmark = {
        user_id: user.id,
        url,
        title: customTitle || metadata.title || url,
        favicon_url: metadata.favicon_url,
        notes: customNotes,
        status: 'unread',
        priority: 0,
        tags: [],
      }

      const created = await createBookmark(newBookmark)
      return created
    } catch (err) {
      throw new Error('Failed to add bookmark: ' + err.message)
    }
  }

  const editBookmark = async (id, updates) => {
    try {
      const updated = await updateBookmark(id, updates)
      return updated
    } catch (err) {
      throw new Error('Failed to update bookmark: ' + err.message)
    }
  }

  const removeBookmark = async (id) => {
    try {
      await deleteBookmark(id)
    } catch (err) {
      throw new Error('Failed to delete bookmark: ' + err.message)
    }
  }

  const removeMultipleBookmarks = async (ids) => {
    try {
      await deleteMultipleBookmarks(ids)
    } catch (err) {
      throw new Error('Failed to delete bookmarks: ' + err.message)
    }
  }

  const changeStatus = async (id, status) => {
    try {
      const updated = await updateBookmarkStatus(id, status)
      return updated
    } catch (err) {
      throw new Error('Failed to change status: ' + err.message)
    }
  }

  const togglePriority = async (id, currentPriority) => {
    try {
      const newPriority = currentPriority === 1 ? 0 : 1
      const updated = await updateBookmark(id, { priority: newPriority })
      return updated
    } catch (err) {
      throw new Error('Failed to toggle priority: ' + err.message)
    }
  }

  const addTag = async (id, tag) => {
    try {
      const bookmark = bookmarks.find(b => b.id === id)
      if (!bookmark) throw new Error('Bookmark not found')

      const tags = bookmark.tags || []
      if (tags.includes(tag)) return bookmark

      const updated = await updateBookmark(id, { tags: [...tags, tag] })
      return updated
    } catch (err) {
      throw new Error('Failed to add tag: ' + err.message)
    }
  }

  const removeTag = async (id, tag) => {
    try {
      const bookmark = bookmarks.find(b => b.id === id)
      if (!bookmark) throw new Error('Bookmark not found')

      const tags = (bookmark.tags || []).filter(t => t !== tag)
      const updated = await updateBookmark(id, { tags })
      return updated
    } catch (err) {
      throw new Error('Failed to remove tag: ' + err.message)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadBookmarks = bookmarks.filter(b => b.status === 'unread')
      await Promise.all(
        unreadBookmarks.map(b => updateBookmarkStatus(b.id, 'completed'))
      )
    } catch (err) {
      throw new Error('Failed to mark all as read: ' + err.message)
    }
  }

  const clearCompleted = async () => {
    try {
      const completedIds = bookmarks
        .filter(b => b.status === 'completed')
        .map(b => b.id)
      if (completedIds.length > 0) {
        await removeMultipleBookmarks(completedIds)
      }
    } catch (err) {
      throw new Error('Failed to clear completed: ' + err.message)
    }
  }

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
