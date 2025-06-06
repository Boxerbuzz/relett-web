
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AnalyticsProvider } from "@/components/monitoring/AnalyticsProvider";
import { ErrorBoundary } from "@/components/monitoring/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyLand from "./pages/MyLand";
import AddProperty from "./pages/AddProperty";
import Marketplace from "./pages/Marketplace";
import Tokens from "./pages/Tokens";
import Settings from "./pages/Settings";
import Verification from "./pages/Verification";
import PropertyVerification from "./pages/PropertyVerification";
import MapView from "./pages/MapView";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataFlow from "./pages/DataFlow";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnalyticsProvider>
              <Routes>
                {/* Auth routes - no layout */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Public pages - standalone without layout */}
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                
                {/* Public pages - with layout but no auth required */}
                <Route path="/data-flow" element={
                  <Layout>
                    <DataFlow />
                  </Layout>
                } />
                <Route path="/docs" element={
                  <Layout>
                    <Documentation />
                  </Layout>
                } />
                
                {/* Protected routes - with layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Layout>
                      <Admin />
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
                <Route path="/property-verification" element={
                  <ProtectedRoute>
                    <Layout>
                      <PropertyVerification />
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
            </AnalyticsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
