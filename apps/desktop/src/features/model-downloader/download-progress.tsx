import { cn } from "@lab/theme/utils"
import { Button, SpinnerButton } from "@lab/ui/button"
import { PauseIcon, ResumeIcon } from "@radix-ui/react-icons"
import { CloudCheck, ShoppingCodeError } from "iconoir-react"

import { DownloadState } from "~features/model-downloader/use-model-download"
import { useModel } from "~providers/model"

export const DownloadProgress = () => {
  const { downloadState, pauseDownload, resumeDownload, progress } = useModel()

  if (downloadState === DownloadState.None) {
    return null
  }

  return (
    <div
      className={cn(
        "flex gap-2 items-center",
        downloadState === DownloadState.Downloading
          ? "opacity-100"
          : "group-hover:opacity-100 opacity-0"
      )}>
      {downloadState === DownloadState.Completed && (
        <CloudCheck className="h-4 w-4" />
      )}

      {downloadState === DownloadState.Errored && (
        <ShoppingCodeError className="h-4 w-4 text-red-9" />
      )}

      {(downloadState === DownloadState.Downloading ||
        downloadState === DownloadState.Validating) && (
        <SpinnerButton
          Icon={PauseIcon}
          onClick={() => pauseDownload()}
          isSpinning={downloadState === DownloadState.Validating}
        />
      )}

      {downloadState === DownloadState.Idle && (
        <Button onClick={() => resumeDownload()}>
          <ResumeIcon />
        </Button>
      )}

      {downloadState !== DownloadState.Completed && (
        <span className="flex w-40 h-full relative">
          <progress
            className={cn(
              "w-full h-full rounded-md overflow-hidden bg-gray-3",
              `
            [&::-webkit-progress-bar]:bg-gray-3
            [&::-webkit-progress-value]:bg-gray-5 
            [&::-moz-progress-bar]:bg-gray-5
          `
            )}
            value={progress}
            max={100}
          />
          <span className="absolute w-full flex justify-center self-center">
            {progress.toFixed(2)}%
          </span>
        </span>
      )}
    </div>
  )
}
