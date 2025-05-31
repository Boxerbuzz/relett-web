
'use client';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, Settings } from 'lucide-react';
import { List } from 'phosphor-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
  showMobileToggle?: boolean;
}

export function Navbar({ onToggleSidebar, showMobileToggle = false }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-6 py-4 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          {showMobileToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onToggleSidebar}
            >
              <List size={20} />
            </Button>
          )}
          
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">Relett</h1>
          <span className="hidden sm:block text-sm text-gray-500">Decentralized Land Records</span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
          </Link>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
              <DropdownMenuItem className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
