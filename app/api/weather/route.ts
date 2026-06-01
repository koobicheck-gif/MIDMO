import { NextResponse } from 'next/server'
import { getWeatherDescription } from '@/lib/weather'

export const revalidate = 1800

export async function GET() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=38.9517&longitude=-92.3341&current=temperature_2m,weathercode&temperature_unit=fahrenheit&wind_speed_unit=mph',
      { next: { revalidate: 1800 } }
    )

    if (!res.ok) {
      throw new Error('Weather API unavailable')
    }

    const data = await res.json()
    const { temperature_2m: temperature, weathercode } = data.current
    const { description, icon } = getWeatherDescription(weathercode)

    return NextResponse.json({
      temperature: Math.round(temperature),
      weathercode,
      description,
      icon,
      city: 'Columbia, MO',
    })
  } catch {
    return NextResponse.json({
      temperature: 72,
      weathercode: 0,
      description: 'Clear',
      icon: '☀️',
      city: 'Columbia, MO',
    })
  }
}
