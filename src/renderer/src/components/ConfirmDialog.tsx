import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-surface-container border border-outline-variant/80 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-start space-x-3.5 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-status-error/15 text-status-error border border-status-error/30'
                : 'bg-primary-container/15 text-primary border border-primary-container/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Dialog Footer Actions */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-outline-variant/40">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              isDanger
                ? 'bg-status-error hover:bg-red-600 text-white shadow-lg'
                : 'bg-primary-container hover:bg-primary text-black shadow-amber-glow'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
