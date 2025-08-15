import Link from 'next/link'
import type { Place, EventType, Event } from '@/lib/types'
import { ArrowRight, X, CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'

interface EventInfo { id: string; title: string; image: string; startIso: string; startLabel: string; kind?: EventType }

function formatUpcoming(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const inYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', ...(inYear ? {} : { year: 'numeric' }) })
}

export default function PlacePopupCard({ place, onClose }: { place: Place; onClose: () => void }) {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const longTitle = !!(eventInfo?.title && eventInfo.title.length > 28)

  useEffect(() => {
    let active = true
    // Reset while loading a new place or updated image so stale info isn't shown
    setEventInfo(null)
    ;(async () => {
      try {
        const res = await fetch('/api/events?place=' + place.id)
        if (!res.ok) return
        const data = await res.json() as { events: Event[] }
        if (!data.events?.length) return
        const now = Date.now()
        const sorted = data.events.slice().sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        const upcoming = sorted.find(e => new Date(e.end).getTime() > now) || sorted[0]
        if (!upcoming) return
        if (active) {
          setEventInfo({
            id: upcoming.id,
            title: upcoming.title,
            image: upcoming.image || place.image,
            startIso: upcoming.start,
            startLabel: formatUpcoming(upcoming.start),
            kind: upcoming.kind,
          })
        }
      } catch {}
    })()
    return () => { active = false }
  }, [place.id, place.image])

  return (
    <div
      className={`place-popup-card ${longTitle ? 'w-88 md:w-80' : 'w-80 md:w-72'} max-w-[calc(100vw-1.25rem)] overflow-hidden rounded-2xl
                 ring-1 ring-white/10 backdrop-blur-md`}
    >
      <div
        className="h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${(eventInfo?.image) || place.image})` }}
        role="img"
        aria-label={`${eventInfo ? eventInfo.title : place.name} photo`}
      />
      <div className="p-3">
        {/* Title + date: medium titles forced single line; long titles can wrap (clamped) */}
        {longTitle ? (
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="block text-base leading-snug font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm pm-line-clamp-2">
                {eventInfo ? eventInfo.title : place.name}
              </span>
            </div>
            {eventInfo && (
              <span className="flex-shrink-0 self-start whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-violet-950/60 dark:bg-violet-800/40 text-violet-200 px-2 py-0.5 text-[10px] ring-1 ring-violet-500/30">
                <CalendarDays className="h-3 w-3" />{eventInfo.startLabel}
              </span>
            )}
          </div>
        ) : (
          <div className="relative">
            {eventInfo && (
              <span className="absolute right-0 top-0 whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-violet-950/60 dark:bg-violet-800/40 text-violet-200 px-2 py-0.5 text-[10px] ring-1 ring-violet-500/30">
                <CalendarDays className="h-3 w-3" />{eventInfo.startLabel}
              </span>
            )}
            <span className="block pr-20 text-base leading-snug font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm whitespace-nowrap">
              {eventInfo ? eventInfo.title : place.name}
            </span>
          </div>
        )}
        {/* Second row: place link only */}
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
          <Link
            href={`/places/${place.id}`}
            className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[12px] font-semibold
                       bg-violet-100/70 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200
                       border border-violet-300/50 dark:border-violet-700/40 shadow-sm
                       hover:bg-violet-200/70 dark:hover:bg-violet-800/60 transition-colors"
          >
            {place.name}
          </Link>
        </div>
        {/* Third row: event kind + tags */}
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {[
            eventInfo?.kind ? { key: `kind-${eventInfo.kind}`, label: eventInfo.kind, kind: eventInfo.kind, isKind: true } : null,
            ...place.tags
              .filter(t => !eventInfo?.kind || t.toLowerCase() !== eventInfo.kind.toLowerCase())
              .slice(0,3)
              .map(t => ({ key: t, label: t, kind: undefined, isKind: false }))
          ].filter(Boolean).map((t: any) => {
            const common = 'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50';
            if (t.isKind) {
              return (
                <Link
                  key={t.key}
                  href={`/tags/${encodeURIComponent(t.label)}`}
                  data-kind={t.label}
                  className={`event-badge capitalize px-2.5 py-0.5 text-[11px] font-semibold ${common}`}
                >
                  {t.label}
                </Link>
              )
            }
            return (
              <Link
                key={t.key}
                href={`/tags/${encodeURIComponent(t.label)}`}
                className={`bg-violet-100/70 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 hover:bg-violet-200/70 dark:hover:bg-violet-800/60 ${common}`}
              >
                {t.label}
              </Link>
            )
          })}
        </div>

  <div className="mt-3 flex items-center w-full">
          {/* Softer primary button */}
          <Link
            href={eventInfo ? `/events/${eventInfo.id}` : `/places/${place.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/60
                        text-violet-800 dark:text-violet-200 bg-white/70 dark:bg-zinc-900/40
                        hover:bg-violet-50/70 dark:hover:bg-violet-900/30
                        px-4 py-1.5 text-xs font-medium shadow-sm cursor-pointer focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-white/60 min-w-[112px] justify-center"
          >
            {eventInfo ? 'View event' : 'View place'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Prominent red close button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full
                        bg-red-600/90 hover:bg-red-500 active:bg-red-700
      text-white px-3 py-1.5 text-xs font-medium shadow-sm ml-auto
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
