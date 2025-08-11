'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { SearchHit } from '@/lib/types'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click (works over Leaflet too by using pointerdown + capture)
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true } as any)
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Fetch results (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setOpen(false); return }
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const json = await r.json() as { hits: SearchHit[] }
      setResults(json.hits)
      setOpen(true)
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/80 px-3 py-2 shadow-sm
                      focus-within:ring-2 focus-within:ring-violet-400
                      dark:bg-zinc-900/70 dark:border-white/10">
        <Search className="h-5 w-5 text-zinc-600 dark:text-zinc-300" aria-hidden />
        <input
          className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-500 outline-none
                     dark:text-zinc-100 dark:placeholder-zinc-400"
          placeholder="Search places, events, performers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true) }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-[1400] mt-2 max-h-96 overflow-auto rounded-xl border border-white/10
                     bg-white/95 shadow-xl backdrop-blur dark:bg-zinc-900/95"
          role="listbox"
        >
          <ul className="divide-y divide-zinc-200/60 dark:divide-white/10">
            {results.map((hit) => (
              <li key={`${hit.type}-${hit.id}`}>
                <Link
                  href={hit.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-violet-50/80 dark:hover:bg-violet-900/30"
                >
                  <div className="text-sm font-medium">{hit.title}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">{hit.subtitle}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
