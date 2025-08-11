'use client'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'
import NavActions from './NavActions'
import Link from 'next/link'
// New display font for branding
import { Baloo_2 } from 'next/font/google'
const partyFont = Baloo_2({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-party' })

export default function TopBar() {
  return (
    // The wrapper doesn’t block map clicks: pointer-events-none
    <div className="fixed inset-x-0 top-0 z-[1200] pointer-events-none">
      <div className="mt-2 px-4">
        {/* Desktop bar */}
        <div className="hidden md:flex h-16 items-center justify-between rounded-2xl
                        bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-700
                        dark:from-violet-900 dark:via-fuchsia-900 dark:to-indigo-900
                        px-3 ring-1 ring-white/10 shadow-lg pointer-events-auto relative overflow-hidden">
          <Link href="/" className={`party-logo group relative flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl ${partyFont.className}`}>
            <span className="party-logo-text font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-fuchsia-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] text-2xl leading-none select-none [letter-spacing:-0.02em]">
              Party <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-violet-200 to-indigo-200">Map</span>
            </span>
          </Link>

          <div className="flex-1 mx-4 max-w-3xl">
            {/* Keep dropdown above the map */}
            <div className="relative z-[1300]">
              <SearchBar />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NavActions variant="desktop" />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile bar: ONLY search up top */}
        <div className="md:hidden h-16 rounded-2xl
                        bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-700
                        dark:from-violet-900 dark:via-fuchsia-900 dark:to-indigo-900
                        ring-1 ring-white/10 px-3 flex items-center shadow-lg pointer-events-auto gap-3">
          <Link href="/" className={`inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/15 ring-1 ring-white/30 text-[15px] font-bold tracking-tight text-white shadow-inner shadow-black/30 select-none ${partyFont.className}`}>
            PM
          </Link>
          <div className="flex-1 relative z-[1300]">
            <SearchBar />
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) { }
        /* Make the custom font variable easy to target if needed */
        :root { font-feature-settings: 'ss01' on; }
        /* Glint animation for Party Map logo */
        .party-logo { position:relative; }
        .party-logo-text { position:relative; display:inline-block; }
        .party-logo-text::after { content:''; pointer-events:none; position:absolute; top:0; left:-130%; width:50%; height:100%; background:linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 72%, rgba(255,255,255,0) 100%); transform:skewX(-20deg); opacity:0; filter:blur(.4px); }
        .party-logo:hover .party-logo-text::after { animation: party-glint .75s linear; opacity:1; }
        @keyframes party-glint { 0% { left:-130%; opacity:0; } 8% { opacity:0; } 25% { opacity:1; } 55% { opacity:1; } 70% { opacity:0; } 100% { left:140%; opacity:0; } }
        @media (prefers-reduced-motion: reduce) { .party-logo:hover .party-logo-text::after { animation:none; opacity:.35; left:0; width:100%; background:linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05)); } }
      `}</style>
    </div>
  )
}
