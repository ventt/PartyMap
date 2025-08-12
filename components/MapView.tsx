'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
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

interface Props { places: Place[]; isDark?: boolean; highlightIds?: string[]; activePlaceId?: string | null; activePlaceIds?: string[] }

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

// Ask for browser geolocation, center map, and show a pulsing marker when permitted
function UserLocation({ auto = true }: { auto?: boolean }) {
  const map = useMap()
  const [pos, setPos] = useState<LatLngTuple | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  useEffect(() => {
    if (!auto || typeof window === 'undefined' || !('geolocation' in navigator)) return
    const opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }

    navigator.geolocation.getCurrentPosition(
      (g) => {
        const p: LatLngTuple = [g.coords.latitude, g.coords.longitude]
        setPos(p)
        setAccuracy(g.coords.accuracy ?? null)
        try { window.dispatchEvent(new CustomEvent('pm:user-position', { detail: { lat: p[0], lng: p[1] } })) } catch {}
        try { map.flyTo(p, Math.max(map.getZoom(), 14), { duration: 0.8 }) } catch {}
      },
      () => { /* ignore denied/unavailable */ },
      opts
    )

    const id = navigator.geolocation.watchPosition(
      (g) => {
        const p: LatLngTuple = [g.coords.latitude, g.coords.longitude]
        setPos(p)
        setAccuracy(g.coords.accuracy ?? null)
        try { window.dispatchEvent(new CustomEvent('pm:user-position', { detail: { lat: p[0], lng: p[1] } })) } catch {}
      },
      () => {},
      opts
    )

    return () => {
      try { navigator.geolocation.clearWatch?.(id as any) } catch {}
    }
  }, [map, auto])

  if (!pos) return null

  const youIcon = L.divIcon({
    className: 'pm-you-wrapper',
    html: "<div class='pm-you'><span class='glow'></span><span class='ring'></span><span class='core'></span><span class='wave w1'></span><span class='wave w2'></span></div>",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  return (
    <>
      {accuracy && (
        <Circle
          center={pos as any}
          radius={Math.min(accuracy, 200)}
          pathOptions={{ color: '#60a5fa', weight: 1, opacity: 0.8, fillColor: '#60a5fa', fillOpacity: 0.12 }}
        />
      )}
      <Marker position={pos} icon={youIcon as any} />
    </>
  )
}

// Desktop-only custom zoom controls (glassmorphism)
function DesktopZoomControls() {
  const map = useMap()
  return (
    <div className="hidden md:flex absolute right-4 top-24 z-[1000] select-none">
      <div className="flex flex-col overflow-hidden rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 shadow-lg divide-y divide-black/10 dark:divide-white/10">
        <button
          aria-label="Zoom in"
          className="h-11 w-11 grid place-items-center text-slate-800 dark:text-slate-100 hover:bg-white/90 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 active:scale-95"
          onClick={() => map.zoomIn()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
        <button
          aria-label="Zoom out"
          className="h-11 w-11 grid place-items-center text-slate-800 dark:text-slate-100 hover:bg-white/90 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 active:scale-95"
          onClick={() => map.zoomOut()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function MapView({ places, isDark = false, highlightIds, activePlaceId, activePlaceIds }: Props) {
  // Single-popup state
  const [openPopupId, setOpenPopupId] = useState<string | null>(null)
  const center: LatLngTuple = [47.4979, 19.0402]
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = isDark ? '&copy; OSM · © CARTO' : '&copy; OpenStreetMap'

  // Sync incoming controls from parent (prefer single id)
  useEffect(() => {
    if (activePlaceId) {
      setOpenPopupId(activePlaceId)
      return
    }
    if (activePlaceIds && activePlaceIds.length) {
      setOpenPopupId(activePlaceIds[0])
      return
    }
    // If both are cleared
    if (!activePlaceIds && !activePlaceId) setOpenPopupId(null)
  }, [activePlaceId, activePlaceIds])

  // Close all popups on global pm:close-popups (e.g., Clear button)
  useEffect(() => {
    const onCloseAll = () => setOpenPopupId(null)
    window.addEventListener('pm:close-popups', onCloseAll as any)
    return () => window.removeEventListener('pm:close-popups', onCloseAll as any)
  }, [])

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
        {/* Geolocate user and center map if allowed */}
        <UserLocation />
        {/* Custom desktop zoom controls */}
        <DesktopZoomControls />
        {places.map((p) => {
          const isHighlighted = !!highlightIds?.includes(p.id)
          const isActive = openPopupId === p.id
          const shiny = isHighlighted || isActive
          const baseColor = isActive ? '#ec4899' : (isHighlighted ? '#8b5cf6' : (isDark ? '#475569' : '#334155'))
          const icon = fancyPinIcon(baseColor, shiny)
          const pos: LatLngTuple = [p.location.lat, p.location.lng]
          return (
            <Marker
              key={p.id}
              position={pos}
              icon={icon as any}
              eventHandlers={{
                click: () => setOpenPopupId(prev => prev === p.id ? null : p.id)
              }}
            />
          )
        })}
        {/* Render only one popup at a time */}
        {(() => {
          const p = openPopupId ? places.find(x => x.id === openPopupId) : undefined
          if (!p) return null
          return (
            <Popup
              key={`popup-${p.id}`}
              position={[p.location.lat, p.location.lng] as LatLngTuple}
              autoPan
              closeOnClick
              autoClose
              offset={[0, -26]}
              className="place-popup"
              eventHandlers={{ remove: () => setOpenPopupId(prev => (prev === p.id ? null : prev)) }}
            >
              <PlacePopupCard place={p} onClose={() => setOpenPopupId(prev => (prev === p.id ? null : prev))} />
            </Popup>
          )
        })()}
      </MapContainer>
      {/* styles moved to app/map.css */}
    </div>
  )
}
