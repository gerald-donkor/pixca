import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span>{label}</span>
        <Plus className="h-3.5 w-3.5" />
      </button>
    )
  }
)
Chip.displayName = "Chip"
