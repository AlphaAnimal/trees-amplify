import { useState } from 'react'
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-5">
          {/* Warning icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Tree</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-1">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900">{treeName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            All members, relationships, photos, and access permissions will be
            permanently removed.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting…' : 'Delete Forever'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

