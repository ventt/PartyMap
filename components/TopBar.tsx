'use client'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'
import Link from 'next/link'

export default function TopBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[1200]">   {/* ⬅️ higher than Leaflet panes */}
      <div className="px-4">
        <div className="flex h-16 items-center justify-between rounded-none   /* remove mt-2 */
                        bg-gradient-to-r from-violet-700/80 via-fuchsia-700/70 to-indigo-700/70
                        dark:from-violet-900/70 dark:via-fuchsia-900/60 dark:to-indigo-900/60
                        backdrop-blur ring-0 px-3">
          <Link href="/" className="text-white font-semibold tracking-tight">PartyMap</Link>
          <div className="flex-1 mx-3 max-w-xl">
            <div className="relative z-[1300]">       {/* ⬅️ dropdown sits above map */}
              <SearchBar />
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

