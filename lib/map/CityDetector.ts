import type { CityDetector } from './types'
import type { Place } from '@/lib/types'
import { haversine } from './utils'

export class CityDetectorImpl implements CityDetector {
  detect(user: { lat: number; lng: number }, places: Place[]): string | null {
    if (!places.length) return null
    const nearest = [...places].sort((a,b) => haversine(user, a.location) - haversine(user, b.location))[0]
    if (!nearest) return null
    const d = haversine(user, nearest.location)
    if (d <= 30000) return nearest.city
    const byCity = new Map<string, Place[]>()
    for (const p of places) byCity.set(p.city, [...(byCity.get(p.city) ?? []), p])
    let candidate: string | null = null
    let best = 0
    for (const [city, list] of byCity.entries()) {
      const count = list.filter(p => haversine(user, p.location) <= 12000).length
      if (count > best) { best = count; candidate = city }
    }
    return candidate
  }
}
