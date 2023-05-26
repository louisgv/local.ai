"use client"

import { useMemo } from "react"

import { Route, useGlobal } from "~providers/global"
import { ChatView } from "~views/chat"
import { ModelManagerView } from "~views/model-manager"

// Since NextJS router doesn't work with SPA yet, use manual router for now.

function IndexPage() {
  const {
    routeState: [currentRoute]
  } = useGlobal()
  return useMemo(() => {
    switch (currentRoute) {
      case Route.Chat:
        return <ChatView />
      case Route.ModelManager:
      default:
        return <ModelManagerView />
    }
  }, [currentRoute])
}

export default IndexPage
