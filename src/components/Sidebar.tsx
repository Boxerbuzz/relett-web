
'use client';

import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { 
  House, 
  FileText, 
  ShieldCheck, 
  Store, 
  Coins,
  Settings,
  MapPin,
  Bell,
  Plus,
  Search,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: House, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor'] },
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, roles: ['admin'] },
  { name: 'My Property', href: '/land', icon: FileText, roles: ['landowner', 'admin'] },
  { name: 'Add Property', href: '/add-property', icon: Plus, roles: ['landowner', 'admin'] },
  { name: 'Property Verification', href: '/property-verification', icon: Search, roles: ['landowner', 'verifier', 'admin', 'agent'] },
  { name: 'Verification', href: '/verification', icon: ShieldCheck, roles: ['verifier', 'admin'] },
  { name: 'Marketplace', href: '/marketplace', icon: Store, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor'] },
  { name: 'Tokens', href: '/tokens', icon: Coins, roles: ['landowner', 'admin', 'investor'] },
  { name: 'Map View', href: '/map', icon: MapPin, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor'] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['landowner', 'verifier', 'admin', 'agent', 'investor'] },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { hasRole } = useUserRoles();

  const filteredNavigation = navigation.filter(item => {
    // Allow admin to see all items
    if (hasRole('admin')) {
      return true;
    }
    // For other roles, check if they have access
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <div className="w-64 bg-gradient-to-b from-white to-blue-50 border-r border-blue-200 h-screen flex flex-col fixed md:sticky top-0 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-blue-200 h-16 flex items-center flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600">
        <div>
          <h2 className="text-xl font-bold text-white">Terra Vault</h2>
          <p className="text-sm text-blue-100">Land Tokenization</p>
        </div>
      </div>
      
      {/* Navigation - Scrollable */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-blue-300 shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-800"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "mr-3",
                  isActive ? "text-white" : "text-gray-600"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
