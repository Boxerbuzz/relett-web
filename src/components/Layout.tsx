
'use client';

import { ReactNode, useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
  stripPadding?: boolean;
}

export function Layout({ children, stripPadding = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar - Fixed positioning */}
      <div className="hidden md:flex md:flex-shrink-0 md:fixed md:inset-y-0 md:z-40">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area with proper spacing for fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 min-w-0">
        {/* Header - Fixed positioning at top */}
        <div className="fixed top-0 left-0 md:left-64 right-0 z-30 bg-white border-b border-gray-200 h-16">
          <Navbar 
            onToggleSidebar={() => setSidebarOpen(true)}
          />
        </div>
        
        {/* Page Content - Properly spaced below fixed header */}
        <main className="flex-1 mt-16 overflow-x-hidden overflow-y-auto">
          <div className={`max-w-full min-w-0 w-full ${stripPadding ? 'p-0' : 'p-4 md:p-6'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
