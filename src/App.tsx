
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
            <Route path="/land" element={
              <Layout>
                <MyLand />
              </Layout>
            } />
            <Route path="/add-property" element={
              <Layout>
                <AddProperty />
              </Layout>
            } />
            <Route path="/verification" element={
              <Layout>
                <Verification />
              </Layout>
            } />
            <Route path="/marketplace" element={
              <Layout>
                <Marketplace />
              </Layout>
            } />
            <Route path="/tokens" element={
              <Layout>
                <Tokens />
              </Layout>
            } />
            <Route path="/map" element={
              <Layout>
                <MapView />
              </Layout>
            } />
            <Route path="/notifications" element={
              <Layout>
                <Notifications />
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <Settings />
              </Layout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
