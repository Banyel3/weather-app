/**
 * Weather API Client
 * Handles all communication with the Django backend
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/weather";

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

// ============================================================================
// CRUD Types
// ============================================================================

export interface WeatherDataItem {
  date: string;
  temperature_max: number;
  temperature_min: number;
  temperature_mean?: number;
  feels_like_max: number;
  feels_like_min: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  weather_description: string;
  wind_speed_max: number;
  wind_direction: number;
}

export interface WeatherRequest {
  id: number;
  location_name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  start_date: string;
  end_date: string;
  weather_data: WeatherDataItem[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherRequestListItem {
  id: number;
  location_name: string;
  country: string;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWeatherRequestPayload {
  location_name: string;
  start_date: string;
  end_date: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  timezone?: string;
}

export interface UpdateWeatherRequestPayload {
  location_name?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  timezone?: string;
}

export interface LocationValidation {
  valid: boolean;
  error?: string;
  best_match?: Location;
  suggestions?: Location[];
}

export interface DateRangeValidation {
  valid: boolean;
  error?: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface SignupPayload {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class WeatherAPIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "An error occurred");
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
    return this.handleResponse<{ forecast: DailyForecast[]; timezone: string }>(
      response
    );
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
    return this.handleResponse<{ hourly: HourlyForecast[]; timezone: string }>(
      response
    );
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

  // ============================================================================
  // Authentication Operations
  // ============================================================================

  /**
   * Sign up a new user
   */
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.token);
    return data;
  }

  /**
   * Log in a user
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await this.handleResponse<AuthResponse>(response);
    this.setToken(data.token);
    return data;
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    if (this.token) {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    }
    this.setToken(null);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Validate a location name
   */
  async validateLocation(locationName: string): Promise<LocationValidation> {
    const response = await fetch(
      `${this.baseUrl}/validate-location?location_name=${encodeURIComponent(locationName)}`
    );
    return this.handleResponse<LocationValidation>(response);
  }

  /**
   * Validate a date range
   */
  async validateDateRange(
    startDate: string,
    endDate: string
  ): Promise<DateRangeValidation> {
    const response = await fetch(
      `${this.baseUrl}/validate-dates?start_date=${startDate}&end_date=${endDate}`
    );
    return this.handleResponse<DateRangeValidation>(response);
  }

  /**
   * CREATE: Create a new weather request
   */
  async createWeatherRequest(
    payload: CreateWeatherRequestPayload
  ): Promise<WeatherRequest> {
    const response = await fetch(`${this.baseUrl}/weather-requests`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<WeatherRequest>(response);
  }

  /**
   * READ: Get list of weather requests
   */
  async getWeatherRequests(
    location?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<WeatherRequestListItem[]> {
    let url = `${this.baseUrl}/weather-requests?limit=${limit}&offset=${offset}`;
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<WeatherRequestListItem[]>(response);
  }

  /**
   * READ: Get a specific weather request by ID
   */
  async getWeatherRequestById(id: number): Promise<WeatherRequest> {
    const response = await fetch(`${this.baseUrl}/weather-requests/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<WeatherRequest>(response);
  }

  /**
   * UPDATE: Update an existing weather request
   */
  async updateWeatherRequest(
    id: number,
    payload: UpdateWeatherRequestPayload
  ): Promise<WeatherRequest> {
    const response = await fetch(`${this.baseUrl}/weather-requests/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<WeatherRequest>(response);
  }

  /**
   * DELETE: Delete a weather request
   */
  async deleteWeatherRequest(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/weather-requests/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }
}

// Export singleton instance
export const weatherAPI = new WeatherAPIClient();

// Export class for custom instances
export default WeatherAPIClient;
