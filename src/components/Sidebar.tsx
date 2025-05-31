
'use client';

import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { 
  House, 
  FileText, 
  ShieldCheck, 
  Storefront, 
  Coins,
  Gear,
  MapPin,
  Bell,
  Plus
} from 'phosphor-react';

interface SidebarProps {
  onNavigate?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: House, roles: ['landowner', 'verifier', 'admin', 'agent'] },
  { name: 'My Property', href: '/land', icon: FileText, roles: ['landowner'] },
  { name: 'Add Property', href: '/add-property', icon: Plus, roles: ['landowner'] },
  { name: 'Verification', href: '/verification', icon: ShieldCheck, roles: ['verifier', 'admin'] },
  { name: 'Marketplace', href: '/marketplace', icon: Storefront, roles: ['landowner', 'verifier', 'admin', 'agent'] },
  { name: 'Tokens', href: '/tokens', icon: Coins, roles: ['landowner'] },
  { name: 'Map View', href: '/map', icon: MapPin, roles: ['landowner', 'verifier', 'admin', 'agent'] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['landowner', 'verifier', 'admin', 'agent'] },
  { name: 'Settings', href: '/settings', icon: Gear, roles: ['landowner', 'verifier', 'admin', 'agent'] },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Terra Vault</h2>
        <p className="text-sm text-gray-500">Land Tokenization</p>
      </div>
      
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
