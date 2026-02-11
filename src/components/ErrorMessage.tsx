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
      className={`rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
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
        <div className="flex-1 min-w-0">
          <p className="font-medium">{title}</p>
          <p className="mt-1 break-words">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-medium text-red-800 hover:text-red-900 underline cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

