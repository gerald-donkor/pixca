"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[Global Root Error Caught]:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F6F6F6] text-[#0D0D0F] flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight text-[#0D0D0F]">
              Critical Application Error
            </h1>
            <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
              PIXCA encountered a critical system error while preparing the global workspace.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-zinc-400 pt-1">
                Ref: {error.digest}
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0D0D0F] text-white text-xs font-bold hover:bg-black/90 transition-opacity cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
