'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { X, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useNewJobModal } from '@/store/useNewJobModal'
import { useCreateJob } from '@/hooks/useJobs'
import { useCustomers } from '@/hooks/useCustomers'
import { cn } from '@/lib/utils'

const schema = z.object({
  type: z.enum(['DELIVERY', 'PICKUP', 'SWAP']),
  customerId: z.string().min(1, 'Customer required'),
  dumpsterId: z.string().optional(),
  address: z.string().min(5, 'Address required'),
  scheduledAt: z.string().min(1, 'Date required'),
  rentalDays: z.coerce.number().int().min(1).optional(),
  notes: z.string().optional(),
  gateCode: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewJobModal() {
  const { isOpen, prefill, close } = useNewJobModal()
  const { mutateAsync: createJob, isPending } = useCreateJob()
  const { data: customers = [] } = useCustomers()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'DELIVERY',
      rentalDays: 7,
      scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  useEffect(() => {
    if (isOpen && prefill) {
      if (prefill.customerId) setValue('customerId', prefill.customerId)
      if (prefill.address) setValue('address', prefill.address)
      if (prefill.dumpsterId) setValue('dumpsterId', prefill.dumpsterId)
      if (prefill.jobType) setValue('type', prefill.jobType)
    }
    if (!isOpen) {
      reset({
        type: 'DELIVERY',
        rentalDays: 7,
        scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      })
    }
  }, [isOpen, prefill, setValue, reset])

  if (!isOpen) return null

  const onSubmit = async (data: FormData) => {
    try {
      const job = await createJob({
        ...data,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        lat: prefill?.lat,
        lng: prefill?.lng,
      })
      const customerName = customers.find((c: any) => c.id === data.customerId)?.name ?? 'Customer'
      toast.success(`✅ Job confirmed for ${customerName}`, {
        description: `${data.type} scheduled for ${format(new Date(data.scheduledAt), 'MMM d, yyyy')}`,
      })
      close()
    } catch {
      toast.error('Failed to create job. Please try again.')
    }
  }

  const jobType = watch('type')

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'rgba(5, 46, 22, 0.98)',
          border: '1.5px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-mint">New Job</h2>
            <p className="text-xs text-mint-muted">Schedule a delivery, pickup, or swap</p>
          </div>
          <button onClick={close} className="p-2 rounded-xl hover:bg-white/10 text-mint-muted hover:text-mint transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prefill banner */}
        {prefill?.unitId && (
          <div className="mx-5 mt-4 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-300">
              Location data loaded from <span className="font-mono font-bold">{prefill.unitId}</span>
              {prefill.customerName && ` · ${prefill.customerName}`}
              {prefill.daysOnSite !== undefined && ` · Day ${prefill.daysOnSite} on site`}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Job type */}
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-2">Job Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['DELIVERY', 'PICKUP', 'SWAP'] as const).map(type => (
                <label key={type} className="cursor-pointer">
                  <input type="radio" {...register('type')} value={type} className="sr-only" />
                  <div className={cn(
                    'text-center py-2 rounded-xl text-xs font-medium border transition-all',
                    jobType === type
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : 'bg-white/5 border-white/10 text-mint-muted hover:bg-white/10'
                  )}>
                    {type}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Customer</label>
            <select
              {...register('customerId')}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-mint',
                errors.customerId ? 'border-red-500/50' : 'border-white/10',
                'focus:outline-none focus:border-green-500/50'
              )}
            >
              <option value="">Select customer...</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-red-400 text-xs mt-1">{errors.customerId.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-mint-muted mb-1.5">Service Address</label>
            <input
              {...register('address')}
              placeholder="123 Main St, Columbia, MO"
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-mint placeholder-white/25',
                errors.address ? 'border-red-500/50' : 'border-white/10',
                'focus:outline-none focus:border-green-500/50'
              )}
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
          </div>

          {/* Date + Rental Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Scheduled Date</label>
              <input
                type="datetime-local"
                {...register('scheduledAt')}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint focus:outline-none focus:border-green-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Rental Days</label>
              <input
                type="number"
                {...register('rentalDays')}
                min={1}
                max={90}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint focus:outline-none focus:border-green-500/50"
              />
            </div>
          </div>

          {/* Gate code + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Gate Code</label>
              <input
                {...register('gateCode')}
                placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mint-muted mb-1.5">Notes</label>
              <input
                {...register('notes')}
                placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-mint placeholder-white/25 focus:outline-none focus:border-green-500/50"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/15 text-mint-muted hover:bg-white/8 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#dcfce7',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              {isPending ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
