import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './styles/amplify-overrides.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import MinimumScreenSize from './components/MinimumScreenSize'
import ErrorBoundary from './components/ErrorBoundary'

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
  return (
    <ErrorBoundary>
      <MinimumScreenSize>
        <Authenticator>
          {({ signOut }) => (
            <QueryClientProvider client={queryClient}>
              <SignOutContext.Provider value={signOut}>
                <RouterProvider router={router} />
              </SignOutContext.Provider>
            </QueryClientProvider>
          )}
        </Authenticator>
      </MinimumScreenSize>
    </ErrorBoundary>
  )
}

// Context so any component (e.g. the navbar) can trigger sign-out
import { createContext, useContext } from 'react'

type SignOutFn = (() => void) | undefined

export const SignOutContext = createContext<SignOutFn>(undefined)

export function useSignOut() {
  return useContext(SignOutContext)
}
