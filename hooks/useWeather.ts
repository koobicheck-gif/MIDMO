'use client'

import { useQuery } from '@tanstack/react-query'
import { IS_STATIC } from '@/lib/mock-data'
import type { WeatherData } from '@/types'

const MOCK_WEATHER: WeatherData = {
  temperature: 78,
  weathercode: 2,
  description: 'Partly Cloudy',
  icon: '⛅',
  city: 'Columbia, MO',
}

async function fetchWeather(): Promise<WeatherData> {
  if (IS_STATIC) return MOCK_WEATHER
  const res = await fetch('/api/weather')
  if (!res.ok) throw new Error('Failed to fetch weather')
  return res.json()
}

export function useWeather() {
  return useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 1000 * 60 * 30,
    refetchInterval: IS_STATIC ? false : 1000 * 60 * 30,
  })
}
