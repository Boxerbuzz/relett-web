
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Home,
  Building2,
  Map,
  Settings,
  User,
  Bell,
  MessageSquare,
  Calendar,
  FileText,
  ShieldCheck,
  DollarSign,
  Heart,
  Search,
} from "lucide-react";
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
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Marketplace", href: "/marketplace", icon: Building2 },
    { name: "Map View", href: "/map", icon: Map },
    { name: "My Properties", href: "/my-properties", icon: Heart },
    { name: "Services", href: "/services", icon: Search },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Messaging", href: "/messaging", icon: MessageSquare },
    { name: "Verification", href: "/verification", icon: ShieldCheck },
    { name: "Tokens", href: "/tokens", icon: DollarSign },
    { name: "Documentation", href: "/documentation", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
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
          <Building2 className="h-6 w-6 text-blue-500" />
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
                <ShieldCheck className="mr-2 h-4 w-4" />
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
