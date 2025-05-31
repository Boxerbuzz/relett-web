
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
import { Bell, User, Settings, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletConnectionIndicator } from '@/components/wallet/WalletConnectionIndicator';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onAddProperty?: () => void;
}

export function Navbar({ onToggleSidebar, onAddProperty }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-6 py-4 backdrop-blur-sm bg-white/95 h-16">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <List size={20} />
          </Button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-green-600">LandChain</h1>
            <span className="text-sm text-gray-500">Decentralized Land Records</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Add Property Button */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={onAddProperty}
            className="hidden sm:flex"
          >
            <Plus size={16} className="mr-2" />
            Add Property
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            onClick={onAddProperty}
            className="sm:hidden"
          >
            <Plus size={16} />
          </Button>

          {/* Wallet Connection */}
          <WalletConnectionIndicator />

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
