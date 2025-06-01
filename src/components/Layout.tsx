
'use client';

import { ReactNode, useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AddPropertyForm } from './property/AddPropertyForm';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAddPropertyPage = location.pathname === '/add-property';

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar - Fixed positioning with proper z-index */}
      <div className="hidden md:flex md:flex-shrink-0">
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

      {/* Main Content Area - Flexible with proper overflow handling */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* Header - Full Width of Content Area */}
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        
        {/* Page Content - Proper container with overflow handling */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-full">
            {isAddPropertyPage ? (
              <AddPropertyForm />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
