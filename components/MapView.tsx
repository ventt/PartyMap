'use client'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { useMemo, useState } from 'react'
import type { Place } from '@/lib/types'
import PlacePopupCard from './PlacePopupCard'
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
  const attribution = isDark ? '&copy; OSM · © CARTO' : '&copy; OpenStreetMap'

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer attribution={attribution} url={tileUrl} />

        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.location.lat, p.location.lng]}
            eventHandlers={{ click: () => setActive(p) }}
          />
        ))}

        {active && (
          <Popup
            position={[active.location.lat, active.location.lng]}
            className="place-popup"
            autoPan
            autoPanPadding={[16, 120]}
            closeOnClick={false}
            offset={[0, -6]}
            eventHandlers={{ remove: () => setActive(null) }}
          >
            <PlacePopupCard place={active} onClose={() => setActive(null)} />
          </Popup>
        )}
      </MapContainer>
    </div>
  )
}
