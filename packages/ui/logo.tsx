import Image from "next/image"

import { QuickLink } from "./link"

export const Logo = () => (
  <QuickLink
    className="flex items-center justify-center gap-2 font-bold text-lg text-mauve-12"
    href="/">
    <Image src={"/favicon.png"} alt="local.ai logo" width={40} height={40} />
    local.ai
  </QuickLink>
)
