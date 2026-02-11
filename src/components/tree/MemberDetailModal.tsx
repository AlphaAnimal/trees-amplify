import { useState } from 'react'
import { useMember, usePicUrl, usePhotosUrls } from '@/hooks/useTreesApi'
import { getPartitionKey } from '@/services/flaskService'
import type { Member } from '@/types'

interface Props {
  readonly open: boolean
  readonly onClose: () => void
  readonly memberId: string | null
  readonly onViewInTree?: () => void
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

export default function MemberDetailModal({
  open,
  onClose,
  memberId,
  onViewInTree,
  onEdit,
  onAddChild,
  onAddParent,
  onAddSpouse,
}: Props) {
  const partitionKey = getPartitionKey()
  const { data: member, isLoading: memberLoading } = useMember(partitionKey, memberId)
  const { data: picData, isLoading: picLoading } = usePicUrl(partitionKey, memberId)
  const { data: photosData, isLoading: photosLoading } = usePhotosUrls(partitionKey, memberId)

  const [imageError, setImageError] = useState<string | null>(null)

  if (!open || !memberId) return null

  const isLoading = memberLoading || picLoading || photosLoading
  const picUrl = picData?.url
  const photosUrls = photosData?.urls ?? []

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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Member Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-gray-200">
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
                  </div>
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
              {photosUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Photos ({photosUrls.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photosUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
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
                </div>
              )}

              {photosUrls.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No photos available for this member
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        {(onViewInTree || onEdit || onAddChild || onAddParent || onAddSpouse) && (
          <div className="border-t border-gray-200 px-6 py-4 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              {onViewInTree && (
                <button
                  onClick={() => {
                    onViewInTree()
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  View in Tree
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit()
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Edit Member
                </button>
              )}
              {onAddChild && (
                <button
                  onClick={() => {
                    onAddChild()
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Add Child
                </button>
              )}
              {onAddParent && (
                <button
                  onClick={() => {
                    onAddParent()
                    onClose()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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

