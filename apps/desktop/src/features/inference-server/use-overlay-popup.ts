import { useEffect, useRef, useState } from "react"

export const useOverlayPopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const popupRef = useRef(null)
  const buttonRef = useRef(null)

  const toggle = () => setIsVisible((v) => !v)

  useEffect(() => {
    if (!isVisible) return

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        !popupRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener("click", handleDocumentClick)

    return () => {
      document.removeEventListener("click", handleDocumentClick)
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
