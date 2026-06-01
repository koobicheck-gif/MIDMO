import { NextRequest } from 'next/server'
import { requireAuth, handleApiError, successResponse } from '@/lib/api-helpers'
import { sendSMS } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { amount, note, phone, customerName } = await request.json()
    const handle = process.env.VENMO_BUSINESS_HANDLE ?? 'MidMoRollOffs'
    const encodedNote = encodeURIComponent(note ?? 'Mid Mo Roll Offs - Dumpster Rental')

    const venmoDeepLink = `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount}&note=${encodedNote}`
    const venmoWebLink = `https://venmo.com/${handle}?txn=pay&amount=${amount}&note=${encodedNote}`

    if (phone) {
      const smsBody = `Hi ${customerName}, please pay $${amount} for your Mid Mo Roll Offs service:\n\nVenmo: ${venmoWebLink}\n\nQuestions? Call (573) 555-0100`
      await sendSMS(phone, smsBody)
    }

    return successResponse({ deepLink: venmoDeepLink, webLink: venmoWebLink })
  } catch (error) {
    return handleApiError(error)
  }
}
