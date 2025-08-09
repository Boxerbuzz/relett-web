"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./profile/UserAvatar";
import { WalletConnectButton } from "./wallet/WalletConnectButton";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  ListIcon,
  GearIcon,
  SignOutIcon,
  UserIcon,
  StarIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { wallet, disconnectWallet } = useHederaWallet();
  const [notificationCount] = useState(0);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  if (!user) return null;

  const userDisplayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email;

  const roleDisplayName =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6">
      {/* Left side - Mobile menu toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <ListIcon size={20} />
        </Button>

        {/* Desktop: Show page title or breadcrumb */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* Right side - User menu and notifications */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <BellIcon size={20} />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2">
              {/* Dual Avatar System - Stacked Horizontally */}
              <div className="flex flex-row items-center relative">
                <UserAvatar size="sm" className="z-10" />
                {wallet && (
                  <div className="w-8 h-8 border-2 border-white -ml-3 z-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <WalletIcon size={14} className="text-primary" />
                  </div>
                )}
              </div>
              <div className="hidden text-left">
                <p className="text-sm font-medium">{userDisplayName}</p>
                <p className="text-xs text-gray-500">
                  {wallet
                    ? `${roleDisplayName} • ${wallet.id.slice(0, 8)}...`
                    : roleDisplayName}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{userDisplayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {roleDisplayName}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                className="flex items-center gap-2 cursor-pointer"
              >
                <UserIcon size={16} />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <GearIcon size={16} />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/notifications"
                className="flex items-center gap-2 cursor-pointer"
              >
                <BellIcon size={16} />
                Notifications
                {notificationCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {notificationCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/favourites"
                className="flex items-center gap-2 cursor-pointer"
              >
                <StarIcon size={16} />
                Favourites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Wallet Section */}
            <DropdownMenuItem
              onClick={() => setIsWalletDialogOpen(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <WalletIcon size={16} />
              Connect Wallet
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2 cursor-pointer text-red-600"
            >
              <SignOutIcon size={16} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Controlled Wallet Dialog rendered outside the dropdown to avoid unmount issues */}
        <WalletConnectButton open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen} />
      </div>

    </header>
  );
}
