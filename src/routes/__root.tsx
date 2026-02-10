import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useSignOut } from '../App'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const signOut = useSignOut()

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
          {signOut && (
            <button
              onClick={signOut}
              className="text-sm text-red-600 hover:text-red-800"
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
