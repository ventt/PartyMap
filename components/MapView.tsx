'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import type { Place, Event, EventType } from '@/lib/types'
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

interface Props { places: Place[]; events: Event[]; isDark?: boolean; highlightIds?: string[]; activePlaceId?: string | null; activePlaceIds?: string[] }

// Floating labels above pins showing event name, place, and type tag
function PlaceLabels({
  places,
  eventsByPlace,
  highlightIds,
  openPopupId,
  onOpen,
}: {
  places: Place[]
  eventsByPlace: Map<string, Event[]>
  highlightIds?: string[]
  openPopupId: string | null
  onOpen: (id: string) => void
}) {
  const map = useMap()
  const [, force] = useState(0)

  useEffect(() => {
    const rerender = () => force(c => c + 1)
    map.on('move', rerender)
    map.on('zoom', rerender)
    return () => {
      map.off('move', rerender)
      map.off('zoom', rerender)
    }
  }, [map])

  const size = map.getSize()
  const centerPt = size.divideBy(2)
  const maxDist = Math.min(size.x, size.y) * 0.9
  const zoom = map.getZoom()
  const baseMinLabelZoom = 12
  const highlightMinLabelZoom = 10 // allow labels earlier when there is a selection/highlight
  const hasHighlights = !!(highlightIds && highlightIds.length)
  const minLabelZoom = hasHighlights ? highlightMinLabelZoom : baseMinLabelZoom

  const typeColors: Record<EventType, string> = {
    disco: 'bg-pink-500',
    techno: 'bg-indigo-500',
    festival: 'bg-emerald-500',
    jazz: 'bg-amber-500',
    alter: 'bg-fuchsia-500',
  }

  const now = Date.now()

  return (
    <div className="absolute inset-0 pointer-events-none z-[600] select-none">
  {zoom < minLabelZoom ? null : places.map(p => {
        const pt = map.latLngToContainerPoint([p.location.lat, p.location.lng])
        if (pt.x < -80 || pt.y < -80 || pt.x > size.x + 80 || pt.y > size.y + 80) return null

        const isHighlighted = !!highlightIds?.includes(p.id)
        const isActive = openPopupId === p.id
        const evts = eventsByPlace.get(p.id) || []
        const upcoming = evts
          .slice()
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
          .find(e => new Date(e.end).getTime() >= now) || evts[0]
        if (!upcoming) return null
        let opacity = 1
        if (!isHighlighted && !isActive) {
          const dist = centerPt.distanceTo(pt)
            ; (opacity = 1 - dist / maxDist)
          opacity = Math.max(0.15, Math.min(1, opacity))
        }
        const tagColor = typeColors[upcoming.kind]
        const offsetY = (isHighlighted || isActive) ? -80 : -72 // lift a bit more for shiny pins so text sits cleanly above
        return (
      <div
            key={`lbl-${p.id}`}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y,
        transform: `translate(-50%, ${offsetY}px)`,
              opacity,
            }}
            className="transition-opacity duration-200"
          >
            <button
              type="button"
              onClick={() => onOpen(p.id)}
              className="pointer-events-auto focus:outline-none group text-center"
              aria-label={`Open ${upcoming.title}`}
            >
              <span className="block mx-auto max-w-[150px] text-[11px] font-semibold leading-tight pm-line-clamp-2 text-slate-800 dark:text-slate-100 drop-shadow-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.55)] group-hover:text-pink-600 dark:group-hover:text-pink-300">
                {upcoming.title}
              </span>
              <div className="mt-0.5 flex items-center gap-1 justify-center">
                <span className="text-[9px] uppercase tracking-wide font-medium text-slate-600 dark:text-slate-400 [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
                  {p.name}
                </span>
                <span className={`text-[9px] leading-none font-semibold text-white px-1 py-0.5 rounded ${tagColor} shadow [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]`}>{upcoming.kind}</span>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

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

export default function MapView({ places, events, isDark = false, highlightIds, activePlaceId, activePlaceIds }: Props) {
  // Single-popup state
  const [openPopupId, setOpenPopupId] = useState<string | null>(null)
  const eventsByPlace = new Map<string, Event[]>()
  for (const e of events) {
    eventsByPlace.set(e.placeId, [...(eventsByPlace.get(e.placeId) || []), e])
  }
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
  {/* Floating labels */}
  <PlaceLabels places={places} eventsByPlace={eventsByPlace} highlightIds={highlightIds} openPopupId={openPopupId} onOpen={(id) => setOpenPopupId(prev => prev === id ? null : id)} />
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
