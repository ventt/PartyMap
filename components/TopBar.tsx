'use client'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'
import NavActions from './NavActions'
import Link from 'next/link'

export default function TopBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[1200]">
      {/* add a tiny top margin so the rounded corners are visible */}
      <div className="mt-2 px-4">
        {/* Desktop (md+): logo + search + nav items + theme */}
        <div className="hidden md:flex h-16 items-center justify-between rounded-2xl
                        bg-gradient-to-r from-violet-700/85 via-fuchsia-700/75 to-indigo-700/75
                        dark:from-violet-900/75 dark:via-fuchsia-900/65 dark:to-indigo-900/65
                        backdrop-blur px-3 ring-1 ring-white/10">
          <Link href="/" className="text-white font-semibold tracking-tight">PartyMap</Link>

          <div className="flex-1 mx-4 max-w-3xl">
            <div className="relative z-[1300]">
              <SearchBar />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NavActions variant="desktop" />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile (<md): purple bar too, with ONLY the search */}
        <div className="md:hidden h-16 rounded-2xl
                        bg-gradient-to-r from-violet-700/85 via-fuchsia-700/75 to-indigo-700/75
                        dark:from-violet-900/75 dark:via-fuchsia-900/65 dark:to-indigo-900/65
                        backdrop-blur ring-1 ring-white/10 px-3 flex items-center">
          <div className="w-full relative z-[1300]">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  )
}
