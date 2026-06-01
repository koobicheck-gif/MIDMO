import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: params.id },
      include: { customer: true, job: true, payments: true },
    })

    // Dynamic import to keep @react-pdf/renderer server-side only
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const React = await import('react')
    const { InvoicePDF } = await import('@/components/billing/InvoicePDF')

    const element = React.createElement(InvoicePDF, { invoice: invoice as any })
    const buffer = await renderToBuffer(element as any)

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
