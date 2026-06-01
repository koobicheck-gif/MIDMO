export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import AssetsClient from './AssetsClient'

async function getDumpsters() {
  return prisma.dumpster.findMany({
    include: {
      jobs: {
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        include: {
          customer: true,
          driver: { select: { id: true, name: true } },
        },
        take: 1,
      },
    },
    orderBy: { unitId: 'asc' },
  })
}

export default async function AssetsPage() {
  const dumpsters = await getDumpsters()
  return <AssetsClient dumpsters={dumpsters as any} />
}
