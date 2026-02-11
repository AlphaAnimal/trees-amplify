import { Link } from '@tanstack/react-router'
import { setPartitionKey } from '@/services/flaskService'
import type { TreeSummary, Role } from '@/types'

const roleBadge: Record<Role, { label: string; className: string }> = {
  owner: {
    label: 'Owner',
    className: 'bg-indigo-100 text-indigo-700',
  },
  editor: {
    label: 'Editor',
    className: 'bg-amber-100 text-amber-700',
  },
  viewer: {
    label: 'Viewer',
    className: 'bg-gray-100 text-gray-600',
  },
}

export default function TreeCard({ tree }: { readonly tree: TreeSummary }) {
  const badge = roleBadge[tree.role]

  return (
    <Link
      to="/tree/$treeId"
      params={{ treeId: tree.tree_id }}
      search={{ memberId: undefined }}
      onClick={() => {
        if (tree.partition_key) setPartitionKey(tree.partition_key)
      }}
      className="block rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all overflow-hidden"
    >
      {/* Image banner */}
      <div className="h-32 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
        {tree.image ? (
          <img
            src={tree.image}
            alt={tree.name ?? 'Tree'}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-12 h-12 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {tree.name || 'Unnamed Tree'}
          </h3>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        {tree.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {tree.description}
          </p>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span>
            {tree.member_count} {tree.member_count === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>
    </Link>
  )
}

