"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface BlockchainStatusBadgeProps {
  isRegistered?: boolean;
  transactionId?: string | null;
  size?: "sm" | "md" | "lg";
}

export function BlockchainStatusBadge({
  isRegistered = false,
  transactionId,
  size = "md",
}: BlockchainStatusBadgeProps) {
  if (isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <ShieldCheck
            className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-1`}
          />
          Blockchain Registered
        </Badge>
        {transactionId && size !== "sm" && (
          <span className="text-xs text-gray-500 font-mono">
            TX: {transactionId.slice(0, 8)}...
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-700 border-orange-200"
      >
        <AlertCircle
          className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-1`}
        />
        Not Registered
      </Badge>
    </div>
  );
}
