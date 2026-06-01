'use client'

import { useState } from 'react'
import { useCustomers, useUpdateCustomer } from '@/hooks/useCustomers'
import { useNewJobModal } from '@/store/useNewJobModal'
import { cn, formatPhone } from '@/lib/utils'
import { Search, Plus, X, Phone, Mail, MapPin, Calendar, DollarSign } from 'lucide-react'

export default function CRMPage() {
  const { data: customers = [], isLoading } = useCustomers()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const openModal = useNewJobModal(s => s.open)

  const filtered = customers.filter((c: any) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const typeColors: Record<string, string> = {
    RESIDENTIAL: 'pill-scheduled',
    COMMERCIAL: 'pill-due',
    CONTRACTOR: 'pill-active',
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-mint">CRM</h1>
          <p className="text-xs text-mint-muted">{customers.length} customers</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50"
        />
      </div>

      <div className="flex gap-4">
        {/* Customer list */}
        <div className={cn('flex-1 glass-card overflow-hidden', selected && 'hidden lg:block')}>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="text-mint-muted border-b border-white/8">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Phone</th>
                    <th className="text-left px-4 py-3 font-medium">Jobs</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c: any) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={cn(
                        'border-b border-white/5 cursor-pointer transition-colors',
                        selected?.id === c.id ? 'bg-white/10' : 'hover:bg-white/5'
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-mint">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', typeColors[c.type] ?? 'pill-scheduled')}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-mint-muted">{formatPhone(c.phone)}</td>
                      <td className="px-4 py-3 text-mint-muted">{c._count?.jobs ?? 0}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-mint-muted">No customers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer detail panel */}
        {selected && (
          <div
            className="w-full lg:w-80 flex-shrink-0 rounded-2xl p-4 space-y-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-mint">{selected.name}</h3>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block', typeColors[selected.type])}>
                  {selected.type}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-mint-muted">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formatPhone(selected.phone)}</span>
              </div>
              {selected.email && (
                <div className="flex items-center gap-2 text-mint-muted">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{selected.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-mint-muted">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{selected.address}, {selected.city}, {selected.state}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-lg font-mono font-bold text-green-400">{selected._count?.jobs ?? 0}</div>
                <div className="text-[10px] text-mint-muted">Total Jobs</div>
              </div>
              <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-lg font-mono font-bold text-green-400">{selected._count?.invoices ?? 0}</div>
                <div className="text-[10px] text-mint-muted">Invoices</div>
              </div>
            </div>

            {selected.notes && (
              <div className="p-3 rounded-xl text-xs text-mint-muted" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {selected.notes}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => openModal({ customerId: selected.id, customerName: selected.name, address: selected.address, phone: selected.phone })}
                className="w-full py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7' }}
              >
                New Job
              </button>
              <a
                href={`tel:${selected.phone}`}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium border border-white/15 text-mint-muted hover:bg-white/8 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Customer
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
