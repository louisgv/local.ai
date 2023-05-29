import { Button } from "@localai/ui/button"
import { QuickLink } from "@localai/ui/link"
import { DownloadIcon, GitHubLogoIcon } from "@radix-ui/react-icons"

export const MacDownloadButton = () => (
  <QuickLink external>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-2">
      MacOS Installer
    </button>
  </QuickLink>
)

export const WindowsDownloadButton = () => (
  <QuickLink external>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-2">
      Windows Installer
    </button>
  </QuickLink>
)

export const UbuntuDownloadButton = () => (
  <QuickLink external>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-2">
      Ubuntu Installer
    </button>
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
