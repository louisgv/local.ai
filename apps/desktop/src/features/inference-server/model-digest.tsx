import { cn } from "@lab/theme/utils"
import { SpinnerButton } from "@lab/ui/button"
import { CrossCircledIcon, ReloadIcon } from "@radix-ui/react-icons"
import { ShoppingCodeCheck } from "iconoir-react"

import { InitState } from "~features/inference-server/use-init"
import { useOverlayPopup } from "~features/inference-server/use-overlay-popup"
import { DownloadState } from "~features/model-downloader/use-model-download"
import { useModel } from "~providers/model"

export const getTruncatedHash = (hashValue: string) =>
  `${hashValue.slice(0, 4)}...${hashValue.slice(-7)}`

const HashDisplay = ({ hashType = "", hashValue = "", truncated = false }) => {
  return (
    <div className="flex justify-between gap-4 w-full">
      <label className="font-bold">{hashType}</label>
      <code className="break-all lg:break-normal">
        {truncated ? getTruncatedHash(hashValue) : hashValue}
      </code>
    </div>
  )
}

export function ModelDigest() {
  const overlayPopup = useOverlayPopup()
  const {
    integrity,
    isChecking: isCalculating,
    checkModel: computeDigest,
    downloadState,
    integrityInit: { initState }
  } = useModel()
  return (
    <div className="flex justify-end text-gray-10 w-64 relative">
      {integrity ? (
        <>
          <div
            ref={overlayPopup.popupRef}
            className={cn(
              overlayPopup.isVisible
                ? "z-40 opacity-100 pointer-events-auto"
                : "z-0 opacity-0 pointer-events-none",
              "absolute right-0 top-0",
              "transition-opacity",
              "w-64 sm:w-64 md:w-96 lg:w-auto",
              "text-xs sm:text-sm md:text-base"
            )}>
            <div
              className={cn(
                "bg-gray-4 relative px-5 py-4 rounded-lg border border-gray-6",
                "flex-wrap"
              )}>
              <button
                className="absolute right-1 top-1"
                onClick={() => overlayPopup.setIsVisible(false)}>
                <CrossCircledIcon />
              </button>
              {["blake3", "sha256"].map((hashType) => (
                <HashDisplay
                  key={hashType}
                  hashType={hashType.toUpperCase()}
                  hashValue={integrity[hashType]}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 bg-gray-3 rounded-lg">
            <SpinnerButton
              className="w-10 p-3"
              isSpinning={isCalculating}
              Icon={ReloadIcon}
              onClick={computeDigest}
            />
            <button
              ref={overlayPopup.buttonRef}
              className="text-xs hover:bg-gray-4 p-2 rounded-md"
              onClick={() => overlayPopup.setIsVisible(true)}>
              {["blake3", "sha256"].map((hashType) => (
                <HashDisplay
                  key={hashType}
                  truncated
                  hashType={hashType.toUpperCase()}
                  hashValue={integrity[hashType]}
                />
              ))}
            </button>
          </div>
        </>
      ) : (
        <SpinnerButton
          disabled={
            downloadState !== DownloadState.None &&
            downloadState !== DownloadState.Completed
          }
          isSpinning={isCalculating || initState === InitState.Initializing}
          onClick={computeDigest}
          Icon={ShoppingCodeCheck}>
          {isCalculating ? "Computing" : "Check Model"}
        </SpinnerButton>
      )}
    </div>
  )
}
