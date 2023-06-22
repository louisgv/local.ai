"use client"

import { createProvider } from "puro"
import { useContext } from "react"

import type { ModelMetadata } from "~features/model-downloader/model-file"

/**
 * Requires a global provider
 */
const useServerProvider = ({ model }: { model: ModelMetadata }) => {
  return {
    model
  }
}

const { BaseContext, Provider } = createProvider(useServerProvider)

export const useServer = () => useContext(BaseContext)
export const ServerProvider = Provider
