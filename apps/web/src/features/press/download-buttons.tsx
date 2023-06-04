import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { QuickLink } from "@localai/ui/link"
import { DownloadIcon, GitHubLogoIcon } from "@radix-ui/react-icons"
import { AppleMac, Linux, Windows } from "iconoir-react"

const buttonClass = "rounded-full transition-all font-bold w-40 gap-6"

export const WindowsDownloadButton = () => (
  <QuickLink external>
    <Button
      className={cn(
        buttonClass,
        "bg-blue-12 hover:bg-blue-9 text-blue-1 hover:text-blue-12 "
      )}>
      <Windows />
      Windows
    </Button>
  </QuickLink>
)

export const MacArm64DownloadButton = () => (
  <QuickLink external>
    <Button
      className={cn(
        buttonClass,
        "bg-violet-12 hover:bg-violet-9 text-violet-1 hover:text-violet-12 "
      )}>
      <AppleMac />
      Mac M1/M2
    </Button>
  </QuickLink>
)

export const MacIntelDownloadButton = () => (
  <QuickLink external>
    <Button
      className={cn(
        buttonClass,
        "bg-indigo-12 hover:bg-indigo-9 text-indigo-1 hover:text-indigo-12 "
      )}>
      <AppleMac />
      Mac Intel
    </Button>
  </QuickLink>
)

export const UbuntuDownloadButton = () => (
  <QuickLink external>
    <Button
      className={cn(
        buttonClass,
        "bg-purple-12 hover:bg-purple-9 text-purple-1 hover:text-purple-12 "
      )}>
      <Linux />
      Linux
    </Button>
  </QuickLink>
)

export const ReleaseDownloadButton = () => (
  <QuickLink
    external
    href={"https://github.com/louisgv/local.ai/releases/latest"}>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-3">
      <DownloadIcon className="w-6 h-6" />
      Download on GitHub
    </button>
  </QuickLink>
)

export const MiniDownloadButtonGroup = () => (
  <div className="rounded-full overflow-hidden">
    <QuickLink external href={"https://github.com/louisgv/local.ai"}>
      <Button>
        <GitHubLogoIcon />
      </Button>
    </QuickLink>
    {/* <QuickLink external>
      <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-2 px-3">
        <AppleMac />
      </button>
    </QuickLink>
    <QuickLink external>
      <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-2 px-3">
        <Windows />
      </button>
    </QuickLink>
    <QuickLink external>
      <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-2 px-3">
        <Linux />
      </button>
    </QuickLink> */}
  </div>
)
