
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
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
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, Settings, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const [notificationCount] = useState(3); // Mock notification count

  if (!user) return null;

  const userDisplayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email;

  const roleDisplayName =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-300 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
      {/* Left side - Mobile menu toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="md:hidden text-white hover:bg-white/20"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop: Show page title or breadcrumb */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </div>
      </div>

      {/* Right side - User menu and notifications */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-400 text-yellow-900"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2 text-white hover:bg-white/20">
              <UserAvatar size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{userDisplayName}</p>
                <p className="text-xs text-blue-100">{roleDisplayName}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-blue-200">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{userDisplayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-xs border-blue-300 text-blue-700">
                  {roleDisplayName}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/notifications"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                Notifications
                {notificationCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {notificationCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2 cursor-pointer text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
