/**
 * Weather API Client
 * Handles all communication with the Django backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/weather';

export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  weather_description: string;
  cloud_cover: number;
  pressure: number;
  surface_pressure: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  time: string;
  timezone: string;
}

export interface DailyForecast {
  date: string;
  weather_code: number;
  weather_description: string;
  temperature_max: number;
  temperature_min: number;
  feels_like_max: number;
  feels_like_min: number;
  precipitation: number;
  rain: number;
  precipitation_probability: number;
  wind_speed_max: number;
  wind_gusts_max: number;
  wind_direction: number;
  sunrise: string;
  sunset: string;
  uv_index_max: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  precipitation_probability: number;
  precipitation: number;
  weather_code: number;
  weather_description: string;
  wind_speed: number;
  wind_direction: number;
}

export interface CompleteWeatherData {
  location: Location;
  current: CurrentWeather;
  forecast: DailyForecast[];
}

export interface ApiError {
  error: string;
  message: string;
}

class WeatherAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'An error occurred');
    }
    return response.json();
  }

  /**
   * Search for locations by name
   */
  async searchLocation(query: string): Promise<Location[]> {
    const response = await fetch(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}`
    );
    return this.handleResponse<Location[]>(response);
  }

  /**
   * Get current weather by coordinates
   */
  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    const response = await fetch(
      `${this.baseUrl}/current?lat=${lat}&lon=${lon}`
    );
    return this.handleResponse<CurrentWeather>(response);
  }

  /**
   * Get daily forecast by coordinates
   */
  async getForecast(
    lat: number,
    lon: number,
    days: number = 7
  ): Promise<{ forecast: DailyForecast[]; timezone: string }> {
    const response = await fetch(
      `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&days=${days}`
    );
    return this.handleResponse<{ forecast: DailyForecast[]; timezone: string }>(response);
  }

  /**
   * Get hourly forecast by coordinates
   */
  async getHourlyForecast(
    lat: number,
    lon: number,
    hours: number = 24
  ): Promise<{ hourly: HourlyForecast[]; timezone: string }> {
    const response = await fetch(
      `${this.baseUrl}/hourly?lat=${lat}&lon=${lon}&hours=${hours}`
    );
    return this.handleResponse<{ hourly: HourlyForecast[]; timezone: string }>(response);
  }

  /**
   * Get complete weather data by location name
   */
  async getCompleteWeather(
    query: string,
    days: number = 7
  ): Promise<CompleteWeatherData> {
    const response = await fetch(
      `${this.baseUrl}/complete?q=${encodeURIComponent(query)}&days=${days}`
    );
    return this.handleResponse<CompleteWeatherData>(response);
  }

  /**
   * Get weather by geolocation coordinates
   */
  async getWeatherByCoordinates(
    lat: number,
    lon: number,
    days: number = 7
  ): Promise<{
    current: CurrentWeather;
    forecast: DailyForecast[];
  }> {
    const [current, forecastData] = await Promise.all([
      this.getCurrentWeather(lat, lon),
      this.getForecast(lat, lon, days),
    ]);

    return {
      current,
      forecast: forecastData.forecast,
    };
  }
}

// Export singleton instance
export const weatherAPI = new WeatherAPIClient();

// Export class for custom instances
export default WeatherAPIClient;
