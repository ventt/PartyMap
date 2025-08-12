'use client'
import dynamic from 'next/dynamic'
import type { Place } from '@/lib/types'
import { useTheme } from './ThemeProvider'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

// Lightweight event bus via window dispatch
export type MapHighlightEventDetail = { placeIds: string[] }
const EVENT_NAME = 'pm:highlight-places'

export function highlightPlaces(placeIds: string[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<MapHighlightEventDetail>(EVENT_NAME, { detail: { placeIds } }))
  }
}

function toast(message: string) {
  try { window.dispatchEvent(new CustomEvent('pm:toast', { detail: { message } })) } catch {}
}

// Haversine distance in meters
function haversine(a: {lat:number; lng:number}, b: {lat:number; lng:number}) {
  const toRad = (n: number) => (n * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sa = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1-sa))
  return R * c
}

function detectUserCity(user: {lat:number; lng:number}, places: Place[]): string | null {
  if (!places.length) return null
  const nearest = [...places].sort((a,b) => haversine(user, a.location) - haversine(user, b.location))[0]
  if (!nearest) return null
  const d = haversine(user, nearest.location)
  // If nearest known place is within 30km, assume we're in that city (Budafok->Budapest works well)
  if (d <= 30000) return nearest.city
  // Fallback: pick a city with at least 2 places within 12km
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

export default function MapClient({ places }: { places: Place[] }) {
  const { theme } = useTheme()
  const [highlightIds, setHighlightIds] = useState<string[] | undefined>()
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const [activePlaceIds, setActivePlaceIds] = useState<string[] | null>(null)
  const [lastUserPos, setLastUserPos] = useState<{lat:number; lng:number} | null>(null)
  const [lastUserPosAt, setLastUserPosAt] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<MapHighlightEventDetail>
      setHighlightIds(ce.detail.placeIds)
      if (ce.detail.placeIds.length === 0) { setActivePlaceId(null); setActivePlaceIds(null) }
    }
    window.addEventListener(EVENT_NAME, handler as any)
    return () => window.removeEventListener(EVENT_NAME, handler as any)
  }, [])

  useEffect(() => {
    const onUserPos = (e: Event) => {
      const ce = e as CustomEvent<{ lat:number; lng:number }>
      setLastUserPos({ lat: ce.detail.lat, lng: ce.detail.lng })
      setLastUserPosAt(Date.now())
    }
    window.addEventListener('pm:user-position', onUserPos as any)
    return () => window.removeEventListener('pm:user-position', onUserPos as any)
  }, [])

  useEffect(() => {
    const openHandler = (e: Event) => {
      const ce = e as CustomEvent<{ placeId: string }>
      setActivePlaceId(ce.detail.placeId)
      setActivePlaceIds(null)
    }
    const closeHandler = () => { setActivePlaceId(null); setActivePlaceIds(null) }
    window.addEventListener('pm:open-place-popup', openHandler as any)
    window.addEventListener('pm:close-popups', closeHandler as any)
    return () => {
      window.removeEventListener('pm:open-place-popup', openHandler as any)
      window.removeEventListener('pm:close-popups', closeHandler as any)
    }
  }, [])

  useEffect(() => {
    const focus = searchParams?.get('focus')
    if (focus) {
      // highlight + open popup (FitToHighlights handles flyTo)
      highlightPlaces([focus])
      window.dispatchEvent(new CustomEvent('pm:open-place-popup', { detail: { placeId: focus } }))
      // Optionally clean param (shallow)
      const url = new URL(window.location.href)
      url.searchParams.delete('focus')
      router.replace(url.pathname + url.search + url.hash, { scroll: false })
    }
  }, [searchParams, router])

  const primaryCity = useMemo(() => {
    const byCity = new Map<string, Place[]>()
    for (const p of places) {
      byCity.set(p.city, [...(byCity.get(p.city) ?? []), p])
    }
    let maxCity = ''
    let maxCount = 0
    for (const [city, arr] of byCity.entries()) {
      if (arr.length > maxCount) { maxCity = city; maxCount = arr.length }
    }
    return { city: maxCity, list: byCity.get(maxCity) ?? places }
  }, [places])

  useEffect(() => {
    const onNearby = () => {
      const MIN_RESULTS = 5
      const baseRadii = [3000, 10000, 30000]

      const openWith = (found: Place[]) => {
        if (!found.length) {
          toast('No events around you')
          highlightPlaces([])
          setActivePlaceId(null)
          setActivePlaceIds(null)
          return
        }
        const ids = found.slice(0, MIN_RESULTS).map(f => f.id)
        // Highlight only; do not open any popups
        highlightPlaces(ids)
        // Ensure any previously open popups are closed
        setActivePlaceId(null)
        setActivePlaceIds(null)
        try { window.dispatchEvent(new CustomEvent('pm:nearby-result', { detail: { ids } })) } catch {}
      }

      const computeForPos = (user: {lat:number; lng:number}) => {
        const city = detectUserCity(user, places)
        // 1) within detected city first
        if (city) {
          const inCity = places.filter(p => p.city === city)
          let found: Place[] = []
          for (const r of baseRadii) {
            found = inCity.filter(p => haversine(user, p.location) <= r)
            if (found.length >= MIN_RESULTS) break
          }
          if (found.length < MIN_RESULTS) {
            const pad = inCity
              .filter(p => !found.some(f => f.id === p.id))
              .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
            found = found.concat(pad.slice(0, Math.max(0, MIN_RESULTS - found.length)))
          }
          if (found.length) return openWith(found)
        }
        // 2) global adaptive radii
        let globalFound: Place[] = []
        for (const r of baseRadii) {
          globalFound = places.filter(p => haversine(user, p.location) <= r)
          if (globalFound.length >= MIN_RESULTS) break
        }
        if (globalFound.length < MIN_RESULTS) {
          const pad = [...places]
            .filter(p => !globalFound.some(f => f.id === p.id))
            .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
          globalFound = globalFound.concat(pad.slice(0, Math.max(0, MIN_RESULTS - globalFound.length)))
        }
        if (globalFound.length) return openWith(globalFound)
        // 3) absolute nearest
        const fallback = [...places]
          .sort((a,b) => haversine(user, a.location) - haversine(user, b.location))
          .slice(0, MIN_RESULTS)
        return openWith(fallback)
      }

      const computeFromPrimaryCity = () => {
        const list = primaryCity.list
        if (!list.length) return openWith([])
        const center = list.reduce((acc, p) => ({ lat: acc.lat + p.location.lat, lng: acc.lng + p.location.lng }), { lat: 0, lng: 0 })
        center.lat /= list.length
        center.lng /= list.length
        const found = [...list]
          .sort((a,b) => haversine(center, a.location) - haversine(center, b.location))
          .slice(0, MIN_RESULTS)
        return openWith(found)
      }

      // Instant if we already have a fresh user position (<= 2 minutes old)
      if (lastUserPos && lastUserPosAt && (Date.now() - lastUserPosAt) <= 120000) {
        return computeForPos(lastUserPos)
      }

      // Otherwise, race a quick geolocation (short timeout, allow cached) vs. city fallback
      let done = false
      const finishOnce = (fn: () => void) => { if (!done) { done = true; fn() } }

      if ('geolocation' in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            g => finishOnce(() => computeForPos({ lat: g.coords.latitude, lng: g.coords.longitude })),
            () => finishOnce(() => computeFromPrimaryCity()),
            { enableHighAccuracy: false, timeout: 1500, maximumAge: 600000 }
          )
          // Also set a fast fallback in case the browser stalls
          setTimeout(() => finishOnce(() => computeFromPrimaryCity()), 500)
        } catch {
          finishOnce(() => computeFromPrimaryCity())
        }
      } else {
        finishOnce(() => computeFromPrimaryCity())
      }
    }
    window.addEventListener('pm:nearby', onNearby)
    return () => window.removeEventListener('pm:nearby', onNearby)
  }, [places, lastUserPos, lastUserPosAt, primaryCity])

  return <MapView places={places} isDark={theme === 'dark'} highlightIds={highlightIds} activePlaceId={activePlaceId} activePlaceIds={activePlaceIds ?? undefined} />
}
