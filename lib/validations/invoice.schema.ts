import { z } from 'zod'

export const CreateInvoiceSchema = z.object({
  customerId: z.string().cuid(),
  jobId: z.string().cuid().optional(),
  baseRate: z.number().min(0),
  extraDays: z.number().int().min(0).optional().default(0),
  dayRate: z.number().min(0).optional().default(45),
  lateFee: z.number().min(0).optional().default(0),
  fuelSurcharge: z.number().min(0).optional().default(0),
  taxRate: z.number().min(0).max(1).optional().default(0),
  dueDate: z.string().datetime(),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).optional(),
})

export const UpdateInvoiceSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'VOID']).optional(),
  paidAt: z.string().datetime().optional(),
  paymentMethod: z.enum(['STRIPE', 'VENMO', 'CASH', 'CHECK', 'MONEY_ORDER', 'ZELLE', 'ACH', 'NET_30', 'OTHER', 'CREDIT_CARD']).optional(),
  stripeId: z.string().optional(),
  notes: z.string().optional(),
  lateFee: z.number().min(0).optional(),
})

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>
