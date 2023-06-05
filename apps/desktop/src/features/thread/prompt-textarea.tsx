import { cn } from "@localai/theme/utils"
import { Button, SpinnerButton } from "@localai/ui/button"
import { Textarea } from "@localai/ui/textarea"
import { Notes, Send } from "iconoir-react"
import { useCallback, useState } from "react"

export const PromptTextarea = ({
  className = "",
  onSubmit = (_: string) => {},
  onNote = (_: string) => {},
  disabled = false,
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
        "relative flex gap-2 w-full items-end justify-center",
        className
      )}>
      <Textarea
        rows={4}
        className="w-full bg-gray-3"
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
      <div className="flex flex-col h-full justify-between">
        <Button
          className="border border-gold-9 text-gold-9 disabled:border-gold-9 disabled:text-gold-9 disabled:cursor-not-allowed"
          disabled={disabled || !prompt}
          onClick={note}>
          <Notes />
        </Button>
        <SpinnerButton
          className="border border-blue-9 text-blue-9 disabled:border-gray-9 disabled:text-gray-9 disabled:cursor-not-allowed"
          Icon={Send}
          isSpinning={disabled}
          disabled={disabled || !prompt}
          onClick={submit}
        />
      </div>
    </div>
  )
}
