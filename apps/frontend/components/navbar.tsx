"use client";

import { Cloud, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { weatherAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = weatherAPI.isAuthenticated();

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Cloud className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Weather Tracker</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/weather-data">
                <Button
                  variant={pathname === "/weather-data" ? "default" : "ghost"}
                  size="sm"
                >
                  My Weather Data
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={async () => {
                  await weatherAPI.logout();
                  router.push("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              {pathname !== "/auth" && (
                <Link href="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
