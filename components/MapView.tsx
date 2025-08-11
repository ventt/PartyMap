'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { LatLngTuple, Icon } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import type { Place } from '@/lib/types'
import PlacePopupCard from './PlacePopupCard'

// Inline SVG markers (default + highlight) to avoid network 404s
const makeMarker = (color: string) => new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41' fill='none'><path d='M12.5 0C5.596 0 0 5.61 0 12.536c0 2.34.64 4.685 1.85 6.73L11.6 39.52c.17.31.5.5.86.5.36 0 .69-.19.86-.5l9.75-20.254A12.5 12.5 0 0 0 25 12.536C25 5.61 19.404 0 12.5 0Z' fill='${color}'/><circle cx='12.5' cy='12.5' r='5.5' fill='white'/></svg>`),
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -38],
})
const defaultMarker: Icon = makeMarker('#3b82f6')
const highlightMarker: Icon = makeMarker('#7256d9')

interface Props { places: Place[]; isDark?: boolean; highlightIds?: string[] }

function FitToHighlights({ places, highlightIds }: { places: Place[]; highlightIds?: string[] }) {
  const map = useMap()
  useEffect(() => {
    if (!highlightIds || highlightIds.length === 0) return
    const targets = places.filter(p => highlightIds.includes(p.id))
    if (targets.length === 0) return
    if (targets.length === 1) {
      const t = targets[0]
      map.flyTo([t.location.lat, t.location.lng], 15, { duration: 0.6 })
      return
    }
    const bounds = L.latLngBounds(targets.map(t => [t.location.lat, t.location.lng]) as LatLngTuple[])
    map.flyToBounds(bounds.pad(0.2), { duration: 0.8 })
  }, [highlightIds, places, map])
  return null
}

export default function MapView({ places, isDark = false, highlightIds }: Props) {
  const [active, setActive] = useState<Place | null>(null)
  const center: LatLngTuple = [47.4979, 19.0402]
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = isDark ? '&copy; OSM · © CARTO' : '&copy; OpenStreetMap'

  return (
    <div className="h-full w-full relative z-0">
      {/* center + other props typed via module augmentation */}
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer attribution={attribution} url={tileUrl} />
        <FitToHighlights places={places} highlightIds={highlightIds} />
        {places.map((p) => {
          const isHighlighted = highlightIds?.includes(p.id)
          const pos: LatLngTuple = [p.location.lat, p.location.lng]
          return (
            <Marker
              key={p.id}
              position={pos}
              icon={isHighlighted ? highlightMarker : defaultMarker}
              eventHandlers={{ click: () => setActive(p) }}
            />
          )
        })}
        {active && (
          <Popup
            position={[active.location.lat, active.location.lng] as LatLngTuple}
            autoPan
            autoPanPadding={[16, 120] as any}
            closeOnClick={false}
            offset={[0, -6]}
            className="place-popup"
            eventHandlers={{ remove: () => setActive(null) }}
          >
            <PlacePopupCard place={active} onClose={() => setActive(null)} />
          </Popup>
        )}
      </MapContainer>
    </div>
  )
}
