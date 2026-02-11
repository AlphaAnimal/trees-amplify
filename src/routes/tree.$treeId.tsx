import { useEffect } from 'react'
import { createRoute, Outlet } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useTrees } from '@/hooks/useTreesApi'
import { setPartitionKey } from '@/services/flaskService'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tree/$treeId',
  component: TreeLayout,
})

/**
 * Layout route for /tree/:treeId/*
 *
 * Responsibilities:
 *  - Look up the tree from the cached trees list
 *  - Set the global partition key for Flask API requests
 *  - Render child routes via <Outlet />
 */
function TreeLayout() {
  const { treeId } = Route.useParams()
  const { data: treesData } = useTrees()

  const tree = treesData?.trees.find((t) => t.tree_id === treeId)

  useEffect(() => {
    if (tree?.partition_key) {
      setPartitionKey(tree.partition_key)
    }
  }, [tree?.partition_key])

  return <Outlet />
}
