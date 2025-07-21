"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { MagnifyingGlassIcon, ArchiveBoxIcon } from "@phosphor-icons/react";
import { VerificationTask } from "./types";
import { VerificationTaskItem } from "./VerificationTaskItem";
import {
  useVerificationTaskActions,
  useVerificationTasks,
} from "@/hooks/usePropertyVerificationTasks";

interface VerificationTaskListProps {
  onTaskSelect?: (task: VerificationTask) => void;
  filterStatus?: string;
  showAssignButton?: boolean;
}

export function VerificationTaskList({
  onTaskSelect,
  filterStatus = "all",
  showAssignButton = false,
}: VerificationTaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState(filterStatus);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigningTask, setAssigningTask] = useState<string | null>(null);
  const { tasks, loading, refetch } = useVerificationTasks();
  const { assignTaskToSelf } = useVerificationTaskActions();

  const handleAssignTask = async (task: VerificationTask) => {
    setAssigningTask(task.id);
    const { success } = await assignTaskToSelf(task.id, task.property_id);
    if (success) {
      refetch();
    }
    setAssigningTask(null);
  };

  const { toast } = useToast();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.properties.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.properties.users?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      task.properties.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by property, owner, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ArchiveBoxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No verification tasks found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <VerificationTaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskSelect?.(task)}
              onAssignToSelf={() => handleAssignTask(task)}
              assigning={assigningTask === task.id}
              showAssignButton={showAssignButton}
            />
          ))
        )}
      </div>
    </div>
  );
}
