
'use client';

import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { 
  House, 
  FileText, 
  ShieldCheck, 
  Storefront, 
  Coins,
  Gear,
  MapPin,
  Bell,
  Plus,
  MagnifyingGlass,
  ChartBar,
  Eye,
  Buildings,
  Users,
  Calendar,
  CaretRight,
  Tree,
  Heart,
  Chat,
  Wrench,
  Star,
} from 'phosphor-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreeDonationDialog } from '@/components/dialogs/TreeDonationDialog';
import { useState } from 'react';

interface SidebarProps {
  onNavigate?: () => void;
}

const mainNavigation = [
  { name: 'Welcome', href: '/welcome', icon: Star, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'Dashboard', href: '/dashboard', icon: House, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'Admin Dashboard', href: '/admin', icon: ChartBar, roles: ['admin'] },
  { name: 'Marketplace', href: '/marketplace', icon: Storefront, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'Services', href: '/services', icon: Wrench, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'Map View', href: '/map', icon: MapPin, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'My Bookings', href: '/me', icon: Calendar, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'Property Verification', href: '/verification', icon: ShieldCheck, roles: ['verifier', 'admin'] },
  { name: 'Messaging', href: '/messaging', icon: Chat, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
];

const propertyNavigation = [
  { name: 'My Property', href: '/my-land', icon: FileText, roles: ['landowner', 'admin'] },
  { name: 'Add Property', href: '/add-property', icon: Plus, roles: ['landowner', 'admin'] },
  { name: 'Tokens', href: '/tokens', icon: Coins, roles: ['landowner', 'admin', 'investor'] },
];

const agentNavigation = [
  { name: 'Inspections', href: '/agent/inspections', icon: Eye, roles: ['agent', 'admin', 'landowner'] },
  { name: 'Rentals', href: '/agent/rentals', icon: Buildings, roles: ['agent', 'admin', 'landowner'] },
  { name: 'Reservations', href: '/agent/reservations', icon: Users, roles: ['agent', 'admin', 'landowner'] },
  { name: 'Calendar', href: '/agent/calendar', icon: Calendar, roles: ['agent', 'admin', 'landowner'] },
];

const settingsNavigation = [
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
  { name: 'Settings & Profile', href: '/settings', icon: Gear, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor', 'user'] },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [agentToolsOpen, setAgentToolsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [treeDonationOpen, setTreeDonationOpen] = useState(false);

  const filterNavigation = (items: typeof mainNavigation) => {
    return items.filter(item => {
      if (hasRole('admin')) {
        return true;
      }
      return user?.role && item.roles.includes(user.role);
    });
  };

  const filteredMainNav = filterNavigation(mainNavigation);
  const filteredPropertyNav = filterNavigation(propertyNavigation);
  const filteredAgentNav = filterNavigation(agentNavigation);
  const filteredSettingsNav = filterNavigation(settingsNavigation);

  const renderNavItem = (item: typeof mainNavigation[0]) => {
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
          className={cn(
            "mr-3",
            isActive ? "text-blue-700" : "text-gray-500"
          )} 
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed md:sticky top-0">
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
        <div className="space-y-2">
          {filteredMainNav.map(renderNavItem)}
        </div>

        {/* Property Management Section */}
        {filteredPropertyNav.length > 0 && (
          <Collapsible open={propertiesOpen} onOpenChange={setPropertiesOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="flex items-center">
                <FileText size={16} className="mr-2" />
                Property Management
              </span>
              <CaretRight 
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
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="flex items-center">
                <Eye size={16} className="mr-2" />
                Agent Tools
                <Badge variant="secondary" className="ml-2 text-xs">
                  Pro
                </Badge>
              </span>
              <CaretRight 
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

        {/* Settings Section */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <span className="flex items-center">
              <Gear size={16} className="mr-2" />
              Settings & Support
            </span>
            <CaretRight 
              size={16} 
              className={cn(
                "transition-transform",
                settingsOpen && "rotate-90"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-2 space-y-1">
            {filteredSettingsNav.map(renderNavItem)}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* Plant a Tree CTA with proper margins */}
      <div className="p-6 border-t bg-gradient-to-r from-green-50 to-emerald-50 mx-3 mb-4 rounded-lg shadow-sm">
        <div className="text-center mb-3">
          <div className="flex justify-center mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Tree className="w-6 h-6 text-green-600" />
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
          <Heart className="w-4 h-4 mr-2" />
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
