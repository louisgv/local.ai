import { useMatchMedia } from "@lab/ui/hooks/use-match-media"
import { useUI } from "@lab/ui/provider"
import { useCallback, useEffect } from "react"
import { InvokeCommand, invoke } from "~features/invoke"

export const DARK_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

type ThemeClassName = "light" | "dark"

export const useSystemTheme = () => {
  const {
    darkModeState: [isDarkMode, setIsDarkMode]
  } = useUI()

  const isDarkSchemePreferred = useMatchMedia(DARK_COLOR_SCHEME_QUERY)

  useEffect(() => {
    if (isDarkSchemePreferred && isDarkMode === undefined) {
      setIsDarkMode(true)
    }
  }, [isDarkSchemePreferred, isDarkMode, setIsDarkMode])

  const initTheme = useCallback(async () => {
    let themeClassName: ThemeClassName = "light"

    try {
      const themeRes = await invoke(InvokeCommand.GetConfig, {
        path: "theme"
      })

      themeClassName = themeRes.data as ThemeClassName
    } catch (e) {
      if (globalThis.window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches) {
        themeClassName = "dark"
      }
    }
    globalThis.document.documentElement.classList.toggle(themeClassName, true)
    setIsDarkMode(themeClassName === "dark")
  }, [setIsDarkMode])

  useEffect(() => {
    if (isDarkMode === undefined) {
      return
    }

    if (isDarkMode) {
      globalThis.document.documentElement.classList.toggle("light", false)
      globalThis.document.documentElement.classList.toggle("dark", true)
    } else {
      globalThis.document.documentElement.classList.toggle("light", true)
      globalThis.document.documentElement.classList.toggle("dark", false)
    }

    invoke(InvokeCommand.SetConfig, {
      path: "theme",
      data: isDarkMode ? "dark" : "light"
    })
  }, [isDarkMode])

  return {
    initTheme
  }
}
