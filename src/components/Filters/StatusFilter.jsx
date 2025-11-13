import { Circle, BookOpen, CheckCircle } from 'lucide-react'

const statuses = [
  { value: 'all', label: 'All', icon: null },
  { value: 'unread', label: 'Unread', icon: Circle },
  { value: 'reading', label: 'Reading', icon: BookOpen },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
]

export function StatusFilter({ value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="status-filter">
      {statuses.map((status) => {
        const Icon = status.icon
        const count = counts?.[status.value] || 0
        const isActive = value === status.value

        return (
          <button
            key={status.value}
            onClick={() => onChange(status.value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            data-testid={`status-${status.value}`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{status.label}</span>
            {status.value !== 'all' && count > 0 && (
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${
                  isActive
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
