import { cn } from "@lab/theme/utils"

export const Spinner = ({ className = "" }) => (
  <svg className={cn("w-6 h-6", "flex items-center justify-center", className)}>
    <circle
      className="animate-spin origin-center will-change-transform"
      cx="50%"
      cy="50%"
      r="25%"
      strokeWidth={"10%"}
      strokeLinecap="round"
      strokeDasharray="15%"
      fill="none"
      stroke="currentColor"
    />
  </svg>
)
