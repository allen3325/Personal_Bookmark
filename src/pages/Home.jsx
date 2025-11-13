import { useState, useMemo, useCallback } from 'react'
import { Download, Upload, Trash2, CheckCheck } from 'lucide-react'
import { Header } from '../components/Layout/Header'
import { AddBookmarkForm } from '../components/Bookmarks/AddBookmarkForm'
import { BookmarkList } from '../components/Bookmarks/BookmarkList'
import { EditBookmarkModal } from '../components/Bookmarks/EditBookmarkModal'
import { SearchBar } from '../components/Filters/SearchBar'
import { StatusFilter } from '../components/Filters/StatusFilter'
import { TagFilter } from '../components/Filters/TagFilter'
import { SortDropdown } from '../components/Filters/SortDropdown'
import { Button } from '../components/UI/Button'
import { ToastContainer } from '../components/UI/Toast'
import { ConfirmDialog } from '../components/UI/ConfirmDialog'
import { useBookmarks } from '../hooks/useBookmarks'
import { useToast } from '../hooks/useToast'
import { exportToJson, exportToCsv, parseHtmlBookmarks } from '../lib/utils'

export function Home() {
  const {
    bookmarks,
    loading,
    addBookmark,
    editBookmark,
    removeBookmark,
    changeStatus,
    togglePriority,
    addTag,
    removeTag,
    markAllAsRead,
    clearCompleted,
  } = useBookmarks()

  const { toasts, hideToast, success, error: showError } = useToast()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('date-desc')

  // Modal states
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [addingBookmark, setAddingBookmark] = useState(false)

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // Handle add bookmark
  const handleAddBookmark = useCallback(async (url, title, notes) => {
    setAddingBookmark(true)
    try {
      await addBookmark(url, title, notes)
      success('Bookmark added successfully!')
    } catch (err) {
      showError(err.message)
    } finally {
      setAddingBookmark(false)
    }
  }, [addBookmark, success, showError])

  // Handle edit bookmark
  const handleEditBookmark = useCallback(async (id, updates) => {
    try {
      await editBookmark(id, updates)
      success('Bookmark updated successfully!')
    } catch (err) {
      showError(err.message)
    }
  }, [editBookmark, success, showError])

  // Handle delete bookmark
  const handleDeleteBookmark = useCallback((id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Bookmark',
      message: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await removeBookmark(id)
          success('Bookmark deleted successfully!')
        } catch (err) {
          showError(err.message)
        }
      },
    })
  }, [removeBookmark, success, showError])

  // Handle status change
  const handleStatusChange = useCallback(async (id, status) => {
    try {
      await changeStatus(id, status)
    } catch (err) {
      showError(err.message)
    }
  }, [changeStatus, showError])

  // Handle toggle priority
  const handleTogglePriority = useCallback(async (id, currentPriority) => {
    try {
      await togglePriority(id, currentPriority)
    } catch (err) {
      showError(err.message)
    }
  }, [togglePriority, showError])

  // Handle add tag
  const handleAddTag = useCallback(async (id, tag) => {
    try {
      await addTag(id, tag)
    } catch (err) {
      showError(err.message)
    }
  }, [addTag, showError])

  // Handle remove tag
  const handleRemoveTag = useCallback(async (id, tag) => {
    try {
      await removeTag(id, tag)
    } catch (err) {
      showError(err.message)
    }
  }, [removeTag, showError])

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    const unreadAndReadingCount = statusCounts.unread + statusCounts.reading

    setConfirmDialog({
      isOpen: true,
      title: 'Mark All as Completed',
      message: `Are you sure you want to mark ${unreadAndReadingCount} bookmark${unreadAndReadingCount !== 1 ? 's' : ''} as completed?`,
      onConfirm: async () => {
        try {
          await markAllAsRead()
          success(`Successfully marked ${unreadAndReadingCount} bookmark${unreadAndReadingCount !== 1 ? 's' : ''} as completed!`)
        } catch (err) {
          showError(err.message)
        }
      },
      variant: 'primary',
    })
  }, [markAllAsRead, success, showError, statusCounts])

  // Handle clear completed
  const handleClearCompleted = useCallback(() => {
    const completedCount = statusCounts.completed

    setConfirmDialog({
      isOpen: true,
      title: 'Clear Completed Bookmarks',
      message: `Are you sure you want to delete ${completedCount} completed bookmark${completedCount !== 1 ? 's' : ''}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await clearCompleted()
          success(`Successfully deleted ${completedCount} completed bookmark${completedCount !== 1 ? 's' : ''}!`)
        } catch (err) {
          showError(err.message)
        }
      },
    })
  }, [clearCompleted, success, showError, statusCounts])

  // Handle export to JSON
  const handleExportJson = useCallback(() => {
    exportToJson(bookmarks, `bookmarks-${new Date().toISOString().split('T')[0]}.json`)
    success('Bookmarks exported to JSON!')
  }, [bookmarks, success])

  // Handle export to CSV
  const handleExportCsv = useCallback(() => {
    exportToCsv(bookmarks, `bookmarks-${new Date().toISOString().split('T')[0]}.csv`)
    success('Bookmarks exported to CSV!')
  }, [bookmarks, success])

  // Handle import
  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target.result

        let bookmarksToImport = []

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content)
          bookmarksToImport = Array.isArray(data) ? data : [data]
        } else if (file.name.endsWith('.html')) {
          bookmarksToImport = parseHtmlBookmarks(content)
        }

        if (bookmarksToImport.length === 0) {
          showError('No valid bookmarks found in the file')
          return
        }

        let imported = 0
        for (const bookmark of bookmarksToImport) {
          try {
            await addBookmark(
              bookmark.url,
              bookmark.title,
              bookmark.notes
            )
            imported++
          } catch (err) {
            console.error('Failed to import bookmark:', err)
          }
        }

        success(`Imported ${imported} bookmarks!`)
      } catch (err) {
        showError('Failed to import bookmarks: ' + err.message)
      }
    }

    reader.readAsText(file)
    e.target.value = '' // Reset file input
  }, [addBookmark, success, showError])

  // Get all unique tags with counts
  const allTags = useMemo(() => {
    const tagMap = {}
    bookmarks.forEach((bookmark) => {
      if (bookmark.tags) {
        bookmark.tags.forEach((tag) => {
          tagMap[tag] = (tagMap[tag] || 0) + 1
        })
      }
    })
    return Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [bookmarks])

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: bookmarks.length,
      unread: 0,
      reading: 0,
      completed: 0,
    }
    bookmarks.forEach((bookmark) => {
      counts[bookmark.status] = (counts[bookmark.status] || 0) + 1
    })
    return counts
  }, [bookmarks])

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.notes?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((b) =>
        selectedTags.some((tag) => b.tags?.includes(tag))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      // Priority always comes first
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }

      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'priority':
          return b.priority - a.priority
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

    return filtered
  }, [bookmarks, searchQuery, statusFilter, selectedTags, sortBy])

  // Toggle tag filter
  const toggleTagFilter = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Bookmark Form */}
        <AddBookmarkForm onAdd={handleAddBookmark} loading={addingBookmark} />

        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {/* Status Filter */}
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
          />

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <TagFilter
              allTags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTagFilter}
            />
          )}

          {/* Bulk Actions and Import/Export */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={statusCounts.unread === 0 && statusCounts.reading === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCompleted}
              disabled={statusCounts.completed === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Completed
            </Button>

            <div className="flex-1" />

            <Button variant="ghost" size="sm" onClick={handleExportJson}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>

            <Button variant="ghost" size="sm" onClick={handleExportCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <label>
              <Button variant="ghost" size="sm" as="span">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                accept=".json,.html"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Results Count */}
        {searchQuery || statusFilter !== 'all' || selectedTags.length > 0 ? (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedBookmarks.length} of {bookmarks.length} bookmarks
          </div>
        ) : null}

        {/* Bookmark List */}
        <BookmarkList
          bookmarks={filteredAndSortedBookmarks}
          onEdit={setEditingBookmark}
          onDelete={handleDeleteBookmark}
          onStatusChange={handleStatusChange}
          onTogglePriority={handleTogglePriority}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          loading={loading}
          allTags={allTags}
        />

        {/* Edit Modal */}
        <EditBookmarkModal
          bookmark={editingBookmark}
          isOpen={!!editingBookmark}
          onClose={() => setEditingBookmark(null)}
          onSave={handleEditBookmark}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={hideToast} />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
        />
      </main>
    </div>
  )
}
