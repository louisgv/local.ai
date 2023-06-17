import { cn } from "@localai/theme/utils"
import { CrossCircledIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"

import { useToggle } from "~features/layout/use-toggle"
import { toGB } from "~features/model-downloader/model-file"
import { useModel } from "~providers/model"

import { useModelType } from "./use-model-type"

const InfoMenu = () => {
  const [showMenu, setShowMenu] = useState(false)
  const { model, modelSize } = useModel()
  const [showByte, toggleShowByte] = useToggle()
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const { modelType } = useModelType(model)

  useEffect(() => {
    const handleResize = () => {
      if (menuRef.current) {
        const menuWidth = menuRef.current.offsetWidth
        const contentWidth = menuRef.current.firstChild.offsetWidth
        if (contentWidth > menuWidth) {
          menuRef.current.classList.add("overflow-x-scroll")
        } else {
          menuRef.current.classList.remove("overflow-x-scroll")
        }
      }
    }

    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const formatModelSize = (size) => {
    return isNaN(size) ? "N/A" : `${toGB(size).toFixed(2)} GB`
  }

  const handleClick = () => {
    toggleShowByte()
  }

  const handleDocumentClick = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !buttonRef.current.contains(event.target)
    ) {
      setShowMenu(false)
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick)

    return () => {
      document.removeEventListener("click", handleDocumentClick)
    }
  }, [])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={cn(
          "px-3 py-2 text-gray-10 hover:text-gray-11 focus:text-gray-11"
        )}
        onClick={() => setShowMenu(!showMenu)}>
        <span className="text-sm">Info</span>
      </button>

      {showMenu && (
        <div
          className={cn(
            "absolute top-8 left-0 bg-gray-3 border border-gray-6 rounded-md shadow-md"
          )}
          ref={menuRef}
          style={{ minWidth: "225px" }}>
          <div className={cn("px-3 py-2")}>
            <div
              className={cn("flex items-center justify-between mb-4")}
              style={{ whiteSpace: "nowrap" }}>
              <h4 className={cn("text-lg text-gray-10 font-semibold")}>
                Model Information
              </h4>
              <button
                className={cn("absolute right-1 top-1")}
                onClick={() => setShowMenu(false)}>
                <CrossCircledIcon />
              </button>
            </div>

            <div className={cn("text-gray-10")}>
              <div style={{ whiteSpace: "nowrap" }}>
                <div className={cn("flex justify-between")}>
                  <div className={cn("text-right")}>Type</div>
                  <div className={cn("text-gray-11")}>{modelType}</div>
                </div>
                <div className={cn("flex justify-between")}>
                  <div className={cn("text-right")}>Size</div>
                  <div className={cn("text-gray-11")}>
                    {showByte ? `${modelSize} B` : formatModelSize(modelSize)}
                  </div>
                </div>
              </div>
              <button
                className={cn("text-xs text-gray-10 hover:text-gray-11")}
                onClick={handleClick}>
                {showByte ? "Show in GB" : "Show in Bytes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { InfoMenu }
