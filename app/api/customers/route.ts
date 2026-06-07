import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, validateBody, validateEnum, handleApiError, successResponse } from '@/lib/api-helpers'
import { CreateCustomerSchema } from '@/lib/validations/customer.schema'

const CUSTOMER_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'CONTRACTOR'] as const

export async function GET(request: NextRequest) {
  const { error } = await requireAuth(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = validateEnum(searchParams.get('type'), CUSTOMER_TYPES)

    const customers = await prisma.customer.findMany({
      where: {
        ...(type && { type }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }),
      },
      include: {
        _count: { select: { jobs: true, invoices: true } },
      },
      orderBy: { name: 'asc' },
    })

    return successResponse(customers)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireRole(['OWNER', 'OFFICE'], request)
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(CreateCustomerSchema, body)
    if (validationError) return validationError

    const customer = await prisma.customer.create({ data })
    return successResponse(customer, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
