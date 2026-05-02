import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  allowedRoles?: ("admin" | "parent")[];
}

const ProtectedRoutes: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  // ── 1. Wait for session check ──────────────────────────────────────────
  // App.tsx already gates on loading, but this is a safety net for any
  // secondary thunks (e.g. token refresh) that set loading:true mid-session.
  // Also catches the race: isAuthenticated:true but user not yet hydrated.
  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
          <span className="text-gray-500 text-sm font-medium">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  // ── 2. Not authenticated → redirect to login ───────────────────────────
  // Pass current location so Login can redirect back after sign-in.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Role-based authorization ────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(user.role as "admin" | "parent")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── 4. Authorized ──────────────────────────────────────────────────────
  return <Outlet />;
};

export default ProtectedRoutes;