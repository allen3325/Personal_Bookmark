export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all ${
        hover ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
