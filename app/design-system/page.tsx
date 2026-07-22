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
    <div className="min-h-screen bg-[#F6F6F6] text-[#0D0D0F] font-sans antialiased selection:bg-[var(--bias-right)]/10 selection:text-[var(--bias-right)]">
      {/* Main Grid Wrapper */}
      <main className="container mx-auto max-w-[1400px] px-6 py-10 space-y-8">
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* BRAND */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[220px]">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-6 self-start">
                Brand
              </div>
              <div className="flex flex-col items-center flex-grow justify-center mb-4">
                <span className="text-4xl font-extrabold tracking-tight select-none">
                  Pixca<span className="text-xs font-semibold px-2 py-0.5 ml-1 bg-[var(--text-primary)] text-white rounded-sm align-middle">News</span>
                </span>
                <p className="mt-3 text-[13px] text-[var(--text-secondary)] font-medium max-w-[200px]">
                  Balanced news coverage, powered by AI.
                </p>
              </div>
            </div>

            {/* COLORS */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-6">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Colors
              </div>
              
              <div className="space-y-4">
                {/* Primary */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-2">Primary</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="h-12 w-full rounded bg-[#0D0D0F] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-none">Text Primary</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">#0D0D0F</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-12 w-full rounded bg-[#6B7280] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-none">Text Sec.</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">#6B7280</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-12 w-full rounded bg-[#F6F6F6] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-none">Surface</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">#F6F6F6</span>
                    </div>
                  </div>
                </div>

                {/* Semantic */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-2">Semantic</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="h-12 w-full rounded bg-[#B42318] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-none">Left Bias</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">#B42318</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-12 w-full rounded bg-[#E5E7EB] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-none">Center</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">#E5E7EB</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-12 w-full rounded bg-[#1D4ED8] border border-[var(--border)]" />
                      <span className="text-[11px] font-bold block leading-none">Right Bias</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">#1D4ED8</span>
                    </div>
                  </div>
                </div>

                {/* Neutrals */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-2">Neutrals</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <div className="h-10 w-full rounded bg-[#FFFFFF] border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">BG Prim</span>
                      <span className="text-[8px] text-[var(--text-secondary)]">#FFFFFF</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-10 w-full rounded bg-[#F0F0F0] border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">BG Sec</span>
                      <span className="text-[8px] text-[var(--text-secondary)]">#F0F0F0</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-10 w-full rounded bg-[#E5E7EB] border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">Border</span>
                      <span className="text-[8px] text-[var(--text-secondary)]">#E5E7EB</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-10 w-full rounded bg-[#E5E7EB] border border-[var(--border)]" />
                      <span className="text-[9px] font-bold block truncate leading-none">Divider</span>
                      <span className="text-[8px] text-[var(--text-secondary)]">#E5E7EB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SPACING SYSTEM */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Spacing System <span className="text-[10px] lowercase font-normal">(4px base unit)</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-end gap-2.5 h-20 pt-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-[var(--bias-right)]/20 rounded-sm h-[4px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">4px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-[var(--bias-right)]/20 rounded-sm h-[8px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">8px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-[var(--bias-right)]/30 rounded-sm h-[16px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">16px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-[var(--bias-right)]/40 rounded-sm h-[24px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">24px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-[var(--bias-right)]/60 rounded-sm h-[32px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">32px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-[var(--bias-right)]/80 rounded-sm h-[40px]" />
                    <span className="text-[9px] font-semibold text-[var(--text-secondary)]">40px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
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
          <div className="space-y-6">
            
            {/* TYPOGRAPHY */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-6">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Typography
              </div>
              <div className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Font Family</span>
                  <p className="text-4xl font-extrabold tracking-tight mt-1">Poppins</p>
                  <p className="text-caption text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Poppins is a modern geometric sans-serif typeface that ensures clarity and excellent readability.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H1</span>
                    <span className="text-h1 font-bold text-[var(--text-primary)] flex-1">Page / Screen Title</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">32px</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H2</span>
                    <span className="text-h2 font-semibold text-[var(--text-primary)] flex-1">Section Title</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">24px</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H3</span>
                    <span className="text-h3 font-semibold text-[var(--text-primary)] flex-1">Card / Module Title</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">20px</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">H4</span>
                    <span className="text-h4 font-medium text-[var(--text-primary)] flex-1">Subheading</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">16px</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Body Lg</span>
                    <span className="text-body-lg text-[var(--text-primary)] flex-1">Important content</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">16px</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Body Md</span>
                    <span className="text-body-md text-[var(--text-primary)] flex-1">Body text</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">14px</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-[#F6F6F6] pb-2">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Body Sm</span>
                    <span className="text-body-sm text-[var(--text-primary)] flex-1">Supporting text</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">13px</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-caption font-bold w-16 shrink-0 text-[var(--text-secondary)]">Caption</span>
                    <span className="text-caption text-[var(--text-primary)] flex-1">Labels, meta text</span>
                    <span className="text-caption font-medium text-right w-12 text-[var(--text-secondary)]">11px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ICONS */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Icons
              </div>
              <div className="grid grid-cols-5 gap-4 p-2 bg-[#F6F6F6] rounded-lg border border-[var(--border)] justify-items-center">
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
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Grid System
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-1.5 h-10">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-[var(--bias-right)]/10 rounded-sm border border-[var(--bias-right)]/20" />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Container</span>
                    <span>1280px</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Columns</span>
                    <span>12</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Gutter / Margin</span>
                    <span>24px</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* UI ELEMENTS */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-6">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                UI Elements
              </div>
              
              {/* Buttons Showcase */}
              <div className="space-y-3">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block">Buttons</span>
                <div className="space-y-3.5">
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
                    <Button size="xs" variant="secondary" className="bg-[#F0F0F0]">Button</Button>
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
                <BiasMeter leftValue={25} centerValue={50} rightValue={25} />
              </div>
            </div>

            {/* CARD EXAMPLE */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Card Example
              </div>
              <NewsCard
                title="Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report"
                subtitle="The proposal includes stricter limits on uranium enrichment and enhanced verification measures."
                category="Politics"
                location="United States"
                timeAgo="2h ago"
                readTime="12 min read"
                imageUrl="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500&auto=format&fit=crop&q=60"
                bias={{ left: 25, center: 50, right: 49 }}
                className="shadow-sm border-[var(--border)] bg-white max-w-full"
              />
            </div>

            {/* SHADOWS & BORDERS */}
            <div className="grid grid-cols-2 gap-4">
              {/* Shadows */}
              <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                  Shadows
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-white shadow-sm border border-[var(--border)]" />
                    <div>
                      <span className="block">Small</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">rgba(0,0,0,0.05)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-white shadow-md border border-[var(--border)]" />
                    <div>
                      <span className="block">Medium</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">rgba(0,0,0,0.08)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-white shadow-lg border border-[var(--border)]" />
                    <div>
                      <span className="block">Large</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">rgba(0,0,0,0.12)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                <div className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                  Border Radius
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-sm bg-white border border-[var(--border)]" />
                    <div>
                      <span className="block">Small</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">4px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-white border border-[var(--border)]" />
                    <div>
                      <span className="block">Medium</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">8px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-[var(--border)]" />
                    <div>
                      <span className="block">Large</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">12px</span>
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
        <div className="container mx-auto max-w-[1400px] px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-tight">
              Pixca<span className="text-[10px] font-semibold px-1.5 py-0.5 ml-1 bg-white text-[#0D0D0F] rounded-sm align-middle">News</span>
            </span>
            <span className="text-xs text-[#6B7280]">|</span>
            <span className="text-xs text-[#6B7280]">Balanced news coverage, powered by AI.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#6B7280] font-medium">
            <span>Design System v1.0</span>
            <span>June 1, 2026</span>
            <span className="text-white font-semibold">Stay consistent. Stay unbiased.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
