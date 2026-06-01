'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, ExternalLink } from 'lucide-react'

async function fetchInvoices() {
  const res = await fetch('/api/invoices?status=PENDING')
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

export default function StripeTab() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices-pending'], queryFn: fetchInvoices })

  const selectedInvoice = invoices.find((i: any) => i.id === selectedInvoiceId)

  const handleCreatePayment = async () => {
    if (!selectedInvoiceId) return
    setIsProcessing(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoiceId }),
      })
      const data = await res.json()
      setClientSecret(data.clientSecret)
    } catch {
      alert('Failed to create payment intent')
    } finally {
      setIsProcessing(false)
    }
  }

  const stripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_')

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div
        className="p-4 rounded-2xl flex items-center gap-3"
        style={{
          background: stripeConfigured ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${stripeConfigured ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
        }}
      >
        <CreditCard className={`w-5 h-5 flex-shrink-0 ${stripeConfigured ? 'text-green-400' : 'text-amber-400'}`} />
        <div>
          <div className="text-sm font-medium text-mint">Stripe {stripeConfigured ? 'Connected' : 'Not Configured'}</div>
          <div className="text-xs text-mint-muted">
            {stripeConfigured ? 'Stripe payments are ready to use' : 'Add STRIPE_SECRET_KEY to environment variables'}
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-mint">Collect Payment via Stripe</h3>

        <div>
          <label className="block text-xs font-medium text-mint-muted mb-1.5">Select Invoice</label>
          <select
            value={selectedInvoiceId}
            onChange={e => setSelectedInvoiceId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint focus:outline-none focus:border-green-500/50"
          >
            <option value="">Choose pending invoice...</option>
            {invoices.map((inv: any) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {inv.customer?.name} — {formatCurrency(inv.total)}
              </option>
            ))}
          </select>
        </div>

        {selectedInvoice && (
          <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex justify-between">
              <span className="text-mint-muted">Customer</span>
              <span className="text-mint">{selectedInvoice.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mint-muted">Amount</span>
              <span className="font-mono font-bold text-green-400">{formatCurrency(selectedInvoice.total)}</span>
            </div>
          </div>
        )}

        {clientSecret ? (
          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="text-sm text-green-300 font-medium">Payment Intent Created</div>
            <div className="text-xs text-mint-muted mt-1 font-mono break-all">{clientSecret.slice(0, 30)}...</div>
            <p className="text-xs text-mint-muted mt-2">In production, Stripe Elements would render here for card entry.</p>
          </div>
        ) : (
          <button
            onClick={handleCreatePayment}
            disabled={!selectedInvoiceId || isProcessing}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
          >
            {isProcessing ? 'Creating...' : 'Create Payment Intent'}
          </button>
        )}
      </div>

      {/* Stripe dashboard link */}
      <a
        href="https://dashboard.stripe.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border border-white/15 text-mint-muted hover:bg-white/8 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Open Stripe Dashboard
      </a>
    </div>
  )
}
