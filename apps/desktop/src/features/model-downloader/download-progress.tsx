import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import { CheckIcon, PauseIcon, PlayIcon } from "@radix-ui/react-icons"

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
      {downloadState === DownloadState.Completed && <CheckIcon />}

      {(downloadState === DownloadState.Downloading ||
        downloadState === DownloadState.Processing) && (
        <SpinnerButton
          Icon={PauseIcon}
          onClick={() => pauseDownload()}
          isSpinning={downloadState === DownloadState.Processing}
        />
      )}

      {downloadState === DownloadState.Idle && (
        <Button onClick={() => resumeDownload()}>
          <PlayIcon />
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
