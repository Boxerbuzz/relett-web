
'use client';

import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { 
  Home, 
  FileText, 
  Shield, 
  Store, 
  Coins,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['landowner', 'verifier', 'admin'] },
  { name: 'My Land', href: '/land', icon: FileText, roles: ['landowner'] },
  { name: 'Verification', href: '/verification', icon: Shield, roles: ['verifier', 'admin'] },
  { name: 'Marketplace', href: '/marketplace', icon: Store, roles: ['landowner', 'verifier', 'admin'] },
  { name: 'Tokens', href: '/tokens', icon: Coins, roles: ['landowner'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['landowner', 'verifier', 'admin'] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-4 py-6">
      <nav className="space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === item.href
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
