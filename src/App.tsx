import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/AuthProvider';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AddProperty from '@/pages/AddProperty';
import Marketplace from '@/pages/Marketplace';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import Verification from '@/pages/Verification';
import PropertyVerification from '@/pages/PropertyVerification';
import Investment from '@/pages/Investment';
import Tokens from '@/pages/Tokens';
import HederaTokens from '@/pages/HederaTokens';
import Notifications from '@/pages/Notifications';
import MyLand from '@/pages/MyLand';
import Documentation from '@/pages/Documentation';
import DataFlow from '@/pages/DataFlow';
import DatabaseDocumentation from '@/pages/DatabaseDocumentation';
import MapView from '@/pages/MapView';
import NotFound from '@/pages/NotFound';
import TermsAndConditions from '@/pages/TermsAndConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import AgentInspections from '@/pages/AgentInspections';
import AgentRentals from '@/pages/AgentRentals';
import AgentReservations from '@/pages/AgentReservations';
import AgentCalendar from '@/pages/AgentCalendar';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/add-property" element={<AddProperty />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/verification" element={<Verification />} />
                        <Route path="/property-verification" element={<PropertyVerification />} />
                        <Route path="/investment" element={<Investment />} />
                        <Route path="/tokens" element={<Tokens />} />
                        <Route path="/hedera-tokens" element={<HederaTokens />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/my-land" element={<MyLand />} />
                        <Route path="/docs" element={<Documentation />} />
                        <Route path="/data-flow" element={<DataFlow />} />
                        <Route path="/database-docs" element={<DatabaseDocumentation />} />
                        <Route path="/map" element={<MapView />} />
                        <Route path="/agent/inspections" element={<AgentInspections />} />
                        <Route path="/agent/rentals" element={<AgentRentals />} />
                        <Route path="/agent/reservations" element={<AgentReservations />} />
                        <Route path="/agent/calendar" element={<AgentCalendar />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
