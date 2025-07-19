"use client";

import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Intercom from "@intercom/messenger-js-sdk";
import useIntercom from "@/hooks/useIntercom";
import { useRightPanel } from "@/contexts/RightPanelContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  stripPadding?: boolean;
}

export function Layout({ children, stripPadding = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { intercomToken, user } = useIntercom();
  const { isOpen: isRightPanelOpen } = useRightPanel();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (intercomToken && user) {
      Intercom({
        intercom_user_jwt: intercomToken,
        app_id: "msg20icm",
        user_id: user?.id,
        name: `${user?.first_name} ${user?.last_name}`,
        email: user?.email,
        created_at: Date.parse(user?.created_at),
      });
    }
  }, [intercomToken, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar - Fixed positioning */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex flex-col w-80">
          <Sidebar />
        </div>
      </div>

      {/* Mobile/Tablet Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area with proper spacing for fixed sidebar and right panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-80 min-w-0">
        {/* Header - Fixed positioning at top */}
        <div className={cn(
          "fixed top-0 left-0 lg:left-80 z-30 bg-white border-b border-gray-200 h-16",
          "transition-all duration-300 ease-in-out"
        )}>
          <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        </div>

        {/* Page Content - Properly spaced below fixed header and adjusts for right panel */}
        <main className={cn(
          "flex-1 mt-16 overflow-x-hidden overflow-y-auto",
          "transition-all duration-300 ease-in-out",
          isDesktop && isRightPanelOpen ? "pr-80" : "pr-0"
        )}>
          <div
            className={`max-w-full min-w-0 w-full ${
              stripPadding ? "p-0" : "p-4 md:p-6"
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}
