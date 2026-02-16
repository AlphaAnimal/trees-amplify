import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteTree } from '@/hooks/useTreesApi'
import { amplifyTreesApi } from '@/services/amplifyDataClient'

interface Props {
  open: boolean
  onClose: () => void
  treeId: string
  treeName: string
}

export default function DeleteTreeModal({ open, onClose, treeId, treeName }: Props) {
  const navigate = useNavigate()
  const deleteTree = useDeleteTree()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Escape key handler ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, loading, onClose])

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      // Delete from Flask (Neptune graph, DynamoDB roles, S3 media)
      await deleteTree.mutateAsync()
      // Delete from Amplify DynamoDB (tree metadata)
      await amplifyTreesApi.delete(treeId)
      onClose()
      navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tree')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--color-surface-elevated)] rounded-2xl shadow-xl w-full max-w-md min-w-[320px] mx-4 animate-in slide-up duration-300">
        <div className="px-6 py-5">
          {/* Warning icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Delete Tree</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            Are you sure you want to delete{' '}
            <strong className="text-[var(--color-text-primary)]">{treeName}</strong>?
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            All members, relationships, photos, and access permissions will be
            permanently removed.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-[var(--color-error)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? 'Deleting…' : 'Delete Forever'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

