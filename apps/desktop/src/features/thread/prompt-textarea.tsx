import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { Textarea } from "@localai/ui/textarea"
import { Send } from "iconoir-react"
import { useCallback, useState } from "react"

export const PromptTextarea = ({
  className = "",
  onSubmit = (_: string) => {},
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

  return (
    <div
      className={cn(
        "relative flex gap-2 w-full items-end justify-center",
        className
      )}>
      <Textarea
        rows={4}
        disabled={disabled}
        className="w-full bg-gray-3"
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      <SpinnerButton
        className="border border-blue-9 text-blue-9 disabled:border-gray-9 disabled:text-gray-9 disabled:cursor-not-allowed"
        Icon={Send}
        isSpinning={disabled}
        disabled={disabled || !prompt}
        onClick={submit}
      />
    </div>
  )
}
