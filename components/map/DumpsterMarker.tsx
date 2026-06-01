'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getDumpsterPinColor, formatPhone, getStatusLabel } from '@/lib/utils'
import { useNewJobModal } from '@/store/useNewJobModal'

interface DumpsterData {
  id: string
  unitId: string
  sizeYd: number
  status: string
  lat: number
  lng: number
  jobs?: Array<{
    customer: { id: string; name: string; phone: string; address: string } | null
    driver: { id: string; name: string } | null
    daysOnSite: number
  }>
}

function createDumpsterIcon(status: string, unitId: string) {
  const color = getDumpsterPinColor(status)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <ellipse cx="24" cy="52" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>
      <path d="M24 2 C13 2 4 11 4 22 C4 36 24 52 24 52 C24 52 44 36 44 22 C44 11 35 2 24 2Z"
        fill="${color}" filter="url(#shadow)" opacity="0.95"/>
      <circle cx="24" cy="22" r="12" fill="rgba(0,0,0,0.25)"/>
      <text x="24" y="27" text-anchor="middle" font-size="8" font-family="Fira Code, monospace"
        font-weight="600" fill="white">${unitId}</text>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [48, 56],
    iconAnchor: [24, 52],
    popupAnchor: [0, -52],
  })
}

interface Props {
  dumpster: DumpsterData
  onOpenJob?: (dumpster: DumpsterData) => void
}

export default function DumpsterMarker({ dumpster, onOpenJob }: Props) {
  const openModal = useNewJobModal((s) => s.open)
  const activeJob = dumpster.jobs?.[0]
  const customer = activeJob?.customer

  const handleOpenJob = () => {
    openModal({
      dumpsterId: dumpster.id,
      unitId: dumpster.unitId,
      sizeYd: dumpster.sizeYd,
      daysOnSite: activeJob?.daysOnSite,
      customerId: customer?.id,
      customerName: customer?.name,
      phone: customer?.phone,
      address: customer?.address,
      lat: dumpster.lat,
      lng: dumpster.lng,
      jobType: 'PICKUP',
    })
    if (onOpenJob) onOpenJob(dumpster)
  }

  return (
    <Marker
      position={[dumpster.lat, dumpster.lng]}
      icon={createDumpsterIcon(dumpster.status, dumpster.unitId)}
    >
      <Popup maxWidth={280}>
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'Fira Code, monospace', fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>
              {dumpster.unitId}
            </span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: `${getDumpsterPinColor(dumpster.status)}25`,
              color: getDumpsterPinColor(dumpster.status),
              border: `1px solid ${getDumpsterPinColor(dumpster.status)}50`,
            }}>
              {getStatusLabel(dumpster.status)}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(187,247,208,0.7)', lineHeight: '1.6' }}>
            <div><strong style={{ color: 'rgba(187,247,208,0.9)' }}>Size:</strong> {dumpster.sizeYd} yd³</div>
            {customer && (
              <>
                <div><strong style={{ color: 'rgba(187,247,208,0.9)' }}>Customer:</strong> {customer.name}</div>
                <div><strong style={{ color: 'rgba(187,247,208,0.9)' }}>Phone:</strong> {formatPhone(customer.phone)}</div>
                <div><strong style={{ color: 'rgba(187,247,208,0.9)' }}>Address:</strong> {customer.address}</div>
              </>
            )}
            {activeJob && (
              <div><strong style={{ color: 'rgba(187,247,208,0.9)' }}>Days on site:</strong> {activeJob.daysOnSite}</div>
            )}
            {activeJob?.driver && (
              <div><strong style={{ color: 'rgba(187,247,208,0.9)' }}>Driver:</strong> {activeJob.driver.name}</div>
            )}
          </div>

          <button
            onClick={handleOpenJob}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '7px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#dcfce7',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Job Form →
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
