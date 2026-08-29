import * as React from "react"
import {
  Menu,
  Search,
  Bookmark,
  Clock,
  Info,
  Share,
  ExternalLink,
  Calendar,
  BarChart2,
  Tag,
  User,
  Bell,
  Sliders,
  Check,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { BiasMeter } from "@/components/ui/bias-meter"
import { NewsCard } from "@/components/ui/news-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PIXCA — Balanced news coverage, powered by AI",
  description: "Design system for Pixca News",
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--bias-right)]/10 selection:text-[var(--bias-right)] overflow-x-clip">
      {/* Main Grid Wrapper */}
      <main className="container mx-auto max-w-[1400px] px-4 sm:px-6 py-8 sm:py-10 space-y-8 min-w-0">
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6 min-w-0">
            
            {/* BRAND */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center text-center min-h-[220px]">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-6 self-start">
                Brand
              </div>
              <div className="flex flex-col items-center flex-grow justify-center mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight select-none inline-flex flex-wrap items-center justify-center gap-1">
                  Pixca<span className="text-xs font-semibold px-2 py-0.5 ml-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-sm align-middle">News</span>
                </span>
                <p className="mt-3 text-[13px] text-[var(--text-secondary)] font-medium max-w-[200px]">
                  Balanced news coverage, powered by AI.
                </p>
              </div>
            </div>

            {/* COLORS */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-6 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Colors
              </div>
              
              <div className="space-y-4">
                {/* Primary */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-2">Primary</span>
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 sm:h-12 w-full rounded bg-[#0D0D0F] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-tight truncate sm:whitespace-normal">Text Primary</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">#0D0D0F</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 sm:h-12 w-full rounded bg-[#6B7280] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-tight truncate sm:whitespace-normal">Text Sec.</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">#6B7280</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 sm:h-12 w-full rounded bg-zinc-100 dark:bg-zinc-800 border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-tight truncate sm:whitespace-normal">Surface</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate break-all">var(--surface)</span>
                    </div>
                  </div>
                </div>

                {/* Semantic */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-2">Semantic</span>
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 sm:h-12 w-full rounded bg-[#B42318] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-tight truncate sm:whitespace-normal">Left Bias</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">#B42318</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 sm:h-12 w-full rounded bg-[#E5E7EB] dark:bg-zinc-700 border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-tight truncate sm:whitespace-normal">Center</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">#E5E7EB</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 sm:h-12 w-full rounded bg-[#1D4ED8] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-tight truncate sm:whitespace-normal">Right Bias</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">#1D4ED8</span>
                    </div>
                  </div>
                </div>

                {/* Neutrals */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-2">Neutrals</span>
                  <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 w-full rounded bg-white dark:bg-zinc-900 border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">BG Prim</span>
                      <span className="text-[8px] text-[var(--text-secondary)] block truncate">Primary</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 w-full rounded bg-zinc-100 dark:bg-zinc-800 border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">BG Sec</span>
                      <span className="text-[8px] text-[var(--text-secondary)] block truncate">Secondary</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 w-full rounded bg-zinc-200 dark:bg-zinc-800 border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">Border</span>
                      <span className="text-[8px] text-[var(--text-secondary)] block truncate">Border</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="h-10 w-full rounded bg-zinc-200 dark:bg-zinc-800 border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">Divider</span>
                      <span className="text-[8px] text-[var(--text-secondary)] block truncate">Divider</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SPACING SYSTEM */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Spacing System <span className="text-[10px] lowercase font-normal">(4px base unit)</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-end justify-between sm:justify-start gap-1.5 sm:gap-2.5 h-20 pt-4 max-w-full overflow-x-auto pb-1">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-5 bg-[var(--bias-right)]/20 rounded-sm h-[4px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">4px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-5 bg-[var(--bias-right)]/20 rounded-sm h-[8px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">8px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-5 bg-[var(--bias-right)]/30 rounded-sm h-[16px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">16px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-5 bg-[var(--bias-right)]/40 rounded-sm h-[24px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">24px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-5 bg-[var(--bias-right)]/60 rounded-sm h-[32px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">32px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-5 bg-[var(--bias-right)]/80 rounded-sm h-[40px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">40px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-6 bg-[var(--bias-right)] rounded-sm h-[64px]" />
                    <span className="text-[9px] font-bold">64px</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Consistent spacing scale based on 4px base unit.
                </p>
              </div>
            </div>

          </div>

          {/* MIDDLE COLUMN */}
          <div className="space-y-6 min-w-0">
            
            {/* TYPOGRAPHY */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-6 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Typography
              </div>
              <div className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Font Family</span>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Poppins</p>
                  <p className="text-caption text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Poppins is a modern geometric sans-serif typeface that ensures clarity and excellent readability.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* H1 */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">H1</span>
                      <span className="font-medium">32px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H1</span>
                    <span className="text-h1 font-bold text-[var(--text-primary)] flex-1 min-w-0 break-words">Page / Screen Title</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">32px</span>
                  </div>

                  {/* H2 */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">H2</span>
                      <span className="font-medium">24px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H2</span>
                    <span className="text-h2 font-semibold text-[var(--text-primary)] flex-1 min-w-0 break-words">Section Title</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">24px</span>
                  </div>

                  {/* H3 */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">H3</span>
                      <span className="font-medium">20px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H3</span>
                    <span className="text-h3 font-semibold text-[var(--text-primary)] flex-1 min-w-0 break-words">Card / Module Title</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">20px</span>
                  </div>

                  {/* H4 */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">H4</span>
                      <span className="font-medium">16px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H4</span>
                    <span className="text-h4 font-medium text-[var(--text-primary)] flex-1 min-w-0 break-words">Subheading</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">16px</span>
                  </div>

                  {/* Body Lg */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">Body Lg</span>
                      <span className="font-medium">16px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Body Lg</span>
                    <span className="text-body-lg text-[var(--text-primary)] flex-1 min-w-0 break-words">Important content</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">16px</span>
                  </div>

                  {/* Body Md */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">Body Md</span>
                      <span className="font-medium">14px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Body Md</span>
                    <span className="text-body-md text-[var(--text-primary)] flex-1 min-w-0 break-words">Body text</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">14px</span>
                  </div>

                  {/* Body Sm */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 sm:pb-2">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">Body Sm</span>
                      <span className="font-medium">13px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Body Sm</span>
                    <span className="text-body-sm text-[var(--text-primary)] flex-1 min-w-0 break-words">Supporting text</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">13px</span>
                  </div>

                  {/* Caption */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <div className="flex items-center justify-between sm:hidden text-caption text-[var(--text-secondary)]">
                      <span className="font-bold">Caption</span>
                      <span className="font-medium">11px</span>
                    </div>
                    <span className="hidden sm:inline-block text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Caption</span>
                    <span className="text-caption text-[var(--text-primary)] flex-1 min-w-0 break-words">Labels, meta text</span>
                    <span className="hidden sm:inline-block text-caption font-medium text-right w-12 text-[var(--text-secondary)]">11px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ICONS */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Icons
              </div>
              <div className="grid grid-cols-5 gap-2 sm:gap-4 p-2.5 sm:p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-[var(--border)] justify-items-center">
                <Menu className="h-5 w-5 stroke-[2]" />
                <Search className="h-5 w-5 stroke-[2]" />
                <Bookmark className="h-5 w-5 stroke-[2]" />
                <Clock className="h-5 w-5 stroke-[2]" />
                <Info className="h-5 w-5 stroke-[2]" />
                <Share className="h-5 w-5 stroke-[2]" />
                <ExternalLink className="h-5 w-5 stroke-[2]" />
                <Calendar className="h-5 w-5 stroke-[2]" />
                <BarChart2 className="h-5 w-5 stroke-[2]" />
                <Tag className="h-5 w-5 stroke-[2]" />
                <User className="h-5 w-5 stroke-[2]" />
                <Bell className="h-5 w-5 stroke-[2]" />
                <Sliders className="h-5 w-5 stroke-[2]" />
                <Check className="h-5 w-5 stroke-[2]" />
                <MoreHorizontal className="h-5 w-5 stroke-[2]" />
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] text-center font-medium">
                Line style • 2px stroke • Rounded caps
              </div>
            </div>

            {/* GRID SYSTEM */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Grid System
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-1 sm:gap-1.5 h-10 w-full">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-[var(--bias-right)]/10 rounded-sm border border-[var(--bias-right)]/20" />
                  ))}
                </div>
                <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2.5 sm:gap-4 text-xs font-semibold">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Container</span>
                    <span className="truncate block">1280px</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Columns</span>
                    <span className="truncate block">12</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[var(--text-secondary)] block">Gutter / Margin</span>
                    <span className="truncate block">24px</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 min-w-0">
            
            {/* UI ELEMENTS */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-6 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                UI Elements
              </div>
              
              {/* Buttons Showcase */}
              <div className="space-y-3">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block">Buttons</span>

                {/* Mobile View (< sm): reflowed variant groups */}
                <div className="space-y-4 sm:hidden">
                  {/* Primary */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--text-secondary)] block">Primary</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Default</span>
                        <Button size="xs" className="w-full">Button</Button>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Hover</span>
                        <Button size="xs" className="w-full opacity-80">Button</Button>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Outline</span>
                        <Button size="xs" variant="outline" className="w-full">Button</Button>
                      </div>
                    </div>
                  </div>

                  {/* Secondary */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--text-secondary)] block">Secondary</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Default</span>
                        <Button size="xs" variant="secondary" className="w-full">Button</Button>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Hover</span>
                        <Button size="xs" variant="secondary" className="w-full bg-zinc-100 dark:bg-zinc-800">Button</Button>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Outline</span>
                        <Button size="xs" variant="outline" className="w-full">Button</Button>
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--text-secondary)] block">Text</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Default</span>
                        <Button size="xs" variant="ghost" className="w-full hover:bg-transparent">Button</Button>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Hover</span>
                        <Button size="xs" variant="ghost" className="w-full hover:bg-transparent text-[var(--bias-right)]">Button</Button>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-[var(--text-secondary)] block">Outline</span>
                        <div className="h-6 flex items-center justify-center text-[var(--text-secondary)]">—</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop View (sm+): 4-column matrix */}
                <div className="hidden sm:block space-y-3.5">
                  <div className="grid grid-cols-4 gap-2 items-center text-[10px] font-bold text-center text-[var(--text-secondary)]">
                    <div></div>
                    <div>Default</div>
                    <div>Hover</div>
                    <div>Outline</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Primary</span>
                    <Button size="xs">Button</Button>
                    <Button size="xs" className="opacity-80">Button</Button>
                    <Button size="xs" variant="outline">Button</Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Secondary</span>
                    <Button size="xs" variant="secondary">Button</Button>
                    <Button size="xs" variant="secondary" className="bg-zinc-100 dark:bg-zinc-800">Button</Button>
                    <Button size="xs" variant="outline">Button</Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Text</span>
                    <Button size="xs" variant="ghost" className="hover:bg-transparent">Button</Button>
                    <Button size="xs" variant="ghost" className="hover:bg-transparent text-[var(--bias-right)]">Button</Button>
                    <span className="text-center text-[var(--text-secondary)]">—</span>
                  </div>
                </div>
              </div>

              {/* Chips Showcase */}
              <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block">Chip / Category</span>
                <div className="flex flex-wrap gap-2">
                  <Chip label="World Cup" />
                  <Chip label="IPL" />
                  <Chip label="Business & Markets" />
                  <Chip label="More" />
                </div>
              </div>

              {/* Bias Meter Showcase */}
              <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block">Bias Meter</span>
                <div className="w-full min-w-0">
                  <BiasMeter leftValue={25} centerValue={50} rightValue={25} />
                </div>
              </div>
            </div>

            {/* CARD EXAMPLE */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Card Example
              </div>
              <div className="w-full min-w-0 overflow-hidden">
                <NewsCard
                  title="Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report"
                  subtitle="The proposal includes stricter limits on uranium enrichment and enhanced verification measures."
                  category="Politics"
                  location="United States"
                  timeAgo="2h ago"
                  readTime="12 min read"
                  imageUrl="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500&auto=format&fit=crop&q=60"
                  bias={{ left: 25, center: 50, right: 49 }}
                  className="shadow-xs border-[var(--border)] bg-card w-full max-w-full"
                />
              </div>
            </div>

            {/* SHADOWS & BORDERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shadows */}
              <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
                <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                  Shadows
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-card shadow-xs border border-[var(--border)] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">Small</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">rgba(0,0,0,0.05)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-card shadow-md border border-[var(--border)] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">Medium</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">rgba(0,0,0,0.08)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-card shadow-lg border border-[var(--border)] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">Large</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">rgba(0,0,0,0.12)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
                <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                  Border Radius
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-sm bg-card border border-[var(--border)] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">Small</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">4px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-card border border-[var(--border)] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">Medium</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">8px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-card border border-[var(--border)] shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">Large</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block truncate">12px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0D0D0F] text-white py-6 mt-16 border-t border-white/10 select-none">
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <span className="text-xl font-extrabold tracking-tight">
              Pixca<span className="text-[10px] font-semibold px-1.5 py-0.5 ml-1 bg-white text-[#0D0D0F] rounded-sm align-middle">News</span>
            </span>
            <span className="hidden sm:inline text-xs text-[#6B7280]">|</span>
            <span className="text-xs text-[#6B7280] block sm:inline">Balanced news coverage, powered by AI.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 sm:gap-x-6 gap-y-1 text-xs text-[#6B7280] font-medium">
            <span>Design System v1.0</span>
            <span>•</span>
            <span>June 1, 2026</span>
            <span className="hidden sm:inline">•</span>
            <span className="w-full sm:w-auto text-white font-semibold">Stay consistent. Stay unbiased.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
