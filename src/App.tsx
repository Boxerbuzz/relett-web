import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { PropertyContractProvider } from "@/contexts/PropertyContractContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect } from "react";

// Page imports
// import Index from "./pages/Index";
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
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple redirect component
const ExternalRedirect = ({
  url,
  delay = 0,
}: {
  url: string;
  delay?: number;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = url;
    }, delay);

    return () => clearTimeout(timer);
  }, [url, delay]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to external site...</p>
        {delay > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Redirecting in {delay / 1000} seconds...
          </p>
        )}
      </div>
    </div>
  );
};

const ExternalLinkRedirect = ({ url }: { url: string }) => {
  useEffect(() => {
    window.open(url, "_blank"); // Opens in new tab
    // Optionally redirect current tab to another page
    // window.location.href = '/dashboard';
  }, [url]);

  return (
    <div className="text-center p-8">
      <p>Opening external site in new tab...</p>
      <a href={url} className="text-blue-600 underline">
        Click here if redirect doesn't work
      </a>
    </div>
  );
};

const ConditionalRedirect = () => {
  const shouldRedirect = true; // Your condition here

  if (shouldRedirect) {
    window.location.href = "https://example.com";
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to external site...</p>
      </div>
    );
  }

  return <Index />; // Fallback to original component
};

const SmartRedirect = () => {
  const redirectUrl =
    process.env.REACT_APP_REDIRECT_URL || "https://default-site.com";

  useEffect(() => {
    // Add any analytics or tracking here
    console.log(`Redirecting to: ${redirectUrl}`);

    // Small delay to ensure any tracking completes
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 500);
  }, [redirectUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Redirecting...
          </h2>
          <p className="text-gray-500 mt-2">Taking you to our main site</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <PropertyContractProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ExternalRedirect
                      url="https://www.relett.com"
                      delay={1000} // Optional 1 second delay
                    />
                  }
                />
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
                  path="/my-properties"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <MyProperty />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/properties/:id"
                  element={
                    <Layout>
                      <PropertyDetails />
                    </Layout>
                  }
                />
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
                    <Layout>
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
          </PropertyContractProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
