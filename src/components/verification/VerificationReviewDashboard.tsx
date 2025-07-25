"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileTextIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  UsersIcon,
  ChartBarIcon,
} from "@phosphor-icons/react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useVerificationStats } from "@/hooks/useVerificationStats";
import { VerificationTaskManager } from "./VerificationTaskManager";

export function VerificationReviewDashboard() {
  const { hasRole } = useUserRoles();
  const { stats, loading: _ } = useVerificationStats();

  const isVerifier = hasRole("verifier") || hasRole("admin");

  if (!isVerifier) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
          <ChartBarIcon className="w-4 h-4" />
          {stats.totalTasks} total tasks
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
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
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
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
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
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
            <CheckIcon className="h-4 w-4 text-muted-foreground" />
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
      <VerificationTaskManager />
    </div>
  );
}
