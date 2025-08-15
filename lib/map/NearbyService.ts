import type { NearbyStrategy, LatLng } from './types'
import type { Place } from '@/lib/types'
import { haversine } from './utils'
import { CityDetectorImpl } from './CityDetector'

export class NearbyService implements NearbyStrategy {
  private detector = new CityDetectorImpl()
  private readonly MIN_RESULTS = 5
  private readonly baseRadii = [3000, 10000, 30000]
  // Radius limits (meters): collect within 30km; extend to 35km only if still under MIN_RESULTS
  private readonly HARD_RADIUS = 30000
  private readonly EXTENDED_RADIUS = 35000

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
    // Distance-constrained padding logic
    const distance = (p: Place) => haversine(user, p.location)
    // Remove anything beyond HARD radius (shouldn't happen yet) and keep only within HARD for initial consideration
    let within30 = found.filter(p => distance(p) <= this.HARD_RADIUS)
    if (!within30.length) {
      within30 = inCity.filter(p => distance(p) <= this.HARD_RADIUS)
    }
    within30 = within30.sort((a,b) => distance(a) - distance(b))
    if (within30.length >= this.MIN_RESULTS) return within30.slice(0, this.MIN_RESULTS).map(p => p.id)

    // Need extension: gather same-city places in 30-35km band
    const bandSameCity = inCity
      .filter(p => distance(p) > this.HARD_RADIUS && distance(p) <= this.EXTENDED_RADIUS)
      .sort((a,b) => distance(a) - distance(b))
    let combined = [...within30]
    for (const p of bandSameCity) {
      if (combined.length >= this.MIN_RESULTS) break
      combined.push(p)
    }
    if (combined.length >= this.MIN_RESULTS) return combined.slice(0, this.MIN_RESULTS).map(p => p.id)

    // If still short, allow cross-city supplementation but only within limits (<=35km)
    const cross = places
      .filter(p => !combined.some(c => c.id === p.id) && distance(p) <= this.EXTENDED_RADIUS)
      .sort((a,b) => distance(a) - distance(b))
    for (const p of cross) {
      if (combined.length >= this.MIN_RESULTS) break
      combined.push(p)
    }
    // Final list (may be < MIN_RESULTS if insufficient places within extended radius)
    return combined
      .sort((a,b) => distance(a) - distance(b))
      .slice(0, this.MIN_RESULTS)
      .map(p => p.id)
  }

  private findGlobal(user: LatLng, places: Place[]): string[] {
    const distance = (p: Place) => haversine(user, p.location)
    // Collect within hard radius first
    let within30 = places.filter(p => distance(p) <= this.HARD_RADIUS)
      .sort((a,b) => distance(a) - distance(b))
    if (within30.length >= this.MIN_RESULTS) return within30.slice(0, this.MIN_RESULTS).map(p => p.id)
    // Extend band up to EXTENDED_RADIUS
    const band = places
      .filter(p => distance(p) > this.HARD_RADIUS && distance(p) <= this.EXTENDED_RADIUS)
      .sort((a,b) => distance(a) - distance(b))
    let combined = [...within30]
    for (const p of band) {
      if (combined.length >= this.MIN_RESULTS) break
      combined.push(p)
    }
    return combined
      .sort((a,b) => distance(a) - distance(b))
      .slice(0, this.MIN_RESULTS)
      .map(p => p.id)
  }
}
