
'use client';

import { ReactNode, useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AddPropertyForm } from './property/AddPropertyForm';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
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
          onAddProperty={() => setAddPropertyOpen(true)}
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

      {/* Add Property Drawer for Desktop */}
      <div className="hidden lg:block">
        <Drawer open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
          <DrawerContent className="h-[90vh] w-[600px] ml-auto">
            <div className="p-6 h-full overflow-auto">
              <AddPropertyForm onClose={() => setAddPropertyOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Add Property Full Screen Modal for Mobile/Tablet */}
      <div className="lg:hidden">
        <Sheet open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
          <SheetContent side="right" className="w-full p-0">
            <div className="p-6 h-full overflow-auto">
              <AddPropertyForm onClose={() => setAddPropertyOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
