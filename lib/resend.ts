import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')

export async function sendInvoiceEmail(params: {
  to: string
  customerName: string
  invoiceNumber: string
  amount: number
  dueDate: string
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder') {
    console.log(`[Email Mock] Invoice ${params.invoiceNumber} to ${params.to}`)
    return { id: 'mock_email_id' }
  }
  return resend.emails.send({
    from: 'billing@midmorolloffs.com',
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} from Mid Mo Roll Offs`,
    html: `
      <h2>Invoice ${params.invoiceNumber}</h2>
      <p>Hi ${params.customerName},</p>
      <p>Your invoice for $${params.amount.toFixed(2)} is due on ${params.dueDate}.</p>
      <p>Please contact us at (573) 555-0100 with any questions.</p>
      <p>Mid Mo Roll Offs</p>
    `,
  })
}
