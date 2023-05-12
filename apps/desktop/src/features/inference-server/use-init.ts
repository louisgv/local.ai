import { useEffect, useRef, useState } from "react"

export enum InitState {
  Default,
  Initializing,
  Initialized
}

export const useInit = (callback: () => Promise<void>, dependencies = []) => {
  const initializedRef = useRef(false)
  const [initState, setInitState] = useState(InitState.Default)
  useEffect(() => {
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true
    // get the models directory saved in config
    async function init() {
      setInitState(InitState.Initializing)
      await callback()
      setInitState(InitState.Initialized)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return {
    initState
  }
}
