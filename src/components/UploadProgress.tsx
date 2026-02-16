interface Props {
  readonly fileName: string
  readonly progress: number
  readonly status: 'uploading' | 'success' | 'error'
  readonly error?: string
}

export default function UploadProgress({
  fileName,
  progress,
  status,
  error,
}: Props) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--color-text-primary)] truncate flex-1 min-w-0">
          {fileName}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)] ml-2 shrink-0">
          {status === 'uploading' ? `${Math.round(progress)}%` : status === 'success' ? '✓' : '✗'}
        </span>
      </div>
      {status === 'uploading' && (
        <div className="w-full bg-[var(--color-border)] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[var(--color-accent)] h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {status === 'error' && error && (
        <p className="text-xs text-[var(--color-error)] mt-1">{error}</p>
      )}
    </div>
  )
}


