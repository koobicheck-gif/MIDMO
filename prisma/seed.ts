import { PrismaClient, Role, CustomerType, PaymentMethod, DumpsterStatus, JobType, JobStatus, InvoiceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, subDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.job.deleteMany()
  await prisma.dispatchRoute.deleteMany()
  await prisma.dumpster.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('changeme123', 10)

  // Users
  const owner = await prisma.user.create({
    data: {
      email: 'owner@midmorolloffs.com',
      name: 'Will Kubicek',
      hashedPassword: passwordHash,
      role: Role.OWNER,
      phone: '5735551001',
    },
  })

  const driver1 = await prisma.user.create({
    data: {
      email: 'jake@midmorolloffs.com',
      name: 'Jake B.',
      hashedPassword: passwordHash,
      role: Role.DRIVER,
      phone: '5735551002',
    },
  })

  const driver2 = await prisma.user.create({
    data: {
      email: 'marcus@midmorolloffs.com',
      name: 'Marcus T.',
      hashedPassword: passwordHash,
      role: Role.DRIVER,
      phone: '5735551003',
    },
  })

  console.log('✅ Users created')

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Mike Hendricks',
        phone: '5735551010',
        email: 'mike.hendricks@email.com',
        address: '1200 E Broadway',
        type: CustomerType.RESIDENTIAL,
        paymentPref: PaymentMethod.CREDIT_CARD,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sara Bloom',
        phone: '5735551011',
        email: 'sara.bloom@email.com',
        address: '3405 W Worley St',
        type: CustomerType.RESIDENTIAL,
        paymentPref: PaymentMethod.VENMO,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Central Dev Co.',
        phone: '5735551012',
        email: 'projects@centraldev.com',
        address: '700 E Cherry St',
        type: CustomerType.COMMERCIAL,
        paymentPref: PaymentMethod.CHECK,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Tom & Amy Price',
        phone: '5735551013',
        email: 'tamyprice@email.com',
        address: '2890 N Stadium Blvd',
        type: CustomerType.RESIDENTIAL,
        paymentPref: PaymentMethod.CREDIT_CARD,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Boone Co. Schools',
        phone: '5735551014',
        email: 'facilities@bcsd.k12.mo.us',
        address: '1840 S Providence Rd',
        type: CustomerType.COMMERCIAL,
        paymentPref: PaymentMethod.ACH,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Jake Morrison',
        phone: '5735551015',
        email: 'jake.morrison@email.com',
        address: '4200 Rangeline St',
        type: CustomerType.RESIDENTIAL,
        paymentPref: PaymentMethod.CASH,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Lisa Chen',
        phone: '5735551016',
        email: 'lisa.chen@email.com',
        address: '1503 E Ash St',
        type: CustomerType.RESIDENTIAL,
        paymentPref: PaymentMethod.VENMO,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Whitaker Const.',
        phone: '5735551017',
        email: 'billing@whitakerconst.com',
        address: '5600 W Outer Rd',
        type: CustomerType.CONTRACTOR,
        paymentPref: PaymentMethod.CHECK,
        notes: 'NET 30 terms approved',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Karen & Dale Foster',
        phone: '5735551018',
        email: 'foster.family@email.com',
        address: '810 Vandiver Dr',
        type: CustomerType.RESIDENTIAL,
        paymentPref: PaymentMethod.ZELLE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Midwest Remodel LLC',
        phone: '5735551019',
        email: 'ops@midwestremodel.com',
        address: '3100 Paris Rd',
        type: CustomerType.CONTRACTOR,
        paymentPref: PaymentMethod.STRIPE,
        notes: 'Preferred: Stripe auto-invoicing',
      },
    }),
  ])

  console.log('✅ Customers created')

  // Dumpsters with real Columbia, MO coordinates
  const dumpsterData = [
    { unitId: 'D-041', sizeYd: 20, status: DumpsterStatus.ACTIVE, lat: 38.9517, lng: -92.3341, customerId: customers[0].id, daysOnSite: 3 },
    { unitId: 'D-039', sizeYd: 30, status: DumpsterStatus.PICKUP_DUE, lat: 38.9589, lng: -92.3229, customerId: customers[1].id, daysOnSite: 10 },
    { unitId: 'D-036', sizeYd: 40, status: DumpsterStatus.ACTIVE, lat: 38.9142, lng: -92.3785, customerId: customers[2].id, daysOnSite: 5 },
    { unitId: 'D-034', sizeYd: 15, status: DumpsterStatus.SCHEDULED, lat: 38.9701, lng: -92.3544, customerId: customers[3].id, daysOnSite: 0 },
    { unitId: 'D-031', sizeYd: 30, status: DumpsterStatus.PICKUP_DUE, lat: 38.9025, lng: -92.3012, customerId: customers[4].id, daysOnSite: 9 },
    { unitId: 'D-028', sizeYd: 20, status: DumpsterStatus.ACTIVE, lat: 38.9481, lng: -92.3899, customerId: customers[5].id, daysOnSite: 4 },
    { unitId: 'D-025', sizeYd: 10, status: DumpsterStatus.ACTIVE, lat: 38.9512, lng: -92.3230, customerId: customers[6].id, daysOnSite: 2 },
    { unitId: 'D-022', sizeYd: 30, status: DumpsterStatus.OVERDUE, lat: 38.9643, lng: -92.4012, customerId: customers[7].id, daysOnSite: 14 },
    { unitId: 'D-019', sizeYd: 20, status: DumpsterStatus.ACTIVE, lat: 38.9234, lng: -92.2891, customerId: customers[8].id, daysOnSite: 6 },
    { unitId: 'D-016', sizeYd: 15, status: DumpsterStatus.ACTIVE, lat: 38.9531, lng: -92.3279, customerId: customers[9].id, daysOnSite: 1 },
    { unitId: 'D-013', sizeYd: 40, status: DumpsterStatus.ACTIVE, lat: 38.9765, lng: -92.3601, customerId: null, daysOnSite: 7 },
    { unitId: 'D-010', sizeYd: 30, status: DumpsterStatus.IN_YARD, lat: null, lng: null, customerId: null, daysOnSite: 0 },
  ]

  const dumpsters = []
  for (const d of dumpsterData) {
    const dumpster = await prisma.dumpster.create({
      data: {
        unitId: d.unitId,
        sizeYd: d.sizeYd,
        status: d.status,
        lat: d.lat,
        lng: d.lng,
      },
    })
    dumpsters.push({ ...dumpster, customerId: d.customerId, daysOnSite: d.daysOnSite })
  }

  console.log('✅ Dumpsters created')

  // Jobs (link dumpsters to customers)
  const jobs = []
  for (let i = 0; i < 8; i++) {
    const d = dumpsters[i]
    if (!d.customerId) continue
    const customer = customers.find(c => c.id === d.customerId)!
    const scheduledAt = subDays(new Date(), d.daysOnSite)
    const job = await prisma.job.create({
      data: {
        type: JobType.DELIVERY,
        status: JobStatus.COMPLETED,
        address: customer.address,
        lat: dumpsterData[i].lat,
        lng: dumpsterData[i].lng,
        daysOnSite: d.daysOnSite,
        rentalDays: 7,
        scheduledAt,
        completedAt: scheduledAt,
        customerId: d.customerId,
        dumpsterId: d.id,
        driverId: i % 2 === 0 ? driver1.id : driver2.id,
      },
    })
    jobs.push(job)
  }

  // A few upcoming scheduled jobs
  const upcomingJob1 = await prisma.job.create({
    data: {
      type: JobType.PICKUP,
      status: JobStatus.SCHEDULED,
      address: customers[1].address,
      scheduledAt: addDays(new Date(), 1),
      customerId: customers[1].id,
      dumpsterId: dumpsters[1].id,
      driverId: driver1.id,
      notes: 'Customer confirmed via text',
    },
  })

  const upcomingJob2 = await prisma.job.create({
    data: {
      type: JobType.SWAP,
      status: JobStatus.SCHEDULED,
      address: customers[7].address,
      scheduledAt: addDays(new Date(), 2),
      customerId: customers[7].id,
      dumpsterId: dumpsters[7].id,
      driverId: driver2.id,
      notes: 'Overdue — priority pickup',
    },
  })

  const todayJob1 = await prisma.job.create({
    data: {
      type: JobType.DELIVERY,
      status: JobStatus.IN_PROGRESS,
      address: customers[3].address,
      scheduledAt: new Date(),
      customerId: customers[3].id,
      dumpsterId: dumpsters[3].id,
      driverId: driver1.id,
    },
  })

  console.log('✅ Jobs created')

  // Invoices
  let invNum = 2240
  const makeInvNum = () => `INV-${++invNum}`

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[0].id,
      jobId: jobs[0].id,
      baseRate: 275,
      extraDays: 0,
      dayRate: 45,
      total: 275,
      status: InvoiceStatus.PAID,
      dueDate: subDays(new Date(), 5),
      paidAt: subDays(new Date(), 7),
      paymentMethod: PaymentMethod.CREDIT_CARD,
    },
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[1].id,
      jobId: jobs[1].id,
      baseRate: 325,
      extraDays: 3,
      dayRate: 45,
      total: 460,
      status: InvoiceStatus.PENDING,
      dueDate: addDays(new Date(), 7),
    },
  })

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[2].id,
      jobId: jobs[2].id,
      baseRate: 450,
      extraDays: 0,
      dayRate: 55,
      total: 450,
      status: InvoiceStatus.PAID,
      dueDate: subDays(new Date(), 10),
      paidAt: subDays(new Date(), 12),
      paymentMethod: PaymentMethod.CHECK,
    },
  })

  const invoice4 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[4].id,
      jobId: jobs[4] ? jobs[4].id : undefined,
      baseRate: 325,
      extraDays: 2,
      dayRate: 45,
      total: 415,
      status: InvoiceStatus.OVERDUE,
      dueDate: subDays(new Date(), 15),
    },
  })

  const invoice5 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[5].id,
      baseRate: 275,
      extraDays: 0,
      dayRate: 45,
      total: 275,
      status: InvoiceStatus.PAID,
      dueDate: subDays(new Date(), 3),
      paidAt: subDays(new Date(), 4),
      paymentMethod: PaymentMethod.CASH,
    },
  })

  const invoice6 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[6].id,
      baseRate: 225,
      extraDays: 0,
      dayRate: 40,
      total: 225,
      status: InvoiceStatus.PENDING,
      dueDate: addDays(new Date(), 14),
    },
  })

  const invoice7 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[7].id,
      baseRate: 325,
      extraDays: 7,
      dayRate: 45,
      lateFee: 75,
      total: 715,
      status: InvoiceStatus.OVERDUE,
      dueDate: subDays(new Date(), 8),
      notes: 'Late fee applied at day 10',
    },
  })

  const invoice8 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[8].id,
      baseRate: 275,
      extraDays: 0,
      dayRate: 45,
      total: 275,
      status: InvoiceStatus.PENDING,
      dueDate: addDays(new Date(), 5),
    },
  })

  const invoice9 = await prisma.invoice.create({
    data: {
      invoiceNumber: makeInvNum(),
      customerId: customers[9].id,
      baseRate: 225,
      extraDays: 0,
      dayRate: 40,
      total: 225,
      status: InvoiceStatus.DRAFT,
      dueDate: addDays(new Date(), 30),
    },
  })

  console.log('✅ Invoices created')

  // Payments
  await prisma.payment.createMany({
    data: [
      {
        invoiceId: invoice1.id,
        customerId: customers[0].id,
        amount: 275,
        method: PaymentMethod.CREDIT_CARD,
        reference: 'stripe_pi_abc123',
        receivedBy: 'Stripe',
        paidAt: subDays(new Date(), 7),
      },
      {
        invoiceId: invoice3.id,
        customerId: customers[2].id,
        amount: 450,
        method: PaymentMethod.CHECK,
        reference: 'CHK-4521',
        receivedBy: 'Jake B.',
        paidAt: subDays(new Date(), 12),
      },
      {
        invoiceId: invoice5.id,
        customerId: customers[5].id,
        amount: 275,
        method: PaymentMethod.CASH,
        receivedBy: 'Marcus T.',
        paidAt: subDays(new Date(), 4),
      },
      {
        invoiceId: invoice2.id,
        customerId: customers[1].id,
        amount: 100,
        method: PaymentMethod.VENMO,
        reference: 'vmn_partial_001',
        receivedBy: 'Office',
        notes: 'Partial payment received',
        paidAt: subDays(new Date(), 2),
      },
      {
        invoiceId: invoice6.id,
        customerId: customers[6].id,
        amount: 50,
        method: PaymentMethod.ZELLE,
        reference: 'zelle_001',
        receivedBy: 'Office',
        notes: 'Deposit only',
        paidAt: subDays(new Date(), 1),
      },
      {
        invoiceId: invoice4.id,
        customerId: customers[4].id,
        amount: 200,
        method: PaymentMethod.CHECK,
        reference: 'CHK-9812',
        receivedBy: 'Jake B.',
        notes: 'Partial — awaiting balance',
        paidAt: subDays(new Date(), 20),
      },
      {
        invoiceId: invoice7.id,
        customerId: customers[7].id,
        amount: 325,
        method: PaymentMethod.ACH,
        reference: 'ach_trx_00142',
        receivedBy: 'Office',
        notes: 'Partial — late fees still owed',
        paidAt: subDays(new Date(), 5),
      },
      {
        invoiceId: invoice8.id,
        customerId: customers[8].id,
        amount: 75,
        method: PaymentMethod.CASH,
        receivedBy: 'Marcus T.',
        notes: 'Deposit collected on delivery',
        paidAt: subDays(new Date(), 3),
      },
    ],
  })

  console.log('✅ Payments created')
  console.log('\n🎉 Seed complete!')
  console.log('\nLogin credentials:')
  console.log('  Owner:  owner@midmorolloffs.com / changeme123')
  console.log('  Driver: jake@midmorolloffs.com / changeme123')
  console.log('  Driver: marcus@midmorolloffs.com / changeme123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
