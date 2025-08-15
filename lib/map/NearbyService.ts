import type { NearbyStrategy, LatLng } from './types'
import type { Place } from '@/lib/types'
import { haversine } from './utils'
import { CityDetectorImpl } from './CityDetector'

export class NearbyService implements NearbyStrategy {
  private detector = new CityDetectorImpl()
  private readonly MIN_RESULTS = 5
  private readonly baseRadii = [3000, 10000, 30000]

  find(user: LatLng, places: Place[]): string[] {
    const ids = this.findInDetectedCity(user, places)
    if (ids.length) return ids
    const global = this.findGlobal(user, places)
    if (global.length) return global
    return [...places]
      .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
      .slice(0, this.MIN_RESULTS)
      .map(p => p.id)
  }

  private findInDetectedCity(user: LatLng, places: Place[]): string[] {
    const city = this.detector.detect(user, places)
    if (!city) return []
    const inCity = places.filter(p => p.city === city)
    let found: Place[] = []
    for (const r of this.baseRadii) {
      const within = inCity.filter(p => haversine(user, p.location) <= r)
      if (within.length) {
        found = within
        if (within.length >= this.MIN_RESULTS) break
      }
    }
    // Pad with closest remaining in city if still short
    if (found.length < this.MIN_RESULTS) {
      const pad = inCity
        .filter(p => !found.some(f => f.id === p.id))
        .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
      found = found.concat(pad.slice(0, Math.max(0, this.MIN_RESULTS - found.length)))
    }
    // Final distance sort so closest always surface first regardless of insertion order
    found = found
      .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
      .slice(0, this.MIN_RESULTS)
    return found.map(p => p.id)
  }

  private findGlobal(user: LatLng, places: Place[]): string[] {
    let found: Place[] = []
    for (const r of this.baseRadii) {
      const within = places.filter(p => haversine(user, p.location) <= r)
      if (within.length) {
        found = within
        if (within.length >= this.MIN_RESULTS) break
      }
    }
    if (found.length < this.MIN_RESULTS) {
      const pad = [...places]
        .filter(p => !found.some(f => f.id === p.id))
        .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
      found = found.concat(pad.slice(0, Math.max(0, this.MIN_RESULTS - found.length)))
    }
    found = found
      .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
      .slice(0, this.MIN_RESULTS)
    return found.map(p => p.id)
  }
}
