import { type ModelInfoList, type ModelMap, modelList } from "@models/index"
import { fetch } from "@tauri-apps/api/http"
import { useMemo } from "react"
import useSWR from "swr"

export const useModelsApi = () => {
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_LOCALAI_ORIGIN}/api/models`,
    (url) =>
      fetch<ModelInfoList>(url)
        .then((r) => r.data)
        .catch((_) => modelList) // fallback to the static model list embedded in the app
  )

  const modelMap = useMemo(
    () =>
      data?.reduce((acc, model) => {
        acc[model.blake3] = {
          ...model
        }
        return acc
      }, {}) as ModelMap,
    [data]
  )

  return {
    models: data,
    modelMap,
    isLoading: !error && !data,
    isError: error
  }
}
