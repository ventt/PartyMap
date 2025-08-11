'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Place } from '@/lib/types'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
})

interface Props { places: Place[]; isDark?: boolean }

export default function MapView({ places, isDark = false }: Props) {
  const [active, setActive] = useState<Place | null>(null)
  const center = useMemo(() => ({ lat: 47.4979, lng: 19.0402 }), [])
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

  return (
    <div className="h-full w-full">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution={attribution} url={tileUrl} />
        {places.map((p) => (
          <Marker key={p.id} position={[p.location.lat, p.location.lng]} eventHandlers={{ click: () => setActive(p) }} />
        ))}
        {active && (
          <Popup position={[active.location.lat, active.location.lng]} eventHandlers={{ remove: () => setActive(null) }}>
            <div className="min-w-48">
              <div className="text-sm font-semibold">{active.name}</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-300">{active.address}</div>
              <Link href={`/places/${active.id}`} className="mt-2 inline-block text-sm font-medium text-violet-600 dark:text-violet-300 hover:underline">
                View place →
              </Link>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  )
}
