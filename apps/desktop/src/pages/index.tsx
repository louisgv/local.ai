import { useMemo } from "react"

import { Route, useGlobal } from "~providers/global"
import { ModelManagerView } from "~views/model-manager"
import { ThreadView } from "~views/thread"

// Since NextJS router doesn't work with SPA yet, use manual router for now.

function IndexPage() {
  const {
    routeState: [currentRoute]
  } = useGlobal()

  return useMemo(() => {
    switch (currentRoute) {
      case Route.Thread:
        return <ThreadView />
      case Route.ModelManager:
      default:
        return <ModelManagerView />
    }
  }, [currentRoute])
}

export default IndexPage
