import { cn } from "@localai/theme/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const MarkdownContainer = ({ children = "" }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className={cn(
      "prose-slate prose-base prose-hr:border-mauve-7",
      "prose-table:rounded-lg prose-table:border-mauve-7 prose-table:border prose-table:shadow-xl prose-table:shadow-mauve-4 prose-table:overflow-hidden",
      "prose-th:bg-mauve-5",
      "prose-th:border prose-th:border-mauve-7 prose-th:py-2 prose-th:px-4",
      "prose-td:border prose-td:border-mauve-7 prose-td:py-2 prose-td:px-4"
    )}>
    {children}
  </ReactMarkdown>
)
