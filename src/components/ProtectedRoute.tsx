
"use client";

import { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?:
    | ("verifier" | "agent" | "landowner" | "admin")
    | ("verifier" | "agent" | "landowner" | "admin")[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    if (!allowedRoles.map(role => role.toLowerCase()).includes(user.role?.toLowerCase() || '')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-8">
              You don't have permission to access this page.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
              <Button onClick={() => window.history.back()}>Go Back <ArrowLeftIcon className="w-4 h-4"/></Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
