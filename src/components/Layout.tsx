
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SystemNotificationBanner } from "@/components/notifications/SystemNotificationBanner";
import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children?: ReactNode;
  stripPadding?: boolean;
}

export function Layout({ children, stripPadding = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Navigation */}
        <Navbar onToggleSidebar={toggleSidebar} />
        
        {/* System Notifications */}
        <SystemNotificationBanner />
        
        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className={stripPadding ? "" : "py-6"}>
            {children || <Outlet />}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
