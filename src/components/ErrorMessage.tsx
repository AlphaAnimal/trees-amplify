interface Props {
  readonly title?: string
  readonly message: string
  readonly onRetry?: () => void
  readonly className?: string
}

export default function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  className = '',
}: Props) {
  return (
    <div
      className={`rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 px-4 py-3 text-sm text-[var(--color-error)] animate-in fade-in duration-200 w-full ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-[var(--color-error)] shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-[200px]">
          <p className="font-medium break-words">{title}</p>
          <p className="mt-1 break-words whitespace-normal">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-medium text-[var(--color-error)] hover:opacity-80 underline cursor-pointer transition-opacity inline-block whitespace-nowrap"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


