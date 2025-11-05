import { useState } from 'react'
import {
  ExternalLink,
  Edit2,
  Trash2,
  Star,
  CheckCircle,
  Circle,
  BookOpen,
  X,
  Plus,
} from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { getDomain, formatDate, getTagColor } from '../../lib/utils'

const statusConfig = {
  unread: {
    icon: Circle,
    label: 'Unread',
    color: 'text-gray-400',
  },
  reading: {
    icon: BookOpen,
    label: 'Reading',
    color: 'text-blue-500',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'text-green-500',
  },
}

export function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onStatusChange,
  onTogglePriority,
  onAddTag,
  onRemoveTag,
}) {
  const [showNotes, setShowNotes] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  const StatusIcon = statusConfig[bookmark.status]?.icon || Circle
  const statusColor = statusConfig[bookmark.status]?.color || 'text-gray-400'

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(bookmark.id, newTag.trim())
      setNewTag('')
      setShowTagInput(false)
    }
  }

  const cycleStatus = () => {
    const statuses = ['unread', 'reading', 'completed']
    const currentIndex = statuses.indexOf(bookmark.status)
    const nextIndex = (currentIndex + 1) % statuses.length
    onStatusChange(bookmark.id, statuses[nextIndex])
  }

  return (
    <Card hover className="p-5 transition-all">
      <div className="flex items-start gap-4">
        {/* Favicon */}
        <div className="flex-shrink-0">
          {bookmark.favicon_url ? (
            <img
              src={bookmark.favicon_url}
              alt=""
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Priority Star */}
          {bookmark.priority === 1 && (
            <div className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500 mb-2">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">Pinned</span>
            </div>
          )}

          {/* Title */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 mb-2"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {bookmark.title}
            </h3>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
          </a>

          {/* URL */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
            {getDomain(bookmark.url)}
          </p>

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className={`tag ${getTagColor(tag)} group cursor-pointer`}
                  onClick={() => onRemoveTag(bookmark.id, tag)}
                  title="Click to remove"
                >
                  {tag}
                  <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              ))}
            </div>
          )}

          {/* Add Tag Input */}
          {showTagInput ? (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="New tag..."
                className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowTagInput(false)
                  setNewTag('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-3 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add tag
            </button>
          )}

          {/* Notes */}
          {bookmark.notes && (
            <div className="mb-3">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {showNotes ? '▼' : '▶'} Notes
              </button>
              {showNotes && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                  {bookmark.notes}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDate(bookmark.created_at)}</span>
            {bookmark.completed_at && (
              <span>Completed {formatDate(bookmark.completed_at)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={cycleStatus}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${statusColor}`}
            title={statusConfig[bookmark.status]?.label}
          >
            <StatusIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTogglePriority(bookmark.id, bookmark.priority)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              bookmark.priority === 1
                ? 'text-yellow-500'
                : 'text-gray-400'
            }`}
            title={bookmark.priority === 1 ? 'Unpin' : 'Pin'}
          >
            <Star className={bookmark.priority === 1 ? 'fill-current' : ''} />
          </button>

          <button
            onClick={() => onEdit(bookmark)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => onDelete(bookmark.id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  )
}
