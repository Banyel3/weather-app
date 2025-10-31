"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Calendar,
  MapPin,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  weatherAPI,
  type WeatherRequestListItem,
  type WeatherRequest,
} from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";
import {
  exportAsJSON,
  exportAsXML,
  exportAsCSV,
  exportAsMarkdown,
  exportAsPDF,
} from "@/lib/export-utils";

interface WeatherRequestsListProps {
  onView?: (id: number) => void;
  onRefresh?: () => void;
}

export default function WeatherRequestsList({
  onView,
  onRefresh,
}: WeatherRequestsListProps) {
  const [requests, setRequests] = useState<WeatherRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await weatherAPI.getWeatherRequests(
        searchQuery || undefined
      );
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load weather requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await weatherAPI.deleteWeatherRequest(deleteId);
      setRequests(requests.filter((r) => r.id !== deleteId));
      setDeleteId(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete request");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Request History</CardTitle>
          <CardDescription>
            View, edit, or delete previous weather requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchRequests} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Requests List */}
      {!loading && requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery
              ? "No requests found matching your search"
              : "No weather requests yet. Create one to get started!"}
          </CardContent>
        </Card>
      )}

      {!loading && requests.length > 0 && (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.location_name}
                          {request.country && (
                            <span className="text-muted-foreground font-normal ml-2">
                              {request.country}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(request.start_date)} -{" "}
                            {formatDate(request.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 pl-7">
                        {request.notes}
                      </p>
                    )}

                    <div className="text-xs text-muted-foreground pl-7">
                      Created{" "}
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:flex-col lg:flex-row">
                    {onView && (
                      <Button
                        onClick={() => onView(request.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const fullRequest =
                                await weatherAPI.getWeatherRequestById(
                                  request.id
                                );
                              exportAsJSON(fullRequest);
                            } catch (err) {
                              console.error(
                                "Failed to fetch request for export:",
                                err
                              );
                            }
                          }}
                        >
                          JSON Format
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const fullRequest =
                                await weatherAPI.getWeatherRequestById(
                                  request.id
                                );
                              exportAsXML(fullRequest);
                            } catch (err) {
                              console.error(
                                "Failed to fetch request for export:",
                                err
                              );
                            }
                          }}
                        >
                          XML Format
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const fullRequest =
                                await weatherAPI.getWeatherRequestById(
                                  request.id
                                );
                              exportAsCSV(fullRequest);
                            } catch (err) {
                              console.error(
                                "Failed to fetch request for export:",
                                err
                              );
                            }
                          }}
                        >
                          CSV Format
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const fullRequest =
                                await weatherAPI.getWeatherRequestById(
                                  request.id
                                );
                              exportAsMarkdown(fullRequest);
                            } catch (err) {
                              console.error(
                                "Failed to fetch request for export:",
                                err
                              );
                            }
                          }}
                        >
                          Markdown Format
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const fullRequest =
                                await weatherAPI.getWeatherRequestById(
                                  request.id
                                );
                              exportAsPDF(fullRequest);
                            } catch (err) {
                              console.error(
                                "Failed to fetch request for export:",
                                err
                              );
                            }
                          }}
                        >
                          PDF (Print)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      onClick={() => setDeleteId(request.id)}
                      variant="destructive"
                      size="sm"
                      className="flex-1 md:flex-none"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this weather request and all
              associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
