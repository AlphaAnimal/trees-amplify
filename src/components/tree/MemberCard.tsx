import type { Member, SpouseInfo } from '@/types'

interface MemberCardProps {
  member: Member | SpouseInfo
  isFocused?: boolean
  onClick?: () => void
}

function getInitials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
}

function formatYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString()
}

export default function MemberCard({ member, isFocused, onClick }: MemberCardProps) {
  const initials = getInitials(member.name, member.surname)
  const isMale = member.gender === 'male'

  // Check if this member is a SpouseInfo (has marriage data)
  const spouseInfo = 'married' in member ? (member as SpouseInfo) : null

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center p-4 rounded-xl border-2 transition-all
        min-w-[140px] max-w-[160px] shrink-0
        ${
          isFocused
            ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        cursor-pointer
      `}
    >
      {/* Avatar */}
      <div
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          text-white font-semibold text-lg mb-2 shadow-sm
          ${isMale ? 'bg-blue-500' : 'bg-pink-500'}
        `}
      >
        {initials}
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
  )
}

