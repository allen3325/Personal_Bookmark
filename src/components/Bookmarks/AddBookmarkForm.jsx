import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import { isValidUrl } from '../../lib/utils'

export function AddBookmarkForm({ onAdd, loading }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    try {
      await onAdd(url, customTitle || null, notes || null)
      // Reset form
      setUrl('')
      setCustomTitle('')
      setNotes('')
      setIsExpanded(false)
    } catch (err) {
      setError(err.message || 'Failed to add bookmark')
    }
  }

  return (
    <div className="card p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL to save..."
              error={error}
              disabled={loading}
              onFocus={() => setIsExpanded(true)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !url.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Custom title (optional)"
              disabled={loading}
            />
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Hide options
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
