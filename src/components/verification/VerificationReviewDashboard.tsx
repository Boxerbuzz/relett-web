"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Check,
  X,
  Clock,
  Eye,
  Search,
  Users,
  BarChart3,
} from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useVerificationStats } from "@/hooks/useVerificationStats";
import { useVerificationRequests } from "@/hooks/useVerificationRequests";
import { VerificationTaskManager } from "./VerificationTaskManager";
import { DocumentViewer } from "./DocumentViewer";

export function VerificationReviewDashboard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);

  const { hasRole } = useUserRoles();
  const { stats, loading: statsLoading } = useVerificationStats();
  const { requests, loading: requestsLoading } = useVerificationRequests();

  const isVerifier = hasRole("verifier") || hasRole("admin");
  const isLoading = statsLoading || requestsLoading;

  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || request.priority === filterPriority;
    const matchesSearch =
      searchTerm === "" ||
      request.property_documents.document_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.requester?.first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.requester?.last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isVerifier) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Verifier Access Required
          </h3>
          <p className="text-gray-600">
            You need verifier permissions to access the verification dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDocumentViewer && selectedRequest) {
    return (
      <DocumentViewer
        documentUrl={selectedRequest.property_documents.file_url}
        documentName={selectedRequest.property_documents.document_name}
        mimeType={selectedRequest.property_documents.mime_type}
        onClose={() => setShowDocumentViewer(false)}
        onAnnotate={(annotations) => console.log("Annotations:", annotations)}
        isVerificationMode={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Verification Dashboard</h1>
          <p className="text-muted-foreground">
            Manage property and document verification processes
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          {stats.totalTasks} total tasks
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All verification tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingTasks}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.assignedTasks}
            </div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.averageCompletionTime.toFixed(1)}d
            </div>
            <p className="text-xs text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Property Verification Tasks</TabsTrigger>
          <TabsTrigger value="documents">Document Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <VerificationTaskManager />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {/* Document Verification Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by document name or requester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document Verification Requests */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No document verification requests found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {request.property_documents.document_name}
                        </CardTitle>
                        <CardDescription>
                          Requested by: {request.requester?.first_name}{" "}
                          {request.requester?.last_name}
                        </CardDescription>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            Type: {request.property_documents.document_type}
                          </span>
                          <span>•</span>
                          <span>
                            Submitted:{" "}
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDocumentViewer(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
