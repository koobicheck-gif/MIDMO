export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, successResponse } from '@/lib/api-helpers'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const dumpster = await prisma.dumpster.update({
      where: { id: params.id },
      data: {
        status: body.status,
        lat: body.lat,
        lng: body.lng,
        notes: body.notes,
      },
    })
    return successResponse(dumpster)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    await prisma.dumpster.delete({ where: { id: params.id } })
    return successResponse({ message: 'Dumpster removed' })
  } catch (error) {
    return handleApiError(error)
  }
}
