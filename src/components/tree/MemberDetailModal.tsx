import { useState, useEffect, useRef } from 'react'
import {
  useMember,
  useDirectRelations,
  usePicUrl,
  usePhotosUrls,
  useUploadPic,
  useUploadPhotos,
} from '@/hooks/useTreesApi'
import { getPartitionKey } from '@/services/flaskService'

interface Props {
  readonly open: boolean
  readonly onClose: () => void
  readonly memberId: string | null
  readonly canEdit?: boolean
  readonly onEdit?: () => void
  readonly onAddChild?: () => void
  readonly onAddParent?: () => void
  readonly onAddSpouse?: () => void
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatYear(dateStr: string): string {
  try {
    return new Date(dateStr).getFullYear().toString()
  } catch {
    return dateStr
  }
}

// Minimum age to have children: 12 years 9 months = (12 * 365 + 9 * 30) days = 4650 days
const MINIMUM_AGE_FOR_CHILDREN_DAYS = 12 * 365 + 9 * 30

function isTooYoungToHaveChildren(born: string, died: string | null | undefined): boolean {
  try {
    const bornDate = new Date(born)
    const referenceDate = died ? new Date(died) : new Date()
    const ageInMs = referenceDate.getTime() - bornDate.getTime()
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24)
    return ageInDays < MINIMUM_AGE_FOR_CHILDREN_DAYS
  } catch {
    // If date parsing fails, default to allowing (backend will validate)
    return false
  }
}

export default function MemberDetailModal({
  open,
  onClose,
  memberId,
  canEdit = true,
  onEdit,
  onAddChild,
  onAddParent,
  onAddSpouse,
}: Props) {
  const partitionKey = getPartitionKey()
  const { data: member, isLoading: memberLoading } = useMember(partitionKey, memberId)
  const { data: relations, isLoading: relationsLoading } = useDirectRelations(
    partitionKey,
    memberId,
  )
  const { data: picData, isLoading: picLoading } = usePicUrl(partitionKey, memberId)
  const { data: photosData, isLoading: photosLoading } = usePhotosUrls(partitionKey, memberId)
  const uploadPic = useUploadPic(partitionKey)
  const uploadPhotos = useUploadPhotos(partitionKey)

  const [imageError, setImageError] = useState<string | null>(null)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    total: number
    completed: number
    currentFile?: string
  } | null>(null)
  const picInputRef = useRef<HTMLInputElement>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)

  // ─── Escape key handler ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  // ─── Upload handlers ───────────────────────────────────────────────
  async function handlePicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !memberId) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    setUploadError(null)
    setUploadingPic(true)

    try {
      await uploadPic.mutateAsync({ memberId, file })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload picture')
    } finally {
      setUploadingPic(false)
      if (picInputRef.current) picInputRef.current.value = ''
    }
  }

  async function handlePhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !memberId) return

    const invalidFiles = files.filter((f) => !f.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      setUploadError('Please select only image files')
      return
    }

    setUploadError(null)
    setUploadingPhotos(true)
    setUploadProgress({ total: files.length, completed: 0 })

    try {
      await uploadPhotos.mutateAsync({ memberId, files })
      setUploadProgress({ total: files.length, completed: files.length })
      // Clear progress after a brief delay
      setTimeout(() => {
        setUploadProgress(null)
      }, 1000)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload photos')
      setUploadProgress(null)
    } finally {
      setUploadingPhotos(false)
      if (photosInputRef.current) photosInputRef.current.value = ''
    }
  }

  if (!open || !memberId) return null

  const isLoading = memberLoading || relationsLoading || picLoading || photosLoading
  const picUrl = picData?.url || null
  const photosUrls = photosData?.urls ?? []
  const parentsCount = relations?.parents.length ?? 0
  const hasMaxParents = parentsCount >= 2
  const memberName = member ? `${member.name} ${member.surname}` : ''
  const isTooYoung =
    member && isTooYoungToHaveChildren(member.born, member.died || null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in slide-up duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Member Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading member details…</p>
              </div>
            </div>
          ) : !member ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Member not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Profile Section ───────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Picture */}
                <div className="shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-gray-200 relative">
                    {picUrl && !imageError ? (
                      <img
                        src={picUrl}
                        alt={`${member.name} ${member.surname}`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError('pic')}
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center text-white text-3xl font-semibold ${
                          member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}
                      >
                        {member.name.charAt(0)}
                        {member.surname.charAt(0)}
                      </div>
                    )}
                    {uploadingPic && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {canEdit && (
                    <>
                      <input
                        ref={picInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePicUpload}
                        className="hidden"
                        id="upload-pic"
                      />
                      <label
                        htmlFor="upload-pic"
                        className="mt-2 block text-center text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        {uploadingPic ? 'Uploading…' : 'Change Picture'}
                      </label>
                    </>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {member.name} {member.surname}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium text-gray-900 capitalize">{member.gender}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Born:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(member.born)} ({formatYear(member.born)})
                      </span>
                    </div>

                    {member.died && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Died:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(member.died)} ({formatYear(member.died)})
                        </span>
                      </div>
                    )}

                    {member.died && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Lifespan:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(member.died).getFullYear() -
                            new Date(member.born).getFullYear()}{' '}
                          years
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Description ──────────────────────────────────────── */}
              {member.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Photos Section ────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Photos {photosUrls.length > 0 && `(${photosUrls.length})`}
                  </h4>
                  {canEdit && (
                    <>
                      <input
                        ref={photosInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotosUpload}
                        disabled={uploadingPhotos}
                        className="hidden"
                        id="upload-photos"
                      />
                      <label
                        htmlFor="upload-photos"
                        className={`text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer px-2 py-1 rounded hover:bg-indigo-50 transition-colors ${
                          uploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingPhotos ? 'Uploading…' : '+ Add Photos'}
                      </label>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 animate-in fade-in duration-200">
                    {uploadError}
                  </div>
                )}

                {/* Upload Progress Indicator */}
                {uploadProgress && uploadingPhotos && (
                  <div className="mb-4 rounded-lg bg-indigo-50 border border-indigo-200 p-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-indigo-900">
                        Uploading photos...
                      </span>
                      <span className="text-sm text-indigo-700">
                        {uploadProgress.completed} / {uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                        style={{
                          width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                    {uploadProgress.currentFile && (
                      <p className="text-xs text-indigo-600 mt-2 truncate">
                        {uploadProgress.currentFile}
                      </p>
                    )}
                  </div>
                )}

                {photosUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photosUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 transition-transform hover:scale-105"
                      >
                        <img
                          src={url}
                          alt={`Photo ${idx + 1} of ${member.name} ${member.surname}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : !uploadingPhotos ? (
                  <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No photos available. Click "Add Photos" to upload some.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        {(onEdit || onAddChild || onAddParent || onAddSpouse) && (
          <div className="border-t border-gray-200 px-6 py-4 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit()
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Edit
                </button>
              )}
              {onAddChild && (
                <button
                  onClick={() => {
                    if (!isTooYoung) {
                      onAddChild()
                      onClose()
                    }
                  }}
                  disabled={isTooYoung}
                  title={isTooYoung ? `${memberName} is too young to have children` : undefined}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isTooYoung
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  Add Child
                </button>
              )}
              {onAddParent && (
                <button
                  onClick={() => {
                    if (!hasMaxParents) {
                      onAddParent()
                      onClose()
                    }
                  }}
                  disabled={hasMaxParents}
                  title={hasMaxParents ? `${memberName} already has 2 parents` : undefined}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    hasMaxParents
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  Add Parent
                </button>
              )}
              {onAddSpouse && (
                <button
                  onClick={() => {
                    onAddSpouse()
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Add Spouse
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

