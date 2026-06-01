'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Search, FileText, Download } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { formatCurrency, cn } from '@/lib/utils'

const STATUS_FILTERS = ['ALL', 'PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'DRAFT']

async function fetchInvoices(status?: string) {
  const query = status && status !== 'ALL' ? `?status=${status}` : ''
  const res = await fetch(`/api/invoices${query}`)
  if (!res.ok) throw new Error('Failed to fetch invoices')
  return res.json()
}

export default function InvoicesTab() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => fetchInvoices(statusFilter),
  })

  const filtered = invoices.filter((inv: any) =>
    !search ||
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
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
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoiced', value: invoices.reduce((s: number, i: any) => s + i.total, 0), color: 'text-mint' },
          { label: 'Collected', value: invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.total, 0), color: 'text-green-400' },
          { label: 'Pending', value: invoices.filter((i: any) => i.status === 'PENDING').reduce((s: number, i: any) => s + i.total, 0), color: 'text-blue-400' },
          { label: 'Overdue', value: invoices.filter((i: any) => i.status === 'OVERDUE').reduce((s: number, i: any) => s + i.total, 0), color: 'text-red-400' },
        ].map(item => (
          <div key={item.label} className="glass-card p-3 text-center">
            <div className={`text-lg font-mono font-bold ${item.color}`}>{formatCurrency(item.value)}</div>
            <div className="text-[10px] text-mint-muted mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-white/5" />)}
          </div>
        ) : (
          <div className="touch-scroll">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="text-mint-muted border-b border-white/8">
                  <th className="text-left px-4 py-3 font-medium">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                    <td className="px-4 py-3 font-mono text-green-400 font-bold">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-mint">{inv.customer?.name}</td>
                    <td className="px-4 py-3 font-mono text-mint">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-mint-muted">{format(new Date(inv.dueDate), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3"><StatusPill status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors" title="View">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-mint-muted">No invoices found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
