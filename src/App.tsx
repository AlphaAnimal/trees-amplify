import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './styles/amplify-overrides.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import MinimumScreenSize from './components/MinimumScreenSize'
import ErrorBoundary from './components/ErrorBoundary'
import { useTheme } from './hooks/useTheme'
import { SignOutContext } from './contexts/SignOutContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  const { resolvedTheme } = useTheme()
  
  return (
    <ErrorBoundary>
      <MinimumScreenSize>
        <ThemeProvider colorMode={resolvedTheme}>
          <Authenticator>
            {({ signOut }) => (
              <QueryClientProvider client={queryClient}>
                <SignOutContext.Provider value={signOut}>
                  <RouterProvider router={router} />
                </SignOutContext.Provider>
              </QueryClientProvider>
            )}
          </Authenticator>
        </ThemeProvider>
      </MinimumScreenSize>
    </ErrorBoundary>
  )
}
