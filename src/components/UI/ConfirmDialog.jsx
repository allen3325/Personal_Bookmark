import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="px-6 py-5">
            {/* Icon */}
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  variant === 'danger'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    variant === 'danger'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirm}
              autoFocus
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
