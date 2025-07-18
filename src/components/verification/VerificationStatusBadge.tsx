import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react";

interface VerificationStatusBadgeProps {
  status: string;
  size?: "sm" | "default" | "lg";
}

export function VerificationStatusBadge({
  status,
  size = "default",
}: VerificationStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "completed":
      case "approved":
        return {
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: <CheckCircleIcon className="w-3 h-3" />,
          text: "Verified",
        };
      case "pending":
      case "assigned":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          icon: <ClockIcon className="w-3 h-3" />,
          text: "Pending",
        };
      case "in_progress":
        return {
          variant: "outline" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
          icon: <WarningIcon className="w-3 h-3" />,
          text: "In Progress",
        };
      case "rejected":
      case "failed":
        return {
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: <XCircleIcon className="w-3 h-3" />,
          text: "Rejected",
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800",
          icon: <ClockIcon className="w-3 h-3" />,
          text: status,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${
        size === "sm"
          ? "text-xs px-2 py-1"
          : size === "lg"
          ? "text-sm px-3 py-2"
          : ""
      }`}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
}
