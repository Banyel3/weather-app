"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cloud, ArrowRight } from "lucide-react";
import { weatherAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const router = useRouter();

  // Check authentication and redirect
  useEffect(() => {
    const checkAuth = async () => {
      if (weatherAPI.isAuthenticated()) {
        try {
          await weatherAPI.getCurrentUser();
          // User is authenticated, redirect to weather data page
          router.push("/weather-data");
        } catch (err) {
          // Token is invalid, clear it and show landing page
          weatherAPI.setToken(null);
        }
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-linear-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cloud className="w-16 h-16 text-blue-500" />
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                Weather Tracker
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Track and manage historical weather data
            </p>
            <p className="text-muted-foreground">
              Access weather information from 1940 to 16 days into the future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  Weather Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create requests for any location and date range, then view
                  detailed weather information including temperature,
                  precipitation, and wind data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-green-500" />
                  Historical & Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access historical weather data dating back to 1940 or get
                  forecasts up to 16 days ahead for any location worldwide.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-purple-500" />
                  Personal Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Save and manage your weather data requests. View, organize,
                  and delete your personal weather history anytime.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push("/auth")}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Create a free account to start tracking weather data
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
