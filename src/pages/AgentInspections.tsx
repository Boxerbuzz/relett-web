import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BinocularsIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import { useAgentInspections } from "@/hooks/useAgentInspections";
import { InspectionCard } from "@/components/agent/InspectionCard";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

const AgentInspections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { inspections, isLoading, updateInspection } = useAgentInspections();

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.property?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inspection.user?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inspection.user?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = inspections.reduce((acc, inspection) => {
      acc[inspection.status] = (acc[inspection.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Inspection Requests
            </h1>
            <p className="text-muted-foreground">
              Manage your property inspection schedule
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{inspections.length}</p>
              </div>
              <Badge variant="outline">{inspections.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {statusCounts.pending || 0}
                </p>
              </div>
              <Badge variant="secondary">{statusCounts.pending || 0}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">
                  {statusCounts.confirmed || 0}
                </p>
              </div>
              <Badge variant="default">{statusCounts.confirmed || 0}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {statusCounts.completed || 0}
                </p>
              </div>
              <Badge variant="outline">{statusCounts.completed || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inspections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <FunnelIcon className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BinocularsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Inspections Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "You don't have any inspection requests yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspections.map((inspection) => (
            <InspectionCard
              key={inspection.id}
              inspection={inspection}
              onUpdateStatus={(id, status) =>
                updateInspection({ id, updates: { status } })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentInspections;
