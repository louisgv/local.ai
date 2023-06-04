import { createProvider } from "puro"
import { useContext } from "react"
import useSWR from "swr"

const fallbackVersion = "0.0.4"

const useGlobalProvider = () => {
  const { data: version } = useSWR("/api/cases", (url) =>
    fetch(url)
      .then((res) => res.json())
      .then((res) => res.version)
      .catch(() => fallbackVersion)
  )

  return {
    version
  }
}

const { BaseContext, Provider } = createProvider(useGlobalProvider)

export const useGlobal = () => useContext(BaseContext)
export const GlobalProvider = Provider
