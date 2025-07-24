import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthProvider";
import { PropertyContractProvider } from "@/contexts/PropertyContractContext";
import { HashPackProvider } from "@/contexts/HashPackContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Page imports
// import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
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
      <Router>
        <AuthProvider>
          <PropertyContractProvider>
            <HashPackProvider>
              <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                <Route
                  path="/dashboard"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/add-property"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AddProperty />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/edit-property/:id"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <EditProperty />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/my-properties"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <MyProperty />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route
                  path="/property-lookup"
                  element={
                    <Layout>
                      <PropertyLookup />
                    </Layout>
                  }
                />
                <Route
                  path="/marketplace"
                  element={
                    <Layout>
                      <Marketplace />
                    </Layout>
                  }
                />
                <Route
                  path="/map"
                  element={
                    <Layout>
                      <MapView />
                    </Layout>
                  }
                />
                <Route
                  path="/tokens"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Tokens />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/hedera-tokens"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <HederaTokens />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/investment"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Investment />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/verification"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Verification />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/admin/contacts"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AdminContacts />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/admin/waitlist"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AdminWaitlist />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <UserBookings />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/agent/calendar"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AgentCalendar />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/agent/inspections"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AgentInspections />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/agent/rentals"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AgentRentals />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/agent/reservations"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <AgentReservations />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <Layout stripPadding>
                      <ProtectedRoute>
                        <Messaging />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <Layout>
                      <Services />
                    </Layout>
                  }
                />
                <Route
                  path="/services/:category"
                  element={
                    <Layout>
                      <ServiceCategory />
                    </Layout>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <FavoritesPage />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/data-flow"
                  element={
                    <Layout>
                      <DataFlow />
                    </Layout>
                  }
                />
                <Route
                  path="/database-schema"
                  element={
                    <Layout>
                      <DatabaseSchema />
                    </Layout>
                  }
                />
                <Route
                  path="/database-docs"
                  element={
                    <Layout>
                      <DatabaseDocumentation />
                    </Layout>
                  }
                />
                <Route
                  path="/documentation"
                  element={
                    <Layout>
                      <Documentation />
                    </Layout>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
              <Toaster />
            </HashPackProvider>
          </PropertyContractProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
