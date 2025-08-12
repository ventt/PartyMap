import type { Place } from '@/lib/types'

export type LatLng = { lat: number; lng: number }

export interface Highlighter {
  set(ids: string[]): void
  clear(): void
  get(): string[]
}

export interface PopupController {
  open(id: string): void
  close(id: string): void
  closeAll(): void
  getOpen(): string[]
}

export interface NearbyStrategy {
  find(user: LatLng, places: Place[]): string[]
}

export interface CityDetector {
  detect(user: LatLng, places: Place[]): string | null
}
