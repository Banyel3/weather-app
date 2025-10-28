"use client"

import type { DailyForecast } from "@/lib/api-client"

interface ForecastCardProps {
  day: DailyForecast
}

export default function ForecastCard({ day }: ForecastCardProps) {
  // Map WMO weather codes to icons
  const getWeatherIcon = (weatherCode: number): string => {
    if (weatherCode === 0) return "☀️" // Clear sky
    if (weatherCode <= 3) return "🌤️" // Mainly clear, partly cloudy, overcast
    if (weatherCode <= 48) return "🌫️" // Fog
    if (weatherCode <= 57) return "🌦️" // Drizzle
    if (weatherCode <= 67) return "🌧️" // Rain
    if (weatherCode <= 77) return "🌨️" // Snow
    if (weatherCode <= 82) return "🌧️" // Rain showers
    if (weatherCode <= 86) return "🌨️" // Snow showers
    if (weatherCode <= 99) return "⛈️" // Thunderstorm
    return "🌤️"
  }

  // Format date to day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    }
    
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-foreground mb-3">{getDayName(day.date)}</h3>

      <div className="text-4xl mb-3 text-center">{getWeatherIcon(day.weather_code)}</div>

      <p className="text-sm text-muted-foreground text-center mb-3">{day.weather_description}</p>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">High</span>
          <span className="font-semibold text-foreground">
            {Math.round(day.temperature_max)}°
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Low</span>
          <span className="font-semibold text-foreground">
            {Math.round(day.temperature_min)}°
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Rain</span>
          <span className="font-semibold text-foreground">
            {day.precipitation_probability}%
          </span>
        </div>
      </div>
    </div>
  )
}
