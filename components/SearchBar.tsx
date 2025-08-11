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
    <div
      className="flex items-center gap-2 rounded-full border border-white/20
                 bg-white/85 px-3 py-2 shadow-sm backdrop-blur
                 focus-within:ring-2 focus-within:ring-violet-400
                 dark:bg-white/85 dark:border-white/20"
    >
      <Search className="h-5 w-5 text-zinc-700" aria-hidden />
      <input
        className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-600 outline-none"
        placeholder="Search places, events, performers"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true) }}
      />
    </div>

    {open && results.length > 0 && (
      <div
        className="absolute left-0 right-0 top-full z-[1400] mt-2 max-h-96 overflow-auto
                   rounded-xl border border-white/10 bg-white/95 shadow-xl backdrop-blur
                   dark:bg-zinc-950/95"
        role="listbox"
      >
        {/* …list unchanged… */}
      </div>
    )}
  </div>
)
}
