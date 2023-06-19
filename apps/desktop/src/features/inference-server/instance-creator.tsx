import { cn } from "@localai/theme/utils"
import { SpinnerButton } from "@localai/ui/button"
import { useState } from "react"

export const InstanceCreator = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    // Add your logic here to handle adding a new instance
    // For example:
    await createNewInstance()
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <SpinnerButton
        isSpinning={isLoading}
        className={cn(
          "w-48 justify-center border",
          "bg-gray-5 text-gray-11 ring-gray-9 ring-2 hover: text-gray-12"
        )}
        onClick={handleClick}>
        {isLoading ? "..." : "Create New Instance"}
      </SpinnerButton>
    </div>
  )
}
function createNewInstance() {
  throw new Error("Function not implemented.")
}
