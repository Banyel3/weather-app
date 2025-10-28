"use client"

import { Droplets, Wind, Eye, Gauge } from "lucide-react"

export default function CurrentWeather({ data }) {
  // TODO: Implement weather icon mapping based on condition
  // Map weather conditions to appropriate icons/emojis
  // Example: "Sunny" -> ☀️, "Rainy" -> 🌧️, "Cloudy" -> ☁️, etc.

  const getWeatherIcon = (condition) => {
    // Placeholder - replace with actual icon mapping
    return "🌤️"
  }

  return (
    <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Main weather info */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">{data.location}</h2>
          <p className="text-muted-foreground mb-6">{data.condition}</p>

          <div className="flex items-start gap-4">
            <div className="text-7xl">{getWeatherIcon(data.condition)}</div>
            <div>
              <div className="text-6xl font-bold text-foreground">{Math.round(data.temperature)}°</div>
              <p className="text-muted-foreground">Feels like {Math.round(data.feelsLike)}°</p>
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
            <p className="text-2xl font-bold text-foreground">{data.windSpeed} mph</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Visibility</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.visibility} mi</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Pressure</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.pressure} mb</p>
          </div>
        </div>
      </div>
    </div>
  )
}
