import { QuickLink } from "@localai/ui/link"
import { AppleMac, Linux, MacOsWindow, Windows } from "iconoir-react"

export const MacDownloadButton = () => (
  <QuickLink external>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-2">
      <AppleMac />
      MacOS Installer
    </button>
  </QuickLink>
)

export const WindowsDownloadButton = () => (
  <QuickLink external>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-2">
      <Windows />
      Windows Installer
    </button>
  </QuickLink>
)

export const UbuntuDownloadButton = () => (
  <QuickLink external>
    <button className="bg-mauve-12 hover:bg-blue-9 transition-all text-mauve-1 hover:text-white py-3 px-6 rounded-full flex gap-2">
      <Linux />
      Ubuntu Installer
    </button>
  </QuickLink>
)

export const MiniDownloadButtonGroup = () => (
  <div className="rounded-full overflow-hidden">
    <QuickLink external>
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
    </QuickLink>
  </div>
)
