'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, cn } from '@/lib/utils'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

async function fetchCustomers() {
  const res = await fetch('/api/customers')
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

export default function VenmoTab() {
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers })
  const [customerId, setCustomerId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('Dumpster rental - Mid Mo Roll Offs')
  const [isSending, setIsSending] = useState(false)

  const selectedCustomer = customers.find((c: any) => c.id === customerId)

  const handleSend = async () => {
    if (!customerId || !amount) return
    setIsSending(true)
    try {
      const res = await fetch('/api/venmo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          note,
          phone: selectedCustomer?.phone,
          customerName: selectedCustomer?.name,
        }),
      })
      const data = await res.json()
      toast.success('Venmo request sent!', { description: `SMS sent to ${selectedCustomer?.name}` })
    } catch {
      toast.error('Failed to send Venmo request')
    } finally {
      setIsSending(false)
    }
  }

  const venmoHandle = process.env.NEXT_PUBLIC_APP_URL ? 'MidMoRollOffs' : 'MidMoRollOffs'

  return (
    <div className="space-y-4">
      {/* Account status */}
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
        <div className="text-2xl">💙</div>
        <div>
          <div className="text-sm font-medium text-mint">Venmo Business</div>
          <div className="text-xs text-mint-muted font-mono">@{venmoHandle}</div>
        </div>
      </div>

      {/* Request form */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-mint">Send Payment Request</h3>

        <div>
          <label className="block text-xs font-medium text-mint-muted mb-1.5">Customer</label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint focus:outline-none focus:border-green-500/50"
          >
            <option value="">Select customer...</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="275.00"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Note</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        {customerId && amount && (
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="text-mint-muted mb-1">Preview SMS:</div>
            <div className="text-mint">
              Hi {selectedCustomer?.name}, please pay ${amount} for your Mid Mo Roll Offs service via Venmo @{venmoHandle}
            </div>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!customerId || !amount || isSending}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          <Send className="w-4 h-4" />
          {isSending ? 'Sending...' : 'Send Venmo Request via SMS'}
        </button>
      </div>

      {/* QR Code placeholder */}
      <div className="glass-card p-5 text-center">
        <h3 className="text-sm font-semibold text-mint mb-3">Venmo QR Code</h3>
        <div className="w-32 h-32 mx-auto rounded-xl bg-white flex items-center justify-center mb-3">
          <div className="text-[9px] text-gray-800 font-mono text-center px-2">
            QR for<br />venmo.com/{venmoHandle}
          </div>
        </div>
        <button className="text-xs text-green-400 hover:text-green-300 transition-colors">
          Print QR Code
        </button>
      </div>
    </div>
  )
}
