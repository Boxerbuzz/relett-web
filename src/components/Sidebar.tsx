"use client";

import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  HouseIcon,
  FileTextIcon,
  ShieldCheckIcon,
  StorefrontIcon,
  CoinsIcon,
  GearIcon,
  MapPinIcon,
  BellIcon,
  PlusIcon,
  MapPinPlusIcon,
  EyeIcon,
  BuildingsIcon,
  UsersIcon,
  CalendarIcon,
  CaretRightIcon,
  TreeIcon,
  HeartIcon,
  ChatIcon,
  WrenchIcon,
  StarIcon,
  ChartDonutIcon,
  UserIcon,
  HeadCircuitIcon
} from "@phosphor-icons/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TreeDonationDialog } from "@/components/dialogs/TreeDonationDialog";
import { useState } from "react";

interface SidebarProps {
  onNavigate?: () => void;
}

const mainNavigation = [
  {
    name: "Welcome",
    href: "/welcome",
    icon: StarIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HouseIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: ChartDonutIcon,
    roles: ["admin"],
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: StorefrontIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
  {
    name: "Services",
    href: "/services",
    icon: WrenchIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
    visible: false,
  },
  {
    name: "Map View",
    href: "/map",
    icon: MapPinIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
    visible: false,
  },
  {
    name: "My Bookings",
    href: "/bookings",
    icon: CalendarIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
  {
    name: "Property Verification",
    href: "/verification",
    icon: ShieldCheckIcon,
    roles: ["verifier", "admin"],
  },
  {
    name: "Messaging",
    href: "/messages",
    icon: ChatIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
];

const propertyNavigation = [
  {
    name: "My Property",
    href: "/my-properties",
    icon: FileTextIcon,
    roles: ["landowner", "admin"],
  },
  {
    name: "Add Property",
    href: "/add-property",
    icon: PlusIcon,
    roles: ["landowner", "admin"],
  },
  {
    name: "Tokens",
    href: "/tokens",
    icon: CoinsIcon,
    roles: ["landowner", "admin", "investor"],
    visible: false,
  },
];

const agentNavigation = [
  {
    name: "Inspections",
    href: "/agent/inspections",
    icon: EyeIcon,
    roles: ["agent", "admin", "landowner"],
  },
  {
    name: "Rentals",
    href: "/agent/rentals",
    icon: BuildingsIcon,
    roles: ["agent", "admin", "landowner"],
  },
  {
    name: "Reservations",
    href: "/agent/reservations",
    icon: UsersIcon,
    roles: ["agent", "admin", "landowner"],
  },
  {
    name: "Calendar",
    href: "/agent/calendar",
    icon: CalendarIcon,
    roles: ["agent", "admin", "landowner"],
  },
];

const userNavigation = [
  {
    name: "Notifications",
    href: "/notifications",
    icon: BellIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: GearIcon,
    roles: ["landowner", "verifier", "admin", "agent", "investor", "user"],
  },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [agentToolsOpen, setAgentToolsOpen] = useState(true);
  const [treeDonationOpen, setTreeDonationOpen] = useState(false);

  const filterNavigation = (items: typeof mainNavigation) => {
    return items.filter((item) => {
      // Exclude if visible is explicitly false
      if (item.visible === false) return false;
      if (hasRole("admin")) {
        return true;
      }
      return user?.role && item.roles.includes(user.role);
    });
  };

  const filteredMainNav = filterNavigation(mainNavigation);
  const filteredUserNav = filterNavigation(userNavigation);
  const filteredPropertyNav = filterNavigation(propertyNavigation);
  const filteredAgentNav = filterNavigation(agentNavigation);

  const renderNavItem = (item: (typeof mainNavigation)[0]) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <Icon
          size={20}
          className={cn("mr-3", isActive ? "text-blue-700" : "text-gray-500")}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col fixed md:sticky top-0">
      {/* Header */}
      <div className="p-6 border-b h-16 flex items-center flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Relett</h2>
          <p className="text-sm text-gray-500">Land Tokenization</p>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-2">{filteredMainNav.map(renderNavItem)}</div>

        {/* Property Management Section */}
        {filteredPropertyNav.length > 0 && (
          <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="flex items-center">
                <MapPinPlusIcon size={20} className="mr-2 text-gray-700" />
                Property Management
              </span>
              <CaretRightIcon
                size={16}
                className={cn(
                  "transition-transform",
                  propertiesOpen && "rotate-90"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 mt-2 space-y-1">
              {filteredPropertyNav.map(renderNavItem)}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Agent Tools Section */}
        {filteredAgentNav.length > 0 && (
          <Collapsible open={agentToolsOpen} onOpenChange={setAgentToolsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="flex items-center">
                <HeadCircuitIcon size={20} className="mr-2" />
                Agent Tools
                <Badge variant="secondary" className="ml-2 text-xs">
                  Pro
                </Badge>
              </span>
              <CaretRightIcon
                size={16}
                className={cn(
                  "transition-transform",
                  agentToolsOpen && "rotate-90"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 mt-2 space-y-1">
              {filteredAgentNav.map(renderNavItem)}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* User Tools Section */}
        <div className="space-y-2">{filteredUserNav.map(renderNavItem)}</div>
      </nav>

      {/* Plant a Tree CTA with proper margins */}
      <div className="p-6 border-t bg-gradient-to-r from-green-50 to-emerald-50 mx-3 mb-4 rounded-lg shadow-sm">
        <div className="text-center mb-3">
          <div className="flex justify-center mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <TreeIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Plant a Tree, Save the Planet
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Help us offset carbon emissions from blockchain transactions
          </p>
        </div>
        <Button
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setTreeDonationOpen(true)}
        >
          <HeartIcon className="w-4 h-4 mr-2" />
          Donate Now
        </Button>
        <p className="text-xs text-center text-gray-500 mt-2">
          Starting from ₦2,000 per tree
        </p>
      </div>

      {/* Tree Donation Dialog */}
      <TreeDonationDialog
        open={treeDonationOpen}
        onOpenChange={setTreeDonationOpen}
      />
    </div>
  );
}
