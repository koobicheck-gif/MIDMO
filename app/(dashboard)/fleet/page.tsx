'use client'

import { useState } from 'react'
import { useDumpsters } from '@/hooks/useDumpsters'
import { useNewJobModal } from '@/store/useNewJobModal'
import { StatusPill } from '@/components/ui/StatusPill'
import { getDumpsterPinColor, getStatusLabel, cn } from '@/lib/utils'
import { Plus, Search, Truck } from 'lucide-react'

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'PICKUP_DUE', 'OVERDUE', 'SCHEDULED', 'IN_YARD', 'MAINTENANCE']

export default function FleetPage() {
  const { data: dumpsters = [], isLoading } = useDumpsters()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const openModal = useNewJobModal(s => s.open)

  const filtered = dumpsters.filter((d: any) => {
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter
    const matchSearch = !search ||
      d.unitId.toLowerCase().includes(search.toLowerCase()) ||
      d.jobs?.[0]?.customer?.name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-mint">Fleet</h1>
          <p className="text-xs text-mint-muted">{dumpsters.length} units total</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by unit ID or customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                statusFilter === s
                  ? 'bg-green-500/20 border-green-500/40 text-green-300'
                  : 'bg-white/5 border-white/10 text-mint-muted hover:bg-white/10'
              )}
            >
              {s === 'ALL' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d: any) => {
            const job = d.jobs?.[0]
            const customer = job?.customer
            const pinColor = getDumpsterPinColor(d.status)
            return (
              <div
                key={d.id}
                className="glass-card overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => openModal({
                  dumpsterId: d.id,
                  unitId: d.unitId,
                  sizeYd: d.sizeYd,
                  customerId: customer?.id,
                  customerName: customer?.name,
                  address: customer?.address,
                  lat: d.lat,
                  lng: d.lng,
                  jobType: 'PICKUP',
                })}
              >
                {/* Status color bar */}
                <div style={{ height: '4px', background: pinColor }} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-green-400 text-base">{d.unitId}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${pinColor}20`, color: pinColor, border: `1px solid ${pinColor}40` }}
                    >
                      {d.sizeYd} yd³
                    </span>
                  </div>
                  <StatusPill status={d.status} />
                  {customer ? (
                    <div className="mt-2 text-xs space-y-0.5">
                      <div className="text-mint font-medium truncate">{customer.name}</div>
                      <div className="text-mint-muted truncate">{customer.address}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-mint-muted">In yard · No active job</div>
                  )}
                  <button
                    className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold text-green-300 border border-green-500/20 hover:bg-green-500/10 transition-colors"
                    onClick={e => {
                      e.stopPropagation()
                      openModal({ dumpsterId: d.id, unitId: d.unitId, sizeYd: d.sizeYd })
                    }}
                  >
                    <Truck className="w-3 h-3 inline mr-1" />
                    Create Job
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-mint-muted">
              No dumpsters found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
