import { BookmarkCard } from './BookmarkCard'
import { Inbox } from 'lucide-react'

export function BookmarkList({
  bookmarks,
  onEdit,
  onDelete,
  onStatusChange,
  onTogglePriority,
  onAddTag,
  onRemoveTag,
  loading,
  allTags = [],
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start by adding your first bookmark above. Paste any URL you'd like to save for later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onTogglePriority={onTogglePriority}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          allTags={allTags}
        />
      ))}
    </div>
  )
}
