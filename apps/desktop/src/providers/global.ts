import { createProvider } from "puro"
import { useContext, useState } from "react"

import { type ModelMetadata } from "~core/model-file"

const useGlobalProvider = () => {
  const activeModelState = useState<ModelMetadata>(null)

  return {
    activeModelState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
