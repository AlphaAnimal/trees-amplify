import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useTrees } from '@/hooks/useTreesApi'
import TreeCard from '@/components/dashboard/TreeCard'
import EmptyState from '@/components/dashboard/EmptyState'
import CreateTreeModal from '@/components/dashboard/CreateTreeModal'
import ErrorMessage from '@/components/ErrorMessage'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data, isLoading, isError, error } = useTrees()

  const trees = data?.trees ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trees</h1>
          {trees.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {trees.length} {trees.length === 1 ? 'tree' : 'trees'}
            </p>
          )}
        </div>
        {trees.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            Create Tree
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading your trees…</p>
          </div>
        </div>
      ) : isError ? (
        <div className="animate-in fade-in duration-300">
          <ErrorMessage
            title="Failed to load trees"
            message={error?.message || 'An unknown error occurred'}
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : trees.length === 0 ? (
        <EmptyState onCreateTree={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {trees.map((tree) => (
            <TreeCard key={tree.tree_id} tree={tree} />
          ))}
        </div>
      )}

      {/* Create Tree Modal */}
      <CreateTreeModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
