import { useState } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useAuthMe, useDeleteAccount } from '@/hooks/useTreesApi'
import { updatePassword, type UpdatePasswordInput } from 'aws-amplify/auth'
import { signOut } from 'aws-amplify/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

function SettingsPage() {
  const navigate = useNavigate()
  const { data: authData, isLoading: authLoading } = useAuthMe()
  const deleteAccount = useDeleteAccount()

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ─── Password Change ────────────────────────────────────────────────
  async function handlePasswordChange(e: { preventDefault: () => void }) {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)

    try {
      const input: UpdatePasswordInput = {
        oldPassword,
        newPassword,
      }
      await updatePassword(input)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordModal(false)
      alert('Password changed successfully')
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Failed to change password',
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  // ─── Account Deletion ────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm')
      return
    }

    setDeleteError(null)
    setDeleteLoading(true)

    try {
      // Delete from Flask (trees, roles, etc.)
      await deleteAccount.mutateAsync()
      // Sign out from Amplify
      await signOut()
      // Navigate to home (will redirect to login)
      navigate({ to: '/' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleteLoading(false)
    }
  }

  const user = authData?.user

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {authLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading settings…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Account Information ──────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-sm text-gray-900">{user?.email || 'Not available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Verified
                </label>
                <p className="text-sm text-gray-900">
                  {user?.email_verified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-amber-600">Not verified</span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-sm text-gray-500 font-mono">{user?.user_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* ── Change Password ────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* ── Delete Account ──────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your account, there is no going back. All your trees, members, and
              data will be permanently deleted.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ──────────────────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowPasswordModal(false)
              setPasswordError(null)
              setOldPassword('')
              setNewPassword('')
              setConfirmPassword('')
            }}
            aria-label="Close modal"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

              {passwordError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordError(null)
                      setOldPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    disabled={passwordLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading || !oldPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {passwordLoading ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ──────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false)
              setDeleteError(null)
              setDeleteConfirm('')
            }}
            aria-label="Close modal"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete your account and all associated data, including all
                trees you own, members, photos, and access permissions.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="deleteConfirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {deleteError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteError(null)
                    setDeleteConfirm('')
                  }}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading ? 'Deleting…' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
