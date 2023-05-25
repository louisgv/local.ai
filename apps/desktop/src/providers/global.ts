import { createProvider } from "puro"
import { useContext, useState } from "react"

import { type ModelMetadata } from "~core/model-file"

const useGlobalProvider = () => {
  const activeModelState = useState<ModelMetadata>(null)
  const concurrencyState = useState(1)

  return {
    activeModelState,
    concurrencyState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
