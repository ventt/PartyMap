'use client'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'
import NavActions from './NavActions'
import Link from 'next/link'

export default function TopBar() {
  return (
    // The wrapper doesn’t block map clicks: pointer-events-none
    <div className="fixed inset-x-0 top-0 z-[1200] pointer-events-none">
      <div className="mt-2 px-4">
        {/* Desktop bar */}
        <div className="hidden md:flex h-16 items-center justify-between rounded-2xl
                        bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-700
                        dark:from-violet-900 dark:via-fuchsia-900 dark:to-indigo-900
                        px-3 ring-1 ring-white/10 shadow-lg pointer-events-auto">
          <Link href="/" className="text-white font-semibold tracking-tight">PartyMap</Link>

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
                        ring-1 ring-white/10 px-3 flex items-center shadow-lg pointer-events-auto">
          <div className="w-full relative z-[1300]">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  )
}
