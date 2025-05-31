
'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { List } from 'phosphor-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Full Height */}
      <div className="hidden md:block w-64 fixed left-0 top-0 h-screen z-10 bg-white border-r border-gray-200">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header - Full width from sidebar end */}
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(true)} 
          showMobileToggle={true}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
