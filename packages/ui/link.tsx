import cn from "clsx"
import NextLink from "next/link"
import type { ReactNode } from "react"

export const QuickLink = ({
  href = "/",
  as = null as URL | string,
  disabled = false,
  children = null as ReactNode,
  external = false,
  title = "",
  className = "",
  onClick = () => {}
}) => (
  <NextLink
    href={href}
    as={as}
    title={title}
    rel={external ? "noopener noreferrer" : ""}
    target={external ? "_blank" : "_self"}
    onClick={onClick}
    className={cn(
      disabled ? "pointer-events-none" : "pointer-events-auto",
      disabled ? "opacity-50" : "opacity-100",
      className
    )}>
    {children}
  </NextLink>
)
