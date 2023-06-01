import { type EffectCallback, useEffect, useRef, useState } from "react"

export enum InitState {
  Default,
  Initializing,
  Initialized
}

export const useInit = (
  callback: () => Promise<EffectCallback | void>,
  dependencies = []
) => {
  const initializedRef = useRef(false)
  const cleanupRef = useRef<EffectCallback>()
  const [initState, setInitState] = useState(InitState.Default)
  useEffect(() => {
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true
    // get the models directory saved in config
    async function init() {
      setInitState(InitState.Initializing)
      const cleanup = await callback()
      if (cleanup) {
        cleanupRef.current = cleanup
      }
      setInitState(InitState.Initialized)
    }
    init()

    return () => {
      cleanupRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return {
    initState
  }
}
