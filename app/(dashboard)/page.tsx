import { Truck, Users, DollarSign, AlertTriangle, Package, Clock } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusPill } from '@/components/ui/StatusPill'
import { formatCurrency } from '@/lib/utils'
import DashboardClientSection from './DashboardClientSection'
import {
  MOCK_DASHBOARD_STATS,
  MOCK_JOBS,
  MOCK_REVENUE_BY_MONTH,
  MOCK_DUMPSTERS,
} from '@/lib/mock-data'

async function getDashboardData() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || !process.env.DATABASE_URL) {
    return {
      stats: MOCK_DASHBOARD_STATS,
      recentJobs: MOCK_JOBS,
      revenueByMonth: MOCK_REVENUE_BY_MONTH,
      dumpsters: MOCK_DUMPSTERS,
    }
  }

  const { prisma } = await import('@/lib/prisma')
  const { startOfMonth, subMonths, format } = await import('date-fns')

  const now = new Date()
  const monthStart = startOfMonth(now)

  const [activeUnits, overdueUnits, dueUnits, totalCustomers, monthlyRevenue, outstandingInvoices, recentJobs, revenueByMonth, dumpsters] = await Promise.all([
    prisma.dumpster.count({ where: { status: { in: ['ACTIVE', 'PICKUP_DUE', 'OVERDUE'] } } }),
    prisma.dumpster.count({ where: { status: 'OVERDUE' } }),
    prisma.dumpster.count({ where: { status: 'PICKUP_DUE' } }),
    prisma.customer.count(),
    prisma.payment.aggregate({ where: { paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.invoice.aggregate({ where: { status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } }, _sum: { total: true } }),
    prisma.job.findMany({
      include: {
        customer: { select: { name: true } },
        dumpster: { select: { unitId: true, sizeYd: true } },
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const start = startOfMonth(subMonths(now, 5 - i))
        const end = startOfMonth(subMonths(now, 4 - i))
        return prisma.payment
          .aggregate({ where: { paidAt: { gte: start, lt: end } }, _sum: { amount: true } })
          .then(r => ({ month: format(start, 'MMM'), revenue: r._sum.amount ?? 0 }))
      })
    ),
    prisma.dumpster.findMany({
      include: {
        jobs: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          include: { customer: true, driver: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    }),
  ])

  return {
    stats: {
      activeUnits,
      overdueUnits,
      dueUnits,
      totalCustomers,
      monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
      outstandingInvoices: outstandingInvoices._sum.total ?? 0,
    },
    recentJobs,
    revenueByMonth,
    dumpsters,
  }
}

export default async function DashboardPage() {
  const { stats, recentJobs, revenueByMonth, dumpsters } = await getDashboardData()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-mint">
          {greeting}, Will 👋
        </h1>
        <p className="text-sm text-mint-muted mt-1">
          {stats.activeUnits} units out · {stats.dueUnits} due for pickup · {stats.overdueUnits} overdue
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Units" value={stats.activeUnits} icon={Truck} iconColor="text-green-400" subtitle={`${stats.overdueUnits} overdue`} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} iconColor="text-blue-400" />
        <StatCard title="Revenue (Month)" value={formatCurrency(stats.monthlyRevenue)} icon={DollarSign} iconColor="text-green-400" />
        <StatCard title="Outstanding" value={formatCurrency(stats.outstandingInvoices)} icon={AlertTriangle} iconColor="text-amber-400" subtitle="Unpaid invoices" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-mint flex items-center gap-2">
              <Package className="w-4 h-4 text-green-400" />
              Active Dumpsters
            </h2>
            <a href="/assets" className="text-xs text-green-400 hover:text-green-300 transition-colors">Full Map →</a>
          </div>
          <div style={{ height: '260px' }}>
            <DashboardClientSection dumpsters={dumpsters as any} revenueByMonth={revenueByMonth} />
          </div>
        </div>
        <div className="glass-card p-4">
          <h2 className="text-sm font-semibold text-mint mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            Revenue (Last 6 Months)
          </h2>
          <DashboardClientSection dumpsters={[]} revenueByMonth={revenueByMonth} chartOnly />
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="text-sm font-semibold text-mint mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-400" />
          Recent Jobs
        </h2>
        <div className="touch-scroll">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="text-mint-muted border-b border-white/8">
                <th className="text-left py-2 pr-4 font-medium">Customer</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Unit</th>
                <th className="text-left py-2 pr-4 font-medium">Address</th>
                <th className="text-left py-2 pr-4 font-medium">Driver</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job: any) => (
                <tr key={job.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                  <td className="py-2.5 pr-4 text-mint font-medium">{job.customer?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4">
                    <span className="pill-scheduled px-2 py-0.5 rounded-full text-[10px]">{job.type}</span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-green-400">{job.dumpster?.unitId ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-mint-muted truncate max-w-[160px]">{job.address}</td>
                  <td className="py-2.5 pr-4 text-mint-muted">{job.driver?.name ?? 'Unassigned'}</td>
                  <td className="py-2.5"><StatusPill status={job.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
