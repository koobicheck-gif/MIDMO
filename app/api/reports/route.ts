import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, successResponse } from '@/lib/api-helpers'
import { startOfMonth, subMonths, format } from 'date-fns'

export async function GET(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const fromDate = from ? new Date(from) : subMonths(startOfMonth(new Date()), 5)
    const toDate = to ? new Date(to) : new Date()

    const [payments, invoices, jobs, dumpsters] = await Promise.all([
      prisma.payment.findMany({
        where: { paidAt: { gte: fromDate, lte: toDate } },
        select: { amount: true, method: true, paidAt: true },
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: fromDate, lte: toDate } },
        select: { total: true, status: true, dueDate: true, createdAt: true },
      }),
      prisma.job.findMany({
        where: { scheduledAt: { gte: fromDate, lte: toDate } },
        select: { type: true, status: true, scheduledAt: true, customer: { select: { name: true, type: true } } },
      }),
      prisma.dumpster.findMany({
        select: { sizeYd: true, status: true },
      }),
    ])

    // Monthly revenue (last 6 months)
    const monthlyRevenue: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const month = format(subMonths(new Date(), i), 'MMM yyyy')
      monthlyRevenue[month] = 0
    }
    payments.forEach(p => {
      const month = format(new Date(p.paidAt), 'MMM yyyy')
      if (monthlyRevenue[month] !== undefined) {
        monthlyRevenue[month] += p.amount
      }
    })

    // Payment method breakdown
    const methodBreakdown: Record<string, number> = {}
    payments.forEach(p => {
      methodBreakdown[p.method] = (methodBreakdown[p.method] ?? 0) + p.amount
    })

    // Invoice aging
    const now = new Date()
    const aging = { current: 0, days30: 0, days60: 0, over60: 0 }
    invoices.filter(i => i.status === 'OVERDUE' || i.status === 'PENDING').forEach(i => {
      const daysOverdue = Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      if (daysOverdue <= 0) aging.current += i.total
      else if (daysOverdue <= 30) aging.days30 += i.total
      else if (daysOverdue <= 60) aging.days60 += i.total
      else aging.over60 += i.total
    })

    // Jobs by type
    const jobsByType: Record<string, number> = { DELIVERY: 0, PICKUP: 0, SWAP: 0 }
    jobs.forEach(j => { jobsByType[j.type] = (jobsByType[j.type] ?? 0) + 1 })

    // Fleet utilization
    const fleetUtil = { IN_YARD: 0, ACTIVE: 0, PICKUP_DUE: 0, OVERDUE: 0, SCHEDULED: 0, MAINTENANCE: 0 }
    dumpsters.forEach(d => { fleetUtil[d.status] = (fleetUtil[d.status] ?? 0) + 1 })

    return successResponse({
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
      methodBreakdown: Object.entries(methodBreakdown).map(([method, amount]) => ({ method, amount })),
      invoiceAging: aging,
      jobsByType: Object.entries(jobsByType).map(([type, count]) => ({ type, count })),
      fleetUtilization: Object.entries(fleetUtil).map(([status, count]) => ({ status, count })),
      totals: {
        revenue: payments.reduce((s, p) => s + p.amount, 0),
        invoiced: invoices.reduce((s, i) => s + i.total, 0),
        jobsCompleted: jobs.filter(j => j.status === 'COMPLETED').length,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
