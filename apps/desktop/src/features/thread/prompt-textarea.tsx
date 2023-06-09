import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import { Textarea } from "@localai/ui/textarea"
import { Notes, Pause, Send } from "iconoir-react"
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
        className="w-full h-full bg-gray-3"
        placeholder={[
          "Pst... try using Markdown. Here're some shortcuts:",
          "\t- [CTRL/CMD + ENTER]\t\tTake note",
          "\t- [SHIFT + ENTER]\t\t\t\t\tAdd a new line",
          "\t- [ENTER]\t\t\t\t\t\t\t\tStart AI inferencing"
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
              note()
              return
            }

            e.preventDefault()
            submit()
          }
        }}
      />
      <div className="flex flex-col h-full justify-between gap-3">
        <Button
          className={cn(
            "w-12 h-12 justify-center p-0",
            "disabled:cursor-not-allowed",
            "border border-gold-9 text-gold-9 disabled:border-gray-9 disabled:text-gray-9"
          )}
          disabled={isResponding || !prompt}
          onClick={note}>
          <Notes />
        </Button>
        <Button
          className={cn(
            "w-12 h-12 justify-center p-0",
            "disabled:cursor-not-allowed",
            "bg-blue-9 hover:bg-blue-10 text-blue-12 disabled:bg-gray-9 disabled:text-gray-11"
          )}
          disabled={!isResponding && !prompt}
          onClick={isResponding ? onStop : submit}>
          {isResponding ? <Pause /> : <Send />}
        </Button>
      </div>
    </div>
  )
}
