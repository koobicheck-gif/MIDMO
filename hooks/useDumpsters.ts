'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchDumpsters(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`/api/dumpsters${query}`)
  if (!res.ok) throw new Error('Failed to fetch dumpsters')
  return res.json()
}

export function useDumpsters(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['dumpsters', params],
    queryFn: () => fetchDumpsters(params),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  })
}

export function useUpdateDumpster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/dumpsters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update dumpster')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dumpsters'] })
    },
  })
}
