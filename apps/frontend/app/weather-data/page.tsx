"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, List, Cloud, Loader } from "lucide-react";
import WeatherRequestForm from "@/components/weather-request-form";
import WeatherRequestsList from "@/components/weather-requests-list";
import WeatherRequestDetail from "@/components/weather-request-detail";
import { weatherAPI, type WeatherRequest } from "@/lib/api-client";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

type ViewMode = "list" | "detail";

export default function WeatherDataPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastCreatedRequest, setLastCreatedRequest] =
    useState<WeatherRequest | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!weatherAPI.isAuthenticated()) {
        router.push("/auth");
        return;
      }

      try {
        // Verify token is valid
        await weatherAPI.getCurrentUser();
        setIsAuthenticated(true);
      } catch (err) {
        // Token is invalid, redirect to auth
        weatherAPI.setToken(null);
        router.push("/auth");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleView = (id: number) => {
    setSelectedRequestId(id);
    setViewMode("detail");
    setActiveTab("history");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedRequestId(null);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateSuccess = (request: WeatherRequest) => {
    setLastCreatedRequest(request);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDismissLastCreated = () => {
    setLastCreatedRequest(null);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-linear-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </main>
    );
  }

  // If not authenticated, return null (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-linear-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Database className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Weather Data Management
              </h1>
            </div>
            <p className="text-center text-muted-foreground">
              Create, view, update, and manage weather data requests with date
              ranges
            </p>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Request
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <List className="h-4 w-4" />
                View History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              {/* Show last created request if exists */}
              {lastCreatedRequest && (
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Request Created Successfully!
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismissLastCreated}
                      >
                        ✕
                      </Button>
                    </div>
                    <CardDescription>
                      Your weather data has been saved. View full details in
                      History.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">
                          {lastCreatedRequest.location_name},{" "}
                          {lastCreatedRequest.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date Range
                        </p>
                        <p className="font-medium">
                          {new Date(
                            lastCreatedRequest.start_date
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            lastCreatedRequest.end_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Weather Data Points
                      </p>
                      <p className="font-medium">
                        {lastCreatedRequest.weather_data.length} days of data
                        collected
                      </p>
                    </div>
                    {lastCreatedRequest.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{lastCreatedRequest.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleView(lastCreatedRequest.id);
                          handleDismissLastCreated();
                        }}
                      >
                        View Full Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("history")}
                      >
                        Go to History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <WeatherRequestForm
                mode="create"
                onSuccess={handleCreateSuccess}
              />

              {/* Info Card */}
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>1. Enter a Location:</strong> Type a city name and
                    we'll validate it with fuzzy matching
                  </p>
                  <p>
                    <strong>2. Select Date Range:</strong> Choose start and end
                    dates (supports historical data from 1940 and forecasts up
                    to 16 days ahead)
                  </p>
                  <p>
                    <strong>3. Add Notes:</strong> Optionally add notes about
                    why you're requesting this data
                  </p>
                  <p>
                    <strong>4. Submit:</strong> We'll fetch the weather data and
                    store it in the database for future reference
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {viewMode === "list" && (
                <WeatherRequestsList
                  key={refreshKey}
                  onView={handleView}
                  onRefresh={() => setRefreshKey((prev) => prev + 1)}
                />
              )}

              {viewMode === "detail" && selectedRequestId && (
                <WeatherRequestDetail
                  requestId={selectedRequestId}
                  onBack={handleBackToList}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
