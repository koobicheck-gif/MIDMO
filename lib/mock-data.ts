import { subDays, addDays, startOfMonth, subMonths, format } from 'date-fns'

const now = new Date('2026-06-01T12:00:00Z')

export const MOCK_USERS = [
  { id: 'user-1', email: 'owner@midmorolloffs.com', name: 'Will Kubicek', role: 'OWNER' as const, phone: '5735551001' },
  { id: 'user-2', email: 'jake@midmorolloffs.com', name: 'Jake B.', role: 'DRIVER' as const, phone: '5735551002' },
  { id: 'user-3', email: 'marcus@midmorolloffs.com', name: 'Marcus T.', role: 'DRIVER' as const, phone: '5735551003' },
]

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Mike Hendricks', phone: '5735551010', email: 'mike.hendricks@email.com', address: '1200 E Broadway', city: 'Columbia', state: 'MO', zip: '65201', type: 'RESIDENTIAL' as const, paymentPref: 'CREDIT_CARD' as const, notes: null, _count: { jobs: 3, invoices: 2 } },
  { id: 'c2', name: 'Sara Bloom', phone: '5735551011', email: 'sara.bloom@email.com', address: '3405 W Worley St', city: 'Columbia', state: 'MO', zip: '65201', type: 'RESIDENTIAL' as const, paymentPref: 'VENMO' as const, notes: null, _count: { jobs: 2, invoices: 2 } },
  { id: 'c3', name: 'Central Dev Co.', phone: '5735551012', email: 'projects@centraldev.com', address: '700 E Cherry St', city: 'Columbia', state: 'MO', zip: '65201', type: 'COMMERCIAL' as const, paymentPref: 'CHECK' as const, notes: null, _count: { jobs: 4, invoices: 3 } },
  { id: 'c4', name: 'Tom & Amy Price', phone: '5735551013', email: 'tamyprice@email.com', address: '2890 N Stadium Blvd', city: 'Columbia', state: 'MO', zip: '65201', type: 'RESIDENTIAL' as const, paymentPref: 'CREDIT_CARD' as const, notes: null, _count: { jobs: 1, invoices: 1 } },
  { id: 'c5', name: 'Boone Co. Schools', phone: '5735551014', email: 'facilities@bcsd.k12.mo.us', address: '1840 S Providence Rd', city: 'Columbia', state: 'MO', zip: '65201', type: 'COMMERCIAL' as const, paymentPref: 'ACH' as const, notes: null, _count: { jobs: 5, invoices: 4 } },
  { id: 'c6', name: 'Jake Morrison', phone: '5735551015', email: 'jake.morrison@email.com', address: '4200 Rangeline St', city: 'Columbia', state: 'MO', zip: '65201', type: 'RESIDENTIAL' as const, paymentPref: 'CASH' as const, notes: null, _count: { jobs: 2, invoices: 2 } },
  { id: 'c7', name: 'Lisa Chen', phone: '5735551016', email: 'lisa.chen@email.com', address: '1503 E Ash St', city: 'Columbia', state: 'MO', zip: '65201', type: 'RESIDENTIAL' as const, paymentPref: 'VENMO' as const, notes: null, _count: { jobs: 1, invoices: 1 } },
  { id: 'c8', name: 'Whitaker Const.', phone: '5735551017', email: 'billing@whitakerconst.com', address: '5600 W Outer Rd', city: 'Columbia', state: 'MO', zip: '65201', type: 'CONTRACTOR' as const, paymentPref: 'CHECK' as const, notes: 'NET 30 terms approved', _count: { jobs: 3, invoices: 3 } },
  { id: 'c9', name: 'Karen & Dale Foster', phone: '5735551018', email: 'foster.family@email.com', address: '810 Vandiver Dr', city: 'Columbia', state: 'MO', zip: '65201', type: 'RESIDENTIAL' as const, paymentPref: 'ZELLE' as const, notes: null, _count: { jobs: 2, invoices: 2 } },
  { id: 'c10', name: 'Midwest Remodel LLC', phone: '5735551019', email: 'ops@midwestremodel.com', address: '3100 Paris Rd', city: 'Columbia', state: 'MO', zip: '65201', type: 'CONTRACTOR' as const, paymentPref: 'STRIPE' as const, notes: 'Preferred: Stripe auto-invoicing', _count: { jobs: 6, invoices: 5 } },
]

export const MOCK_DUMPSTERS = [
  { id: 'd1', unitId: 'D-041', sizeYd: 20, status: 'ACTIVE', lat: 38.9517, lng: -92.3341, jobs: [{ customer: MOCK_CUSTOMERS[0], daysOnSite: 3, driver: MOCK_USERS[1] }] },
  { id: 'd2', unitId: 'D-039', sizeYd: 30, status: 'PICKUP_DUE', lat: 38.9589, lng: -92.3229, jobs: [{ customer: MOCK_CUSTOMERS[1], daysOnSite: 10, driver: MOCK_USERS[2] }] },
  { id: 'd3', unitId: 'D-036', sizeYd: 40, status: 'ACTIVE', lat: 38.9142, lng: -92.3785, jobs: [{ customer: MOCK_CUSTOMERS[2], daysOnSite: 5, driver: MOCK_USERS[1] }] },
  { id: 'd4', unitId: 'D-034', sizeYd: 15, status: 'SCHEDULED', lat: 38.9701, lng: -92.3544, jobs: [{ customer: MOCK_CUSTOMERS[3], daysOnSite: 0, driver: MOCK_USERS[2] }] },
  { id: 'd5', unitId: 'D-031', sizeYd: 30, status: 'PICKUP_DUE', lat: 38.9025, lng: -92.3012, jobs: [{ customer: MOCK_CUSTOMERS[4], daysOnSite: 9, driver: MOCK_USERS[1] }] },
  { id: 'd6', unitId: 'D-028', sizeYd: 20, status: 'ACTIVE', lat: 38.9481, lng: -92.3899, jobs: [{ customer: MOCK_CUSTOMERS[5], daysOnSite: 4, driver: MOCK_USERS[2] }] },
  { id: 'd7', unitId: 'D-025', sizeYd: 10, status: 'ACTIVE', lat: 38.9512, lng: -92.3230, jobs: [{ customer: MOCK_CUSTOMERS[6], daysOnSite: 2, driver: MOCK_USERS[1] }] },
  { id: 'd8', unitId: 'D-022', sizeYd: 30, status: 'OVERDUE', lat: 38.9643, lng: -92.4012, jobs: [{ customer: MOCK_CUSTOMERS[7], daysOnSite: 14, driver: MOCK_USERS[2] }] },
  { id: 'd9', unitId: 'D-019', sizeYd: 20, status: 'ACTIVE', lat: 38.9234, lng: -92.2891, jobs: [{ customer: MOCK_CUSTOMERS[8], daysOnSite: 6, driver: MOCK_USERS[1] }] },
  { id: 'd10', unitId: 'D-016', sizeYd: 15, status: 'ACTIVE', lat: 38.9531, lng: -92.3279, jobs: [{ customer: MOCK_CUSTOMERS[9], daysOnSite: 1, driver: MOCK_USERS[2] }] },
  { id: 'd11', unitId: 'D-013', sizeYd: 40, status: 'ACTIVE', lat: 38.9765, lng: -92.3601, jobs: [] },
  { id: 'd12', unitId: 'D-010', sizeYd: 30, status: 'IN_YARD', lat: null, lng: null, jobs: [] },
]

export const MOCK_JOBS = [
  { id: 'j1', type: 'DELIVERY', status: 'COMPLETED', address: '1200 E Broadway', scheduledAt: subDays(now, 3), completedAt: subDays(now, 3), daysOnSite: 3, customer: MOCK_CUSTOMERS[0], dumpster: { unitId: 'D-041', sizeYd: 20 }, driver: MOCK_USERS[1] },
  { id: 'j2', type: 'DELIVERY', status: 'COMPLETED', address: '3405 W Worley St', scheduledAt: subDays(now, 10), completedAt: subDays(now, 10), daysOnSite: 10, customer: MOCK_CUSTOMERS[1], dumpster: { unitId: 'D-039', sizeYd: 30 }, driver: MOCK_USERS[2] },
  { id: 'j3', type: 'DELIVERY', status: 'COMPLETED', address: '700 E Cherry St', scheduledAt: subDays(now, 5), completedAt: subDays(now, 5), daysOnSite: 5, customer: MOCK_CUSTOMERS[2], dumpster: { unitId: 'D-036', sizeYd: 40 }, driver: MOCK_USERS[1] },
  { id: 'j4', type: 'PICKUP', status: 'SCHEDULED', address: '3405 W Worley St', scheduledAt: addDays(now, 1), completedAt: null, daysOnSite: 10, customer: MOCK_CUSTOMERS[1], dumpster: { unitId: 'D-039', sizeYd: 30 }, driver: MOCK_USERS[1] },
  { id: 'j5', type: 'SWAP', status: 'SCHEDULED', address: '5600 W Outer Rd', scheduledAt: addDays(now, 2), completedAt: null, daysOnSite: 14, customer: MOCK_CUSTOMERS[7], dumpster: { unitId: 'D-022', sizeYd: 30 }, driver: MOCK_USERS[2] },
  { id: 'j6', type: 'DELIVERY', status: 'IN_PROGRESS', address: '2890 N Stadium Blvd', scheduledAt: now, completedAt: null, daysOnSite: 0, customer: MOCK_CUSTOMERS[3], dumpster: { unitId: 'D-034', sizeYd: 15 }, driver: MOCK_USERS[1] },
  { id: 'j7', type: 'DELIVERY', status: 'COMPLETED', address: '4200 Rangeline St', scheduledAt: subDays(now, 4), completedAt: subDays(now, 4), daysOnSite: 4, customer: MOCK_CUSTOMERS[5], dumpster: { unitId: 'D-028', sizeYd: 20 }, driver: MOCK_USERS[2] },
  { id: 'j8', type: 'DELIVERY', status: 'COMPLETED', address: '1840 S Providence Rd', scheduledAt: subDays(now, 9), completedAt: subDays(now, 9), daysOnSite: 9, customer: MOCK_CUSTOMERS[4], dumpster: { unitId: 'D-031', sizeYd: 30 }, driver: MOCK_USERS[1] },
]

export const MOCK_INVOICES = [
  { id: 'inv1', invoiceNumber: 'INV-2241', customerId: 'c1', customer: MOCK_CUSTOMERS[0], total: 275, baseRate: 275, extraDays: 0, dayRate: 45, lateFee: 0, fuelSurcharge: 0, status: 'PAID', dueDate: subDays(now, 5), paidAt: subDays(now, 7), paymentMethod: 'CREDIT_CARD', payments: [{ id: 'p1', amount: 275, method: 'CREDIT_CARD', paidAt: subDays(now, 7) }] },
  { id: 'inv2', invoiceNumber: 'INV-2242', customerId: 'c2', customer: MOCK_CUSTOMERS[1], total: 460, baseRate: 325, extraDays: 3, dayRate: 45, lateFee: 0, fuelSurcharge: 0, status: 'PENDING', dueDate: addDays(now, 7), paidAt: null, paymentMethod: null, payments: [] },
  { id: 'inv3', invoiceNumber: 'INV-2243', customerId: 'c3', customer: MOCK_CUSTOMERS[2], total: 450, baseRate: 450, extraDays: 0, dayRate: 55, lateFee: 0, fuelSurcharge: 0, status: 'PAID', dueDate: subDays(now, 10), paidAt: subDays(now, 12), paymentMethod: 'CHECK', payments: [{ id: 'p2', amount: 450, method: 'CHECK', paidAt: subDays(now, 12) }] },
  { id: 'inv4', invoiceNumber: 'INV-2244', customerId: 'c5', customer: MOCK_CUSTOMERS[4], total: 415, baseRate: 325, extraDays: 2, dayRate: 45, lateFee: 0, fuelSurcharge: 0, status: 'OVERDUE', dueDate: subDays(now, 15), paidAt: null, paymentMethod: null, payments: [] },
  { id: 'inv5', invoiceNumber: 'INV-2245', customerId: 'c6', customer: MOCK_CUSTOMERS[5], total: 275, baseRate: 275, extraDays: 0, dayRate: 45, lateFee: 0, fuelSurcharge: 0, status: 'PAID', dueDate: subDays(now, 3), paidAt: subDays(now, 4), paymentMethod: 'CASH', payments: [{ id: 'p3', amount: 275, method: 'CASH', paidAt: subDays(now, 4) }] },
  { id: 'inv6', invoiceNumber: 'INV-2246', customerId: 'c7', customer: MOCK_CUSTOMERS[6], total: 225, baseRate: 225, extraDays: 0, dayRate: 40, lateFee: 0, fuelSurcharge: 0, status: 'PENDING', dueDate: addDays(now, 14), paidAt: null, paymentMethod: null, payments: [] },
  { id: 'inv7', invoiceNumber: 'INV-2247', customerId: 'c8', customer: MOCK_CUSTOMERS[7], total: 715, baseRate: 325, extraDays: 7, dayRate: 45, lateFee: 75, fuelSurcharge: 0, status: 'OVERDUE', dueDate: subDays(now, 8), paidAt: null, paymentMethod: null, payments: [] },
  { id: 'inv8', invoiceNumber: 'INV-2248', customerId: 'c9', customer: MOCK_CUSTOMERS[8], total: 275, baseRate: 275, extraDays: 0, dayRate: 45, lateFee: 0, fuelSurcharge: 0, status: 'PENDING', dueDate: addDays(now, 5), paidAt: null, paymentMethod: null, payments: [] },
  { id: 'inv9', invoiceNumber: 'INV-2249', customerId: 'c10', customer: MOCK_CUSTOMERS[9], total: 225, baseRate: 225, extraDays: 0, dayRate: 40, lateFee: 0, fuelSurcharge: 0, status: 'DRAFT', dueDate: addDays(now, 30), paidAt: null, paymentMethod: null, payments: [] },
]

export const MOCK_PAYMENTS = [
  { id: 'p1', invoiceId: 'inv1', customerId: 'c1', amount: 275, method: 'CREDIT_CARD', reference: 'stripe_pi_abc123', receivedBy: 'Stripe', paidAt: subDays(now, 7), customer: MOCK_CUSTOMERS[0], invoice: { invoiceNumber: 'INV-2241' } },
  { id: 'p2', invoiceId: 'inv3', customerId: 'c3', amount: 450, method: 'CHECK', reference: 'CHK-4521', receivedBy: 'Jake B.', paidAt: subDays(now, 12), customer: MOCK_CUSTOMERS[2], invoice: { invoiceNumber: 'INV-2243' } },
  { id: 'p3', invoiceId: 'inv5', customerId: 'c6', amount: 275, method: 'CASH', reference: null, receivedBy: 'Marcus T.', paidAt: subDays(now, 4), customer: MOCK_CUSTOMERS[5], invoice: { invoiceNumber: 'INV-2245' } },
  { id: 'p4', invoiceId: 'inv2', customerId: 'c2', amount: 100, method: 'VENMO', reference: 'vmn_001', receivedBy: 'Office', paidAt: subDays(now, 2), customer: MOCK_CUSTOMERS[1], invoice: { invoiceNumber: 'INV-2242' } },
  { id: 'p5', invoiceId: 'inv6', customerId: 'c7', amount: 50, method: 'ZELLE', reference: 'zelle_001', receivedBy: 'Office', paidAt: subDays(now, 1), customer: MOCK_CUSTOMERS[6], invoice: { invoiceNumber: 'INV-2246' } },
  { id: 'p6', invoiceId: 'inv4', customerId: 'c5', amount: 200, method: 'CHECK', reference: 'CHK-9812', receivedBy: 'Jake B.', paidAt: subDays(now, 20), customer: MOCK_CUSTOMERS[4], invoice: { invoiceNumber: 'INV-2244' } },
  { id: 'p7', invoiceId: 'inv7', customerId: 'c8', amount: 325, method: 'ACH', reference: 'ach_00142', receivedBy: 'Office', paidAt: subDays(now, 5), customer: MOCK_CUSTOMERS[7], invoice: { invoiceNumber: 'INV-2247' } },
  { id: 'p8', invoiceId: 'inv8', customerId: 'c9', amount: 75, method: 'CASH', reference: null, receivedBy: 'Marcus T.', paidAt: subDays(now, 3), customer: MOCK_CUSTOMERS[8], invoice: { invoiceNumber: 'INV-2248' } },
]

export const MOCK_DASHBOARD_STATS = {
  activeUnits: 8,
  overdueUnits: 1,
  dueUnits: 2,
  totalCustomers: MOCK_CUSTOMERS.length,
  monthlyRevenue: MOCK_PAYMENTS.filter(p => {
    const d = new Date(p.paidAt)
    const now2 = new Date('2026-06-01')
    return d.getMonth() === now2.getMonth() && d.getFullYear() === now2.getFullYear()
  }).reduce((s, p) => s + p.amount, 0),
  outstandingInvoices: MOCK_INVOICES
    .filter(i => ['PENDING', 'OVERDUE', 'PARTIAL'].includes(i.status))
    .reduce((s, i) => s + i.total, 0),
}

export const MOCK_REVENUE_BY_MONTH = Array.from({ length: 6 }, (_, i) => ({
  month: format(subMonths(new Date('2026-06-01'), 5 - i), 'MMM'),
  revenue: [1840, 2340, 1975, 3120, 2680, 1750][i],
}))

export const MOCK_REPORTS = {
  monthlyRevenue: Array.from({ length: 6 }, (_, i) => ({
    month: format(subMonths(new Date('2026-06-01'), 5 - i), 'MMM yyyy'),
    revenue: [1840, 2340, 1975, 3120, 2680, 1750][i],
  })),
  methodBreakdown: [
    { method: 'STRIPE', amount: 275 },
    { method: 'CHECK', amount: 975 },
    { method: 'CASH', amount: 350 },
    { method: 'VENMO', amount: 100 },
    { method: 'ZELLE', amount: 50 },
    { method: 'ACH', amount: 325 },
  ],
  invoiceAging: { current: 725, days30: 415, days60: 715, over60: 0 },
  jobsByType: [
    { type: 'DELIVERY', count: 6 },
    { type: 'PICKUP', count: 1 },
    { type: 'SWAP', count: 1 },
  ],
  fleetUtilization: [
    { status: 'ACTIVE', count: 6 },
    { status: 'PICKUP_DUE', count: 2 },
    { status: 'OVERDUE', count: 1 },
    { status: 'SCHEDULED', count: 1 },
    { status: 'IN_YARD', count: 1 },
    { status: 'MAINTENANCE', count: 1 },
  ],
  totals: { revenue: 2075, invoiced: 3320, jobsCompleted: 5 },
}

export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'
