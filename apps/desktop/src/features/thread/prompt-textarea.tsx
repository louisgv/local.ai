import { cn } from "@lab/theme/utils"
import { Button } from "@lab/ui/button"
import { Textarea } from "@lab/ui/textarea"
import {
  EnterFullScreenIcon,
  EnterIcon,
  Pencil1Icon,
  Pencil2Icon
} from "@radix-ui/react-icons"
import {
  BrainElectricity,
  EditPencil,
  Notes,
  Pause,
  Send,
  SendDiagonal
} from "iconoir-react"
import { useCallback, useState } from "react"

export const PromptTextarea = ({
  className = "",
  onStop = () => {},
  onSubmit = (_: string) => {},
  onNote = (_: string) => {},
  isResponding = false,
  clearInput = false
}) => {
  const [prompt, setPrompt] = useState("")

  const submit = useCallback(() => {
    onSubmit(prompt)
    if (clearInput) {
      setPrompt("")
    }
  }, [prompt, clearInput, onSubmit])

  const note = useCallback(() => {
    onNote(prompt)
    if (clearInput) {
      setPrompt("")
    }
  }, [prompt, clearInput, onNote])

  return (
    <div
      className={cn(
        "relative flex gap-3 w-full items-end justify-center",
        className
      )}>
      <Textarea
        className="w-full h-full"
        placeholder={[
          "Markdown is supported",
          "[ENTER]\t\t\t\t\t\t\t\t\tTake note",
          "[SHIFT + ENTER]\t\t\t\t\tAdd a new line",
          "[CTRL/CMD + ENTER]\t\t\tStart AI inferencing"
        ].join("\n")}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              return
            }

            if (e.ctrlKey || e.metaKey) {
              e.preventDefault()
              submit()
              return
            }

            e.preventDefault()
            note()
          }
        }}
      />
      <div className="flex flex-col h-full justify-between gap-3">
        <Button
          className={cn(
            "w-12 h-12 justify-center p-0",
            "disabled:cursor-not-allowed",
            "text-blue-9 hover:text-blue-10"
          )}
          disabled={!isResponding && !prompt}
          onClick={isResponding ? onStop : submit}>
          {isResponding ? <Pause /> : <BrainElectricity />}
        </Button>
        <Button
          className={cn(
            "w-12 h-12 justify-center p-0",
            "disabled:cursor-not-allowed",
            "bg-gold-9 hover:bg-gold-10 text-white"
          )}
          disabled={!isResponding && !prompt}
          onClick={note}>
          <EditPencil />
        </Button>
      </div>
    </div>
  )
}
