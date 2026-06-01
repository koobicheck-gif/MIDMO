'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Search, FileText, Download, X, DollarSign } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { formatCurrency, cn } from '@/lib/utils'
import { MOCK_INVOICES, IS_STATIC } from '@/lib/mock-data'

const STATUS_FILTERS = ['ALL', 'PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'DRAFT']

async function fetchInvoices(status?: string) {
  if (IS_STATIC) {
    return status && status !== 'ALL'
      ? MOCK_INVOICES.filter((i: any) => i.status === status)
      : MOCK_INVOICES
  }
  const query = status && status !== 'ALL' ? `?status=${status}` : ''
  const res = await fetch(`/api/invoices${query}`)
  if (!res.ok) throw new Error('Failed to fetch invoices')
  return res.json()
}

function InvoiceDetailModal({ invoice, onClose }: { invoice: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(5,46,22,0.98)', border: '1.5px solid rgba(255,255,255,0.15)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-mint-muted mb-0.5">Invoice</div>
            <h2 className="text-lg font-mono font-bold text-green-400">{invoice.invoiceNumber}</h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={invoice.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl text-xs space-y-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between">
            <span className="text-mint-muted">Customer</span>
            <span className="text-mint font-medium">{invoice.customer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mint-muted">Due Date</span>
            <span className="text-mint">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1.5 border-b border-white/8">
            <span className="text-mint-muted">Base Rate</span>
            <span className="font-mono text-mint">{formatCurrency(invoice.baseRate ?? 0)}</span>
          </div>
          {invoice.extraDays > 0 && (
            <div className="flex justify-between py-1.5 border-b border-white/8">
              <span className="text-mint-muted">Extra {invoice.extraDays} days × {formatCurrency(invoice.dayRate ?? 0)}</span>
              <span className="font-mono text-mint">{formatCurrency((invoice.extraDays ?? 0) * (invoice.dayRate ?? 0))}</span>
            </div>
          )}
          {invoice.lateFee > 0 && (
            <div className="flex justify-between py-1.5 border-b border-white/8">
              <span className="text-mint-muted">Late Fee</span>
              <span className="font-mono text-amber-400">{formatCurrency(invoice.lateFee)}</span>
            </div>
          )}
          {invoice.fuelSurcharge > 0 && (
            <div className="flex justify-between py-1.5 border-b border-white/8">
              <span className="text-mint-muted">Fuel Surcharge</span>
              <span className="font-mono text-mint">{formatCurrency(invoice.fuelSurcharge)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 mt-1">
            <span className="text-sm font-bold text-mint">Total Due</span>
            <span className="text-lg font-mono font-bold text-green-400">{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {invoice.payments?.length > 0 && (
          <div>
            <div className="text-xs font-medium text-mint-muted mb-2">Payments Applied</div>
            <div className="space-y-1.5">
              {invoice.payments.map((p: any) => (
                <div key={p.id} className="flex justify-between text-xs p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <span className="text-mint-muted">{p.method} · {format(new Date(p.paidAt), 'MMM d')}</span>
                  <span className="font-mono font-bold text-green-400">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {!IS_STATIC && (
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium border border-white/15 text-mint-muted hover:bg-white/8 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InvoicesTab() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
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
      {selected && <InvoiceDetailModal invoice={selected} onClose={() => setSelected(null)} />}

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
                        {!IS_STATIC && (
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelected(inv)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-mint-muted hover:text-mint transition-colors"
                          title="View"
                        >
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
