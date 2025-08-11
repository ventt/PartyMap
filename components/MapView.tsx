'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import type { Place } from '@/lib/types'
import PlacePopupCard from './PlacePopupCard'

// Fancy pin (CSS driven). Shiny state adds glow + sparkles.
function fancyPinIcon(color: string, shiny: boolean) {
  return L.divIcon({
    className: 'pm-pin-wrapper',
    html: `\n      <div class="pm-pin ${shiny ? 'pm-shiny' : ''}" style="--pin:${color}">\n        <div class='pm-pin-head'>\n          <div class='pm-pin-core'></div>\n          <div class='pm-pin-gloss'></div>\n          <div class='pm-pin-sparkles'>\n            <span class='sp s1'></span>\n            <span class='sp s2'></span>\n            <span class='sp s3'></span>\n          </div>\n        </div>\n        <div class='pm-pin-tail'></div>\n      </div>`,
    iconSize: [36, 48],
    iconAnchor: [18, 44],
    popupAnchor: [0, -38],
  })
}

interface Props { places: Place[]; isDark?: boolean; highlightIds?: string[]; activePlaceId?: string | null }

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

export default function MapView({ places, isDark = false, highlightIds, activePlaceId }: Props) {
  const [active, setActive] = useState<Place | null>(null)
  const center: LatLngTuple = [47.4979, 19.0402]
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = isDark ? '&copy; OSM · © CARTO' : '&copy; OpenStreetMap'

  useEffect(() => {
    if (!activePlaceId) { setActive(null); return }
    const p = places.find(pl => pl.id === activePlaceId)
    if (p) setActive(p)
  }, [activePlaceId, places])

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
          const isHighlighted = !!highlightIds?.includes(p.id)
          const isActive = active?.id === p.id
          const shiny = isHighlighted || isActive
          const baseColor = isActive ? '#ec4899' : (isHighlighted ? '#8b5cf6' : (isDark ? '#475569' : '#334155'))
          const icon = fancyPinIcon(baseColor, shiny)
          const pos: LatLngTuple = [p.location.lat, p.location.lng]
          return (
            <Marker
              key={p.id}
              position={pos}
              icon={icon as any}
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
            offset={[0, -26]} // raised higher so it doesn't cover the pin
            className="place-popup"
            eventHandlers={{ remove: () => setActive(null) }}
          >
            <PlacePopupCard place={active} onClose={() => setActive(null)} />
          </Popup>
        )}
      </MapContainer>
      <style jsx global>{`
        .pm-pin { position:relative; width:34px; height:44px; transform-origin:50% 90%; transition: transform .35s cubic-bezier(.4,.2,.2,1), filter .35s; }
        .pm-pin-head { position:absolute; top:0; left:50%; transform:translateX(-50%); width:28px; height:28px; border-radius:50%; background:radial-gradient(circle at 30% 30%, #fff8, color-mix(in srgb, var(--pin) 85%, #000) 55%, #000 90%); box-shadow:0 2px 4px -1px #000a, 0 0 0 1px #000 inset, 0 0 10px -2px var(--pin); overflow:hidden; }
        .pm-pin-core { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--pin) 65%, #fff) 0, var(--pin) 55%, #000 100%); mix-blend-mode:screen; opacity:.85; }
        .pm-pin-gloss { position:absolute; top:2px; left:5px; width:10px; height:14px; background:linear-gradient(140deg, #fff9, #ffffff05); border-radius:50%; filter:blur(.5px); }
        .pm-pin-tail { position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:12px; height:20px; background:linear-gradient(180deg, var(--pin), color-mix(in srgb, var(--pin) 40%, #000)); clip-path:polygon(50% 0, 100% 20%, 70% 100%, 30% 100%, 0 20%); filter:drop-shadow(0 3px 3px #0008); }
        .pm-pin::after { content:''; position:absolute; bottom:-4px; left:50%; transform:translateX(-50%); width:22px; height:6px; background:radial-gradient(circle at 50% 50%, #0006, #0000 70%); }
        .pm-pin-sparkles { position:absolute; inset:0; pointer-events:none; }
        .pm-pin-sparkles .sp { position:absolute; width:4px; height:4px; background:radial-gradient(circle,#fff,#fff0); border-radius:50%; opacity:0; }
        .pm-pin.pm-shiny .pm-pin-sparkles .sp { animation: pm-spark 2.4s linear infinite; }
        .pm-pin-sparkles .s1 { top:6px; left:6px; animation-delay:.2s; }
        .pm-pin-sparkles .s2 { top:10px; right:6px; animation-delay:1.1s; }
        .pm-pin-sparkles .s3 { bottom:6px; left:12px; animation-delay=1.8s; }
        @keyframes pm-spark { 0% { transform:scale(.4) rotate(0deg); opacity:0; } 10% { opacity:1; transform:scale(1) rotate(45deg); } 35% { opacity:.9; } 60% { opacity:0; transform:scale(.3) rotate(90deg);} 100% { opacity:0; } }
        .pm-pin.pm-shiny { transform:translateY(-3px) scale(1.08); filter:drop-shadow(0 0 6px var(--pin)) drop-shadow(0 0 18px color-mix(in srgb, var(--pin) 60%, transparent)); }
        .pm-pin.pm-shiny .pm-pin-head { box-shadow:0 0 0 1px #000, 0 0 12px -2px var(--pin), 0 0 28px -4px var(--pin); }
        /* Pulse ring */
        .pm-pin.pm-shiny .pm-pin-head::after { content:''; position:absolute; inset:-4px; border:2px solid color-mix(in srgb, var(--pin) 70%, #fff); border-radius:50%; opacity:0; animation: pm-pulse 2.2s ease-out infinite; }
        @keyframes pm-pulse { 0% { transform:scale(.5); opacity:.8; } 60% { opacity:0; } 100% { transform:scale(1.4); opacity:0; } }
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) { .pm-pin.pm-shiny { animation:none; } .pm-pin.pm-shiny .pm-pin-head::after, .pm-pin.pm-shiny .pm-pin-sparkles .sp { animation:none; opacity:.4; } }
      `}</style>
    </div>
  )
}
