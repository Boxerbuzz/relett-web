"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface BlockchainStatusBadgeProps {
  isRegistered?: boolean;
  transactionId?: string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showTransactionId?: boolean;
}

export function BlockchainStatusBadge({
  isRegistered = false,
  transactionId,
  size = "md",
  showLabel = true,
  showTransactionId = true,
}: BlockchainStatusBadgeProps) {
  console.log("transactionId", transactionId);

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "bg-green-50 text-green-700 border-green-200",
            showLabel ? "" : "p-1 items-center justify-center"
          )}
        >
          <ShieldCheck
            className={cn(
              `${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`,
              showLabel ? "mr-1" : ""
            )}
          />
          {showLabel && "Blockchain Registered"}
        </Badge>
        {transactionId && transactionId !== "" && showTransactionId && (
          <a 
            href={`https://hashscan.io/testnet/transaction/${transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant="outline" className="text-xs text-gray-500 font-mono cursor-pointer hover:bg-gray-50">
              TX: {transactionId.slice(0, 8)}...
            </Badge>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={cn(
          "bg-orange-50 text-orange-700 border-orange-200",
          showLabel ? "" : "p-1 items-center justify-center"
        )}
      >
        <AlertCircle
          className={cn(
            `${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`,
            showLabel ? "mr-1" : ""
          )}
        />
        {showLabel && "Not Registered"}
      </Badge>
    </div>
  );
}
