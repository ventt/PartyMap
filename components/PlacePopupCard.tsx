import Link from 'next/link'
import type { Place } from '@/lib/types'
import { ArrowRight, X } from 'lucide-react'

export default function PlacePopupCard({
  place,
  onClose,
}: {
  place: Place
  onClose: () => void
}) {
  return (
    <div className="w-64 overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
      <div
        className="h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${place.image})` }}
        role="img"
        aria-label={`${place.name} photo`}
      />
      <div className="p-3">
        <div className="text-sm font-semibold">{place.name}</div>
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
