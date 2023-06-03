import { useReducer } from "react"

export const useToggle = (initialState = false) =>
  useReducer((state) => !state, initialState)
