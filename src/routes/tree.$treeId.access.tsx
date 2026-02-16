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
        <div className="rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 px-6 py-4">
          <p className="text-[var(--color-warning)] font-medium">Access Denied</p>
          <p className="text-sm text-[var(--color-warning)] mt-1">
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Access Control</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage who can view and edit this tree
          </p>
        </div>
        <Link
          to="/tree/$treeId"
          params={{ treeId }}
          search={{ memberId: undefined }}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
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
          <div className="relative bg-[var(--color-surface-elevated)] rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Add User</h3>

              {error && (
                <div className="mb-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 px-4 py-3 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddRole} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
                  >
                    Email Address <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
                  >
                    Role <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
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
                    className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="px-5 py-2 text-sm font-medium text-white bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="w-8 h-8 border-4 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-text-secondary)]">Loading access control…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Owners Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Owners</h2>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {owners.length} {owners.length === 1 ? 'owner' : 'owners'}
              </span>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
              {owners.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--color-text-tertiary)]">No owners found</div>
              ) : (
                owners.map((r) => (
                  <div
                    key={r.userId}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {r.email || `User ID: ${r.userId}`}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        Added {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
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
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Editors</h2>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {editors.length} {editors.length === 1 ? 'editor' : 'editors'}
              </span>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
              {editors.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--color-text-tertiary)]">No editors</div>
              ) : (
                editors.map((r) => (
                  <div
                    key={r.userId}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {r.email || `User ID: ${r.userId}`}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        Added {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                        Editor
                      </span>
                      <button
                        onClick={() => handleRemoveRole(r.userId)}
                        className="text-xs text-[var(--color-error)] hover:opacity-80 transition-colors cursor-pointer"
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
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Viewers</h2>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'}
              </span>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
              {viewers.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--color-text-tertiary)]">No viewers</div>
              ) : (
                viewers.map((r) => (
                  <div
                    key={r.userId}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {r.email || `User ID: ${r.userId}`}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        Added {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                        Viewer
                      </span>
                      <button
                        onClick={() => handleRemoveRole(r.userId)}
                        className="text-xs text-[var(--color-error)] hover:opacity-80 transition-colors cursor-pointer"
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
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
            >
              + Add User
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
