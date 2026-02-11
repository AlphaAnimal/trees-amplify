import { Route as rootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as SettingsRoute } from './routes/settings'
import { Route as TreeTreeIdRoute } from './routes/tree.$treeId'
import { Route as TreeTreeIdIndexRoute } from './routes/tree.$treeId.index'
import { Route as TreeTreeIdAccessRoute } from './routes/tree.$treeId.access'

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  SettingsRoute,
  TreeTreeIdRoute.addChildren([TreeTreeIdIndexRoute, TreeTreeIdAccessRoute]),
])
