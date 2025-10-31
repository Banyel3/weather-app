"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { weatherAPI } from "@/lib/api-client";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await weatherAPI.login({
        username: loginData.username,
        password: loginData.password,
      });
      router.push("/weather-data");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!signupData.first_name || !signupData.last_name) {
      setError("First name and last name are required");
      return;
    }

    // Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await weatherAPI.signup({
        username: signupData.username,
        password: signupData.password,
        first_name: signupData.first_name,
        last_name: signupData.last_name,
      });
      router.push("/weather-data");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Weather Data Tracker
            </CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to track weather data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "login" | "signup")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username *</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signupData.username}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name *</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="First name"
                        value={signupData.first_name}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name *</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Last name"
                        value={signupData.last_name}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            last_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password *
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Re-enter your password"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      minLength={8}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
