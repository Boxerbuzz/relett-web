
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
  Users,
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
  { name: 'User Management', href: '/admin/users', icon: Users, roles: ['admin'] },
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
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed md:sticky top-0">
      {/* Header */}
      <div className="p-6 border-b h-16 flex items-center flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Terra Vault</h2>
          <p className="text-sm text-gray-500">Land Tokenization</p>
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
        })}
      </nav>
    </div>
  );
}
