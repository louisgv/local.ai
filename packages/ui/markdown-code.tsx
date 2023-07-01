import { useMemo } from "react"
import type { CodeComponent } from "react-markdown/lib/ast-to-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  oneLight,
  vscDarkPlus
} from "react-syntax-highlighter/dist/cjs/styles/prism"

import { useMatchMedia } from "./hooks/use-match-media"
import { CornerLabel } from "./label"

export const MdxCode: CodeComponent = (props) => {
  const isDarkTheme = useMatchMedia("(prefers-color-scheme: dark)")

  const language = useMemo(
    () => /language-(\w+)/.exec(props.className || "")?.[1] || "",
    [props.className]
  )

  if (props.inline) {
    return (
      <code className="bg-gray-7 hover:bg-gray-8 rounded-md px-1.5">
        {props.children}
      </code>
    )
  }

  return (
    <div className="relative">
      <CornerLabel>{language}</CornerLabel>
      <SyntaxHighlighter
        showLineNumbers
        useInlineStyles
        language={language}
        wrapLines
        customStyle={{
          transition: "opacity 0.42s ease-in-out",
          opacity: isDarkTheme === undefined ? 0 : 1
        }}
        style={isDarkTheme ? vscDarkPlus : oneLight}>
        {props.children as any}
      </SyntaxHighlighter>
    </div>
  )
}
