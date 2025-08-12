import type { LatLng } from './types'
import type { Place } from '@/lib/types'

export function haversine(a: LatLng, b: LatLng): number {
  const toRad = (n: number) => (n * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sa = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1-sa))
  return R * c
}

export function centroid(places: Place[]): LatLng {
  if (!places.length) return { lat: 0, lng: 0 }
  const c = places.reduce((acc, p) => ({ lat: acc.lat + p.location.lat, lng: acc.lng + p.location.lng }), { lat: 0, lng: 0 })
  return { lat: c.lat / places.length, lng: c.lng / places.length }
}
