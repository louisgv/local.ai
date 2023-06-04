import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { QuickLink } from "@localai/ui/link"
import { DownloadIcon, GitHubLogoIcon } from "@radix-ui/react-icons"
import { AppleMac, Linux, Windows } from "iconoir-react"

const buttonClass = "rounded-full transition-all font-bold w-36"

const version = `0.0.4`

const baseUrl = `https://github.com/louisgv/local.ai/releases/download/v${version}`

export const WindowsMsiDownloadButton = () => (
  <QuickLink external href={`${baseUrl}/Local.AI_${version}_x64_en-US.msi`}>
    <Button
      className={cn(
        buttonClass,
        "bg-blue-12 hover:bg-blue-9 text-blue-1 hover:text-blue-12 "
      )}>
      <Windows />
      .MSI
    </Button>
  </QuickLink>
)

export const WindowsExeDownloadButton = () => (
  <QuickLink external href={`${baseUrl}/Local.AI_${version}_x64-setup.exe`}>
    <Button
      className={cn(
        buttonClass,
        "bg-indigo-12 hover:bg-indigo-9 text-indigo-1 hover:text-indigo-12 "
      )}>
      <Windows />
      .EXE
    </Button>
  </QuickLink>
)

export const MacArm64DownloadButton = () => (
  <QuickLink external href={`${baseUrl}/Local.AI_${version}_aarch64.dmg`}>
    <Button
      className={cn(
        buttonClass,
        "bg-violet-12 hover:bg-violet-9 text-violet-1 hover:text-violet-12 "
      )}>
      <AppleMac />
      M1/M2
    </Button>
  </QuickLink>
)

export const MacIntelDownloadButton = () => (
  <QuickLink external href={`${baseUrl}/Local.AI_${version}_x64.dmg`}>
    <Button
      className={cn(
        buttonClass,
        "bg-purple-12 hover:bg-purple-9 text-purple-1 hover:text-purple-12"
      )}>
      <AppleMac />
      Intel
    </Button>
  </QuickLink>
)

export const AppImageDownloadButton = () => (
  <QuickLink external href={`${baseUrl}/local-ai_${version}_amd64.AppImage`}>
    <Button
      className={cn(
        buttonClass,
        "bg-plum-12 hover:bg-plum-9 text-plum-1 hover:text-plum-12"
      )}>
      <Linux />
      AppImage
    </Button>
  </QuickLink>
)

export const DebImageDownloadButton = () => (
  <QuickLink external href={`${baseUrl}/local-ai_${version}_amd64.deb`}>
    <Button
      className={cn(
        buttonClass,
        "bg-pink-12 hover:bg-pink-9 text-pink-1 hover:text-pink-12"
      )}>
      <Linux />
      .deb
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

export const DownloadButtonGroup = () => (
  <>
    <div className="flex flex-row md:flex-col gap-6 w-full md:w-40 justify-center">
      <WindowsMsiDownloadButton />
      <WindowsExeDownloadButton />
    </div>
    <div className="flex flex-row md:flex-col gap-6 w-full md:w-40 justify-center">
      <MacArm64DownloadButton />
      <MacIntelDownloadButton />
    </div>
    <div className="flex flex-row md:flex-col gap-6 w-full md:w-40 justify-center">
      <AppImageDownloadButton />
      <DebImageDownloadButton />
    </div>
  </>
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
