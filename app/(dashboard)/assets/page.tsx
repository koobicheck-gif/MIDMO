import AssetsClient from './AssetsClient'
import { MOCK_DUMPSTERS } from '@/lib/mock-data'

async function getDumpsters() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || !process.env.DATABASE_URL) {
    return MOCK_DUMPSTERS
  }
  const { prisma } = await import('@/lib/prisma')
  return prisma.dumpster.findMany({
    include: {
      jobs: {
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        include: { customer: true, driver: { select: { id: true, name: true } } },
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
