import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  WarningIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";

interface BookingStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BookingStatusBadge({
  status,
  size = "md",
  className,
}: BookingStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          className: "bg-yellow-100 text-yellow-800",
          icon: <ClockIcon className="w-3 h-3" />,
          text: "Pending",
        };
      case "approved":
      case "confirmed":
        return {
          className: "bg-green-100 text-green-800",
          icon: <CheckCircleIcon className="w-3 h-3" />,
          text: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case "active":
        return {
          className: "bg-blue-100 text-blue-800",
          icon: <CheckCircleIcon className="w-3 h-3" />,
          text: "Active",
        };
      case "completed":
        return {
          className: "bg-gray-100 text-gray-800",
          icon: <CheckCircleIcon className="w-3 h-3" />,
          text: "Completed",
        };
      case "cancelled":
      case "canceled":
        return {
          className: "bg-gray-100 text-gray-800",
          icon: <XCircleIcon className="w-3 h-3" />,
          text: "Cancelled",
        };
      case "rejected":
      case "failed":
        return {
          className: "bg-red-100 text-red-800",
          icon: <WarningIcon className="w-3 h-3" />,
          text: "Rejected",
        };
      case "awaiting_payment":
        return {
          className: "",
          icon: <CreditCardIcon className="w-3 h-3" />,
          text: "Awaiting Payment",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800",
          icon: <ClockIcon className="w-3 h-3" />,
          text: status,
        };
    }
  };
  const config = getStatusConfig(status);
  return (
    <Badge
      className={clsx(
        "flex items-center gap-1 px-2 py-0.5 text-xs font-medium border-none",
        config.className,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-3 py-2",
        className
      )}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
}
