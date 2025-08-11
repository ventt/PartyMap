'use client'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'
import NavActions from './NavActions'
import Link from 'next/link'

export default function TopBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[1200]">
      <div className="px-4">
        {/* Desktop (md+): logo + search + nav items + theme */}
        <div className="hidden md:flex h-16 items-center justify-between
                        bg-gradient-to-r from-violet-700/80 via-fuchsia-700/70 to-indigo-700/70
                        dark:from-violet-900/70 dark:via-fuchsia-900/60 dark:to-indigo-900/60
                        backdrop-blur px-3">
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

        {/* Mobile (<md): ONLY the search bar up top */}
        <div className="md:hidden py-2">
          <div className="relative z-[1300]">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  )
}
