import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import { MagnifyingGlass, ArrowLeft, Download } from "phosphor-react";
import { Link } from "react-router-dom";

interface WaitlistEntry {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  location?: string;
  interest_type?: string;
  referral_source?: string;
  additional_info?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export default function AdminWaitlist() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const { toast } = useToast();

  const itemsPerPage = 15;

  // Debounced search term - only updates 300ms after user stops typing
  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => searchTerm, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [actualSearchTerm, setActualSearchTerm] = useState("");

  // Effect to handle the debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setActualSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchWaitlistEntries();
  }, [currentPage, actualSearchTerm, statusFilter, sourceFilter]);

  const fetchWaitlistEntries = async () => {
    try {
      setLoading(true);

      let query = supabase.from("waitlist").select("*", { count: "exact" });

      // Apply filters
      if (actualSearchTerm) {
        query = query.or(
          `email.ilike.%${actualSearchTerm}%,full_name.ilike.%${actualSearchTerm}%`
        );
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (sourceFilter !== "all") {
        query = query.eq("referral_source", sourceFilter);
      }

      // Get total count for pagination
      const { count } = await query;
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      // Get paginated data
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (error) throw error;
      setWaitlistEntries(data || []);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch waitlist entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("waitlist")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Waitlist entry status has been updated",
      });

      fetchWaitlistEntries();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const exportWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select(
          "email, full_name, phone_number, location, interest_type, referral_source, status, created_at"
        )
        .csv();

      if (error) throw error;

      // Create and download CSV file
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `waitlist_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Waitlist data has been exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting waitlist:", error);
      toast({
        title: "Export failed",
        description: "Failed to export waitlist data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      contacted: "bg-blue-100 text-blue-800",
      converted: "bg-purple-100 text-purple-800",
      unsubscribed: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Waitlist Management</h1>
          <p className="text-gray-600">View and manage waitlist entries</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Waitlist Entries</span>
              {loading && (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              )}
            </div>
            <Button
              onClick={exportWaitlist}
              variant="outline"
              disabled={loading}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </CardTitle>
          <CardDescription>
            All waitlist entries with filtering and search options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
              {searchTerm !== actualSearchTerm && (
                <div className="absolute right-3 top-3">
                  <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sourceFilter}
              onValueChange={(value) => {
                setSourceFilter(value);
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`rounded-md border ${loading ? "opacity-50" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Show skeleton rows while loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : waitlistEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No waitlist entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  waitlistEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.email}
                      </TableCell>
                      <TableCell>
                        {entry.full_name || "Not provided"}
                      </TableCell>
                      <TableCell>
                        {entry.phone_number || "Not provided"}
                      </TableCell>
                      <TableCell>
                        {entry.location || "Not provided"}
                      </TableCell>
                      <TableCell>
                        {entry.interest_type ? (
                          <Badge variant="outline">
                            {entry.interest_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ) : (
                          "Not specified"
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.referral_source || "Not specified"}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.status}
                          onValueChange={(value) =>
                            updateStatus(entry.id, value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, waitlistEntries.length)} of{" "}
            {waitlistEntries.length} entries
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
