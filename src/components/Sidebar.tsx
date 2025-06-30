import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Marketplace", href: "/marketplace", icon: BuildingOfficeIcon },
    { name: "Map View", href: "/map", icon: MapIcon },
    { name: "My Properties", href: "/my-properties", icon: HeartIcon },
    { name: "Services", href: "/services", icon: MagnifyingGlassIcon },
    { name: "Bookings", href: "/bookings", icon: CalendarIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon },
    { name: "Messaging", href: "/messaging", icon: ChatBubbleLeftIcon },
    { name: "Verification", href: "/verification", icon: ShieldCheckIcon },
    { name: "Tokens", href: "/tokens", icon: CurrencyDollarIcon },
    { name: "Documentation", href: "/documentation", icon: DocumentTextIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  const active = (href: string) => {
    return location.pathname === href
  }

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.(); // Call onClose when navigating on mobile
  };

  const handleSignOut = async () => {
    await signOut();
    onClose?.(); // Call onClose when signing out
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold">Real Estate</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "justify-start pl-6 hover:bg-gray-100 w-full",
                active(item.href) ? "font-semibold bg-gray-100" : "text-gray-500"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          ))}
        </div>
        {user?.role === "admin" && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="px-4 text-sm font-medium text-gray-500">Admin</p>
              <Button
                variant="ghost"
                className="justify-start pl-6 hover:bg-gray-100 w-full text-gray-500"
                onClick={() => handleNavigation("/admin")}
              >
                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Button>
            </div>
          </>
        )}
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
