import Link from 'next/link'
import type { Place } from '@/lib/types'
import { ArrowRight, X, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UpcomingInfo { label: string; iso: string }

function formatUpcoming(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const inYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', ...(inYear ? {} : { year: 'numeric' }) })
}

export default function PlacePopupCard({
  place,
  onClose,
}: {
  place: Place
  onClose: () => void
}) {
  const [upcoming, setUpcoming] = useState<UpcomingInfo | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/events?place=' + place.id)
        if (!res.ok) return
        const data = await res.json() as { events: { start: string }[] }
        const now = Date.now()
        const next = data.events
          .map(e => e.start)
          .map(s => new Date(s))
          .filter(d => d.getTime() > now)
          .sort((a,b) => a.getTime()-b.getTime())[0]
        if (next && active) setUpcoming({ iso: next.toISOString(), label: formatUpcoming(next.toISOString()) })
      } catch {}
    })()
    return () => { active = false }
  }, [place.id])

  return (
    <div className="w-64 overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
      <div
        className="h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${place.image})` }}
        role="img"
        aria-label={`${place.name} photo`}
      />
      <div className="p-3">
        <div className="text-sm font-semibold flex items-center justify-between">
          <span>{place.name}</span>
          {upcoming && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-violet-950/60 dark:bg-violet-800/40 text-violet-200 px-2 py-0.5 text-[10px] ring-1 ring-violet-500/30">
              <CalendarDays className="h-3 w-3" />{upcoming.label}
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-300">
          {place.address}, {place.city}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {place.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-violet-100/70 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 px-2 py-0.5 text-[10px]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {/* Softer primary button */}
          <Link
            href={`/places/${place.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/60
                        text-violet-800 dark:text-violet-200 bg-white/70 dark:bg-zinc-900/40
                        hover:bg-violet-50/70 dark:hover:bg-violet-900/30
                        px-3 py-1.5 text-xs font-medium shadow-sm cursor-pointer focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-white/60"
          >
            View place
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Prominent red close button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full
                        bg-red-600/90 hover:bg-red-500 active:bg-red-700
                        text-white px-3 py-1.5 text-xs font-medium shadow-sm
                        cursor-pointer select-none transition
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[.98]"
            aria-label="Close popup"
            >
            <X className="h-3.5 w-3.5" />
            Close
            </button>
        </div>
      </div>
    </div>
  )
}
