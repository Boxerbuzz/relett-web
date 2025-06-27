
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Page imports
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Welcome from '@/pages/Welcome';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import Marketplace from '@/pages/Marketplace';
import Services from '@/pages/Services';
import PropertyDetails from '@/pages/PropertyDetails';
import Me from '@/pages/Me';
import Tokens from '@/pages/Tokens';
import MyLand from '@/pages/MyLand';
import AddProperty from '@/pages/AddProperty';
import Verification from '@/pages/Verification';
import PropertyVerification from '@/pages/PropertyVerification';
import Messaging from '@/pages/Messaging';
import Map from '@/pages/Map';

// Agent pages
import AgentInspections from '@/pages/agent/Inspections';
import AgentRentals from '@/pages/agent/Rentals';
import AgentReservations from '@/pages/agent/Reservations';
import AgentCalendar from '@/pages/agent/Calendar';

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
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes with layout */}
              <Route path="/welcome" element={
                <ProtectedRoute>
                  <Layout>
                    <Welcome />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/*" element={
                <ProtectedRoute requireRole="admin">
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
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
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
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
              
              <Route path="/services" element={
                <ProtectedRoute>
                  <Layout>
                    <Services />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/properties/:propertyId" element={
                <ProtectedRoute>
                  <Layout>
                    <PropertyDetails />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/me" element={
                <ProtectedRoute>
                  <Layout>
                    <Me />
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
              
              <Route path="/my-land" element={
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
              
              <Route path="/messaging" element={
                <ProtectedRoute>
                  <Layout>
                    <Messaging />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/map" element={
                <ProtectedRoute>
                  <Layout>
                    <Map />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Agent routes */}
              <Route path="/agent/inspections" element={
                <ProtectedRoute>
                  <Layout>
                    <AgentInspections />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/agent/rentals" element={
                <ProtectedRoute>
                  <Layout>
                    <AgentRentals />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/agent/reservations" element={
                <ProtectedRoute>
                  <Layout>
                    <AgentReservations />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/agent/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <AgentCalendar />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
