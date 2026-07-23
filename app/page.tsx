import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { NewsCard } from "@/components/ui/news-card"
import Link from "next/link"

// 12 Mock Articles from 02-homepage.png
const ARTICLES = [
  {
    id: 1,
    title: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
    category: "Politics",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 12,
    bias: { left: 20, center: 31, right: 49 },
  },
  {
    id: 2,
    title: "Researchers Make Case for Grapes as a 'Superfood' After Review of Health Evidence",
    category: "Health",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1537084642907-629340c7e59c?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 7,
    bias: { left: 18, center: 42, right: 40 },
  },
  {
    id: 3,
    title: "CERN Finds High-Significance Hint of Physics Beyond Standard Model",
    category: "Science",
    location: "Switzerland",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 8,
    bias: { left: 16, center: 62, right: 22 },
  },
  {
    id: 4,
    title: "Indigenous Leader Brooklyn Rivera Dies in Nicaragua After Nearly 3 Years of Detention",
    category: "World",
    location: "Nicaragua",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 63,
    bias: { left: 54, center: 28, right: 18 },
  },
  {
    id: 5,
    title: "UN Security Council to Hold Emergency Meeting as Israel Pushes Deeper into Lebanon",
    category: "World",
    location: "Middle East",
    imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 15,
    bias: { left: 22, center: 33, right: 45 },
  },
  {
    id: 6,
    title: "Oil Prices Dip as OPEC+ Considers Output Increase Amid Weak Demand",
    category: "Business",
    location: "Global",
    imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 11,
    bias: { left: 25, center: 50, right: 28 },
  },
  {
    id: 7,
    title: "SpaceX Launches Starship Test Flight in Milestone for Mars Program",
    category: "Technology",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 9,
    bias: { left: 12, center: 45, right: 49 },
  },
  {
    id: 8,
    title: "Apple Unveils AI-Powered Features Across iPhone, iPad and Mac",
    category: "Business",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 10,
    bias: { left: 15, center: 40, right: 45 },
  },
  {
    id: 9,
    title: "2025 on Track to Be Among Top 3 Hottest Years, EU Climate Service Says",
    category: "Climate",
    location: "Global",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 14,
    bias: { left: 33, center: 34, right: 33 },
  },
  {
    id: 10,
    title: "Fed Holds Rates Steady, Signals Caution on Inflation and Growth Outlook",
    category: "Economy",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 13,
    bias: { left: 30, center: 45, right: 25 },
  },
  {
    id: 11,
    title: "Real Madrid Win Champions League After Comeback Victory in Final",
    category: "Soccer",
    location: "Europe",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 26,
    bias: { left: 10, center: 20, right: 70 },
  },
  {
    id: 12,
    title: "Wildfires Force Thousands to Evacuate Across Western Canada",
    category: "Environment",
    location: "Canada",
    imageUrl: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=600&auto=format&fit=crop&q=60",
    sourcesCount: 17,
    bias: { left: 27, center: 33, right: 40 },
  },
]

const CATEGORIES = [
  "World Cup",
  "IPL",
  "Social Media",
  "Business & Markets",
  "Health & Medicine",
  "Soccer",
  "Artificial Intelligence",
  "Arsenal FC",
  "Extreme Weather and Disasters",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#0D0D0F]">
      {/* CATEGORY PILLS BAR */}
      <div className="bg-white border-b border-[var(--border)] py-3 px-6 shadow-sm overflow-hidden">
        <div className="container mx-auto max-w-[1400px] flex items-center gap-3">
          {/* Left Scroll Trigger */}
          <button className="p-1 rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 flex items-center justify-center shrink-0">
            <ChevronLeft className="h-4 w-4 text-zinc-500" />
          </button>

          {/* Scrolling Categories */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat, idx) => (
              <Chip key={idx} label={cat} className="shrink-0 text-[11px] font-bold py-1 px-3 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors" />
            ))}
          </div>

          {/* Right Scroll Trigger */}
          <button className="p-1 rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 flex items-center justify-center shrink-0">
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* MAIN BODY CONTAINER */}
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        {/* Title */}
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0D0D0F]">
          Top News
        </h1>

        {/* 12-Card Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((art) => (
            <Link key={art.id} href={`/article/${art.id}`} className="block transition-transform hover:-translate-y-0.5">
              <NewsCard
                variant="vertical"
                title={art.title}
                category={art.category}
                location={art.location}
                imageUrl={art.imageUrl}
                sourcesCount={art.sourcesCount}
                bias={art.bias}
                className="bg-white rounded-xl border border-[var(--border)] shadow-sm h-full"
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
