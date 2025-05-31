
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

// Service pages
import Artisans from "./pages/services/Artisans";
import Rentals from "./pages/services/Rentals";
import Moove from "./pages/services/Moove";
import Shortlet from "./pages/services/Shortlet";
import Investments from "./pages/services/Investments";
import Manager from "./pages/services/Manager";
import Verify from "./pages/services/Verify";
import CoSpaces from "./pages/services/CoSpaces";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/services/artisans" element={<Artisans />} />
            <Route path="/services/rentals" element={<Rentals />} />
            <Route path="/services/moove" element={<Moove />} />
            <Route path="/services/shortlet" element={<Shortlet />} />
            <Route path="/services/investments" element={<Investments />} />
            <Route path="/services/manager" element={<Manager />} />
            <Route path="/services/verify" element={<Verify />} />
            <Route path="/services/co-spaces" element={<CoSpaces />} />
            
            {/* Protected routes with Layout */}
            <Route path="/land" element={<Layout><MyLand /></Layout>} />
            <Route path="/verification" element={<Layout><Verification /></Layout>} />
            <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
            <Route path="/tokens" element={<Layout><Tokens /></Layout>} />
            <Route path="/map" element={<Layout><MapView /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
