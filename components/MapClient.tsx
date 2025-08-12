'use client'
import dynamic from 'next/dynamic'
import type { Place } from '@/lib/types'
import { useTheme } from './ThemeProvider'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { HighlighterImpl } from '@/lib/map/Highlighter'
import { NearbyService } from '@/lib/map/NearbyService'
import type { LatLng } from '@/lib/map/types'
import { PopupControllerImpl } from '@/lib/map/PopupController'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapClient({ places }: { places: Place[] }) {
  const { theme } = useTheme()
  const [highlightIds, setHighlightIds] = useState<string[] | undefined>()
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const [activePlaceIds, setActivePlaceIds] = useState<string[] | null>(null)
  const [lastUserPos, setLastUserPos] = useState<LatLng | null>(null)
  const [lastUserPosAt, setLastUserPosAt] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const highlighterRef = useRef(new HighlighterImpl())
  const nearbyRef = useRef(new NearbyService())
  const popupRef = useRef(new PopupControllerImpl())

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ placeIds: string[] }>
      setHighlightIds(ce.detail.placeIds)
      if (ce.detail.placeIds.length === 0) { setActivePlaceId(null); setActivePlaceIds(null) }
    }
    window.addEventListener('pm:highlight-places', handler as any)
    return () => window.removeEventListener('pm:highlight-places', handler as any)
  }, [])

  useEffect(() => {
    const onUserPos = (e: Event) => {
      const ce = e as CustomEvent<LatLng>
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
      highlighterRef.current.set([focus])
      popupRef.current.open(focus)
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
    const toast = (message: string) => { try { window.dispatchEvent(new CustomEvent('pm:toast', { detail: { message } })) } catch {} }

    const onNearby = () => {
      const finish = (ids: string[]) => {
        if (!ids.length) {
          toast('No events around you')
          highlighterRef.current.clear()
          popupRef.current.closeAll()
          setActivePlaceId(null)
          setActivePlaceIds(null)
        } else {
          highlighterRef.current.set(ids)
          popupRef.current.closeAll()
          setActivePlaceId(null)
          setActivePlaceIds(null)
          try { window.dispatchEvent(new CustomEvent('pm:nearby-result', { detail: { ids } })) } catch {}
        }
      }

      // Use fresh position instantly
      if (lastUserPos && lastUserPosAt && (Date.now() - lastUserPosAt) <= 120000) {
        const ids = nearbyRef.current.find(lastUserPos, places)
        return finish(ids)
      }

      // Race quick geolocation vs city fallback
      let done = false
      const finishOnce = (fn: () => void) => { if (!done) { done = true; fn() } }

      const computeFromPrimaryCity = () => {
        const list = primaryCity.list
        if (!list.length) return finish([])
        const ids = list.slice(0, 5).map(p => p.id)
        finish(ids)
      }

      if ('geolocation' in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            g => finishOnce(() => finish(nearbyRef.current.find({ lat: g.coords.latitude, lng: g.coords.longitude }, places))),
            () => finishOnce(() => computeFromPrimaryCity()),
            { enableHighAccuracy: false, timeout: 1500, maximumAge: 600000 }
          )
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
