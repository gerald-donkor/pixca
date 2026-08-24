import * as React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#0D0D0F] text-white border-t border-zinc-800 mt-16">
      <div className="container mx-auto max-w-[1400px] px-6 py-12">
        {/* Top Brand & Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-extrabold tracking-tight select-none block">
              Pixca<span className="text-[10px] font-semibold px-1.5 py-0.5 ml-1 bg-white text-black rounded-sm align-middle">News</span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">
              Balanced news coverage powered by AI. Get multiple viewpoints on top stories.
            </p>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500">Company</h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">About</li>
              <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-white cursor-pointer transition-colors">Press</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>

            {/* Column 3: Help */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500">Help & Status</h4>
              <ul className="space-y-2 text-xs text-zinc-400 font-medium">
                <li>
                  <Link href="/logs" className="hover:text-white cursor-pointer transition-colors">
                    System Status
                  </Link>
                </li>
                <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              </ul>
            </div>

          {/* Column 4: Connect */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500">Connect</h4>
            <div className="flex items-center gap-3">
              {/* Custom SVG Social Icons mimicking Twitter, LinkedIn, Instagram, Youtube */}
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors text-white text-xs font-bold">𝕏</a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors text-white text-xs font-bold">in</a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors text-white text-xs font-bold">📸</a>
              <a href="#" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors text-white text-xs font-bold">▶</a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="border-t border-zinc-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-xs gap-4">
          <span>© 2026 Pixca News. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
