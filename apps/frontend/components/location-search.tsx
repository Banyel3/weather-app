"use client"

import { useState } from "react"
import { Search } from "lucide-react"

interface LocationSearchProps {
  onSearch: (location: string) => void
}

export default function LocationSearch({ onSearch }: LocationSearchProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input.trim())
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter city, zip code, coordinates, or landmark..."
          className="w-full px-4 py-3 pl-12 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded font-medium transition-colors"
        >
          Search
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Try: "New York", "90210", "40.7128,-74.0060", or "Eiffel Tower"
      </p>
    </form>
  )
}
