'use client'
import dynamic from 'next/dynamic'
import type { Place } from '@/lib/types'
import { useTheme } from './ThemeProvider'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapClient({ places }: { places: Place[] }) {
  const { theme } = useTheme()
  return <MapView places={places} isDark={theme === 'dark'} />
}
