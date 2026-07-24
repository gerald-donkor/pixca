import * as React from "react"
import {
  Info,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronLeft
} from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { BiasMeter } from "@/components/ui/bias-meter"
import { NewsCard } from "@/components/ui/news-card"
import Link from "next/link"

// 6 Related Stories from 03-news-details-page.png
const RELATED_STORIES = [
  {
    id: 101,
    title: "Iran Says It Will Not Negotiate Under 'Maximum Pressure'",
    category: "World",
    location: "Middle East",
    imageUrl: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=400&auto=format&fit=crop&q=60",
    timeAgo: "May 29, 2026",
    readTime: "8 min read",
  },
  {
    id: 102,
    title: "Bipartisan Group Urges Diplomacy With Iran",
    category: "Politics",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&auto=format&fit=crop&q=60",
    timeAgo: "May 26, 2026",
    readTime: "5 min read",
  },
  {
    id: 103,
    title: "US Sanctions More Iranian Entities Over Nuclear Program",
    category: "Politics",
    location: "United States",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&auto=format&fit=crop&q=60",
    timeAgo: "May 28, 2026",
    readTime: "6 min read",
  },
  {
    id: 104,
    title: "What&apos;s in the 2015 Iran Nuclear Deal?",
    category: "Science",
    location: "Nuclear Policy",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&auto=format&fit=crop&q=60",
    timeAgo: "May 25, 2026",
    readTime: "10 min read",
  },
  {
    id: 105,
    title: "Oman Hosts Another Round of US-Iran Nuclear Talks",
    category: "World",
    location: "Middle East",
    imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=60",
    timeAgo: "May 27, 2026",
    readTime: "7 min read",
  },
  {
    id: 106,
    title: "Israel Reaffirms Red Line Over Iranian Nuclear Program",
    category: "World",
    location: "Middle East",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=60",
    timeAgo: "May 24, 2026",
    readTime: "6 min read",
  },
]

// Reusable progress bar row for sidebar widgets
function SidebarProgressBar({
  label,
  percentage,
  valueText,
  colorClass,
}: {
  label: string
  percentage: number
  valueText?: string
  colorClass: string
}) {
  return (
    <div className="grid grid-cols-[60px_45px_1fr] items-center gap-3 text-[11px] font-bold select-none">
      <div className="text-zinc-500 uppercase tracking-wider text-[10px]">{label}</div>
      <div className="text-zinc-800 text-right">{valueText || `${percentage}%`}</div>
      <div className="h-2 w-full bg-zinc-100 border border-zinc-200/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default async function ArticleDetailsPage() {
  await auth.protect();

  return (
    <div className="min-h-screen bg-white text-[#0D0D0F] pb-16">
      {/* Top Back Navigation Bar */}
      <div className="bg-white border-b border-[var(--border)] py-3 px-6 shadow-sm">
        <div className="container mx-auto max-w-[1400px] flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Top News
          </Link>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
          
          {/* LEFT COLUMN: ARTICLE CONTENT */}
          <div className="space-y-6">
            
            {/* Metadata Breadcrumb */}
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Politics • United States
            </div>

            {/* Headline */}
            <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#0D0D0F] leading-tight">
              Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report
            </h1>

            {/* Byline & Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-y border-[var(--border)] py-4 gap-4">
              <div className="text-xs font-medium text-zinc-500">
                By <span className="font-bold text-zinc-800">David Morgan</span> <span className="mx-1">•</span> May 31, 2026 <span className="mx-1">•</span> 12 min read
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-zinc-500 hover:text-black text-xs font-semibold gap-1.5 p-0 hover:bg-transparent">
                  <Bookmark className="h-4 w-4" /> Save
                </Button>
                <span className="text-zinc-300">|</span>
                <Button variant="ghost" className="text-zinc-500 hover:text-black text-xs font-semibold gap-1.5 p-0 hover:bg-transparent">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <span className="text-zinc-300">|</span>
                <button className="text-zinc-500 hover:text-black transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="space-y-2">
              <img
                src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=60"
                alt="President Trump"
                className="w-full aspect-[16/9] object-cover rounded-xl border border-[var(--border)] shadow-sm"
              />
              <div className="text-xs text-zinc-500 leading-relaxed space-y-0.5">
                <div>President Donald Trump in the Cabinet Room at the White House, Washington, D.C., May 30, 2026.</div>
                <div className="font-bold">Photo: Andrew Harnik/Getty Images</div>
              </div>
            </div>

            {/* Inline Bias Distribution Card */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1.5">
                  Bias Distribution
                  <Info className="h-3.5 w-3.5 text-zinc-400 cursor-pointer" />
                </span>
                <span className="text-xs font-bold text-zinc-700">12 sources</span>
              </div>
              <BiasMeter leftValue={20} centerValue={31} rightValue={49} showLabels={false} />
            </div>

            {/* Article Text Content */}
            <article className="text-zinc-800 text-[15px] md:text-[16px] leading-[1.7] font-medium space-y-6 max-w-none">
              <p>
                The Trump administration has sent Iran a revised nuclear deal proposal that includes
                tougher terms on uranium enrichment and stronger verification measures, according to a
                report published Saturday.
              </p>
              <p>
                The new proposal, delivered through intermediaries in Oman, requires Iran to halt all uranium
                enrichment on its soil and ship its stockpile of enriched uranium out of the country. It also
                demands unrestricted access for international inspectors to all Iranian nuclear facilities,
                including military sites.
              </p>
              <p className="font-bold border-l-4 border-[var(--bias-right)] pl-4 py-1 my-6 italic text-zinc-900 bg-zinc-50 rounded-r">
                &ldquo;This is a take-it-or-leave-it proposal,&rdquo; a senior administration official told the Wall Street Journal.
                &ldquo;The President wants a deal, but he will not accept a weak agreement that puts America or our allies at risk.&rdquo;
              </p>
              <p>
                Iran has not yet officially responded to the proposal. However, Iranian Foreign Minister
                Hossein Amir-Abdollahian said last week that any deal must respect Iran&apos;s right to peaceful
                nuclear energy and include the lifting of all U.S. sanctions.
              </p>
              <p>
                The revised proposal comes after several rounds of indirect talks between U.S. and Iranian
                officials failed to produce a breakthrough. The Trump administration has warned that if
                diplomacy fails, it is prepared to take other action to prevent Iran from obtaining a nuclear
                weapon.
              </p>
              <p>
                European allies have urged both sides to continue negotiations. &ldquo;We believe diplomacy is
                still the best path forward,&rdquo; said a spokesperson for the EU&apos;s foreign policy chief.
              </p>
              <p>
                Israel, which has long opposed the 2015 nuclear deal with Iran, praised the Trump
                administration&apos;s tougher stance. &ldquo;This is the kind of leadership that was missing in the past,&rdquo;
                said Israeli Prime Minister Benjamin Netanyahu in a statement.
              </p>
              <p>
                The fate of the proposal now rests with Iran, as global attention remains focused on
                whether a new nuclear agreement can be reached&mdash;or if tensions will escalate further.
              </p>
            </article>

            {/* Related Stories Section */}
            <div className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h2 className="text-xl font-extrabold text-[#0D0D0F]">Related Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RELATED_STORIES.map((story) => (
                  <NewsCard
                    key={story.id}
                    title={story.title}
                    category={story.category}
                    location={story.location}
                    imageUrl={story.imageUrl}
                    timeAgo={story.timeAgo}
                    readTime={story.readTime}
                    variant="horizontal"
                    className="bg-white rounded-xl border border-[var(--border)] shadow-sm max-w-full"
                  />
                ))}
              </div>
            </div>

            {/* Full-width Newsletter Block */}
            <div className="bg-zinc-50 rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mt-10">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg font-extrabold text-[#0D0D0F]">Stay Informed. Stay Balanced.</h3>
                <p className="text-xs text-zinc-500 font-semibold">Get the top stories and bias analysis delivered to your inbox.</p>
              </div>
              <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium py-2.5 px-4 outline-none focus:border-zinc-400 flex-1 md:w-64"
                />
                <Button variant="default" className="bg-[#0D0D0F] hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-5 h-auto rounded-md">
                  Subscribe
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
          <div className="space-y-6">
            
            {/* WIDGET 1: BIAS ANALYSIS */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800">Bias Analysis</h3>
                <Info className="h-4 w-4 text-zinc-400 cursor-pointer" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Bias</div>
                <div className="text-2xl font-extrabold text-[var(--bias-right)]">Right 49%</div>
                <div className="text-[11px] font-bold text-zinc-400 leading-none">Based on 12 balanced sources</div>
              </div>
              <div className="space-y-3 pt-2">
                <SidebarProgressBar label="Left" percentage={20} colorClass="bg-[var(--bias-left)]" />
                <SidebarProgressBar label="Center" percentage={31} colorClass="bg-zinc-300" />
                <SidebarProgressBar label="Right" percentage={49} colorClass="bg-[var(--bias-right)]" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                Our analysis is based on the political leaning of the publication and how the story is
                framed. Sources are weighted by reliability and recency.
              </p>
              <Button variant="outline" className="w-full border-zinc-200 hover:bg-zinc-50 text-xs font-bold py-2 h-auto text-zinc-800 rounded-md">
                How We Analyze Bias
              </Button>
            </div>

            {/* WIDGET 2: AI SUMMARY */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800">AI Summary</h3>
                <Info className="h-4 w-4 text-zinc-400 cursor-pointer" />
              </div>
              <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 leading-none">
                Generated May 31, 2026 <span className="text-zinc-300">•</span> 3 min read
              </div>
              <ul className="space-y-4 text-xs font-medium text-zinc-700 list-disc pl-4 leading-relaxed">
                <li>
                  The Trump administration has sent Iran a revised nuclear deal proposal with tougher
                  terms, including a complete halt to uranium enrichment and the removal of enriched uranium
                  stockpiles.
                </li>
                <li>
                  The proposal also demands unrestricted inspector access to all nuclear sites, including
                  military facilities.
                </li>
                <li>
                  Iran has not responded officially but says any deal must respect its right to peaceful
                  nuclear energy and include sanctions relief.
                </li>
                <li>
                  The U.S. warns it is prepared to take other action if diplomacy fails, while European
                  allies urge continued negotiations.
                </li>
                <li>
                  Israel supports the tougher stance, praising the administration&apos;s determination to prevent
                  Iran from acquiring nuclear weapons.
                </li>
              </ul>
              <div className="text-[10px] text-zinc-400 font-bold italic leading-tight pt-2 border-t border-zinc-50">
                AI summaries can make mistakes.
              </div>
              <Button variant="outline" className="w-full border-zinc-200 hover:bg-zinc-50 text-xs font-bold py-2 h-auto text-zinc-800 rounded-md">
                Provide Feedback
              </Button>
            </div>

            {/* WIDGET 3: SOURCE BREAKDOWN */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800">Source Breakdown</h3>
                <Info className="h-4 w-4 text-zinc-400 cursor-pointer" />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-extrabold text-zinc-800 leading-none">12 Total Sources</div>
              </div>
              <div className="space-y-3 pt-2">
                <SidebarProgressBar label="Left" percentage={20} valueText="2 (20%)" colorClass="bg-[var(--bias-left)]" />
                <SidebarProgressBar label="Center" percentage={31} valueText="4 (31%)" colorClass="bg-zinc-300" />
                <SidebarProgressBar label="Right" percentage={49} valueText="6 (49%)" colorClass="bg-[var(--bias-right)]" />
              </div>

              {/* Top Sources Table List */}
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  <span>Top Sources</span>
                  <span>Bias</span>
                </div>
                <div className="space-y-2 text-xs font-bold text-zinc-700">
                  <div className="flex justify-between items-center">
                    <span>Fox News</span>
                    <span className="text-[var(--bias-right)] text-[10px] uppercase font-extrabold tracking-wider">Right</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>The Wall Street Journal</span>
                    <span className="text-zinc-400 text-[10px] uppercase font-extrabold tracking-wider">Center</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reuters</span>
                    <span className="text-zinc-400 text-[10px] uppercase font-extrabold tracking-wider">Center</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>BBC</span>
                    <span className="text-zinc-400 text-[10px] uppercase font-extrabold tracking-wider">Center</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CNN</span>
                    <span className="text-[var(--bias-left)] text-[10px] uppercase font-extrabold tracking-wider">Left</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>The New York Times</span>
                    <span className="text-zinc-400 text-[10px] uppercase font-extrabold tracking-wider">Center</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>The Washington Post</span>
                    <span className="text-zinc-400 text-[10px] uppercase font-extrabold tracking-wider">Center</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Newsmax</span>
                    <span className="text-[var(--bias-right)] text-[10px] uppercase font-extrabold tracking-wider">Right</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full border-zinc-200 hover:bg-zinc-50 text-xs font-bold py-2 h-auto text-zinc-800 rounded-md">
                View All Sources
              </Button>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  )
}
