// Minimal override typings to satisfy properties used in the project.
// This avoids using any-casts in component code while keeping compile-time safety for the used props.

import * as React from 'react'
import type { Map as LeafletMap, Icon, LatLngExpression } from 'leaflet'

declare module 'react-leaflet' {
  export interface MapContainerProps {
    center: LatLngExpression
    zoom?: number
    children?: React.ReactNode
    scrollWheelZoom?: boolean | 'center'
    zoomControl?: boolean
    className?: string
    style?: React.CSSProperties
  }
  export const MapContainer: React.ComponentType<MapContainerProps>

  export interface TileLayerProps {
    url: string
    attribution?: string
  }
  export const TileLayer: React.ComponentType<TileLayerProps>

  export interface MarkerProps {
    position: LatLngExpression
    icon?: Icon
    eventHandlers?: Record<string, (...args: any[]) => void>
  }
  export const Marker: React.ComponentType<MarkerProps>

  export interface PopupProps {
    position: LatLngExpression
    autoPan?: boolean
    autoPanPadding?: [number, number]
    closeOnClick?: boolean
    offset?: [number, number]
    eventHandlers?: Record<string, (...args: any[]) => void>
    children?: React.ReactNode
  }
  export const Popup: React.ComponentType<PopupProps>

  export function useMap(): LeafletMap
}
