'use client'
import dynamic from 'next/dynamic'
import type { Place } from '@/lib/types'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<MapHighlightEventDetail>
      setHighlightIds(ce.detail.placeIds)
    }
    window.addEventListener(EVENT_NAME, handler as any)
    return () => window.removeEventListener(EVENT_NAME, handler as any)
  }, [])

  return <MapView places={places} isDark={theme === 'dark'} highlightIds={highlightIds} />
}
