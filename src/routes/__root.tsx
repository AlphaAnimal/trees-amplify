import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { signOut } from 'aws-amplify/auth'
import { useSignOut } from '../App'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const signOutFromContext = useSignOut()
  const queryClient = useQueryClient()
  const { authStatus, user } = useAuthenticator()
  const prevAuthStatus = useRef<string | null>(null)
  const prevUserId = useRef<string | null>(null)
  const isInitialMount = useRef(true)

  // Wrap signOut - let the useEffect handle the redirect when auth status changes
  const handleSignOut = async () => {
    try {
      queryClient.clear()
      // Use the async signOut from aws-amplify/auth
      // The useEffect will detect the auth status change and redirect
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
      // If signOut fails, still try to redirect
      window.location.href = '/'
    }
  }

  // Handle redirect and cache clearing on auth status changes
  useEffect(() => {
    // Use email or username to identify the user (email is unique per user)
    const currentUserIdentifier =
      user?.signInDetails?.loginId || user?.username || user?.userId || null

    // Skip on initial mount - we only want to redirect on actual transitions
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevAuthStatus.current = authStatus
      prevUserId.current = currentUserIdentifier
      return
    }

    // When user signs out (transitions from authenticated to unauthenticated), redirect to /
    if (prevAuthStatus.current === 'authenticated' && authStatus === 'unauthenticated') {
      queryClient.clear()
      // Small delay to ensure Authenticator has processed the sign out
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return
    }

    // When user transitions from unauthenticated to authenticated, redirect to / and clear cache
    if (prevAuthStatus.current === 'unauthenticated' && authStatus === 'authenticated') {
      // Clear all cache when a new user signs in
      queryClient.clear()
      // Force redirect to / using window.location to bypass router state
      window.location.href = '/'
      return
    }

    // If user identifier changes (different user signed in), clear cache and redirect
    if (
      authStatus === 'authenticated' &&
      prevUserId.current !== null &&
      currentUserIdentifier !== null &&
      prevUserId.current !== currentUserIdentifier
    ) {
      queryClient.clear()
      window.location.href = '/'
      return
    }

    prevAuthStatus.current = authStatus
    prevUserId.current = currentUserIdentifier
  }, [authStatus, user, queryClient])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
          Family Trees
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Settings
          </Link>
          {signOutFromContext && (
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
