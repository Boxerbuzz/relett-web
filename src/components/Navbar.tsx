"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHashPack } from "@/contexts/HashPackContext";
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
import { WalletAvatar } from "./wallet/WalletAvatar";
import { HashPackConnectDialog } from "./wallet/HashPackConnectDialog";
import { Badge } from "@/components/ui/badge";
import { Bell, List, Gear, SignOut, User, Star, Wallet } from "phosphor-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { wallet, disconnectWallet } = useHashPack();
  const [notificationCount] = useState(0);
  const [showWalletDialog, setShowWalletDialog] = useState(false);

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
          <List size={20} />
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
          <Bell size={20} />
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
              {/* Dual Avatar System - Stacked */}
              <div className="relative">
                <UserAvatar size="sm" />
                <div className="absolute -top-0 -right-5">
                  <WalletAvatar size="sm" className="w-8 h-8 border-2 border-white" />
                </div>
              </div>
              <div className="hidden text-left">
                <p className="text-sm font-medium">{userDisplayName}</p>
                <p className="text-xs text-gray-500">
                  {wallet?.isConnected ? `${roleDisplayName} • ${wallet.address.slice(0, 8)}...` : roleDisplayName}
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
                <User size={16} />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Gear size={16} />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/notifications"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Bell size={16} />
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
                <Star size={16} />
                Favourites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {/* Wallet Section */}
            {wallet?.isConnected ? (
              <DropdownMenuItem 
                onClick={disconnectWallet}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Wallet size={16} />
                Disconnect Wallet
                <Badge variant="outline" className="ml-auto text-xs">
                  Connected
                </Badge>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => setShowWalletDialog(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Wallet size={16} />
                Connect Wallet
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2 cursor-pointer text-red-600"
            >
              <SignOut size={16} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* HashPack Connect Dialog */}
      <HashPackConnectDialog 
        isOpen={showWalletDialog} 
        onClose={() => setShowWalletDialog(false)} 
      />
    </header>
  );
}
