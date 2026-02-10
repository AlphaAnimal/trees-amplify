import { createRoute, Outlet } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tree/$treeId',
  component: TreeViewLayout,
})

function TreeViewLayout() {
  const { treeId } = Route.useParams()

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Tree: {treeId}</h1>
      <p className="text-gray-500 mt-2">Tree view will be built in Phase 3.</p>
      <Outlet />
    </div>
  )
}
