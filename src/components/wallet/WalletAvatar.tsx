"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHashPack } from "@/contexts/HashPackContext";
import { PlusIcon } from "@phosphor-icons/react";

interface WalletAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function WalletAvatar({ size = "md", className }: WalletAvatarProps) {
  const { wallet } = useHashPack();

  return (
    <Avatar
      className={`${sizeClasses[size]} ${className || ""} ${
        wallet?.isConnected ? "ring-2 ring-green-500" : "ring-2 ring-gray-300"
      }`}
    >
      <AvatarImage
        src={wallet?.isConnected ? "/wallet-connected.png" : undefined}
        alt="Wallet avatar"
      />
      <AvatarFallback
        className={`${
          wallet?.isConnected
            ? "bg-green-600 text-white"
            : "bg-gray-400 text-white"
        } font-medium`}
      >
        <PlusIcon size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
      </AvatarFallback>
    </Avatar>
  );
}
