import { z } from 'zod'

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  city: z.string().optional().default('Columbia'),
  state: z.string().optional().default('MO'),
  zip: z.string().optional().default('65201'),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'CONTRACTOR']).optional().default('RESIDENTIAL'),
  paymentPref: z.enum(['STRIPE', 'VENMO', 'CASH', 'CHECK', 'MONEY_ORDER', 'ZELLE', 'ACH', 'NET_30', 'OTHER', 'CREDIT_CARD']).optional().default('CREDIT_CARD'),
  notes: z.string().optional(),
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial()

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>
