'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MOCK_JOBS, IS_STATIC } from '@/lib/mock-data'

async function fetchJobs(params?: Record<string, string>) {
  if (IS_STATIC) return MOCK_JOBS
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(`/api/jobs${query}`)
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}

export function useJobs(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => fetchJobs(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      if (IS_STATIC) return { ...data, id: `j-${Date.now()}` }
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create job')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['dumpsters'] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (IS_STATIC) return { id, ...data }
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update job')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
