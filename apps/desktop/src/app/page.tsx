"use client"

import { ModelManagerView } from "~views/model-manager"

// Since NextJS router doesn't work with SPA yet, use manual router for now.

function IndexPage() {
  return <ModelManagerView />
}

export default IndexPage
