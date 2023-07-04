import { useReducer, useRef } from "react"

/**
 * A hybrid is a state variable that is accompanied by a logic ref.
 * The render states are good for ui render
 * The logic ref is useful for checking in effect without the need for re-render.
 */
export const useHybrid = <T>(defaultValue: T) => {
  const dataRef = useRef(defaultValue)
  const [render, set] = useReducer(
    (_: T, newValue: T) => (dataRef.current = newValue),
    dataRef.current
  )

  return {
    set,
    render,
    ref: dataRef,
    get data() {
      return dataRef.current
    }
  }
}
