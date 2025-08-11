import type { SearchHit } from './types'
import { events, performers, places } from './data/mock'

const norm = (s: string) => s.toLowerCase().normalize('NFKD')

export function searchAll(query: string): SearchHit[] {
  const q = norm(query)
  if (!q) return []

  const placeHits: SearchHit[] = places
    .filter(p => norm(p.name).includes(q) || p.tags.some(t => norm(t).includes(q)))
    .map(p => ({
      type: 'place',
      id: p.id,
      title: p.name,
      subtitle: `${p.city} • ${p.tags.join(', ')}`,
      href: `/places/${p.id}`,
    }))

  const eventHits: SearchHit[] = events
    .filter(e => norm(e.title).includes(q) || norm(e.description).includes(q))
    .map(e => ({
      type: 'event',
      id: e.id,
      title: e.title,
      subtitle: `at ${places.find(p => p.id === e.placeId)?.name ?? '—'}`,
      href: `/events/${e.id}`,
    }))

  const performerHits: SearchHit[] = performers
    .filter(a => norm(a.name).includes(q) || norm(a.genre).includes(q))
    .map(a => ({
      type: 'performer',
      id: a.id,
      title: a.name,
      subtitle: a.genre,
      href: `/performers/${a.id}`,
    }))

  return [...placeHits, ...eventHits, ...performerHits].slice(0, 15)
}