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
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700 truncate flex-1 min-w-0">
          {fileName}
        </span>
        <span className="text-xs text-gray-500 ml-2 shrink-0">
          {status === 'uploading' ? `${Math.round(progress)}%` : status === 'success' ? '✓' : '✗'}
        </span>
      </div>
      {status === 'uploading' && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {status === 'error' && error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

