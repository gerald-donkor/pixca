"use client";

import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "@/components/layout/theme-provider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-white dark:group-[.toaster]:!bg-[#18181B] group-[.toaster]:!text-zinc-900 dark:group-[.toaster]:!text-zinc-100 group-[.toaster]:border-zinc-200 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl font-sans text-sm p-4",
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400 text-xs",
          actionButton:
            "group-[.toast]:bg-zinc-900 dark:group-[.toast]:bg-zinc-100 group-[.toast]:text-white dark:group-[.toast]:text-zinc-900 font-medium text-xs rounded-full px-3 py-1",
          cancelButton:
            "group-[.toast]:bg-zinc-100 dark:group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-700 dark:group-[.toast]:text-zinc-300 font-medium text-xs rounded-full px-3 py-1",
          error:
            "group-[.toaster]:!border-red-500/40 group-[.toaster]:!text-zinc-900 dark:group-[.toaster]:!text-zinc-100",
          success:
            "group-[.toaster]:!bg-emerald-600 dark:group-[.toaster]:!bg-emerald-700 group-[.toaster]:!text-white group-[.toaster]:!border-2 group-[.toaster]:!border-blue-400 dark:group-[.toaster]:!border-blue-400 group-[.toaster]:!shadow-[0_8px_25px_rgba(59,130,246,0.3)] [&_[data-icon]]:!text-white [&_[data-description]]:!text-emerald-100",
          info:
            "group-[.toaster]:!border-blue-500/40 group-[.toaster]:!text-zinc-900 dark:group-[.toaster]:!text-zinc-100",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
