"use client"

import { Droplets, Wind, Gauge, CloudRain } from "lucide-react"
import type { CurrentWeather as CurrentWeatherType } from "@/lib/api-client"

interface CurrentWeatherProps {
  data: CurrentWeatherType & { location?: string }
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
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

  return (
    <div className="bg-linear-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Main weather info */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {data.location || "Current Location"}
          </h2>
          <p className="text-muted-foreground mb-6">{data.weather_description}</p>

          <div className="flex items-start gap-4">
            <div className="text-7xl">{getWeatherIcon(data.weather_code)}</div>
            <div>
              <div className="text-6xl font-bold text-foreground">
                {Math.round(data.temperature)}°
              </div>
              <p className="text-muted-foreground">
                Feels like {Math.round(data.feels_like)}°
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Weather details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Humidity</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.humidity}%</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Wind Speed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(data.wind_speed)} km/h
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Precipitation</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.precipitation} mm</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Pressure</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(data.pressure)} hPa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
