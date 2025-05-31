
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyLand from "./pages/MyLand";
import AddProperty from "./pages/AddProperty";
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
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes - no layout */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes - with layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/land" element={
              <ProtectedRoute>
                <Layout>
                  <MyLand />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-property" element={
              <ProtectedRoute>
                <Layout>
                  <AddProperty />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/verification" element={
              <ProtectedRoute>
                <Layout>
                  <Verification />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Layout>
                  <Marketplace />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tokens" element={
              <ProtectedRoute>
                <Layout>
                  <Tokens />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <Layout>
                  <MapView />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
