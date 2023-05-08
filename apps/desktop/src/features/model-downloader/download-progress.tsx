import { useDownloadProgress } from "~features/model-downloader/use-download-progress"

export const DownloadProgress = () => {
  const { progressList } = useDownloadProgress()

  return (
    <div className="flex flex-col gap-2">
      {progressList.map(({ progress, md5Hash }) => (
        <div>
          <span>
            {md5Hash}: {progress}%
          </span>
          <progress className="w-full" value={progress} max={100} />
        </div>
      ))}
    </div>
  )
}
