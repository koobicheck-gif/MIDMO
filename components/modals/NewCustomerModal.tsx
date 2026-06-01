'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateCustomer } from '@/hooks/useCustomers'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Phone required').regex(/^\d{10}$/, '10 digits, no dashes'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().length(2, '2-letter state code'),
  zip: z.string().length(5, '5-digit ZIP'),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'CONTRACTOR']),
  paymentPref: z.enum(['CREDIT_CARD', 'CHECK', 'CASH', 'VENMO', 'ZELLE', 'ACH', 'STRIPE', 'OTHER']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

export default function NewCustomerModal({ onClose }: Props) {
  const { mutateAsync, isPending } = useCreateCustomer()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      city: 'Columbia',
      state: 'MO',
      type: 'RESIDENTIAL',
      paymentPref: 'CREDIT_CARD',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({ ...data, email: data.email || undefined })
      toast.success(`${data.name} added to CRM`)
      onClose()
    } catch {
      toast.error('Failed to add customer')
    }
  }

  const inputCls = (hasError?: boolean) => cn(
    'w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50',
    hasError ? 'border-red-500/50' : 'border-white/10'
  )

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl"
        style={{ background: 'rgba(5,46,22,0.98)', border: '1.5px solid rgba(255,255,255,0.15)' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-mint">New Customer</h2>
            <p className="text-xs text-mint-muted">Add to CRM</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-mint-muted hover:text-mint transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Full Name / Company *</label>
            <input {...register('name')} placeholder="Mike Hendricks" className={inputCls(!!errors.name)} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Phone * (10 digits)</label>
              <input {...register('phone')} placeholder="5735551234" className={inputCls(!!errors.phone)} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="email@example.com" className={inputCls(!!errors.email)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Service Address *</label>
            <input {...register('address')} placeholder="1200 E Broadway" className={inputCls(!!errors.address)} />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-mint-muted mb-1.5">City *</label>
              <input {...register('city')} className={inputCls(!!errors.city)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">State *</label>
              <input {...register('state')} maxLength={2} className={inputCls(!!errors.state)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">ZIP *</label>
              <input {...register('zip')} maxLength={5} className={inputCls(!!errors.zip)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Customer Type *</label>
              <select {...register('type')} className={inputCls()}>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="CONTRACTOR">Contractor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Payment Preference</label>
              <select {...register('paymentPref')} className={inputCls()}>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="STRIPE">Stripe Online</option>
                <option value="CHECK">Check</option>
                <option value="CASH">Cash</option>
                <option value="VENMO">Venmo</option>
                <option value="ZELLE">Zelle</option>
                <option value="ACH">ACH</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Notes</label>
            <textarea {...register('notes')} rows={2} placeholder="NET 30 terms, gate code, special instructions..." className={inputCls()} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/15 text-mint-muted hover:bg-white/8 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#dcfce7', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
            >
              {isPending ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
