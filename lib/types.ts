export type ID = string

export type GeoPoint = {
  lat: number
  lng: number
}

export type Place = {
  id: ID
  name: string
  location: GeoPoint
  address: string
  city: string
  description: string
  image: string
  tags: string[]
}

export type Performer = {
  id: ID
  name: string
  genre: string
  bio: string
  image: string
  links?: { type: 'instagram' | 'facebook' | 'website'; url: string }[]
}

export type Event = {
  id: ID
  title: string
  placeId: ID
  description: string
  start: string // ISO
  end: string // ISO
  image: string
  performerIds: ID[]
  price?: string
  kind: EventType
}

export type EventType = 'disco' | 'techno' | 'festival' | 'jazz' | 'alter' | 'home' | 'pub'

// Central color/style mapping for event types (base brand color).
// Extend later with additional properties (e.g., gradients, dark variants) if needed.
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  disco: '#ec4899',      // pink-500
  techno: '#6366f1',     // indigo-500
  festival: '#10b981',   // emerald-500
  jazz: '#f59e0b',       // amber-500
  alter: '#d946ef',      // fuchsia-500
  home: '#06b6d4',       // cyan-500
  pub: '#92400e',        // amber-900 (deep brownish for pub)
}

// Tailwind-friendly badge class mapping (text on solid background) – optional future use.
export const EVENT_TYPE_BADGE_CLASSES: Record<EventType, string> = {
  disco: 'bg-pink-500 text-white',
  techno: 'bg-indigo-500 text-white',
  festival: 'bg-emerald-500 text-white',
  jazz: 'bg-amber-500 text-white',
  alter: 'bg-fuchsia-500 text-white',
  home: 'bg-cyan-500 text-white',
  pub: 'bg-amber-900 text-amber-50',
}

// Human-readable display labels (separate from slug value), used for UI badges
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  disco: 'Disco',
  techno: 'Techno',
  festival: 'Festival',
  jazz: 'Jazz',
  alter: 'Alter',
  home: 'House Party',
  pub: 'Pub',
}

export type SearchHit = {
  type: 'place' | 'event' | 'performer' | 'tag' // added 'tag'
  id: ID
  title: string
  subtitle: string
  href: string
  image: string // new: thumbnail
  placeId?: ID // for event hits (and could mirror place for convenience)
  nextEventStart?: string // ISO of next upcoming related event (event itself, or linked to place/performer)
}