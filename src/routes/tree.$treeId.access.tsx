import { createRoute } from '@tanstack/react-router'
import { Route as treeRoute } from './tree.$treeId'

export const Route = createRoute({
  getParentRoute: () => treeRoute,
  path: '/access',
  component: AccessControlPage,
})

function AccessControlPage() {
  const { treeId } = Route.useParams()

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-900">Access Control</h2>
      <p className="text-gray-500 mt-2">
        Managing access for tree: {treeId}. Will be built in Phase 5.
      </p>
    </div>
  )
}
