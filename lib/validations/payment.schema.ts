import { z } from 'zod'

export const CreatePaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  customerId: z.string().cuid(),
  amount: z.number().min(0.01),
  method: z.enum(['STRIPE', 'VENMO', 'CASH', 'CHECK', 'MONEY_ORDER', 'ZELLE', 'ACH', 'NET_30', 'OTHER', 'CREDIT_CARD']),
  reference: z.string().optional(),
  receivedBy: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().datetime().optional(),
})

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
