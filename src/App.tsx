import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/monitoring/ErrorBoundary";
import { AnalyticsProvider } from "@/components/monitoring/AnalyticsProvider";

// Pages
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Marketplace from "@/pages/Marketplace";
import Tokens from "@/pages/Tokens";
import Investment from "@/pages/Investment";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import AdminContacts from "@/pages/AdminContacts";
import AdminWaitlist from "@/pages/AdminWaitlist";
import Verification from "@/pages/Verification";
import PropertyVerification from "@/pages/PropertyVerification";
import HederaTokens from "@/pages/HederaTokens";
import MapView from "@/pages/MapView";
import Notifications from "@/pages/Notifications";
import MyLand from "@/pages/MyLand";
import AgentInspections from "@/pages/AgentInspections";
import AgentRentals from "@/pages/AgentRentals";
import AgentReservations from "@/pages/AgentReservations";
import AgentCalendar from "@/pages/AgentCalendar";
import Documentation from "@/pages/Documentation";
import DatabaseDocumentation from "@/pages/DatabaseDocumentation";
import DatabaseSchema from "@/pages/DatabaseSchema";
import DataFlow from "@/pages/DataFlow";
import AddProperty from "@/pages/AddProperty";
import PropertyDetails from "@/pages/PropertyDetails";
import UserBookings from "@/pages/UserBookings";
import TermsAndConditions from "@/pages/TermsAndConditions";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Services from "@/pages/Services";
import ServiceCategory from "@/pages/ServiceCategory";
import { Messaging } from "./pages/Messaging";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AnalyticsProvider>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <UserBookings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/marketplace"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Marketplace />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/services"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Services />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/services/:categoryId"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ServiceCategory />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tokens"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Tokens />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/investment"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Investment />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-land"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <MyLand />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <Admin />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/contacts"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <AdminContacts />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/waitlist"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <AdminWaitlist />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/verification"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Verification />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/property-verification"
                    element={
                      <ProtectedRoute requiredRole="verifier">
                        <Layout>
                          <PropertyVerification />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hedera-tokens"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <HederaTokens />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/map"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <MapView />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Notifications />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agent/inspections"
                    element={
                      <ProtectedRoute
                        requiredRole={["agent", "landowner", "admin"]}
                      >
                        <Layout>
                          <AgentInspections />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agent/rentals"
                    element={
                      <ProtectedRoute
                        requiredRole={["agent", "landowner", "admin"]}
                      >
                        <Layout>
                          <AgentRentals />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agent/reservations"
                    element={
                      <ProtectedRoute
                        requiredRole={["agent", "landowner", "admin"]}
                      >
                        <Layout>
                          <AgentReservations />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agent/calendar"
                    element={
                      <ProtectedRoute
                        requiredRole={["agent", "landowner", "admin"]}
                      >
                        <Layout>
                          <AgentCalendar />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-property"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <AddProperty />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/documentation"
                    element={
                      <ProtectedRoute>
                        <Documentation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/database-docs"
                    element={
                      <ProtectedRoute>
                        <DatabaseDocumentation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/database-schema"
                    element={
                      <ProtectedRoute>
                        <DatabaseSchema />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/data-flow"
                    element={
                      <ProtectedRoute>
                        <DataFlow />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/property/:id"
                    element={
                      <ProtectedRoute>
                        <PropertyDetails />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/messaging"
                    element={
                      <ProtectedRoute>
                        <Layout stripPadding>
                          <Messaging />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </AnalyticsProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
