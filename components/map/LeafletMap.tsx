'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import DumpsterMarker from './DumpsterMarker'
import MapLegend from './MapLegend'

interface DumpsterData {
  id: string
  unitId: string
  sizeYd: number
  status: string
  lat: number | null
  lng: number | null
  jobs?: Array<{
    customer: { id: string; name: string; phone: string; address: string } | null
    driver: { id: string; name: string } | null
    daysOnSite: number
  }>
}

interface LeafletMapProps {
  dumpsters: DumpsterData[]
  height?: string
  onPinClick?: (dumpster: DumpsterData) => void
  showLegend?: boolean
}

export default function LeafletMap({
  dumpsters,
  height = '400px',
  onPinClick,
  showLegend = true,
}: LeafletMapProps) {
  const placedDumpsters = dumpsters.filter((d) => d.lat !== null && d.lng !== null)

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={[38.9517, -92.3341]}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        preferCanvas
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        {placedDumpsters.map((dumpster) => (
          <DumpsterMarker
            key={dumpster.id}
            dumpster={dumpster as any}
            onOpenJob={onPinClick}
          />
        ))}
      </MapContainer>
      {showLegend && <MapLegend />}
    </div>
  )
}
