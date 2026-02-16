import { useState, useEffect } from 'react'

/**
 * Minimum screen size: 13 inch laptop
 * Typical 13" laptop resolution: 1366x768 or 1280x800
 * We'll use 1280px width as minimum
 */
const MIN_WIDTH = 1280
const MIN_HEIGHT = 720

interface Props {
  readonly children: React.ReactNode
}

export default function MinimumScreenSize({ children }: Props) {
  const [isValidSize, setIsValidSize] = useState(true)

  useEffect(() => {
    function checkSize() {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsValidSize(width >= MIN_WIDTH && height >= MIN_HEIGHT)
    }

    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  if (!isValidSize) {
    return (
      <div className="fixed inset-0 bg-[var(--color-background)] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-[var(--color-text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
            Screen Size Too Small
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-2">
            This application requires a minimum screen size of 13 inches (laptop).
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Please use a device with at least {MIN_WIDTH}x{MIN_HEIGHT} pixels resolution.
          </p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-4">
            Current size: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


