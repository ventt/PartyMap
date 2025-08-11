'use client'
import dynamic from 'next/dynamic'
import type { Place } from '@/lib/types'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
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

export default function MapClient({ places }: { places: Place[] }) {
  const { theme } = useTheme()
  const [highlightIds, setHighlightIds] = useState<string[] | undefined>()
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<MapHighlightEventDetail>
      setHighlightIds(ce.detail.placeIds)
      if (ce.detail.placeIds.length === 0) setActivePlaceId(null)
    }
    window.addEventListener(EVENT_NAME, handler as any)
    return () => window.removeEventListener(EVENT_NAME, handler as any)
  }, [])

  useEffect(() => {
    const openHandler = (e: Event) => {
      const ce = e as CustomEvent<{ placeId: string }>
      setActivePlaceId(ce.detail.placeId)
    }
    const closeHandler = () => setActivePlaceId(null)
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

  return <MapView places={places} isDark={theme === 'dark'} highlightIds={highlightIds} activePlaceId={activePlaceId} />
}
