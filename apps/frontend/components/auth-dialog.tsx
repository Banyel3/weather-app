"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, UserPlus, LogIn } from "lucide-react";
import {
  weatherAPI,
  type SignupPayload,
  type LoginPayload,
  type User,
} from "@/lib/api-client";

interface AuthDialogProps {
  onSuccess?: (user: User) => void;
}

export default function AuthDialog({ onSuccess }: AuthDialogProps) {
  // Signup state
  const [signupData, setSignupData] = useState<SignupPayload>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  // Login state
  const [loginData, setLoginData] = useState<LoginPayload>({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await weatherAPI.signup(signupData);
      if (onSuccess) onSuccess(response.user);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await weatherAPI.login(loginData);
      if (onSuccess) onSuccess(response.user);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Weather Data Account</CardTitle>
        <CardDescription>
          Sign in or create an account to save your weather data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
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

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username *</Label>
                <Input
                  id="signup-username"
                  placeholder="Choose a username (min 3 characters)"
                  value={signupData.username}
                  onChange={(e) =>
                    setSignupData({ ...signupData, username: e.target.value })
                  }
                  required
                  minLength={3}
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
                  placeholder="Choose a password (min 6 characters)"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <Input
                    id="signup-firstname"
                    placeholder="John"
                    value={signupData.first_name}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastname">Last Name</Label>
                  <Input
                    id="signup-lastname"
                    placeholder="Doe"
                    value={signupData.last_name}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
