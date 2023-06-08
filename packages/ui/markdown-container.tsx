import { cn } from "@localai/theme/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const MarkdownContainer = ({ children = "", className = "" }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className={cn(
      "prose-gray prose-base prose-hr:border-gray-7",
      "prose-table:rounded-lg prose-table:border-gray-7 prose-table:border prose-table:shadow-xl prose-table:shadow-gray-4 prose-table:overflow-hidden",
      "prose-ol:list-decimal",
      "prose-ul:list-disc",
      "prose-th:bg-gray-5",
      "prose-th:border prose-th:border-gray-7 prose-th:py-2 prose-th:px-4",
      "prose-td:border prose-td:border-gray-7 prose-td:py-2 prose-td:px-4",
      "prose-h1:font-extrabold prose-h1:text-6xl",
      "prose-h2:font-bold prose-h2:text-3xl prose-h2:border-b prose-h2:border-gray-7 prose-h2:pb-2 prose-h2:mb-4",
      "prose-h3:font-semibold prose-h3:pl-4 prose-h3:italic prose-h3:text-lg",
      "prose-code:break-all prose-pre:break-all prose-pre:whitespace-pre-wrap",
      "prose-pre:bg-gray-5",
      "prose-code:relative prose-code:bg-gray-5",
      className
    )}>
    {children}
  </ReactMarkdown>
)
