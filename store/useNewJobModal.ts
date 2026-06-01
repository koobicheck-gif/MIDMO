import { create } from 'zustand'

interface JobPrefill {
  customerId?: string
  customerName?: string
  phone?: string
  address?: string
  dumpsterId?: string
  unitId?: string
  sizeYd?: number
  daysOnSite?: number
  lat?: number
  lng?: number
  jobType?: 'DELIVERY' | 'PICKUP' | 'SWAP'
}

interface NewJobModalStore {
  isOpen: boolean
  prefill: JobPrefill | undefined
  open: (prefill?: JobPrefill) => void
  close: () => void
}

export const useNewJobModal = create<NewJobModalStore>((set) => ({
  isOpen: false,
  prefill: undefined,
  open: (prefill) => set({ isOpen: true, prefill }),
  close: () => set({ isOpen: false, prefill: undefined }),
}))
