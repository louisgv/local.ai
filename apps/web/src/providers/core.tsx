import { createProvider } from "puro"
import { useContext, useState } from "react"

const useCoreProvider = () => {
  const [cases, setCases] = useState([])

  return {
    cases,
    setCases
  }
}

const { BaseContext, Provider } = createProvider(useCoreProvider)

export const useCore = () => useContext(BaseContext)
export const CoreProvider = Provider
