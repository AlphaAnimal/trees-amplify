import { useState } from 'react'
import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { Route as treeRoute } from './tree.$treeId'
import { useTrees, useMembers, useDirectRelations } from '@/hooks/useTreesApi'
import { getPartitionKey } from '@/services/flaskService'
import MemberCard from '@/components/tree/MemberCard'
import MemberSearch from '@/components/tree/MemberSearch'
import DeleteTreeModal from '@/components/tree/DeleteTreeModal'
import MemberDetailModal from '@/components/tree/MemberDetailModal'
import MemberFormModal from '@/components/tree/MemberFormModal'

export const Route = createRoute({
  getParentRoute: () => treeRoute,
  path: '/',
  component: TreeViewPage,
  validateSearch: (search: Record<string, unknown>) => ({
    memberId: (search.memberId as string) || undefined,
  }),
})

function TreeViewPage() {
  const { treeId } = Route.useParams()
  const { memberId: searchMemberId } = Route.useSearch()
  const navigate = useNavigate()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [detailModalMemberId, setDetailModalMemberId] = useState<string | null>(null)
  const [formModalMode, setFormModalMode] = useState<
    'create-child' | 'create-parent' | 'create-spouse' | 'edit' | null
  >(null)
  const [formModalRelatedId, setFormModalRelatedId] = useState<string | undefined>(undefined)

  // ─── Tree info ────────────────────────────────────────────────────
  const { data: treesData } = useTrees()
  const tree = treesData?.trees.find((t) => t.tree_id === treeId)
  const partitionKey = tree?.partition_key ?? getPartitionKey()
  const treeName = tree?.name || 'Unnamed Tree'
  const isOwner = tree?.role === 'owner'
  const canEdit = tree?.role === 'owner' || tree?.role === 'editor'

  // ─── All members (for search + default focus) ─────────────────────
  const { data: allMembers, isLoading: membersLoading } = useMembers(partitionKey)

  // ─── Determine focused member ────────────────────────────────────
  const focusedMemberId = searchMemberId ?? allMembers?.[0]?.id ?? null

  // ─── Direct relations for focused member ──────────────────────────
  const { data: relations, isLoading: relationsLoading } = useDirectRelations(
    partitionKey,
    focusedMemberId,
  )

  // ─── Navigation ──────────────────────────────────────────────────
  function handleMemberClick(memberId: string) {
    navigate({
      to: '/tree/$treeId',
      params: { treeId },
      search: { memberId },
    })
  }

  function handleMemberCardClick(memberId: string) {
    setDetailModalMemberId(memberId)
  }

  // ─── Loading state ───────────────────────────────────────────────
  const isLoading = membersLoading || (focusedMemberId && relationsLoading)

  if (!partitionKey) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-57px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading tree…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Back to dashboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>

          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {treeName}
          </h1>

          {tree?.role && (
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                tree.role === 'owner'
                  ? 'bg-indigo-100 text-indigo-700'
                  : tree.role === 'editor'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tree.role.charAt(0).toUpperCase() + tree.role.slice(1)}
            </span>
          )}
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          {allMembers && allMembers.length > 0 && (
            <MemberSearch
              members={allMembers}
              onSelect={handleMemberClick}
            />
          )}

          {isOwner && (
            <Link
              to="/tree/$treeId/access"
              params={{ treeId }}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
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
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
              <span className="hidden sm:inline">Access</span>
            </Link>
          )}

          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
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
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tree View ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading tree members…</p>
            </div>
          </div>
        ) : !relations ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">No members found</p>
              <p className="text-sm text-gray-400">
                This tree doesn't have any members yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-full py-12 px-6">
            {/* ── Parents Row ──────────────────────────────────────── */}
            {relations.parents.length > 0 && (
              <>
                <div className="flex items-end justify-center gap-4">
                  {relations.parents.map((parent, idx) => (
                    <div key={parent.id} className="flex items-center gap-3">
                      <MemberCard
                        member={parent}
                        onClick={() => handleMemberClick(parent.id)}
                        onViewDetails={() => handleMemberCardClick(parent.id)}
                      />
                      {/* Marriage connector between parents */}
                      {idx === 0 && relations.parents.length === 2 && (
                        <div className="flex flex-col items-center">
                          <div className="w-8 border-t-2 border-dashed border-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Vertical connector to focused member */}
                <div className="flex flex-col items-center my-2">
                  <div className="w-px h-8 bg-gray-300" />
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                </div>
              </>
            )}

            {/* ── Focused Member + Spouses Row ─────────────────────── */}
            <div className="flex items-center justify-center gap-3">
              <MemberCard
                member={relations.member}
                isFocused
                onClick={() => {}} // Already focused, no action needed
                onViewDetails={() => handleMemberCardClick(relations.member.id)}
              />

              {relations.spouses.map((spouse) => (
                <div key={spouse.id} className="flex items-center gap-3">
                  {/* Marriage connector */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-gray-300 text-sm">♥</span>
                    <div className="w-6 border-t-2 border-dashed border-gray-300" />
                  </div>
                  <MemberCard
                    member={spouse}
                    onClick={() => handleMemberClick(spouse.id)}
                    onViewDetails={() => handleMemberCardClick(spouse.id)}
                  />
                </div>
              ))}
            </div>

            {/* ── Children Row ─────────────────────────────────────── */}
            {relations.children.length > 0 && (
              <>
                {/* Vertical connector to children */}
                <div className="flex flex-col items-center my-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <div className="w-px h-8 bg-gray-300" />
                </div>

                {/* Horizontal spread line for multiple children */}
                {relations.children.length > 1 && (
                  <div
                    className="border-t-2 border-gray-300 mb-2"
                    style={{
                      width: `${Math.min(relations.children.length * 160, 800)}px`,
                    }}
                  />
                )}

                <div className="flex items-start justify-center gap-4 overflow-x-auto max-w-full pb-4 px-4">
                  {relations.children.map((child) => (
                    <MemberCard
                      key={child.id}
                      member={child}
                      onClick={() => handleMemberClick(child.id)}
                      onViewDetails={() => handleMemberCardClick(child.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Empty hint when tree has only one member */}
            {relations.parents.length === 0 &&
              relations.spouses.length === 0 &&
              relations.children.length === 0 && (
                <p className="mt-8 text-sm text-gray-400 text-center max-w-xs">
                  This is the only member in the tree. Add parents, spouses, or
                  children from the member detail view.
                </p>
              )}
          </div>
        )}
      </div>

      {/* ── Member Detail Modal ──────────────────────────────────────── */}
      <MemberDetailModal
        open={detailModalMemberId !== null}
        onClose={() => setDetailModalMemberId(null)}
        memberId={detailModalMemberId}
        canEdit={canEdit}
        onEdit={
          canEdit
            ? () => {
                if (detailModalMemberId) {
                  setFormModalMode('edit')
                  setFormModalRelatedId(detailModalMemberId)
                }
              }
            : undefined
        }
        onAddChild={
          canEdit
            ? () => {
                if (detailModalMemberId) {
                  setFormModalMode('create-child')
                  setFormModalRelatedId(detailModalMemberId)
                }
              }
            : undefined
        }
        onAddParent={
          canEdit
            ? () => {
                if (detailModalMemberId) {
                  setFormModalMode('create-parent')
                  setFormModalRelatedId(detailModalMemberId)
                }
              }
            : undefined
        }
        onAddSpouse={
          canEdit
            ? () => {
                if (detailModalMemberId) {
                  setFormModalMode('create-spouse')
                  setFormModalRelatedId(detailModalMemberId)
                }
              }
            : undefined
        }
      />

      {/* ── Member Form Modal (Create/Edit) ───────────────────────────── */}
      <MemberFormModal
        open={formModalMode !== null}
        onClose={() => {
          setFormModalMode(null)
          setFormModalRelatedId(undefined)
        }}
        mode={formModalMode ?? 'edit'}
        relatedMemberId={
          formModalMode !== 'edit' ? formModalRelatedId : undefined
        }
        memberId={formModalMode === 'edit' ? formModalRelatedId : undefined}
        onSuccess={() => {
          // The mutations already invalidate queries, which will trigger a refetch
          // No need to manually call handleMemberClick - the query will refetch automatically
        }}
      />

      {/* ── Delete Modal ───────────────────────────────────────────── */}
      <DeleteTreeModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        treeId={treeId}
        treeName={treeName}
      />
    </div>
  )
}

