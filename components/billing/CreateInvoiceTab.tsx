'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateInvoiceTab() {
  const queryClient = useQueryClient()
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => fetch('/api/customers').then(r => r.json()) })
  const [form, setForm] = useState({
    customerId: '',
    baseRate: 275,
    extraDays: 0,
    dayRate: 45,
    lateFee: 0,
    fuelSurcharge: 0,
    dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const subtotal = form.baseRate + (form.extraDays * form.dayRate) + form.lateFee + form.fuelSurcharge
  const total = subtotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dueDate: new Date(form.dueDate).toISOString() }),
      })
      if (!res.ok) throw new Error('Failed')
      const inv = await res.json()
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success(`Invoice ${inv.invoiceNumber} created!`)
    } catch {
      toast.error('Failed to create invoice')
    } finally {
      setIsSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50'

  const selectedCustomer = customers.find((c: any) => c.id === form.customerId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Form */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-mint mb-4">Invoice Builder</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Customer</label>
            <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className={inputCls}>
              <option value="">Select customer...</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Base Rate ($)</label>
              <input type="number" value={form.baseRate} onChange={e => setForm(f => ({ ...f, baseRate: parseFloat(e.target.value) || 0 }))} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Day Rate ($)</label>
              <input type="number" value={form.dayRate} onChange={e => setForm(f => ({ ...f, dayRate: parseFloat(e.target.value) || 0 }))} className={`${inputCls} font-mono`} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Extra Days</label>
              <input type="number" min={0} value={form.extraDays} onChange={e => setForm(f => ({ ...f, extraDays: parseInt(e.target.value) || 0 }))} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Late Fee ($)</label>
              <input type="number" min={0} value={form.lateFee} onChange={e => setForm(f => ({ ...f, lateFee: parseFloat(e.target.value) || 0 }))} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Fuel ($)</label>
              <input type="number" min={0} value={form.fuelSurcharge} onChange={e => setForm(f => ({ ...f, fuelSurcharge: parseFloat(e.target.value) || 0 }))} className={`${inputCls} font-mono`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Payment terms, service details..." className={inputCls} />
          </div>

          <button
            type="submit"
            disabled={!form.customerId || isSaving}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
          >
            {isSaving ? 'Creating...' : 'Create Invoice'}
          </button>
        </form>
      </div>

      {/* Live preview */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-mint mb-4">Preview</h3>
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-base font-bold text-mint">Mid Mo Roll Offs</div>
              <div className="text-xs text-mint-muted">Columbia, MO 65201</div>
              <div className="text-xs text-mint-muted">(573) 555-0100</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-green-400 font-bold">INVOICE</div>
              <div className="text-xs text-mint-muted">INV-XXXX</div>
              <div className="text-xs text-mint-muted">Due: {format(new Date(form.dueDate), 'MMM d, yyyy')}</div>
            </div>
          </div>

          {/* Bill to */}
          <div className="border-t border-white/8 pt-3">
            <div className="text-[10px] text-mint-muted uppercase tracking-wider mb-1">Bill To</div>
            <div className="text-sm font-medium text-mint">{selectedCustomer?.name ?? '—'}</div>
            <div className="text-xs text-mint-muted">{selectedCustomer?.address ?? ''}</div>
          </div>

          {/* Line items */}
          <div className="border-t border-white/8 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-mint-muted">Base rental rate</span>
              <span className="font-mono text-mint">{formatCurrency(form.baseRate)}</span>
            </div>
            {form.extraDays > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-mint-muted">Extra {form.extraDays} days @ {formatCurrency(form.dayRate)}/day</span>
                <span className="font-mono text-mint">{formatCurrency(form.extraDays * form.dayRate)}</span>
              </div>
            )}
            {form.lateFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-mint-muted">Late fee</span>
                <span className="font-mono text-amber-400">{formatCurrency(form.lateFee)}</span>
              </div>
            )}
            {form.fuelSurcharge > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-mint-muted">Fuel surcharge</span>
                <span className="font-mono text-mint">{formatCurrency(form.fuelSurcharge)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-white/8 pt-3 flex justify-between">
            <span className="text-sm font-bold text-mint">Total Due</span>
            <span className="text-lg font-mono font-bold text-green-400">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
