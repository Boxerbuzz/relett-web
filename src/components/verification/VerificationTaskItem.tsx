import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ClockIcon,
  HouseIcon,
  UserIcon,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import { capitalize } from "@/lib/utils";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { VerificationTask } from "./types";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface VerificationTaskItemProps {
  task: VerificationTask;
  onClick?: () => void;
  onAssignToSelf?: () => void;
  assigning?: boolean;
  showAssignButton?: boolean;
}

export function VerificationTaskItem({
  task,
  onClick,
  onAssignToSelf,
  assigning,
  showAssignButton,
}: VerificationTaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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

  const formatLocation = (location: any) => {
    if (!location || typeof location !== "object")
      return "Location not specified";
    return (
      `${location.city || ""}${
        location.state ? ", " + location.state : ""
      }`.trim() || "Location not specified"
    );
  };

  return (
    <Card key={task.id} className="cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          {/* Left Section - Property Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <HouseIcon className="w-5 h-5" />
              <span className="font-medium">
                {task.properties.title || "Untitled Property"}
              </span>
            </CardTitle>

            <span className="mt-1">
              {/* Property Details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                <span className="flex items-center gap-1 truncate">
                  <UserIcon className="w-4 h-4" />
                  {task.properties.users?.first_name}{" "}
                  {task.properties.users?.last_name}
                </span>
                <span className="truncate">
                  {capitalize(task.properties.type)}
                </span>
                <span className="truncate">
                  {formatLocation(task.properties.location)}
                </span>
              </div>
              {/* Assignee Info */}
              {task.users && (
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="font-medium">Assignee:</span>
                  {task.users.avatar && (
                    <img
                      src={task.users.avatar}
                      alt="Assignee Avatar"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span>
                    {task.users.first_name} {task.users.last_name}
                  </span>
                </div>
              )}
            </span>
          </div>

          {/* Right Section - Status & Actions */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Badge className={getPriorityColor(task.priority)}>
              {capitalize(task.priority)}
            </Badge>

            <VerificationStatusBadge status={task.status} />

            {task.status === "pending" && (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DotsThreeVerticalIcon className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {showAssignButton && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignToSelf?.();
                        setMenuOpen(false);
                      }}
                      disabled={assigning}
                    >
                      {assigning ? "Assigning..." : "Assign to Me"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              Created:{" "}
              {new Date(task.created_at).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {task.deadline && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Due:{" "}
                {new Date(task.deadline).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
