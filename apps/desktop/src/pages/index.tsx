import { Button } from "@localai/ui/button"
import { Input } from "@localai/ui/input"
import { open } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

// Flow: Pick a models directory

// For each model file in the directory, show an items with the following:
// - Model name
// - Model hash
// - Model description
// - Model size

// A button to "spawn" an inference server for the selected model

type ModelMetadata = {
  name: string
  hash: string
  description: string
  size: number
  path: string
}

function IndexPage() {
  const [modelsDirectory, setModelsDirectory] = useState("")
  const [models, setModels] = useState([])

  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true
    // get the models directory saved in config
    async function init() {
      console.log("RUNING FAM")

      const resp = await invoke("get_initial_directory")
      console.log(resp)
    }
    init()
  }, [])

  return (
    <div
      className={clsx(
        "h-full w-full flex flex-col p-8 gap-6 transition-all will-change-transform"
      )}>
      <div className="flex gap-2">
        <Input
          value={modelsDirectory}
          readOnly
          placeholder="Models directory"
        />
        <Button
          className="w-24"
          onClick={async () => {
            const selected = (await open({
              directory: true,
              multiple: false
            })) as string

            if (!selected) {
              return
            }

            setModelsDirectory(selected)
            const resp = await invoke("read_directory", {
              dir: selected
            })
            console.log(resp)
          }}>
          Open
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {models.map((model: ModelMetadata) => (
          <div className="flex gap-2">
            <Input value={model.name} readOnly />
            <Input value={model.hash} readOnly />
            <Input value={model.description} readOnly />
            <Input value={model.size} readOnly />
          </div>
        ))}
      </div>
    </div>
  )
}

export default IndexPage
