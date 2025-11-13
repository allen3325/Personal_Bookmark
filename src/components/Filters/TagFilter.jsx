import { X } from 'lucide-react'
import { getTagColor } from '../../lib/utils'

export function TagFilter({ allTags, selectedTags, onToggleTag }) {
  if (!allTags || allTags.length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Filter by tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name)

          return (
            <button
              key={tag.name}
              onClick={() => onToggleTag(tag.name)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                  : ''
              } ${getTagColor(tag.name)}`}
            >
              <span>{tag.name}</span>
              <span className="ml-1.5 opacity-75">({tag.count})</span>
              {isSelected && <X className="w-3 h-3 ml-1" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
