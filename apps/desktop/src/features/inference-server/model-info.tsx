import { cn } from "@lab/theme/utils"
import { Button } from "@lab/ui/button"
import { CrossCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons"

import { useOverlayPopup } from "~features/inference-server/use-overlay-popup"
import { useModel } from "~providers/model"

export const ModelInfo = () => {
  const overlayPopup = useOverlayPopup()
  const { knownModelInfo, integrity, checkModel, isChecking } = useModel()

  return (
    <div className="relative text-gray-10">
      <Button
        ref={overlayPopup.buttonRef}
        disabled={isChecking}
        onClick={async () => {
          if (!integrity) {
            await checkModel()
          }
          overlayPopup.setIsVisible(true)
        }}
        className={cn(
          "w-6 h-6 p-1 justify-center",
          "group-hover:opacity-100 opacity-0 transition-opacity"
        )}>
        <InfoCircledIcon />
      </Button>

      <div
        ref={overlayPopup.popupRef}
        className={cn(
          "absolute top-0 left-0",
          "transition-opacity",
          "text-xs sm:text-sm md:text-base",
          knownModelInfo ? "w-64 sm:w-64 md:w-96" : "w-36",
          overlayPopup.isVisible
            ? "z-40 opacity-100 pointer-events-auto"
            : "z-0 opacity-0 pointer-events-none"
        )}>
        <div
          className={cn(
            "bg-gray-4 relative px-5 py-4 rounded-lg border border-gray-6",
            "flex-wrap"
          )}>
          <button
            className={cn("absolute left-1 top-1")}
            onClick={() => overlayPopup.setIsVisible(false)}>
            <CrossCircledIcon />
          </button>
          {!knownModelInfo ? (
            <span className="text-xs font-bold">NOT AVAILABLE</span>
          ) : (
            <div
              className={cn(
                "gap-2 w-full grid text-xs",
                "grid-cols-[2fr_5fr]"
              )}>
              <label className={cn("font-bold")}>ORIGIN</label>
              <code className="text-right break-all">
                {knownModelInfo.downloadUrl.split("/").pop()}
              </code>

              <label className={cn("font-bold")}>TYPE</label>
              <code className="text-right">{knownModelInfo.modelType}</code>

              <label className={cn("font-bold")}>DESCRIPTION</label>
              <code className="text-right whitespace-pre-line">
                {knownModelInfo.description}
              </code>

              <label className={cn("font-bold")}>LICENSE</label>
              <code className="text-right">
                {knownModelInfo.licenses.join(", ")}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
