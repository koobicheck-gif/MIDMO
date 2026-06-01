'use client'

import { useQuery } from '@tanstack/react-query'
import type { WeatherData } from '@/types'

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch('/api/weather')
  if (!res.ok) throw new Error('Failed to fetch weather')
  return res.json()
}

export function useWeather() {
  return useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 30,
  })
}
