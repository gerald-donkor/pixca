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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pixca-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F6F6F6] dark:bg-[#0D0D0F] text-[#0D0D0F] dark:text-[#F6F6F6] flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
        <div className="max-w-md w-full min-w-0 bg-white dark:bg-[#18181B] rounded-2xl border border-[#E5E7EB] dark:border-[#27272A] shadow-lg p-6 sm:p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 shadow-xs">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2 min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-[#0D0D0F] dark:text-white">
              Critical Application Error
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-zinc-400 font-medium leading-relaxed">
              PIXCA encountered a critical system error while preparing the global workspace.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 pt-1 break-all max-w-full">
                Ref: {error.digest}
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-full bg-[#0D0D0F] dark:bg-white text-white dark:text-[#0D0D0F] text-xs font-bold hover:bg-black/90 dark:hover:bg-zinc-100 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
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
