import { useState } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { Route as treeRoute } from './tree.$treeId'
import { useTrees, useRoles, useAddRole, useRemoveRole } from '@/hooks/useTreesApi'
import { getPartitionKey } from '@/services/flaskService'
import type { Role } from '@/types'

export const Route = createRoute({
  getParentRoute: () => treeRoute,
  path: '/access',
  component: AccessControlPage,
})

function AccessControlPage() {
  const { treeId } = Route.useParams()
  const { data: treesData } = useTrees()
  const tree = treesData?.trees.find((t) => t.tree_id === treeId)
  const partitionKey = tree?.partition_key ?? getPartitionKey()
  const isOwner = tree?.role === 'owner'

  const { data: rolesData, isLoading } = useRoles(partitionKey)
  const addRole = useAddRole(partitionKey)
  const removeRole = useRemoveRole(partitionKey)

  const [showAddModal, setShowAddModal] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Handlers ───────────────────────────────────────────────────────
  async function handleAddRole(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await addRole.mutateAsync({ email: email.trim(), role })
      setEmail('')
      setRole('editor')
      setShowAddModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add role')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveRole(userId: string) {
    if (!confirm('Are you sure you want to remove this user\'s access?')) {
      return
    }

    try {
      await removeRole.mutateAsync({ user_id: userId })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove role')
    }
  }

  // ─── Group roles by type ────────────────────────────────────────────
  const roles = rolesData?.roles ?? []
  const owners = roles.filter((r) => r.role === 'owner')
  const editors = roles.filter((r) => r.role === 'editor')
  const viewers = roles.filter((r) => r.role === 'viewer')

  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-6 py-4">
          <p className="text-amber-800 font-medium">Access Denied</p>
          <p className="text-sm text-amber-700 mt-1">
            Only tree owners can manage access control.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage who can view and edit this tree
          </p>
        </div>
        <Link
          to="/tree/$treeId"
          params={{ treeId }}
          search={{ memberId: undefined }}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Tree
        </Link>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false)
              setError(null)
              setEmail('')
            }}
            aria-label="Close modal"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add User</h3>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddRole} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Editors can modify the tree. Viewers can only view it.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setError(null)
                      setEmail('')
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Adding…' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading access control…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Owners Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Owners</h2>
              <span className="text-xs text-gray-400">
                {owners.length} {owners.length === 1 ? 'owner' : 'owners'}
              </span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {owners.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No owners found</div>
              ) : (
                owners.map((r) => (
                  <div
                    key={r.userId}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.email || `User ID: ${r.userId}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Added {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Owner
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Editors</h2>
              <span className="text-xs text-gray-400">
                {editors.length} {editors.length === 1 ? 'editor' : 'editors'}
              </span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {editors.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No editors</div>
              ) : (
                editors.map((r) => (
                  <div
                    key={r.userId}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.email || `User ID: ${r.userId}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Added {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        Editor
                      </span>
                      <button
                        onClick={() => handleRemoveRole(r.userId)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Viewers Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Viewers</h2>
              <span className="text-xs text-gray-400">
                {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'}
              </span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {viewers.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No viewers</div>
              ) : (
                viewers.map((r) => (
                  <div
                    key={r.userId}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.email || `User ID: ${r.userId}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Added {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Viewer
                      </span>
                      <button
                        onClick={() => handleRemoveRole(r.userId)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add User Button */}
          <div className="pt-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              + Add User
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
