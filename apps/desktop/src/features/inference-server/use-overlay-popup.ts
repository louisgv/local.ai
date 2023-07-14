import { useEffect, useRef, useState } from "react"

export const useOverlayPopup = <
  TButton extends HTMLButtonElement,
  TPopup extends HTMLDivElement
>() => {
  const [isVisible, setIsVisible] = useState(false)
  const buttonRef = useRef<TButton>(null)
  const popupRef = useRef<TPopup>(null)

  const toggle = () => setIsVisible((v) => !v)

  useEffect(() => {
    if (!isVisible) return

    const handleExternalClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return
      }

      if (
        !popupRef.current?.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener("click", handleExternalClick)

    return () => {
      document.removeEventListener("click", handleExternalClick)
    }
  }, [isVisible])

  return {
    isVisible,
    setIsVisible,
    toggle,
    popupRef,
    buttonRef
  }
}
