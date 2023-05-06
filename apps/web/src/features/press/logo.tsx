import { Jalias } from "@localai/ui/icons/jalias"
import { QuickLink } from "@localai/ui/link"

export const Logo = () => (
  <QuickLink
    className="flex items-center gap-2 font-bold text-lg text-mauve-12"
    href="/">
    <Jalias className="w-8 h-8 fill-mauve-12 text-mauve-3" />
    LocalAI
  </QuickLink>
)
