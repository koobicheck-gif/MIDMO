'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, subMonths, startOfMonth } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp } from 'lucide-react'
import { MOCK_REPORTS, IS_STATIC } from '@/lib/mock-data'

const DATE_PRESETS = [
  { label: '7 days', from: () => subDays(new Date(), 7) },
  { label: '30 days', from: () => subDays(new Date(), 30) },
  { label: '90 days', from: () => subDays(new Date(), 90) },
  { label: '6 months', from: () => subMonths(new Date(), 6) },
]

const PIE_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#7c3aed', '#6b7280']

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(5,46,22,0.97)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: 'rgba(187,247,208,0.9)',
  },
}

async function fetchReports(from: Date, to: Date) {
  if (IS_STATIC) return MOCK_REPORTS
  const res = await fetch(`/api/reports?from=${from.toISOString()}&to=${to.toISOString()}`)
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

export default function ReportsPage() {
  const [preset, setPreset] = useState(2)
  const from = DATE_PRESETS[preset].from()
  const to = new Date()

  const { data, isLoading } = useQuery({
    queryKey: ['reports', preset],
    queryFn: () => fetchReports(from, to),
  })

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-mint">Reports</h1>
          <p className="text-xs text-mint-muted">Analytics and financial overview</p>
        </div>
        <div className="flex gap-1.5">
          {DATE_PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPreset(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                preset === i ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-white/5 border-white/10 text-mint-muted hover:bg-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Collected', value: formatCurrency(data.totals?.revenue ?? 0), color: 'text-green-400' },
            { label: 'Total Invoiced', value: formatCurrency(data.totals?.invoiced ?? 0), color: 'text-blue-400' },
            { label: 'Jobs Completed', value: data.totals?.jobsCompleted ?? 0, color: 'text-mint' },
          ].map(item => (
            <div key={item.label} className="glass-card p-4 text-center">
              <div className={`text-xl font-mono font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-mint-muted mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-2xl animate-pulse bg-white/5" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by month */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-mint mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Monthly Revenue
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(187,247,208,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(187,247,208,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Jobs by type */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-mint mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              Jobs by Type
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.jobsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70}>
                  {data.jobsByType?.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(187,247,208,0.75)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Fleet utilization */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-mint mb-4">Fleet Utilization</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.fleetUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fill: 'rgba(187,247,208,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="status" tick={{ fill: 'rgba(187,247,208,0.55)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment methods */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-mint mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.methodBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={70}>
                  {data.methodBreakdown?.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: any) => [formatCurrency(v), 'Amount']} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(187,247,208,0.75)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice aging */}
          <div className="glass-card p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-mint mb-4">Invoice Aging</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Current (0-30d)', value: data.invoiceAging?.current ?? 0, color: 'text-green-400' },
                { label: '30-60 days', value: data.invoiceAging?.days30 ?? 0, color: 'text-amber-400' },
                { label: '60-90 days', value: data.invoiceAging?.days60 ?? 0, color: 'text-orange-400' },
                { label: '90+ days', value: data.invoiceAging?.over60 ?? 0, color: 'text-red-400' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className={`text-base font-mono font-bold ${item.color}`}>{formatCurrency(item.value)}</div>
                  <div className="text-[10px] text-mint-muted mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
