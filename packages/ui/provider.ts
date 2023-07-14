"use client"

import { createProvider } from "puro"
import { useContext, useState } from "react"

const useUIProvider = () => {
  const darkModeState = useState<boolean>(undefined)

  return {
    darkModeState
  }
}

const { BaseContext, Provider } = createProvider(useUIProvider)

export const useUI = () => useContext(BaseContext)
export const UIProvider = Provider
