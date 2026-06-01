'use client'

import { useState, Suspense } from 'react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const InvoicesTab = dynamic(() => import('@/components/billing/InvoicesTab'), { ssr: false })
const PaymentsTab = dynamic(() => import('@/components/billing/PaymentsTab'), { ssr: false })
const StripeTab = dynamic(() => import('@/components/billing/StripeTab'), { ssr: false })
const VenmoTab = dynamic(() => import('@/components/billing/VenmoTab'), { ssr: false })
const SelfRecordTab = dynamic(() => import('@/components/billing/SelfRecordTab'), { ssr: false })
const CreateInvoiceTab = dynamic(() => import('@/components/billing/CreateInvoiceTab'), { ssr: false })

const TABS = [
  { id: 'invoices', label: 'Invoices' },
  { id: 'payments', label: 'Payments' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'venmo', label: 'Venmo' },
  { id: 'self-record', label: 'Self Record' },
  { id: 'create', label: 'Create Invoice' },
]

function TabSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl animate-pulse bg-white/5" />
      ))}
    </div>
  )
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('invoices')

  return (
    <div className="space-y-4 py-4">
      <div>
        <h1 className="text-xl font-bold text-mint">Billing</h1>
        <p className="text-xs text-mint-muted">Invoices, payments, and financial tools</p>
      </div>

      {/* Tab bar */}
      <div className="touch-scroll">
        <div className="flex gap-1 p-1 rounded-2xl min-w-max" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-mint-muted hover:text-mint hover:bg-white/8'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <Suspense fallback={<TabSkeleton />}>
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'stripe' && <StripeTab />}
        {activeTab === 'venmo' && <VenmoTab />}
        {activeTab === 'self-record' && <SelfRecordTab />}
        {activeTab === 'create' && <CreateInvoiceTab />}
      </Suspense>
    </div>
  )
}
