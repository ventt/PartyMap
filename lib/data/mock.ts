import type { Event, Performer, Place } from '../types'

export const places: Place[] = [
  {
    id: 'p1',
    name: 'Danube Club',
    location: { lat: 47.5005, lng: 19.0481 },
    address: 'Riverbank 12',
    city: 'Budapest',
    description: 'Riverside club with two dance floors and a rooftop terrace.',
    image: 'https://images.unsplash.com/photo-1550951064-6f3b49908f07?q=80&w=1280&auto=format&fit=crop',
    tags: ['house', 'techno', 'rooftop'],
  },
  {
    id: 'p2',
    name: 'Ruin Bar 42',
    location: { lat: 47.4984, lng: 19.0593 },
    address: 'Kazinczy u. 14',
    city: 'Budapest',
    description: 'Iconic ruin-bar vibe with eclectic rooms and a courtyard.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1280&auto=format&fit=crop',
    tags: ['ruin bar', 'eclectic', 'indie'],
  },
  {
    id: 'p3',
    name: 'Warehouse X',
    location: { lat: 47.4869, lng: 19.0701 },
    address: 'Kőbányai út 21',
    city: 'Budapest',
    description: 'Industrial warehouse turned into a late-night techno bunker.',
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=1280&auto=format&fit=crop',
    tags: ['techno', 'underground'],
  },
]

export const performers: Performer[] = [
  {
    id: 'a1',
    name: 'DJ Aurora',
    genre: 'Melodic Techno',
    bio: 'Budapest-based DJ known for atmospheric sets and sunrise closers.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1280&auto=format&fit=crop',
    links: [
      { type: 'instagram', url: 'https://instagram.com/djaurora' },
      { type: 'website', url: 'https://aurora.example.com' },
    ],
  },
  {
    id: 'a2',
    name: 'MC Lumen',
    genre: 'Hip-Hop',
    bio: 'High-energy MC bringing the party to life.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1280&auto=format&fit=crop',
  },
  {
    id: 'a3',
    name: 'Klang Duo',
    genre: 'House',
    bio: 'Back-to-back house duo with classic grooves.',
    image: 'https://images.unsplash.com/photo-1548429859-7e7456e610b7?q=80&w=1280&auto=format&fit=crop',
  },
]

export const events: Event[] = [
  {
    id: 'e1',
    title: 'Sunset Sessions',
    placeId: 'p1',
    description: 'Open-air evening by the river with melodic vibes.',
    start: new Date(Date.now() + 86400000).toISOString(),
    end: new Date(Date.now() + 86400000 * 2).toISOString(),
    image: 'https://images.unsplash.com/photo-1540040582279-4d6cdf2d1b8b?q=80&w=1280&auto=format&fit=crop',
    performerIds: ['a1'],
    price: '€15',
  },
  {
    id: 'e2',
    title: 'Basement Breaks',
    placeId: 'p2',
    description: 'Indie and alt mixes in the classic ruin bar setting.',
    start: new Date(Date.now() + 86400000 * 3).toISOString(),
    end: new Date(Date.now() + 86400000 * 3 + 4 * 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1280&auto=format&fit=crop',
    performerIds: ['a3'],
    price: 'Free',
  },
  {
    id: 'e3',
    title: 'Warehouse All-Nighter',
    placeId: 'p3',
    description: 'Raw, pounding techno until sunrise.',
    start: new Date(Date.now() + 86400000 * 5).toISOString(),
    end: new Date(Date.now() + 86400000 * 6).toISOString(),
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=1280&auto=format&fit=crop',
    performerIds: ['a1', 'a2'],
    price: '€20',
  },
]