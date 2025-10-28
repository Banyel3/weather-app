"use client"

import { useState } from "react"
import LocationSearch from "@/components/location-search"
import CurrentWeather from "@/components/current-weather"
import ForecastCard from "@/components/forecast-card"
import { Cloud, MapPin, Loader } from "lucide-react"

export default function Home() {
  const [location, setLocation] = useState("")
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [useGeolocation, setUseGeolocation] = useState(false)

  // Fetch weather data based on location
  const fetchWeather = async (searchLocation) => {
    setLoading(true)
    setError("")
    try {
      // TODO: Replace with your backend API endpoint
      // Expected endpoint: POST /api/weather
      // Body: { location: string, coordinates?: { lat: number, lon: number } }
      // Response: { current: {...}, forecast: [...] }

      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: searchLocation }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()
      setCurrentWeather(data.current)
      setForecast(data.forecast || [])
    } catch (err) {
      setError(err.message || "Unable to fetch weather. Please try again.")
      console.error("Weather fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get user's current location
  const handleGeolocation = () => {
    setUseGeolocation(true)
    setLoading(true)
    setError("")

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // TODO: Replace with your backend API endpoint
            // Expected endpoint: POST /api/weather
            // Body: { coordinates: { lat: number, lon: number } }
            // Response: { current: {...}, forecast: [...] }

            const response = await fetch("/api/weather", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                coordinates: { lat: latitude, lon: longitude },
              }),
            })

            if (!response.ok) {
              throw new Error("Failed to fetch weather data")
            }

            const data = await response.json()
            setCurrentWeather(data.current)
            setForecast(data.forecast || [])
            setLocation(data.current?.location || "Current Location")
          } catch (err) {
            setError("Unable to fetch weather for your location")
            console.error("Geolocation weather error:", err)
          } finally {
            setLoading(false)
          }
        },
        (err) => {
          setError("Unable to access your location. Please enable location services.")
          setLoading(false)
          console.error("Geolocation error:", err)
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
    }
  }

  const handleSearch = (searchLocation) => {
    setLocation(searchLocation)
    setUseGeolocation(false)
    fetchWeather(searchLocation)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
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
            <CurrentWeather data={currentWeather} />

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
