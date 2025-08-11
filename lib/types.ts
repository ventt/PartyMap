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