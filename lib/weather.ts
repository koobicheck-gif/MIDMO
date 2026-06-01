export interface WeatherData {
  temperature: number
  weathercode: number
  description: string
  icon: string
}

export function getWeatherDescription(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Clear', icon: '☀️' }
  if (code <= 2) return { description: 'Partly Cloudy', icon: '⛅' }
  if (code === 3) return { description: 'Overcast', icon: '☁️' }
  if (code <= 49) return { description: 'Foggy', icon: '🌫️' }
  if (code <= 59) return { description: 'Drizzle', icon: '🌦️' }
  if (code <= 69) return { description: 'Rain', icon: '🌧️' }
  if (code <= 79) return { description: 'Snow', icon: '❄️' }
  if (code <= 82) return { description: 'Rain Showers', icon: '🌧️' }
  if (code <= 86) return { description: 'Snow Showers', icon: '🌨️' }
  if (code <= 99) return { description: 'Thunderstorm', icon: '⛈️' }
  return { description: 'Unknown', icon: '🌡️' }
}
