"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationTaskList } from "./VerificationTaskList";
import { VerificationTaskDetail } from "./VerificationTaskDetail";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ClockIcon, CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { FileCheck } from "lucide-react";
import { VerificationTask } from "./types";

export function VerificationTaskManager() {
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("available");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { hasRole } = useUserRoles();

  const handleTaskSelect = (task: VerificationTask) => {
    setSelectedTask(task);
  };

  const handleBack = () => {
    setSelectedTask(null);
  };

  const handleTaskUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedTask(null);
  };

  const isVerifier = hasRole("verifier") || hasRole("admin");

  if (!isVerifier) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <WarningIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Verifier Access Required
          </h3>
          <p className="text-gray-600">
            You need verifier permissions to access the verification task
            manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedTask) {
    return (
      <VerificationTaskDetail
        task={selectedTask as VerificationTask}
        onBack={handleBack}
        onTaskUpdated={handleTaskUpdated}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Management Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available" className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Available Tasks
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            My Tasks
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex items-center gap-2">
            <WarningIcon className="w-4 h-4" />
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Verification Tasks</CardTitle>
              <CardDescription>
                Property verification tasks available for assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationTaskList
                key={`available-${refreshTrigger}`}
                onTaskSelect={handleTaskSelect}
                filterStatus="pending"
                showAssignButton={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tasks</CardTitle>
              <CardDescription>
                Verification tasks assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationTaskList
                key={`assigned-${refreshTrigger}`}
                onTaskSelect={handleTaskSelect}
                filterStatus="assigned"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks In Progress</CardTitle>
              <CardDescription>
                Verification tasks currently being worked on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationTaskList
                key={`progress-${refreshTrigger}`}
                onTaskSelect={handleTaskSelect}
                filterStatus="in_progress"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Verifications</CardTitle>
              <CardDescription>
                Previously completed verification tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationTaskList
                key={`completed-${refreshTrigger}`}
                onTaskSelect={handleTaskSelect}
                filterStatus="completed"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
