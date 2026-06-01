'use client'

import { useState } from 'react'
import MapWrapper from '@/components/map/MapWrapper'
import { StatusPill } from '@/components/ui/StatusPill'
import { formatPhone, getStatusLabel, getDumpsterPinColor } from '@/lib/utils'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUSES = ['ALL', 'ACTIVE', 'PICKUP_DUE', 'OVERDUE', 'SCHEDULED', 'IN_YARD', 'MAINTENANCE']

export default function AssetsClient({ dumpsters }: { dumpsters: any[] }) {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<any>(null)

  const filtered = filter === 'ALL' ? dumpsters : dumpsters.filter(d => d.status === filter)

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden min-h-[300px] lg:min-h-0">
        <MapWrapper
          dumpsters={dumpsters}
          height="100%"
          onPinClick={setSelected}
          showLegend
        />
      </div>

      {/* Sidebar */}
      <div
        className="w-full lg:w-80 flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1.5px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Filter */}
        <div className="p-3 border-b border-white/8">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-mint-muted" />
            <span className="text-xs font-medium text-mint-muted">Filter</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border',
                  filter === s
                    ? 'bg-green-500/20 border-green-500/40 text-green-300'
                    : 'bg-white/5 border-white/10 text-mint-muted hover:bg-white/10'
                )}
              >
                {s === 'ALL' ? 'All' : getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.map(d => {
            const job = d.jobs?.[0]
            const customer = job?.customer
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={cn(
                  'w-full text-left p-3 rounded-xl transition-all border',
                  selected?.id === d.id
                    ? 'bg-white/12 border-green-500/30'
                    : 'bg-white/4 border-white/8 hover:bg-white/8'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono font-bold text-green-400">{d.unitId}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${getDumpsterPinColor(d.status)}20`,
                      color: getDumpsterPinColor(d.status),
                      border: `1px solid ${getDumpsterPinColor(d.status)}40`,
                    }}
                  >
                    {getStatusLabel(d.status)}
                  </span>
                </div>
                <div className="text-xs text-mint-muted">{d.sizeYd} yd³</div>
                {customer && (
                  <div className="text-xs text-mint mt-0.5 truncate">{customer.name}</div>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-mint-muted">No units found</div>
          )}
        </div>

        {/* Selected detail */}
        {selected && (
          <div className="p-3 border-t border-white/8">
            <div className="text-xs font-semibold text-mint mb-2">{selected.unitId} · {selected.sizeYd} yd³</div>
            {selected.jobs?.[0]?.customer && (
              <div className="space-y-1 text-xs text-mint-muted">
                <div>{selected.jobs[0].customer.name}</div>
                <div>{formatPhone(selected.jobs[0].customer.phone)}</div>
                <div>{selected.jobs[0].customer.address}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
