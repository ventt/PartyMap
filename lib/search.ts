import type { SearchHit, Event, Performer, Place } from './types'

const norm = (s: string) => s.toLowerCase().normalize('NFKD')
const includes = (text: string, q: string) => norm(text).includes(norm(q))

export interface SearchDataBuckets {
  places: Place[]
  events: Event[]
  performers: Performer[]
}

/**
 * Build search hits from provided domain collections (pure / side-effect free)
 */
export function buildSearchHits(query: string, data: SearchDataBuckets): SearchHit[] {
  const q = query.trim()
  if (!q) return []
  const { places, events, performers } = data

  const placeHits: SearchHit[] = places
    .filter(p =>
      includes(p.name, q) ||
      includes(p.city, q) ||
      includes(p.address, q) ||
      p.tags.some(t => includes(t, q))
    )
    .map(p => ({
      type: 'place' as const,
      id: p.id,
      title: p.name,
      subtitle: `${p.city} • ${p.tags.join(', ')}`,
      href: `/places/${p.id}`,
      image: p.image,
      placeId: p.id,
    }))

  const eventHits: SearchHit[] = events
    .filter(e => {
      const place = places.find(p => p.id === e.placeId)
      const blob = `${e.title} ${e.description} ${place?.name ?? ''} ${place?.city ?? ''}`
      return includes(blob, q)
    })
    .map(e => {
      const place = places.find(p => p.id === e.placeId)
      return {
        type: 'event' as const,
        id: e.id,
        title: e.title,
        subtitle: place ? `${place.name} • ${place.city}` : 'Event',
        href: `/events/${e.id}`,
        image: e.image,
        placeId: e.placeId,
      }
    })

  const performerHits: SearchHit[] = performers
    .filter(a => includes(a.name, q) || includes(a.genre, q))
    .map(a => ({
      type: 'performer' as const,
      id: a.id,
      title: a.name,
      subtitle: a.genre,
      href: `/performers/${a.id}`,
      image: a.image,
    }))

  const starts = (s: string) => norm(s).startsWith(norm(q)) ? 0 : 1

  return [...placeHits, ...eventHits, ...performerHits]
    .sort((a, b) => starts(a.title) - starts(b.title))
    .slice(0, 20)
}
