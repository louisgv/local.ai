import { createProvider } from "puro"
import { useContext, useState } from "react"

const useGlobalProvider = () => {
  const activeModelState = useState("")

  return {
    activeModelState
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
