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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium text-xs rounded-full px-3 py-1",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium text-xs rounded-full px-3 py-1",
          error: "group-[.toaster]:!bg-destructive/10 group-[.toaster]:!text-destructive group-[.toaster]:!border-destructive/20",
          success: "group-[.toaster]:!bg-[var(--bias-right)]/10 group-[.toaster]:!text-[var(--bias-right)] group-[.toaster]:!border-[var(--bias-right)]/20",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
