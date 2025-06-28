import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Page imports
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Welcome from "@/pages/Welcome";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import Marketplace from "@/pages/Marketplace";
import Services from "@/pages/Services";
import PropertyDetails from "@/pages/PropertyDetails";
import UserBookings from "@/pages/UserBookings";
import Tokens from "@/pages/Tokens";
import MyLand from "@/pages/MyProperty";
import AddProperty from "@/pages/AddProperty";
import Verification from "@/pages/Verification";
import { Messaging } from "@/pages/Messaging";

// Agent pages
import AgentInspections from "@/pages/AgentInspections";
import AgentRentals from "@/pages/AgentRentals";
import AgentReservations from "@/pages/AgentReservations";
import AgentCalendar from "@/pages/AgentCalendar";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";

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
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />

              {/* Protected routes with layout */}
              <Route
                path="/welcome"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Welcome />
                    </Layout>
                  </ProtectedRoute>
                }
              />

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
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <Admin />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Consolidated settings page with profile functionality */}
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
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
                path="/properties/:propertyId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PropertyDetails />
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
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserBookings />
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
                path="/my-properties"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyLand />
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
                path="/messaging"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Messaging />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Agent routes */}
              <Route
                path="/agent/inspections"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AgentInspections />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/agent/rentals"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AgentRentals />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/agent/reservations"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AgentReservations />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/agent/calendar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AgentCalendar />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </AuthProvider>

        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
