import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useAuthenticator } from '@aws-amplify/ui-react'
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { signOut } from 'aws-amplify/auth'
import { useSignOut } from '../App'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

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
  useTheme() // Initialize theme

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
    <div className="h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors overflow-hidden">
      <nav className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] px-6 py-3 flex items-center justify-between shrink-0">
        <Link 
          to="/" 
          className="text-xl font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          Family Trees
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/help"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Help
          </Link>
          <Link
            to="/settings"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Settings
          </Link>
          {signOutFromContext && (
            <button
              onClick={handleSignOut}
              className="text-sm text-[var(--color-error)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>
      <main className="flex-1 overflow-auto bg-[var(--color-background)]">
        <Outlet />
      </main>
    </div>
  )
}
