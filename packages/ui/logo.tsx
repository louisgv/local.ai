import { LocalAI } from "./icons/localai"
import { QuickLink } from "./link"

export const Logo = () => (
  <QuickLink
    className="flex items-center justify-center gap-2 font-bold text-lg text-mauve-12"
    href="/">
    <LocalAI className="w-8 h-8 fill-mauve-12 text-mauve-3" />
    local.ai
  </QuickLink>
)
