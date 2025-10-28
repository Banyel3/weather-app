"use client"

import { useState } from "react"
import LocationSearch from "@/components/location-search"
import CurrentWeather from "@/components/current-weather"
import ForecastCard from "@/components/forecast-card"
import { Cloud, MapPin, Loader } from "lucide-react"
import { weatherAPI, type CompleteWeatherData, type Location } from "@/lib/api-client"
import { getCurrentPosition, formatCoordinates } from "@/lib/geolocation"

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null)
  const [currentWeather, setCurrentWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [useGeolocation, setUseGeolocation] = useState(false)

  // Fetch weather data based on location name
  const fetchWeather = async (searchLocation: string) => {
    setLoading(true)
    setError("")
    try {
      const data: CompleteWeatherData = await weatherAPI.getCompleteWeather(searchLocation, 7)
      setLocation(data.location)
      setCurrentWeather(data.current)
      setForecast(data.forecast || [])
    } catch (err: any) {
      setError(err.message || "Unable to fetch weather. Please try again.")
      console.error("Weather fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get user's current location
  const handleGeolocation = async () => {
    setUseGeolocation(true)
    setLoading(true)
    setError("")

    try {
      // Get user's position
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords
      
      // Fetch weather data
      const data = await weatherAPI.getWeatherByCoordinates(latitude, longitude, 7)
      
      setCurrentWeather(data.current)
      setForecast(data.forecast || [])
      
      // Set location with formatted coordinates
      setLocation({
        name: `Your Location (${formatCoordinates(latitude, longitude)})`,
        country: "",
        latitude,
        longitude,
        timezone: data.current.timezone,
      })
    } catch (err: any) {
      setError(err.message || "Unable to fetch weather for your location")
      console.error("Geolocation error:", err)
      setCurrentWeather(null)
      setForecast([])
    } finally {
      setLoading(false)
      setUseGeolocation(false)
    }
  }

  const handleSearch = (searchLocation: string) => {
    setUseGeolocation(false)
    fetchWeather(searchLocation)
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Cloud className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Weather</h1>
          </div>
          <p className="text-center text-muted-foreground">Check the weather for any location</p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <LocationSearch onSearch={handleSearch} />
          <button
            onClick={handleGeolocation}
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-accent-foreground rounded-lg font-medium transition-colors"
          >
            {loading && useGeolocation ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Use My Location
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Your browser will ask for location permission
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && !useGeolocation && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Current Weather */}
        {currentWeather && !loading && (
          <>
            <CurrentWeather 
              data={{
                ...currentWeather,
                location: location ? `${location.name}, ${location.country}` : "Current Location"
              }} 
            />

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">5-Day Forecast</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <ForecastCard key={index} day={day} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!currentWeather && !loading && !error && (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">
              Search for a location or use your current location to see the weather
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
