import { invoke } from "@tauri-apps/api/tauri"
import clsx from "clsx"
import { OpenNewWindow, RemoveSquare } from "iconoir-react"
import { useCallback, useEffect, useRef, useState } from "react"

const DRY_RUN = false

function IndexPage() {
  const [modelUri, setModelUri] = useState("")
  const [modelIds, setModelIds] = useState<string[]>([])

  const migratedRef = useRef(false)

  useEffect(() => {}, [])

  return (
    <div
      className={clsx(
        "h-full w-full flex flex-col p-8 gap-6 transition-all will-change-transform",
        modelIds.length > 0
          ? "justify-start items-start"
          : "justify-center items-center"
      )}></div>
  )
}

export default IndexPage
