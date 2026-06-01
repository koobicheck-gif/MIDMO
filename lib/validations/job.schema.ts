import { z } from 'zod'

export const CreateJobSchema = z.object({
  type: z.enum(['DELIVERY', 'PICKUP', 'SWAP']),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().default('SCHEDULED'),
  address: z.string().min(5, 'Address is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  daysOnSite: z.number().int().min(0).optional().default(0),
  rentalDays: z.number().int().min(1).optional().default(7),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
  gateCode: z.string().optional(),
  customerId: z.string().cuid(),
  dumpsterId: z.string().cuid().optional(),
  driverId: z.string().cuid().optional(),
})

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  completedAt: z.string().datetime().optional(),
})

export type CreateJobInput = z.infer<typeof CreateJobSchema>
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>
