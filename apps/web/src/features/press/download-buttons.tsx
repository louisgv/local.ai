import { cn } from "@localai/theme/utils"
import { Button } from "@localai/ui/button"
import { QuickLink } from "@localai/ui/link"
import { DownloadIcon, GitHubLogoIcon } from "@radix-ui/react-icons"
import { AppleMac, Linux, Windows } from "iconoir-react"

import { baseUrl } from "~pages/api/_constants"
import { useGlobal } from "~providers/global"

const buttonClass = "rounded-full transition-all font-bold w-36 hover:shadow-lg"
const buttonTextClass = "text-whiteA-11 hover:text-whiteA-12"

export const WindowsMsiDownloadButton = () => {
  const { version } = useGlobal()
  return (
    <QuickLink external href={`${baseUrl}/Local.AI_${version}_x64_en-US.msi`}>
      <Button
        className={cn(
          buttonClass,
          "bg-blue-9 hover:bg-blue-10",
          buttonTextClass
        )}>
        <Windows />
        .MSI
      </Button>
    </QuickLink>
  )
}

export const WindowsExeDownloadButton = () => {
  const { version } = useGlobal()
  return (
    <QuickLink external href={`${baseUrl}/Local.AI_${version}_x64-setup.exe`}>
      <Button
        className={cn(
          buttonClass,
          "bg-indigo-9 hover:bg-indigo-10",
          buttonTextClass
        )}>
        <Windows />
        .EXE
      </Button>
    </QuickLink>
  )
}

export const MacArm64DownloadButton = () => {
  const { version } = useGlobal()

  return (
    <QuickLink external href={`${baseUrl}/Local.AI_${version}_aarch64.dmg`}>
      <Button
        className={cn(
          buttonClass,
          "bg-violet-9 hover:bg-violet-10",
          buttonTextClass
        )}>
        <AppleMac />
        M1/M2
      </Button>
    </QuickLink>
  )
}

export const MacIntelDownloadButton = () => {
  const { version } = useGlobal()

  return (
    <QuickLink external href={`${baseUrl}/Local.AI_${version}_x64.dmg`}>
      <Button
        className={cn(
          buttonClass,
          "bg-purple-9 hover:bg-purple-10",
          buttonTextClass
        )}>
        <AppleMac />
        Intel
      </Button>
    </QuickLink>
  )
}

export const AppImageDownloadButton = () => {
  const { version } = useGlobal()

  return (
    <QuickLink external href={`${baseUrl}/local-ai_${version}_amd64.AppImage`}>
      <Button
        className={cn(
          buttonClass,
          "bg-plum-9 hover:bg-plum-10",
          buttonTextClass
        )}>
        <Linux />
        AppImage
      </Button>
    </QuickLink>
  )
}

export const DebImageDownloadButton = () => {
  const { version } = useGlobal()

  return (
    <QuickLink external href={`${baseUrl}/local-ai_${version}_amd64.deb`}>
      <Button
        className={cn(
          buttonClass,
          "bg-pink-9 hover:bg-pink-10",
          buttonTextClass
        )}>
        <Linux />
        .deb
      </Button>
    </QuickLink>
  )
}

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
    <div className="flex flex-row lg:flex-col gap-6 w-full lg:w-40 justify-center">
      <WindowsMsiDownloadButton />
      <WindowsExeDownloadButton />
    </div>
    <div className="flex flex-row lg:flex-col gap-6 w-full lg:w-40 justify-center">
      <MacArm64DownloadButton />
      <MacIntelDownloadButton />
    </div>
    <div className="flex flex-row lg:flex-col gap-6 w-full lg:w-40 justify-center">
      <AppImageDownloadButton />
      <DebImageDownloadButton />
    </div>
  </>
)

export const MiniDownloadButtonGroup = () => (
  <div className="rounded-full overflow-hidden">
    <QuickLink external href={"https://github.com/louisgv/local.ai"}>
      <Button className="w-10 h-10 p-2 justify-center hover:shadow-inner bg-mauve-1/60 hover:bg-mauve-4">
        <GitHubLogoIcon className="w-8 h-8" />
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
