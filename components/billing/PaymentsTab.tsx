'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { MOCK_PAYMENTS, IS_STATIC } from '@/lib/mock-data'

const METHOD_ICONS: Record<string, string> = {
  STRIPE: '💳',
  VENMO: '💙',
  CASH: '💵',
  CHECK: '📝',
  ZELLE: '🟡',
  ACH: '🏦',
  MONEY_ORDER: '📮',
  OTHER: '💰',
}

async function fetchPayments() {
  if (IS_STATIC) return MOCK_PAYMENTS
  const res = await fetch('/api/payments')
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

export default function PaymentsTab() {
  const { data: payments = [], isLoading } = useQuery({ queryKey: ['payments'], queryFn: fetchPayments })

  const totalByMethod: Record<string, number> = {}
  payments.forEach((p: any) => {
    totalByMethod[p.method] = (totalByMethod[p.method] ?? 0) + p.amount
  })

  return (
    <div className="space-y-4">
      {/* Method breakdown cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(totalByMethod).slice(0, 4).map(([method, amount]) => (
          <div key={method} className="glass-card p-3 text-center">
            <div className="text-xl mb-1">{METHOD_ICONS[method] ?? '💰'}</div>
            <div className="text-base font-mono font-bold text-green-400">{formatCurrency(amount)}</div>
            <div className="text-[10px] text-mint-muted">{method}</div>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-white/5" />)}
          </div>
        ) : (
          <div className="touch-scroll">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="text-mint-muted border-b border-white/8">
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Method</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Invoice</th>
                  <th className="text-left px-4 py-3 font-medium">Received By</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                    <td className="px-4 py-3 text-mint-muted">{format(new Date(p.paidAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-mint">{p.customer?.name}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {METHOD_ICONS[p.method] ?? '💰'}
                        <span className="text-mint-muted">{p.method}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-green-400 font-bold">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 font-mono text-mint-muted">{p.invoice?.invoiceNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-mint-muted">{p.receivedBy ?? '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-mint-muted">No payments recorded</td>
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
