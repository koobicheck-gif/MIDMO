'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchCustomers(params?: Record<string, string>) {
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
