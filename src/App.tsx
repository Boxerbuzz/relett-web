
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import MyLand from "./pages/MyLand";
import Marketplace from "./pages/Marketplace";
import Tokens from "./pages/Tokens";
import Settings from "./pages/Settings";
import Verification from "./pages/Verification";
import MapView from "./pages/MapView";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/land" element={<MyLand />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
