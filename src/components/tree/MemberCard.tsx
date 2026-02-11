import { useState } from 'react'
import { usePicUrl } from '@/hooks/useTreesApi'
import { getPartitionKey } from '@/services/flaskService'
import type { Member, SpouseInfo } from '@/types'

interface MemberCardProps {
  readonly member: Member | SpouseInfo
  readonly isFocused?: boolean
  readonly onClick?: () => void
  readonly onViewDetails?: () => void
}

function getInitials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
}

function formatYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString()
}

export default function MemberCard({
  member,
  isFocused,
  onClick,
  onViewDetails,
}: MemberCardProps) {
  const partitionKey = getPartitionKey()
  const { data: picData } = usePicUrl(partitionKey, member.id)
  const [imageError, setImageError] = useState(false)
  const initials = getInitials(member.name, member.surname)
  const isMale = member.gender === 'male'
  const picUrl = picData?.url || null
  const showPic = picUrl && !imageError

  // Check if this member is a SpouseInfo (has marriage data)
  const spouseInfo = 'married' in member ? member : null

  return (
    <div
      className={`
        relative flex flex-col items-center p-4 rounded-xl border-2 transition-all
        min-w-[140px] max-w-[160px] shrink-0
        ${
          isFocused
            ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        transition-all duration-200
      `}
    >
      {/* View Details Icon */}
      {onViewDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails()
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors shadow-sm z-10 cursor-pointer"
          aria-label="View member details"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      )}

      <button
        onClick={onClick}
        className="flex flex-col items-center w-full cursor-pointer"
      >
      {/* Avatar */}
      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          text-white font-semibold text-lg mb-2 shadow-sm overflow-hidden
          ${isMale ? 'bg-blue-500' : 'bg-pink-500'}
        `}
      >
        {showPic ? (
          <img
            src={picUrl}
            alt={`${member.name} ${member.surname}`}
            className="w-full h-full object-cover"
            onError={() => {
              setImageError(true)
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-gray-900 text-center leading-tight">
        {member.name}
      </p>
      <p className="text-sm text-gray-600 text-center leading-tight">
        {member.surname}
      </p>

      {/* Lifespan */}
      <p className="text-xs text-gray-400 mt-1.5">
        *{formatYear(member.born)}
        {member.died ? ` — †${formatYear(member.died)}` : ''}
      </p>

      {/* Marriage info for spouses */}
      {spouseInfo && (
        <p className="text-xs text-amber-600 mt-1">
          ♥ {formatYear(spouseInfo.married)}
          {spouseInfo.divorced
            ? ` · div. ${formatYear(spouseInfo.divorced)}`
            : ''}
        </p>
      )}
      </button>
    </div>
  )
}

