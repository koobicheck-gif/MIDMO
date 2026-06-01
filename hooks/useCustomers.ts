'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MOCK_CUSTOMERS, IS_STATIC } from '@/lib/mock-data'

async function fetchCustomers(params?: Record<string, string>) {
  if (IS_STATIC) return MOCK_CUSTOMERS
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`/api/customers${query}`)
  if (!res.ok) throw new Error('Failed to fetch customers')
  return res.json()
}

export function useCustomers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      if (IS_STATIC) return MOCK_CUSTOMERS.find(c => c.id === id) ?? MOCK_CUSTOMERS[0]
      const res = await fetch(`/api/customers/${id}`)
      if (!res.ok) throw new Error('Failed to fetch customer')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      if (IS_STATIC) return { ...data, id: `c-${Date.now()}`, _count: { jobs: 0, invoices: 0 } }
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create customer')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (IS_STATIC) return { id, ...data }
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update customer')
      return res.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
