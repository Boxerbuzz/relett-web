
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { PropertyContractProvider } from '@/contexts/PropertyContractContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Page imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddProperty from "./pages/AddProperty";
import MyProperty from "./pages/MyProperty";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyLookup from "./pages/PropertyLookup";
import Marketplace from "./pages/Marketplace";
import MapView from "./pages/MapView";
import Tokens from "./pages/Tokens";
import HederaTokens from "./pages/HederaTokens";
import Investment from "./pages/Investment";
import Verification from "./pages/Verification";
import Admin from "./pages/Admin";
import AdminContacts from "./pages/AdminContacts";
import AdminWaitlist from "./pages/AdminWaitlist";
import UserBookings from "./pages/UserBookings";
import AgentCalendar from "./pages/AgentCalendar";
import AgentInspections from "./pages/AgentInspections";
import AgentRentals from "./pages/AgentRentals";
import AgentReservations from "./pages/AgentReservations";
import { Messaging } from "./pages/Messaging";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Services from "./pages/Services";
import ServiceCategory from "./pages/ServiceCategory";
import FavoritesPage from "./pages/FavoritesPage";
import DataFlow from "./pages/DataFlow";
import DatabaseSchema from "./pages/DatabaseSchema";
import DatabaseDocumentation from "./pages/DatabaseDocumentation";
import Documentation from "./pages/Documentation";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PropertyContractProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                
                <Route path="/" element={<Layout />}>
                  <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
                  <Route path="my-property" element={<ProtectedRoute><MyProperty /></ProtectedRoute>} />
                  <Route path="properties/:id" element={<PropertyDetails />} />
                  <Route path="property-lookup" element={<PropertyLookup />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="map" element={<MapView />} />
                  <Route path="tokens" element={<ProtectedRoute><Tokens /></ProtectedRoute>} />
                  <Route path="hedera-tokens" element={<ProtectedRoute><HederaTokens /></ProtectedRoute>} />
                  <Route path="investment" element={<ProtectedRoute><Investment /></ProtectedRoute>} />
                  <Route path="verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
                  <Route path="admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="admin/contacts" element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
                  <Route path="admin/waitlist" element={<ProtectedRoute><AdminWaitlist /></ProtectedRoute>} />
                  <Route path="bookings" element={<ProtectedRoute><UserBookings /></ProtectedRoute>} />
                  <Route path="agent/calendar" element={<ProtectedRoute><AgentCalendar /></ProtectedRoute>} />
                  <Route path="agent/inspections" element={<ProtectedRoute><AgentInspections /></ProtectedRoute>} />
                  <Route path="agent/rentals" element={<ProtectedRoute><AgentRentals /></ProtectedRoute>} />
                  <Route path="agent/reservations" element={<ProtectedRoute><AgentReservations /></ProtectedRoute>} />
                  <Route path="messages" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
                  <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/:category" element={<ServiceCategory />} />
                  <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                  <Route path="data-flow" element={<DataFlow />} />
                  <Route path="database-schema" element={<DatabaseSchema />} />
                  <Route path="database-docs" element={<DatabaseDocumentation />} />
                  <Route path="documentation" element={<Documentation />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </PropertyContractProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
