
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Full Height */}
      <div className="hidden md:block w-64 fixed left-0 top-0 h-screen z-10">
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
        {/* Header - Full Width of Content Area */}
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {isAddPropertyPage ? (
            <AddPropertyForm />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
