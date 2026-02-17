import { createContext, useContext } from 'react'

type SignOutFn = (() => void) | undefined

export const SignOutContext = createContext<SignOutFn>(undefined)

export function useSignOut() {
  return useContext(SignOutContext)
}

