"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Calendar,
  CloudRain,
  Thermometer,
  Wind,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Download,
  FileJson,
  FileText,
  FileCode,
  FileDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { weatherAPI, type WeatherRequest } from "@/lib/api-client";
import {
  exportAsJSON,
  exportAsXML,
  exportAsCSV,
  exportAsMarkdown,
  exportAsPDF,
} from "@/lib/export-utils";

interface WeatherRequestDetailProps {
  requestId: number;
  onBack?: () => void;
}

export default function WeatherRequestDetail({
  requestId,
  onBack,
}: WeatherRequestDetailProps) {
  const [request, setRequest] = useState<WeatherRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await weatherAPI.getWeatherRequestById(requestId);
        setRequest(data);
      } catch (err: any) {
        setError(err.message || "Failed to load weather request");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return "☀️";
    if (code === 2 || code === 3) return "⛅";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 57) return "🌧️";
    if (code >= 61 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 85 && code <= 86) return "❄️";
    if (code >= 95 && code <= 99) return "⛈️";
    return "🌡️";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!request) {
    return (
      <Alert>
        <AlertDescription>Weather request not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {onBack && (
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        )}

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => exportAsJSON(request)}
              className="cursor-pointer"
            >
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportAsXML(request)}
              className="cursor-pointer"
            >
              <FileCode className="h-4 w-4 mr-2" />
              XML
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportAsCSV(request)}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV (Delimited)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportAsMarkdown(request)}
              className="cursor-pointer"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Markdown
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportAsPDF(request)}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">
                  {request.location_name}
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                {request.country && <span>{request.country} • </span>}
                Lat: {request.latitude.toFixed(4)}, Lon:{" "}
                {request.longitude.toFixed(4)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm py-1 px-3">
              {request.timezone}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Date Range</div>
                <div className="font-medium">
                  {formatDate(request.start_date)} -{" "}
                  {formatDate(request.end_date)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Days</div>
              <div className="font-medium">
                {request.weather_data.length} days
              </div>
            </div>
          </div>

          {request.notes && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Notes</div>
                <p className="text-sm">{request.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Created: {formatDateTime(request.created_at)}</div>
            <div>Last Updated: {formatDateTime(request.updated_at)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Data</CardTitle>
          <CardDescription>
            Daily temperature and weather conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">High</TableHead>
                  <TableHead className="text-right">Low</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">Rain</TableHead>
                  <TableHead className="text-right">Wind</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.weather_data.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getWeatherIcon(day.weather_code)}
                        </span>
                        <span className="text-sm">
                          {day.weather_description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Thermometer className="h-3 w-3 text-red-500" />
                        <span>{day.temperature_max.toFixed(1)}°C</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Thermometer className="h-3 w-3 text-blue-500" />
                        <span>{day.temperature_min.toFixed(1)}°C</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {day.temperature_mean
                        ? day.temperature_mean.toFixed(1)
                        : (
                            (day.temperature_max + day.temperature_min) /
                            2
                          ).toFixed(1)}
                      °C
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <CloudRain className="h-3 w-3 text-blue-600" />
                        <span>{day.precipitation.toFixed(1)} mm</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Wind className="h-3 w-3 text-gray-600" />
                        <span>{day.wind_speed_max.toFixed(1)} km/h</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {Math.max(
                    ...request.weather_data.map((d) => d.temperature_max)
                  ).toFixed(1)}
                  °C
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Highest Temp
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.min(
                    ...request.weather_data.map((d) => d.temperature_min)
                  ).toFixed(1)}
                  °C
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Lowest Temp
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {request.weather_data
                    .reduce((sum, d) => sum + d.precipitation, 0)
                    .toFixed(1)}{" "}
                  mm
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Rain
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {(
                    request.weather_data.reduce(
                      (sum, d) => sum + d.wind_speed_max,
                      0
                    ) / request.weather_data.length
                  ).toFixed(1)}{" "}
                  km/h
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avg Wind
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
