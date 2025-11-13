import { useMemo } from 'react'
import { Header } from '../components/Layout/Header'
import { Card } from '../components/UI/Card'
import { useBookmarks } from '../hooks/useBookmarks'
import { BookMarked, CheckCircle, BookOpen, Circle, Tag, TrendingUp } from 'lucide-react'
import { getTagColor } from '../lib/utils'

export function Stats() {
  const { bookmarks, loading } = useBookmarks()

  const stats = useMemo(() => {
    const total = bookmarks.length
    const unread = bookmarks.filter(b => b.status === 'unread').length
    const reading = bookmarks.filter(b => b.status === 'reading').length
    const completed = bookmarks.filter(b => b.status === 'completed').length
    const pinned = bookmarks.filter(b => b.priority === 1).length

    // Tag statistics
    const tagMap = {}
    bookmarks.forEach((bookmark) => {
      if (bookmark.tags) {
        bookmark.tags.forEach((tag) => {
          tagMap[tag] = (tagMap[tag] || 0) + 1
        })
      }
    })

    const topTags = Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent activity
    const recentBookmarks = [...bookmarks]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)

    const recentCompleted = [...bookmarks]
      .filter(b => b.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 5)

    // Completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      unread,
      reading,
      completed,
      pinned,
      topTags,
      recentBookmarks,
      recentCompleted,
      completionRate,
    }
  }, [bookmarks])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Reading Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your reading progress and insights
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bookmarks
              </h3>
              <BookMarked className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unread
              </h3>
              <Circle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.unread}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Reading
              </h3>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.reading}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.completed}
            </p>
          </Card>
        </div>

        {/* Completion Rate */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Completion Rate
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="mb-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.completionRate}% of your bookmarks are completed
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Tags */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Most Used Tags
              </h3>
            </div>
            {stats.topTags.length > 0 ? (
              <div className="space-y-3">
                {stats.topTags.map((tag, index) => (
                  <div key={tag.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <span className={`tag ${getTagColor(tag.name)}`}>
                        {tag.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {tag.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No tags yet. Start tagging your bookmarks!
              </p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Bookmarks
            </h3>
            {stats.recentBookmarks.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {bookmark.favicon_url && (
                      <img
                        src={bookmark.favicon_url}
                        alt=""
                        className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {bookmark.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No bookmarks yet
              </p>
            )}
          </Card>

          {/* Recently Completed */}
          {stats.recentCompleted.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recently Completed
              </h3>
              <div className="space-y-3">
                {stats.recentCompleted.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {bookmark.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(bookmark.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
