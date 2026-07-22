import * as React from "react"
import { cn } from "@/lib/utils"

export interface BiasMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  leftValue?: number
  centerValue?: number
  rightValue?: number
  showLabels?: boolean
}

export const BiasMeter = React.forwardRef<HTMLDivElement, BiasMeterProps>(
  ({ className, leftValue = 25, centerValue = 50, rightValue = 25, showLabels = true, ...props }, ref) => {
    const total = leftValue + centerValue + rightValue
    const leftPct = total > 0 ? (leftValue / total) * 100 : 0
    const centerPct = total > 0 ? (centerValue / total) * 100 : 0
    const rightPct = total > 0 ? (rightValue / total) * 100 : 0

    const leftWidth = `${leftPct}%`
    const centerWidth = `${centerPct}%`
    const rightWidth = `${rightPct}%`

    const getLabel = (name: string, value: number, pct: number) => {
      if (pct >= 24) {
        return `${name} ${value}%`
      } else if (pct >= 14) {
        return `${name.charAt(0)} ${value}%`
      } else if (pct >= 8) {
        return `${value}%`
      } else {
        return ""
      }
    }

    const leftLabel = getLabel("Left", leftValue, leftPct)
    const centerLabel = getLabel("Center", centerValue, centerPct)
    const rightLabel = getLabel("Right", rightValue, rightPct)

    return (
      <div ref={ref} className={cn("w-full flex flex-col gap-1.5", className)} {...props}>
        <div className="relative flex h-8 w-full overflow-hidden rounded-md text-xs font-semibold select-none">
          {/* Left Segment */}
          <div
            className="relative z-10 flex items-center justify-start bg-bias-left text-white transition-all duration-500 ease-in-out pl-3 pr-1.5 min-w-[30px]"
            style={{ width: leftWidth }}
          >
            <span className="whitespace-nowrap text-[10px] tracking-tighter sm:text-[11px] sm:tracking-tight font-bold">{leftLabel}</span>
          </div>

          {/* Center Segment */}
          <div
            className="relative z-0 flex items-center justify-center bg-bias-center text-text-primary transition-all duration-500 ease-in-out px-2 min-w-[30px]"
            style={{ width: centerWidth }}
          >
            <span className="whitespace-nowrap text-[10px] tracking-tighter sm:text-[11px] sm:tracking-tight font-bold">{centerLabel}</span>
          </div>

          {/* Right Segment */}
          <div
            className="relative z-10 flex items-center justify-end bg-bias-right text-white transition-all duration-500 ease-in-out pl-1.5 pr-3 min-w-[30px]"
            style={{ width: rightWidth }}
          >
            <span className="whitespace-nowrap text-[10px] tracking-tighter sm:text-[11px] sm:tracking-tight font-bold">{rightLabel}</span>
          </div>
        </div>

        {showLabels && (
          <div className="flex justify-between px-1 text-[10px] font-medium text-text-secondary">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        )}
      </div>
    )
  }
)
BiasMeter.displayName = "BiasMeter"
