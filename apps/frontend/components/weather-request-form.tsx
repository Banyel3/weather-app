"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  weatherAPI,
  type CreateWeatherRequestPayload,
  type UpdateWeatherRequestPayload,
  type WeatherRequest,
} from "@/lib/api-client";

interface WeatherRequestFormProps {
  mode: "create" | "edit";
  existingRequest?: WeatherRequest;
  onSuccess?: (request: WeatherRequest) => void;
  onCancel?: () => void;
}

export default function WeatherRequestForm({
  mode,
  existingRequest,
  onSuccess,
  onCancel,
}: WeatherRequestFormProps) {
  const [locationName, setLocationName] = useState(
    existingRequest?.location_name || ""
  );
  const [startDate, setStartDate] = useState(existingRequest?.start_date || "");
  const [endDate, setEndDate] = useState(existingRequest?.end_date || "");
  const [notes, setNotes] = useState(existingRequest?.notes || "");

  const [loading, setLoading] = useState(false);
  const [validatingLocation, setValidatingLocation] = useState(false);
  const [validatingDates, setValidatingDates] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [dateRangeValid, setDateRangeValid] = useState<boolean | null>(null);
  const [dateRangeError, setDateRangeError] = useState("");

  // Validate location when it changes
  useEffect(() => {
    if (locationName.length < 2) {
      setLocationValid(null);
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingLocation(true);
      try {
        const validation = await weatherAPI.validateLocation(locationName);
        setLocationValid(validation.valid);
        if (!validation.valid && validation.suggestions) {
          setLocationSuggestions(
            validation.suggestions.map((s) => `${s.name}, ${s.country}`)
          );
        } else {
          setLocationSuggestions([]);
        }
      } catch (err) {
        setLocationValid(false);
      } finally {
        setValidatingLocation(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [locationName]);

  // Validate date range when dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      setDateRangeValid(null);
      setDateRangeError("");
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingDates(true);
      try {
        const validation = await weatherAPI.validateDateRange(
          startDate,
          endDate
        );
        setDateRangeValid(validation.valid);
        setDateRangeError(validation.error || "");
      } catch (err) {
        setDateRangeValid(false);
      } finally {
        setValidatingDates(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "create") {
        const payload: CreateWeatherRequestPayload = {
          location_name: locationName,
          start_date: startDate,
          end_date: endDate,
          notes: notes || undefined,
        };
        const result = await weatherAPI.createWeatherRequest(payload);
        setSuccess("Weather request created successfully!");
        if (onSuccess) onSuccess(result);

        // Reset form
        setLocationName("");
        setStartDate("");
        setEndDate("");
        setNotes("");
      } else {
        if (!existingRequest) return;

        const payload: UpdateWeatherRequestPayload = {};
        if (locationName !== existingRequest.location_name)
          payload.location_name = locationName;
        if (startDate !== existingRequest.start_date)
          payload.start_date = startDate;
        if (endDate !== existingRequest.end_date) payload.end_date = endDate;
        if (notes !== existingRequest.notes) payload.notes = notes;

        const result = await weatherAPI.updateWeatherRequest(
          existingRequest.id,
          payload
        );
        setSuccess("Weather request updated successfully!");
        if (onSuccess) onSuccess(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save weather request");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    locationValid && dateRangeValid && locationName && startDate && endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Create Weather Request"
            : "Edit Weather Request"}
        </CardTitle>
        <CardDescription>
          Enter a location and date range to fetch and store weather data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Field */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Enter city name (e.g., London, New York)"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="pl-10"
                required
              />
              {validatingLocation && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!validatingLocation && locationValid === true && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
              {!validatingLocation && locationValid === false && (
                <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {locationSuggestions.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Did you mean: {locationSuggestions.slice(0, 3).join(", ")}?
              </div>
            )}
          </div>

          {/* Date Range Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date Range Validation */}
          {validatingDates && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating dates...
            </div>
          )}
          {!validatingDates && dateRangeValid === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{dateRangeError}</AlertDescription>
            </Alert>
          )}
          {!validatingDates && dateRangeValid === true && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Date range is valid
            </div>
          )}

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this weather request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Request"
              ) : (
                "Update Request"
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
