import { useState } from "react"

import { useInit } from "~features/inference-server/use-init"

export const useThreadConfig = () => {
  const [maxTokens, _setMaxTokens] = useState(-1)

  useInit(async () => {
    _setMaxTokens(100)
  }, [])
}
