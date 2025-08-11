'use client'
import { MapPinned, Ticket, User, Search } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'

export default function BottomBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1200] md:hidden safe-bottom">
      <div className="mx-auto max-w-screen-sm px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="grid h-16 grid-cols-5 items-center rounded-2xl
                        bg-zinc-900/80 text-zinc-100 backdrop-blur ring-1 ring-white/10">
          <button className="flex flex-col items-center gap-1 text-xs opacity-90">
            <MapPinned className="h-5 w-5" /><span>Nearby</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-xs opacity-90">
            <Ticket className="h-5 w-5" /><span>Tickets</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-xs opacity-90" onClick={() => {
            const input = document.querySelector<HTMLInputElement>('[data-search-input]')
            input?.focus()
          }}>
            <Search className="h-5 w-5" /><span>Search</span>
          </button>
          <Link href="#" className="flex flex-col items-center gap-1 text-xs opacity-90">
            <User className="h-5 w-5" /><span>Profile</span>
          </Link>
          <div className="flex items-center justify-center">
            <ThemeToggle small />
          </div>
        </div>
      </div>
    </nav>
  )
}
