"use client"

export default function ForecastCard({ day }) {
  // TODO: Implement weather icon mapping for forecast
  // Map weather conditions to appropriate icons/emojis

  const getWeatherIcon = (condition) => {
    // Placeholder - replace with actual icon mapping
    return "🌤️"
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-foreground mb-3">{day.day}</h3>

      <div className="text-4xl mb-3 text-center">{getWeatherIcon(day.condition)}</div>

      <p className="text-sm text-muted-foreground text-center mb-3">{day.condition}</p>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">High</span>
          <span className="font-semibold text-foreground">{Math.round(day.high)}°</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Low</span>
          <span className="font-semibold text-foreground">{Math.round(day.low)}°</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Chance of Rain</span>
          <span className="font-semibold text-foreground">{day.chanceOfRain}%</span>
        </div>
      </div>
    </div>
  )
}
