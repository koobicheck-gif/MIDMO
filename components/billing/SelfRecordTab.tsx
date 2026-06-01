'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { MOCK_CUSTOMERS, MOCK_INVOICES, MOCK_PAYMENTS, IS_STATIC } from '@/lib/mock-data'

const METHODS = ['CASH', 'CHECK', 'ZELLE', 'MONEY_ORDER', 'ACH', 'OTHER']
const METHOD_ICONS: Record<string, string> = { CASH: '💵', CHECK: '📝', ZELLE: '🟡', MONEY_ORDER: '📮', ACH: '🏦', OTHER: '💰' }

async function fetchData() {
  if (IS_STATIC) return { customers: MOCK_CUSTOMERS, invoices: MOCK_INVOICES, payments: MOCK_PAYMENTS }
  const [customers, invoices, payments] = await Promise.all([
    fetch('/api/customers').then(r => r.json()),
    fetch('/api/invoices').then(r => r.json()),
    fetch('/api/payments').then(r => r.json()),
  ])
  return { customers, invoices, payments }
}

export default function SelfRecordTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['self-record-data'], queryFn: fetchData })
  const [form, setForm] = useState({ customerId: '', invoiceId: '', amount: '', method: 'CASH', reference: '', receivedBy: '', notes: '' })

  const mutation = useMutation({
    mutationFn: async (payment: any) => {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['self-record-data'] })
      setForm({ customerId: '', invoiceId: '', amount: '', method: 'CASH', reference: '', receivedBy: '', notes: '' })
      toast.success('Payment recorded successfully')
    },
    onError: () => toast.error('Failed to record payment'),
  })

  const customers = data?.customers ?? []
  const invoices = data?.invoices ?? []
  const payments = data?.payments ?? []

  const filteredInvoices = form.customerId
    ? invoices.filter((i: any) => i.customerId === form.customerId)
    : invoices

  const customerForInvoice = invoices.find((i: any) => i.id === form.invoiceId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId || !form.invoiceId || !form.amount) return
    mutation.mutate({
      customerId: form.customerId,
      invoiceId: form.invoiceId,
      amount: parseFloat(form.amount),
      method: form.method,
      reference: form.reference || undefined,
      receivedBy: form.receivedBy || undefined,
      notes: form.notes || undefined,
    })
  }

  const monthTotal = payments
    .filter((p: any) => {
      const date = new Date(p.paidAt)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    .reduce((s: number, p: any) => s + p.amount, 0)

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Entry form */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-mint mb-4">Record Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Customer</label>
              <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value, invoiceId: '' }))} className={inputCls}>
                <option value="">Select customer...</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Invoice</label>
              <select value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))} className={inputCls}>
                <option value="">Select invoice...</option>
                {filteredInvoices.map((i: any) => (
                  <option key={i.id} value={i.id}>{i.invoiceNumber} — {formatCurrency(i.total)} ({i.status})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-mint-muted mb-1.5">Amount ($)</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className={`${inputCls} font-mono`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-mint-muted mb-1.5">Method</label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className={inputCls}>
                  {METHODS.map(m => <option key={m} value={m}>{METHOD_ICONS[m]} {m}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-mint-muted mb-1.5">
                  {form.method === 'CHECK' ? 'Check #' : form.method === 'ZELLE' ? 'Zelle Ref' : 'Reference'}
                </label>
                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Optional" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-mint-muted mb-1.5">Received By</label>
                <input value={form.receivedBy} onChange={e => setForm(f => ({ ...f, receivedBy: e.target.value }))} placeholder="Jake B., Office..." className={inputCls} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!form.customerId || !form.invoiceId || !form.amount || mutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
            >
              <Plus className="w-4 h-4" />
              {mutation.isPending ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </div>

        {/* Ledger */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-mint">Ledger</h3>
            <div className="text-xs text-green-400 font-mono">Month total: {formatCurrency(monthTotal)}</div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {payments.slice(0, 15).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <span>{METHOD_ICONS[p.method] ?? '💰'}</span>
                  <div>
                    <div className="text-mint">{p.customer?.name}</div>
                    <div className="text-mint-muted">{format(new Date(p.paidAt), 'MMM d')} · {p.receivedBy ?? 'Office'}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-green-400">{formatCurrency(p.amount)}</div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-8 text-xs text-mint-muted">No payments recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
