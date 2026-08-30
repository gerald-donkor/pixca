import * as React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full min-w-0 max-w-full bg-[#0D0D0F] text-white border-t border-zinc-800 mt-12 sm:mt-16">
      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Brand & Links Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-extrabold tracking-tight select-none inline-block">
              Pixca<span className="text-[10px] font-semibold px-1.5 py-0.5 ml-1 bg-white text-black rounded-sm align-middle">News</span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">
              Balanced news coverage powered by AI. Get multiple viewpoints on top stories.
            </p>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Company & Intelligence</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <Link href="/about" className="inline-block py-1 hover:text-white cursor-pointer transition-colors">
                  About & Methodology
                </Link>
              </li>
              <li>
                <Link href="/blindspot" className="inline-block py-1 hover:text-white cursor-pointer transition-colors">
                  Blindspot Feed
                </Link>
              </li>
              <li>
                <Link href="/saved" className="inline-block py-1 hover:text-white cursor-pointer transition-colors">
                  Saved Articles
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="inline-block py-1 hover:text-white cursor-pointer transition-colors">
                  RSS / Atom Syndication
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Help & Status</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <Link href="/logs" className="inline-block py-1 hover:text-white cursor-pointer transition-colors">
                  System Status
                </Link>
              </li>
              <li>
                <span className="inline-block py-1 hover:text-white cursor-pointer transition-colors">Help Center</span>
              </li>
              <li>
                <span className="inline-block py-1 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="inline-block py-1 hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Connect</h4>
            <div className="flex items-center gap-3 pt-1">
              {/* Custom SVG Social Icons mimicking Twitter, LinkedIn, Instagram, Youtube */}
              <a
                href="#"
                aria-label="Follow Pixca on X"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center transition-all text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                𝕏
              </a>
              <a
                href="#"
                aria-label="Pixca on LinkedIn"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center transition-all text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                in
              </a>
              <a
                href="#"
                aria-label="Pixca on Instagram"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center transition-all text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                📸
              </a>
              <a
                href="#"
                aria-label="Pixca on YouTube"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center transition-all text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                ▶
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="border-t border-zinc-800 mt-8 sm:mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-zinc-400 text-xs gap-4">
          <span>© 2026 Pixca News. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="hover:text-zinc-200 cursor-pointer transition-colors py-1">Terms</span>
            <span className="hover:text-zinc-200 cursor-pointer transition-colors py-1">Privacy</span>
            <span className="hover:text-zinc-200 cursor-pointer transition-colors py-1">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
